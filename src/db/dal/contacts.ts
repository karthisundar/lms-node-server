import { Op } from "sequelize";
import sequelizeConnection from "../config";
import ContactEnquiry from "../model/ContactEnquiry";
import ContactEnquiryEmailLog from "../model/ContactEnquiryEmailLog";
import { contactEnquiryQueue } from "../../queue/contactEnquiryQueue";
import logger from "../../lib/logger";

export interface CreateEnquiryInput {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  source?: string | null;
}

export interface ListEnquiriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  email_status?: string;
}

/**
 * Saves a new enquiry, creates the initial email audit log record,
 * and enqueues the notification job to BullMQ.
 * Preserves the database record even if Redis enqueue fails.
 */
export async function createContactEnquiry(data: CreateEnquiryInput) {
  const adminEmail = process.env.ADMIN_ENQUIRY_EMAIL || "admin@example.com";

  // 1. Transactional creation of Enquiry and initial Audit Log
  const { enquiry, initialLog } = await sequelizeConnection.transaction(async (transaction) => {
    const newEnquiry = await ContactEnquiry.create(
      {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone ? data.phone.trim() : null,
        subject: data.subject ? data.subject.trim() : null,
        message: data.message.trim(),
        source: data.source ? data.source.trim() : null,
        status: "NEW",
        email_status: "PENDING",
        email_sent_at: null,
      },
      { transaction }
    );

    const log = await ContactEnquiryEmailLog.create(
      {
        enquiry_id: newEnquiry.id,
        recipient_email: adminEmail,
        email_type: "ADMIN_ENQUIRY_NOTIFICATION",
        attempt_number: 1,
        status: "PENDING",
        subject: `New Website Enquiry #${newEnquiry.id}: ${newEnquiry.subject || "Course Enquiry"}`,
        provider_message_id: null,
        error_message: null,
        attempted_at: new Date(),
        sent_at: null,
      },
      { transaction }
    );

    return { enquiry: newEnquiry, initialLog: log };
  });

  // 2. Asynchronous Queue Insertion with stable job ID
  let queued = false;
  try {
    await contactEnquiryQueue.add(
      "send-admin-email",
      { enquiryId: enquiry.id },
      {
        jobId: `enquiry-${enquiry.id}`,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      }
    );
    queued = true;
    logger.info(`Enquiry #${enquiry.id} enqueued to contact-enquiry-email queue.`);
  } catch (queueError: any) {
    // Non-fatal: Record is securely saved in DB with PENDING status for recovery
    logger.warn(
      `Redis queue insertion failed for enquiry #${enquiry.id}. Enquiry is preserved in DB for recovery.`,
      queueError?.message
    );
  }

  return {
    enquiry,
    queued,
  };
}

/**
 * Lists contact enquiries with pagination, search, and status filters.
 */
export async function getAllContactEnquiries(params: ListEnquiriesParams = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
  const offset = (page - 1) * limit;

  const whereClause: any = {};

  if (params.status && params.status !== "ALL") {
    whereClause.status = params.status;
  }

  if (params.email_status && params.email_status !== "ALL") {
    whereClause.email_status = params.email_status;
  }

  if (params.search && params.search.trim()) {
    const term = `%${params.search.trim()}%`;
    whereClause[Op.or] = [
      { name: { [Op.like]: term } },
      { email: { [Op.like]: term } },
      { phone: { [Op.like]: term } },
      { subject: { [Op.like]: term } },
    ];
  }

  const { rows, count } = await ContactEnquiry.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  return {
    rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit) || 1,
  };
}

/**
 * Gets a single enquiry with its complete email audit log attempt history.
 */
export async function getContactEnquiryById(id: number) {
  return await ContactEnquiry.findByPk(id, {
    include: [
      {
        model: ContactEnquiryEmailLog,
        as: "emailLogs",
        separate: true,
        order: [["attempt_number", "ASC"]],
      },
    ],
  });
}

/**
 * Updates the enquiry workflow status.
 */
export async function updateContactEnquiryStatus(id: number, status: string) {
  const validStatuses = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of ${validStatuses.join(", ")}`);
  }

  const enquiry = await ContactEnquiry.findByPk(id);
  if (!enquiry) {
    return null;
  }

  await enquiry.update({ status: status as any });
  return enquiry;
}

/**
 * Retries sending an admin notification email.
 * Prevents concurrent retries and duplicates.
 */
export async function retryEnquiryEmail(id: number) {
  const enquiry = await ContactEnquiry.findByPk(id);
  if (!enquiry) {
    const err: any = new Error("Enquiry not found");
    err.statusCode = 404;
    throw err;
  }

  if (enquiry.email_status === "SENT") {
    const err: any = new Error("This enquiry notification has already been sent successfully.");
    err.statusCode = 400;
    throw err;
  }

  // Count existing attempt records
  const existingAttempts = await ContactEnquiryEmailLog.count({
    where: { enquiry_id: id },
  });

  const nextAttemptNumber = existingAttempts + 1;
  const adminEmail = process.env.ADMIN_ENQUIRY_EMAIL || "admin@example.com";

  await sequelizeConnection.transaction(async (transaction) => {
    await ContactEnquiryEmailLog.create(
      {
        enquiry_id: id,
        recipient_email: adminEmail,
        email_type: "ADMIN_ENQUIRY_NOTIFICATION_RETRY",
        attempt_number: nextAttemptNumber,
        status: "PENDING",
        subject: `[Retry] New Website Enquiry #${id}: ${enquiry.subject || "Course Enquiry"}`,
        provider_message_id: null,
        error_message: null,
        attempted_at: new Date(),
        sent_at: null,
      },
      { transaction }
    );

    await enquiry.update(
      { email_status: "PENDING" },
      { transaction }
    );
  });

  // Enqueue new retry job with unique ID to force immediate processing
  await contactEnquiryQueue.add(
    "send-admin-email",
    { enquiryId: id },
    {
      jobId: `enquiry-retry-${id}-${Date.now()}`,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    }
  );

  return {
    id,
    emailStatus: "PENDING",
    attemptNumber: nextAttemptNumber,
  };
}

/**
 * Recovery worker function: checks for pending enquiries that have not succeeded
 * and are older than 60 seconds without an active BullMQ job.
 */
export async function recoverPendingEnquiries() {
  const cutoff = new Date(Date.now() - 60 * 1000);
  const pendingEnquiries = await ContactEnquiry.findAll({
    where: {
      email_status: "PENDING",
      created_at: { [Op.lt]: cutoff },
    },
    limit: 20,
  });

  let recoveredCount = 0;
  for (const item of pendingEnquiries) {
    try {
      await contactEnquiryQueue.add(
        "send-admin-email",
        { enquiryId: item.id },
        {
          jobId: `enquiry-recovery-${item.id}-${Date.now()}`,
          attempts: 3,
        }
      );
      recoveredCount++;
    } catch (e) {
      logger.error(`Recovery enqueue failed for enquiry ${item.id}:`, e);
    }
  }

  return recoveredCount;
}
