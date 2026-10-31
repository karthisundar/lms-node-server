"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContactEnquiry = createContactEnquiry;
exports.getAllContactEnquiries = getAllContactEnquiries;
exports.getContactEnquiryById = getContactEnquiryById;
exports.updateContactEnquiryStatus = updateContactEnquiryStatus;
exports.retryEnquiryEmail = retryEnquiryEmail;
exports.recoverPendingEnquiries = recoverPendingEnquiries;
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const ContactEnquiry_1 = __importDefault(require("../model/ContactEnquiry"));
const ContactEnquiryEmailLog_1 = __importDefault(require("../model/ContactEnquiryEmailLog"));
const contactEnquiryQueue_1 = require("../../queue/contactEnquiryQueue");
const logger_1 = __importDefault(require("../../lib/logger"));
/**
 * Saves a new enquiry, creates the initial email audit log record,
 * and enqueues the notification job to BullMQ.
 * Preserves the database record even if Redis enqueue fails.
 */
async function createContactEnquiry(data) {
    const adminEmail = process.env.ADMIN_ENQUIRY_EMAIL || "admin@example.com";
    // 1. Transactional creation of Enquiry and initial Audit Log
    const { enquiry, initialLog } = await config_1.default.transaction(async (transaction) => {
        const newEnquiry = await ContactEnquiry_1.default.create({
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone ? data.phone.trim() : null,
            subject: data.subject ? data.subject.trim() : null,
            message: data.message.trim(),
            source: data.source ? data.source.trim() : null,
            status: "NEW",
            email_status: "PENDING",
            email_sent_at: null,
        }, { transaction });
        const log = await ContactEnquiryEmailLog_1.default.create({
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
        }, { transaction });
        return { enquiry: newEnquiry, initialLog: log };
    });
    // 2. Asynchronous Queue Insertion with stable job ID
    let queued = false;
    try {
        await contactEnquiryQueue_1.contactEnquiryQueue.add("send-admin-email", { enquiryId: enquiry.id }, {
            jobId: `enquiry-${enquiry.id}`,
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
        });
        queued = true;
        logger_1.default.info(`Enquiry #${enquiry.id} enqueued to contact-enquiry-email queue.`);
    }
    catch (queueError) {
        // Non-fatal: Record is securely saved in DB with PENDING status for recovery
        logger_1.default.warn(`Redis queue insertion failed for enquiry #${enquiry.id}. Enquiry is preserved in DB for recovery.`, queueError?.message);
    }
    return {
        enquiry,
        queued,
    };
}
/**
 * Lists contact enquiries with pagination, search, and status filters.
 */
async function getAllContactEnquiries(params = {}) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const offset = (page - 1) * limit;
    const whereClause = {};
    if (params.status && params.status !== "ALL") {
        whereClause.status = params.status;
    }
    if (params.email_status && params.email_status !== "ALL") {
        whereClause.email_status = params.email_status;
    }
    if (params.search && params.search.trim()) {
        const term = `%${params.search.trim()}%`;
        whereClause[sequelize_1.Op.or] = [
            { name: { [sequelize_1.Op.like]: term } },
            { email: { [sequelize_1.Op.like]: term } },
            { phone: { [sequelize_1.Op.like]: term } },
            { subject: { [sequelize_1.Op.like]: term } },
        ];
    }
    const { rows, count } = await ContactEnquiry_1.default.findAndCountAll({
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
async function getContactEnquiryById(id) {
    return await ContactEnquiry_1.default.findByPk(id, {
        include: [
            {
                model: ContactEnquiryEmailLog_1.default,
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
async function updateContactEnquiryStatus(id, status) {
    const validStatuses = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of ${validStatuses.join(", ")}`);
    }
    const enquiry = await ContactEnquiry_1.default.findByPk(id);
    if (!enquiry) {
        return null;
    }
    await enquiry.update({ status: status });
    return enquiry;
}
/**
 * Retries sending an admin notification email.
 * Prevents concurrent retries and duplicates.
 */
async function retryEnquiryEmail(id) {
    const enquiry = await ContactEnquiry_1.default.findByPk(id);
    if (!enquiry) {
        const err = new Error("Enquiry not found");
        err.statusCode = 404;
        throw err;
    }
    if (enquiry.email_status === "SENT") {
        const err = new Error("This enquiry notification has already been sent successfully.");
        err.statusCode = 400;
        throw err;
    }
    // Count existing attempt records
    const existingAttempts = await ContactEnquiryEmailLog_1.default.count({
        where: { enquiry_id: id },
    });
    const nextAttemptNumber = existingAttempts + 1;
    const adminEmail = process.env.ADMIN_ENQUIRY_EMAIL || "admin@example.com";
    await config_1.default.transaction(async (transaction) => {
        await ContactEnquiryEmailLog_1.default.create({
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
        }, { transaction });
        await enquiry.update({ email_status: "PENDING" }, { transaction });
    });
    // Enqueue new retry job with unique ID to force immediate processing
    await contactEnquiryQueue_1.contactEnquiryQueue.add("send-admin-email", { enquiryId: id }, {
        jobId: `enquiry-retry-${id}-${Date.now()}`,
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
    });
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
async function recoverPendingEnquiries() {
    const cutoff = new Date(Date.now() - 60 * 1000);
    const pendingEnquiries = await ContactEnquiry_1.default.findAll({
        where: {
            email_status: "PENDING",
            created_at: { [sequelize_1.Op.lt]: cutoff },
        },
        limit: 20,
    });
    let recoveredCount = 0;
    for (const item of pendingEnquiries) {
        try {
            await contactEnquiryQueue_1.contactEnquiryQueue.add("send-admin-email", { enquiryId: item.id }, {
                jobId: `enquiry-recovery-${item.id}-${Date.now()}`,
                attempts: 3,
            });
            recoveredCount++;
        }
        catch (e) {
            logger_1.default.error(`Recovery enqueue failed for enquiry ${item.id}:`, e);
        }
    }
    return recoveredCount;
}
//# sourceMappingURL=contacts.js.map