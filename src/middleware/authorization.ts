import { Request, Response, NextFunction } from "express";
import { returnSuccess } from "../abstractions/ApiResponses";
import { StatusCodes } from "http-status-codes";
import logger from "../lib/logger";
import { verifyJWT } from "../components/auth/jwt.utils";
import clientLabel from "../config/clientlabel.config.json";

/**
 * Standard authentication middleware.
 * Verifies that the request contains a valid, unexpired RS256 JWT token.
 * Populates req.user and res.locals.user.
 */
export async function checkAccess(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader || typeof authHeader !== "string" || authHeader.trim() === "") {
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, (clientLabel as any).user?.userError?.unauthorized?.code || "UNAUTHORIZED");
      return res.status(StatusCodes.UNAUTHORIZED).json(res.locals.data);
    }

    const verification = verifyJWT(authHeader);
    if (!verification.payload || verification.expired) {
      const errorCode = verification.expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, errorCode);
      return res.status(StatusCodes.UNAUTHORIZED).json(res.locals.data);
    }

    // Attach validated token payload to request and locals
    (req as any).user = verification.payload;
    res.locals.user = verification.payload;
    next();
  } catch (err: any) {
    logger.error("checkAccess error src/middleware/authorization.ts", err);
    next(err);
  }
}

/**
 * Administrator authorization middleware.
 * Enforces that the authenticated user possesses the Admin role (role_id === 1 or role === 'admin').
 */
export async function checkAdminAccess(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader || typeof authHeader !== "string" || authHeader.trim() === "") {
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, (clientLabel as any).user?.userError?.unauthorized?.code || "UNAUTHORIZED");
      return res.status(StatusCodes.UNAUTHORIZED).json(res.locals.data);
    }

    const verification = verifyJWT(authHeader);
    if (!verification.payload || verification.expired) {
      const errorCode = verification.expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, errorCode);
      return res.status(StatusCodes.UNAUTHORIZED).json(res.locals.data);
    }

    const payload = verification.payload;
    const roleId = Number(payload.role_id);
    const role = String(payload.role || "").toLowerCase();
    const isAdmin = roleId === 1 || role.includes("admin");

    if (!isAdmin) {
      return res.status(StatusCodes.FORBIDDEN).json({
        statusCode: StatusCodes.FORBIDDEN,
        response: {
          code: "FORBIDDEN",
          message: "Access denied. Administrator privileges required.",
        },
      });
    }

    (req as any).user = payload;
    res.locals.user = payload;
    next();
  } catch (err: any) {
    logger.error("checkAdminAccess error src/middleware/authorization.ts", err);
    next(err);
  }
}

/**
 * Standard User role authorization middleware.
 * Enforces that the authenticated user possesses the student/user role (role_id === 2 or role === 'user').
 */
export async function checkUserAccess(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader || typeof authHeader !== "string" || authHeader.trim() === "") {
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, (clientLabel as any).user?.userError?.unauthorized?.code || "UNAUTHORIZED");
      return res.status(StatusCodes.UNAUTHORIZED).json(res.locals.data);
    }

    const verification = verifyJWT(authHeader);
    if (!verification.payload || verification.expired) {
      const errorCode = verification.expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, errorCode);
      return res.status(StatusCodes.UNAUTHORIZED).json(res.locals.data);
    }

    const payload = verification.payload;
    const roleId = Number(payload.role_id);
    const role = String(payload.role || "").toLowerCase();
    const isUser = roleId === 2 || role === "user";

    if (!isUser) {
      return res.status(StatusCodes.FORBIDDEN).json({
        statusCode: StatusCodes.FORBIDDEN,
        response: {
          code: "FORBIDDEN",
          message: "Access denied. Student user access required.",
        },
      });
    }

    (req as any).user = payload;
    res.locals.user = payload;
    next();
  } catch (err: any) {
    logger.error("checkUserAccess error src/middleware/authorization.ts", err);
    next(err);
  }
}

export const checkAccessReseller = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const token = req.headers?.authorization;
    if (!token || token?.trim() === "") {
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, "");
      return res.status(StatusCodes.UNAUTHORIZED).json(res.locals.data);
    }
    const verification = verifyJWT(token);
    if (!verification.payload || verification.expired) {
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, "");
      return res.status(StatusCodes.UNAUTHORIZED).json(res.locals.data);
    }
    (req as any).user = verification.payload;
    res.locals.user = verification.payload;
    next();
  } catch (err) {
    logger.error("checkAccessReseller catch src/middleware/authorization.ts", err);
    next(err);
  }
};

export const checkReseller = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const token = req.headers?.authorization;
    if (!token || token?.trim() === "") {
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, "");
      return res.status(StatusCodes.UNAUTHORIZED).json(res.locals.data);
    }
    const payload = verifyJWT(token)?.payload;
    if (payload == null || !payload?.reseller_ref_id) {
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, "");
      return res.status(StatusCodes.FORBIDDEN).json(res.locals.data);
    }
    (req as any).user = payload;
    res.locals.user = payload;
    next();
  } catch (error) {
    logger.error("reseller valid catch src/middleware/authorization.ts", error);
    next(error);
  }
};
