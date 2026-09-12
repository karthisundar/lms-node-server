import { NextFunction, Request, Response } from "express";
import { ValidationChain, validationResult } from "express-validator";
import logger from "../lib/logger";

export const validator =
  (validator: ValidationChain[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validator.map((validator) => validator.run(req)));

    const error = validationResult(req);

    if (error.isEmpty()) {
      return next();
    }
    logger.error(
      "error from validator",
      error.array().map((d: { msg: string }) => d.msg),
    );
    res.status(400).json({
      statusCode: 400,
      response: {
        code: error.array().map((d: { msg: string }) => d.msg),
        name: "error",
        stack: error.array(),
      },
    });
  };
