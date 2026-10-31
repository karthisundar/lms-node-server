import { Request, Response, Router, NextFunction } from "express";
import BaseApi from "../BaseApi";
import { StatusCodes } from "http-status-codes";
import logger from "../../lib/logger";
import { verifyJWT } from "../auth/jwt.utils";
import * as contactService from "./contact.service";

export default class ContactController extends BaseApi {
  constructor() {
    super();
  }

  public register(): Router {
    // Public enquiry submission
    this.router.post("/api/contact-enquiries", this.submitEnquiry.bind(this));

    // Admin protected management endpoints
    this.router.get(
      "/api/admin/contact-enquiries",
      this.verifyAdminMiddleware.bind(this),
      this.getAdminEnquiries.bind(this)
    );
    this.router.get(
      "/api/admin/contact-enquiries/:id",
      this.verifyAdminMiddleware.bind(this),
      this.getAdminEnquiryById.bind(this)
    );
    this.router.patch(
      "/api/admin/contact-enquiries/:id/status",
      this.verifyAdminMiddleware.bind(this),
      this.updateStatus.bind(this)
    );
    this.router.post(
      "/api/admin/contact-enquiries/:id/retry-email",
      this.verifyAdminMiddleware.bind(this),
      this.retryEmail.bind(this)
    );

    return this.router;
  }

  /**
   * Middleware to verify admin authorization using JWT.
   * Rejects unauthenticated visitors with 401 and non-admins with 403.
   */
  private async verifyAdminMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.trim()) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          statusCode: StatusCodes.UNAUTHORIZED,
          response: {
            code: "UNAUTHORIZED",
            message: "Authentication token is required to access admin enquiry resources.",
          },
        });
        return;
      }

      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
      const decoded = await verifyJWT(token);

      if (!decoded || !decoded.payload || decoded.expired) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          statusCode: StatusCodes.UNAUTHORIZED,
          response: {
            code: "TOKEN_EXPIRED",
            message: "Your session has expired or the token is invalid. Please log in again.",
          },
        });
        return;
      }

      const payload = decoded.payload as any;
      const roleId = Number(payload.role_id);
      const roleName = String(payload.role || payload.role_name || "").toLowerCase();

      // Admin verification: role_id === 1 or role === 'admin'
      const isAdmin = roleId === 1 || roleName === "admin";
      if (!isAdmin) {
        res.status(StatusCodes.FORBIDDEN).json({
          statusCode: StatusCodes.FORBIDDEN,
          response: {
            code: "FORBIDDEN",
            message: "Access denied. Administrator privileges are required.",
          },
        });
        return;
      }

      (req as any).user = payload;
      next();
    } catch (error: any) {
      logger.error("Admin authentication error in ContactController:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        response: {
          code: "INTERNAL_ERROR",
          message: "Failed to authenticate request.",
        },
      });
    }
  }

  /**
   * POST /api/contact-enquiries
   * Public enquiry endpoint.
   */
  public async submitEnquiry(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body || {};
      const name = (body.name || body.fullName || "").trim();
      const email = (body.email || "").trim();
      const phone = (body.phone || body.phoneNumber || "").trim();
      const subject = (body.subject || body.courseInterest || "").trim();
      const message = (body.message || "").trim();
      const source = (body.source || body.learningMode || "").trim();
      const honeypot = body.honeypot;

      // Anti-spam honeypot check
      if (honeypot && String(honeypot).trim().length > 0) {
        res.status(StatusCodes.OK).json({
          success: true,
          message: "Your enquiry has been submitted successfully.",
          data: { id: 0, emailStatus: "PENDING" },
        });
        return;
      }

      // 1. Validation
      const errors: string[] = [];

      if (!name || typeof name !== "string" || name.trim().length < 2) {
        errors.push("Full name is required (minimum 2 characters).");
      } else if (name.trim().length > 150) {
        errors.push("Full name cannot exceed 150 characters.");
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
        errors.push("A valid email address is required.");
      } else if (email.trim().length > 254) {
        errors.push("Email address cannot exceed 254 characters.");
      }

      if (phone && typeof phone === "string") {
        const cleanPhone = phone.trim();
        if (cleanPhone.length > 30) {
          errors.push("Phone number cannot exceed 30 characters.");
        } else if (!/^[+0-9\s()\-\.]+$/.test(cleanPhone)) {
          errors.push("Phone number contains invalid characters.");
        }
      }

      if (subject && typeof subject === "string" && subject.trim().length > 200) {
        errors.push("Subject cannot exceed 200 characters.");
      }

      if (!message || typeof message !== "string" || message.trim().length < 5) {
        errors.push("Enquiry message is required (minimum 5 characters).");
      } else if (message.trim().length > 5000) {
        errors.push("Message cannot exceed 5000 characters.");
      }

      if (source && typeof source === "string" && source.trim().length > 500) {
        errors.push("Source reference cannot exceed 500 characters.");
      }

      if (errors.length > 0) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          response: {
            code: "VALIDATION_ERROR",
            message: errors[0],
            errors,
          },
        });
        return;
      }

      // 2. Persist in DB and enqueue email notification
      const { enquiry } = await contactService.createEnquiry({
        name,
        email,
        phone,
        subject,
        message,
        source,
      });

      // 3. Return standardized success response
      // Initial email status is strictly PENDING because sending is asynchronous via BullMQ
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Your enquiry has been submitted successfully.",
        data: {
          id: enquiry.id,
          emailStatus: "PENDING",
        },
      });
    } catch (error: any) {
      logger.error("Error submitting contact enquiry:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        response: {
          code: "SUBMISSION_FAILED",
          message: "Failed to submit enquiry. Please try again later.",
        },
      });
    }
  }

  /**
   * GET /api/admin/contact-enquiries
   * Admin-only enquiry listing with filters and pagination.
   */
  public async getAdminEnquiries(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search, status, email_status } = req.query;

      const result = await contactService.listEnquiries({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
        email_status: email_status ? String(email_status) : undefined,
      });

      res.status(StatusCodes.OK).json({
        success: true,
        statusCode: StatusCodes.OK,
        response: {
          data: result.rows,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error: any) {
      logger.error("Error retrieving admin contact enquiries:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        response: {
          code: "FETCH_FAILED",
          message: "Could not retrieve enquiries.",
        },
      });
    }
  }

  /**
   * GET /api/admin/contact-enquiries/:id
   * Admin-only single enquiry with full audit log history.
   */
  public async getAdminEnquiryById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!id || isNaN(id)) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          response: { code: "INVALID_ID", message: "A valid enquiry ID is required." },
        });
        return;
      }

      const enquiry = await contactService.getEnquiryById(id);
      if (!enquiry) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          response: { code: "NOT_FOUND", message: `Enquiry with ID ${id} not found.` },
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        success: true,
        statusCode: StatusCodes.OK,
        response: {
          data: enquiry,
        },
      });
    } catch (error: any) {
      logger.error(`Error fetching enquiry ${req.params.id}:`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        response: { code: "FETCH_FAILED", message: "Failed to fetch enquiry details." },
      });
    }
  }

  /**
   * PATCH /api/admin/contact-enquiries/:id/status
   * Admin updates workflow status (NEW, IN_PROGRESS, RESOLVED, CLOSED).
   */
  public async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { status } = req.body || {};

      if (!status) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          response: { code: "MISSING_STATUS", message: "Status is required." },
        });
        return;
      }

      const updated = await contactService.updateEnquiryStatus(id, status);
      if (!updated) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          response: { code: "NOT_FOUND", message: "Enquiry not found." },
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Enquiry status updated successfully.",
        response: { data: updated },
      });
    } catch (error: any) {
      logger.error(`Error updating status for enquiry ${req.params.id}:`, error);
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        response: { code: "UPDATE_FAILED", message: error.message || "Failed to update status." },
      });
    }
  }

  /**
   * POST /api/admin/contact-enquiries/:id/retry-email
   * Admin triggers a retry for failed email delivery. Returns 202 Accepted.
   */
  public async retryEmail(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!id || isNaN(id)) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          response: { code: "INVALID_ID", message: "A valid enquiry ID is required." },
        });
        return;
      }

      const result = await contactService.retryEmailNotification(id);

      res.status(StatusCodes.ACCEPTED).json({
        success: true,
        statusCode: StatusCodes.ACCEPTED,
        message: "Email notification retry has been queued.",
        data: result,
      });
    } catch (error: any) {
      logger.error(`Error retrying email for enquiry ${req.params.id}:`, error);
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        statusCode,
        response: {
          code: "RETRY_FAILED",
          message: error.message || "Failed to retry email notification.",
        },
      });
    }
  }
}
