"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactEnquiryQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
exports.contactEnquiryQueue = new bullmq_1.Queue("contact-enquiry-email", {
    connection: redis_1.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: {
            age: 86400,
            count: 1000,
        },
        // Keep failed jobs for troubleshooting.
        removeOnFail: false,
    },
});
//# sourceMappingURL=contactEnquiryQueue.js.map