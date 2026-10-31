"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const sequelize_1 = require("sequelize");
const redis_1 = require("../config/redis");
const ContactEnquiry_1 = __importDefault(require("../db/model/ContactEnquiry"));
const ContactEnquiryEmailLog_1 = __importDefault(require("../db/model/ContactEnquiryEmailLog"));
const contactEnquiryEmailService_1 = require("../config/contactEnquiryEmailService");
const config_1 = __importDefault(require("../db/config"));
const logger_1 = __importDefault(require("../lib/logger"));
const worker = new bullmq_1.Worker("contact-enquiry-email", async (job) => {
    const adminEmail = process.env.ADMIN_ENQUIRY_EMAIL || "admin@example.com";
    const enquiryId = job.data.enquiryId;
    const enquiry = await ContactEnquiry_1.default.findByPk(enquiryId);
    if (!enquiry) {
        logger_1.default.error(`Worker: Enquiry ${enquiryId} was not found`);
        throw new Error(`Enquiry ${enquiryId} was not found`);
    }
    // Avoid duplicate sending if already sent
    if (enquiry.email_status === "SENT") {
        logger_1.default.info(`Worker: Enquiry ${enquiryId} email already marked SENT. Skipping.`);
        return { skipped: true, enquiryId };
    }
    // BullMQ attemptsMade starts at 0 on first execution
    const attemptNumber = (job.attemptsMade || 0) + 1;
    // Find or create the log record for this attempt
    let log = await ContactEnquiryEmailLog_1.default.findOne({
        where: {
            enquiry_id: enquiry.id,
            attempt_number: attemptNumber,
        },
    });
    if (!log) {
        log = await ContactEnquiryEmailLog_1.default.create({
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
        const result = await (0, contactEnquiryEmailService_1.sendAdminEnquiryEmail)({
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
        await config_1.default.transaction(async (transaction) => {
            await log.update({
                status: "SENT",
                recipient_email: result.recipientEmail,
                provider_message_id: result.messageId,
                error_message: null,
                sent_at: sentAt,
            }, { transaction });
            await enquiry.update({
                email_status: "SENT",
                email_sent_at: sentAt,
            }, { transaction });
        });
        logger_1.default.info(`Worker: Enquiry ${enquiryId} email successfully delivered to SMTP transport.`);
        return { enquiryId: enquiry.id, emailStatus: "SENT" };
    }
    catch (error) {
        const sanitizedError = error instanceof Error ? error.message.replace(/pass(word)?=[^&\s]+/gi, 'password=***') : "SMTP connection failure";
        logger_1.default.error(`Worker: Attempt ${attemptNumber} for enquiry ${enquiryId} failed: ${sanitizedError}`);
        await log.update({
            status: "FAILED",
            error_message: sanitizedError,
            sent_at: null,
        });
        // Re-throwing tells BullMQ to trigger retry according to exponential backoff policy
        throw error;
    }
}, {
    connection: redis_1.redisConnection,
    concurrency: 5,
});
worker.on("completed", (job) => {
    logger_1.default.info(`Contact email job ${job?.id} completed.`);
});
worker.on("failed", async (job, error) => {
    if (!job)
        return;
    logger_1.default.warn(`Contact email job ${job.id} attempt ${job.attemptsMade} failed: ${error.message}`);
    const maxAttempts = job.opts.attempts ?? 3;
    const exhausted = job.attemptsMade >= maxAttempts;
    if (exhausted) {
        logger_1.default.error(`Contact email job ${job.id} exhausted all ${maxAttempts} retry attempts. Marking enquiry FAILED.`);
        try {
            await ContactEnquiry_1.default.update({ email_status: "FAILED" }, {
                where: {
                    id: job.data.enquiryId,
                    email_status: { [sequelize_1.Op.ne]: "SENT" },
                },
            });
        }
        catch (dbError) {
            logger_1.default.error("Could not update final enquiry email_status to FAILED:", dbError);
        }
    }
});
worker.on("error", (error) => {
    logger_1.default.error("BullMQ contact email worker error:", error);
});
exports.default = worker;
//# sourceMappingURL=contactEnquiryEmailWorker.js.map