import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export interface ContactEnquiryEmailJob {
  enquiryId: number;
}

export const contactEnquiryQueue = new Queue<ContactEnquiryEmailJob>(
  "contact-enquiry-email",
  {
    connection: redisConnection,
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
  },
);
