"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTransporterForTesting = setTransporterForTesting;
exports.sendAdminEnquiryEmail = sendAdminEnquiryEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
let cachedTransporter = null;
function getTransporter() {
    if (cachedTransporter)
        return cachedTransporter;
    const smtpHost = process.env.SMTP_HOST || "127.0.0.1";
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpSecure = process.env.SMTP_SECURE === "true";
    const smtpUser = process.env.SMTP_USER || "dev_user";
    const smtpPassword = process.env.SMTP_PASSWORD || "dev_password";
    cachedTransporter = nodemailer_1.default.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
            user: smtpUser,
            pass: smtpPassword,
        },
        // Prevent unhandled connection hangs
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
    });
    return cachedTransporter;
}
// For unit tests: allow injecting custom or mock transporter
function setTransporterForTesting(testTransporter) {
    cachedTransporter = testTransporter;
}
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return entities[character];
    });
}
// Strip CR/LF to prevent header injection attacks
function sanitizeHeader(value) {
    return value.replace(/[\r\n]/g, " ").trim();
}
/**
 * Sends an email notification to the configured administrator.
 *
 * NOTE ON RELIABILITY:
 * SMTP transport acceptance (a successful return from sendMail) only confirms that the
 * immediate upstream SMTP relay or mail server accepted the message for delivery.
 * It does NOT guarantee final mailbox delivery to the recipient's inbox.
 */
async function sendAdminEnquiryEmail(enquiry) {
    const adminEmail = sanitizeHeader(process.env.ADMIN_ENQUIRY_EMAIL || "admin@example.com");
    const emailFrom = sanitizeHeader(process.env.EMAIL_FROM || "no-reply@example.com");
    const message = escapeHtml(enquiry.message).replace(/\r?\n/g, "<br>");
    const name = escapeHtml(enquiry.name);
    const email = escapeHtml(enquiry.email);
    const phone = escapeHtml(enquiry.phone || "Not provided");
    const subject = escapeHtml(enquiry.subject || "General Enquiry");
    const source = escapeHtml(enquiry.source || "Not provided");
    const submittedAt = escapeHtml(new Date(enquiry.created_at).toISOString());
    const mailOptions = {
        from: emailFrom,
        to: adminEmail,
        subject: sanitizeHeader(`New Website Enquiry #${enquiry.id}: ${enquiry.subject || "Course Enquiry"}`),
        replyTo: sanitizeHeader(enquiry.email),
        text: [
            `New Website Enquiry #${enquiry.id}`,
            `----------------------------------------`,
            `Name: ${enquiry.name}`,
            `Email: ${enquiry.email}`,
            `Phone: ${enquiry.phone || "Not provided"}`,
            `Subject: ${enquiry.subject || "General enquiry"}`,
            `Source: ${enquiry.source || "Not provided"}`,
            `Submitted (UTC): ${submittedAt}`,
            ``,
            `Message:`,
            enquiry.message,
        ].join("\n"),
        html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: 700;">New Website Enquiry #${enquiry.id}</h2>
          <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">A visitor has submitted a new enquiry via the scroll popup form.</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
          <tbody>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 12px; color: #4b5563; font-weight: 600; width: 30%;">Full Name</td>
              <td style="padding: 10px 12px; color: #111827; font-weight: 500;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6; background-color: #f9fafb;">
              <td style="padding: 10px 12px; color: #4b5563; font-weight: 600;">Email Address</td>
              <td style="padding: 10px 12px; color: #111827;"><a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 12px; color: #4b5563; font-weight: 600;">Phone Number</td>
              <td style="padding: 10px 12px; color: #111827;">${phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6; background-color: #f9fafb;">
              <td style="padding: 10px 12px; color: #4b5563; font-weight: 600;">Subject / Course</td>
              <td style="padding: 10px 12px; color: #111827;">${subject}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 12px; color: #4b5563; font-weight: 600;">Source URL</td>
              <td style="padding: 10px 12px; color: #6b7280; font-size: 13px;">${source}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6; background-color: #f9fafb;">
              <td style="padding: 10px 12px; color: #4b5563; font-weight: 600;">Submitted At</td>
              <td style="padding: 10px 12px; color: #6b7280; font-size: 13px;">${submittedAt}</td>
            </tr>
          </tbody>
        </table>
        <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
          <h4 style="margin: 0 0 8px; color: #334155; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Visitor Message:</h4>
          <p style="margin: 0; color: #1e293b; line-height: 1.6; font-size: 14px;">${message}</p>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 14px; text-align: center; color: #9ca3af; font-size: 12px;">
          This is an automated notification from your LMS Course Platform. Reply directly to this email to contact the visitor.
        </div>
      </div>
    `,
    };
    const transporter = getTransporter();
    const result = await transporter.sendMail(mailOptions);
    return {
        recipientEmail: adminEmail,
        messageId: result.messageId || null,
    };
}
//# sourceMappingURL=contactEnquiryEmailService.js.map