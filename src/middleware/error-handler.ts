import * as express from "express";
import { StatusCodes } from "http-status-codes";
import serverLabelConfig from "../config/serverlabel.config.json";

const serverLabels = (serverLabelConfig as unknown) as Record<string, { message?: string; type?: string; Type?: string }>;

const errorHandler = (
  err: any,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
): void => {
  if (err) {
    const isUniqueConstraint =
      err?.name === "SequelizeUniqueConstraintError" ||
      err?.original?.code === "ER_DUP_ENTRY" ||
      err?.code === "EMAIL_ALREADY_EXISTS";

    const rawCode = err?.code || (typeof err?.message === "string" ? err.message.trim() : "");
    const mappedLabel = serverLabels[rawCode];

    let statusCode: number = err.status || err.statusCode;
    if (!statusCode) {
      if (isUniqueConstraint || rawCode === "USER_E_00009" || rawCode.includes("_ALREADY_EXISTS") || rawCode.includes("_E_00001") && rawCode.includes("MAPPING_E_00001")) {
        statusCode = StatusCodes.CONFLICT;
      } else if (
        rawCode === "USER_E_00001" ||
        rawCode === "COURSE_E_00001" ||
        rawCode === "MODULE_E_00001" ||
        rawCode === "MODULE_E_00004" ||
        rawCode === "MODULE_E_00005" ||
        rawCode === "LESSON_E_00001" ||
        rawCode === "LESSON_E_00005" ||
        rawCode === "VIDEO_E_00001" ||
        rawCode === "SESSION_E_00001" ||
        rawCode === "SESSION_E_00004" ||
        rawCode === "LESSON_VIDEO_MAPPING_E_00002" ||
        rawCode === "LESSON_NOTES_E_00001" ||
        rawCode === "USER_SESSION_E_00001" ||
        rawCode === "USER_LESSON_E_00001" ||
        rawCode?.toLowerCase().includes("not found") ||
        rawCode?.toLowerCase().includes("not_found")
      ) {
        statusCode = StatusCodes.NOT_FOUND;
      } else if (
        rawCode === "USER_E_00004" ||
        rawCode === "USER_E_00005" ||
        rawCode === "USER_E_00012" ||
        rawCode === "Unauthorized" ||
        rawCode === "Invalid credential" ||
        rawCode?.toLowerCase().includes("unauthorized")
      ) {
        statusCode = StatusCodes.UNAUTHORIZED;
      } else if (
        rawCode.startsWith("COURSE_E_") ||
        rawCode.startsWith("MODULE_E_") ||
        rawCode.startsWith("LESSON_E_") ||
        rawCode.startsWith("VIDEO_E_") ||
        rawCode.startsWith("SESSION_E_") ||
        rawCode.startsWith("USER_E_") ||
        rawCode.startsWith("Product_E_") ||
        rawCode.startsWith("CLUB_E_") ||
        rawCode.startsWith("SALES_E_") ||
        rawCode.includes("mandatory") ||
        rawCode.includes("required") ||
        rawCode.includes("Invalid")
      ) {
        statusCode = StatusCodes.BAD_REQUEST;
      } else {
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      }
    }

    const errorCode = err?.code || (isUniqueConstraint ? "EMAIL_ALREADY_EXISTS" : (mappedLabel ? rawCode : undefined));
    const errorMessage = isUniqueConstraint
      ? "This email address is already registered."
      : (mappedLabel?.message || (err?.message && !err.message.startsWith("USER_E_") && !err.message.startsWith("COURSE_E_") && !err.message.startsWith("MODULE_E_") && !err.message.startsWith("LESSON_E_") && !err.message.startsWith("VIDEO_E_") && !err.message.startsWith("SESSION_E_") ? err.message.trim() : "An error occurred during the request."));

    const body: any = {
      statusCode,
      success: false,
      code: errorCode,
      message: errorMessage,
      field: err?.field || (isUniqueConstraint || rawCode === "USER_E_00009" ? "email" : undefined),
      fields: err?.fields || (err?.field ? [err.field] : undefined),
      response: {
        type: err?.errorMessageType?.type || mappedLabel?.type || "Error",
        code: [errorCode || rawCode || errorMessage],
        message: errorMessage,
        name: err?.name,
        stack: process.env.NODE_ENV === "development" ? err?.stack?.trim() : undefined,
      },
    };

    res.status(statusCode);
    res.send(body);
  }
};

export default errorHandler;
