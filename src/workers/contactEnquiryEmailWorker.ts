import { Worker, Job } from "bullmq";
import { Op } from "sequelize";
import { redisConnection } from "../config/redis";
import { ContactEnquiryEmailJob } from "../queue/contactEnquiryQueue";
import ContactEnquiry from "../db/model/ContactEnquiry";
import ContactEnquiryEmailLog from "../db/model/ContactEnquiryEmailLog";
import { sendAdminEnquiryEmail } from "../config/contactEnquiryEmailService";
import sequelizeConnection from "../db/config";
import logger from "../lib/logger";

const worker = new Worker<ContactEnquiryEmailJob>(
  "contact-enquiry-email",
  async (job: Job<ContactEnquiryEmailJob>) => {
    const adminEmail = process.env.ADMIN_ENQUIRY_EMAIL || "admin@example.com";
    const enquiryId = job.data.enquiryId;

    const enquiry = await ContactEnquiry.findByPk(enquiryId);

    if (!enquiry) {
      logger.error(`Worker: Enquiry ${enquiryId} was not found`);
      throw new Error(`Enquiry ${enquiryId} was not found`);
    }

    // Avoid duplicate sending if already sent
    if (enquiry.email_status === "SENT") {
      logger.info(`Worker: Enquiry ${enquiryId} email already marked SENT. Skipping.`);
      return { skipped: true, enquiryId };
    }

    // BullMQ attemptsMade starts at 0 on first execution
    const attemptNumber = (job.attemptsMade || 0) + 1;

    // Find or create the log record for this attempt
    let log = await ContactEnquiryEmailLog.findOne({
      where: {
        enquiry_id: enquiry.id,
        attempt_number: attemptNumber,
      },
    });

    if (!log) {
      log = await ContactEnquiryEmailLog.create({
        enquiry_id: enquiry.id,
        recipient_email: adminEmail,
        email_type: "ADMIN_ENQUIRY_NOTIFICATION",
        attempt_number: attemptNumber,
        status: "PENDING",
        subject: `New Website Enquiry #${enquiry.id}: ${enquiry.subject || "Course Enquiry"}`,
        provider_message_id: null,
        error_message: null,
        attempted_at: new Date(),
        sent_at: null,
      });
    }

    if (log.status === "SENT") {
      return { skipped: true, enquiryId };
    }

    await log.update({
      status: "PENDING",
      error_message: null,
      attempted_at: new Date(),
    });

    try {
      const result = await sendAdminEnquiryEmail({
        id: enquiry.id,
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone,
        subject: enquiry.subject,
        message: enquiry.message,
        source: enquiry.source,
        created_at: enquiry.created_at || new Date(),
      });

      const sentAt = new Date();

      await sequelizeConnection.transaction(async (transaction) => {
        await log!.update(
          {
            status: "SENT",
            recipient_email: result.recipientEmail,
            provider_message_id: result.messageId,
            error_message: null,
            sent_at: sentAt,
          },
          { transaction }
        );

        await enquiry.update(
          {
            email_status: "SENT",
            email_sent_at: sentAt,
          },
          { transaction }
        );
      });

      logger.info(`Worker: Enquiry ${enquiryId} email successfully delivered to SMTP transport.`);
      return { enquiryId: enquiry.id, emailStatus: "SENT" };
    } catch (error: any) {
      const sanitizedError = error instanceof Error ? error.message.replace(/pass(word)?=[^&\s]+/gi, 'password=***') : "SMTP connection failure";
      logger.error(`Worker: Attempt ${attemptNumber} for enquiry ${enquiryId} failed: ${sanitizedError}`);

      await log.update({
        status: "FAILED",
        error_message: sanitizedError,
        sent_at: null,
      });

      // Re-throwing tells BullMQ to trigger retry according to exponential backoff policy
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  logger.info(`Contact email job ${job?.id} completed.`);
});

worker.on("failed", async (job, error) => {
  if (!job) return;

  logger.warn(`Contact email job ${job.id} attempt ${job.attemptsMade} failed: ${error.message}`);

  const maxAttempts = job.opts.attempts ?? 3;
  const exhausted = job.attemptsMade >= maxAttempts;

  if (exhausted) {
    logger.error(`Contact email job ${job.id} exhausted all ${maxAttempts} retry attempts. Marking enquiry FAILED.`);
    try {
      await ContactEnquiry.update(
        { email_status: "FAILED" },
        {
          where: {
            id: job.data.enquiryId,
            email_status: { [Op.ne]: "SENT" },
          },
        }
      );
    } catch (dbError) {
      logger.error("Could not update final enquiry email_status to FAILED:", dbError);
    }
  }
});

worker.on("error", (error) => {
  logger.error("BullMQ contact email worker error:", error);
});

export default worker;
