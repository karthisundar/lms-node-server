import { NextFunction, Response, Request, Router } from "express";
import BaseApi from "../BaseApi";
import logger from "../../lib/logger";
import { StatusCodes } from "http-status-codes";
import { returnSuccess } from "../../abstractions/ApiResponses";
import * as service from "./question.service";
import { verifyJWT } from "../auth/jwt.utils";

export default class QuestionController extends BaseApi {
  constructor() {
    super();
  }

  public register(): Router {
    this.router.get("/getAllQuestions", this.getAllQuestions.bind(this));
    this.router.get("/getQuestionByRefId", this.getQuestionByRefId.bind(this));
    this.router.get("/getEditorQuestions", this.getEditorQuestions.bind(this));
    this.router.post("/checkSyntax", this.checkSyntax.bind(this));
    this.router.post(
      "/createOrUpdateQuestion",
      this.createOrUpdateQuestion.bind(this),
    );
    this.router.post("/createQuestion", this.createOrUpdateQuestion.bind(this));
    this.router.post("/deleteQuestion", this.deleteQuestion.bind(this));
    this.router.post(
      "/createQuestionAnswer",
      this.createQuestionAnswer.bind(this),
    );
    this.router.post(
      "/updateQuestionAnswer",
      this.updateQuestionAnswer.bind(this),
    );
    this.router.post(
      "/deleteQuestionAnswer",
      this.deleteQuestionAnswer.bind(this),
    );
    return this.router;
  }

  private async verifyUserRole(req: Request): Promise<any> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.trim()) {
      return null;
    }
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
    const decoded = await verifyJWT(token);
    const payload = decoded?.payload;

    if (!payload) return null;

    // Strict role check: User role only (role_id === 2 or role === 'user')
    const roleId = Number(payload.role_id);
    const role = String(payload.role || "").toLowerCase();
    if (roleId === 2 || role === "user") {
      return payload;
    }
    return false; // Valid token but forbidden role (admin/lecturer)
  }

  public async checkSyntax(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userPayload = await this.verifyUserRole(req);
      if (userPayload === null) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          statusCode: StatusCodes.UNAUTHORIZED,
          response: {
            code: "UNAUTHORIZED",
            message: "Authentication token required.",
          },
        });
        return;
      }
      if (userPayload === false) {
        res.status(StatusCodes.FORBIDDEN).json({
          statusCode: StatusCodes.FORBIDDEN,
          response: {
            code: "FORBIDDEN",
            message:
              "Access denied. Python editor and syntax checking is restricted to the User role only.",
          },
        });
        return;
      }

      const { code } = req.body || {};
      const result = await service.checkPythonSyntax(code);
      res.locals.data = returnSuccess(StatusCodes.OK, "", result);
      super.send(res);
    } catch (error) {
      next(error);
      logger.error(error);
    }
  }

  public async getEditorQuestions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userPayload = await this.verifyUserRole(req);
      if (userPayload === null) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          statusCode: StatusCodes.UNAUTHORIZED,
          response: {
            code: "UNAUTHORIZED",
            message: "Authentication token required.",
          },
        });
        return;
      }
      if (userPayload === false) {
        res.status(StatusCodes.FORBIDDEN).json({
          statusCode: StatusCodes.FORBIDDEN,
          response: {
            code: "FORBIDDEN",
            message:
              "Access denied. Questions & Answers for Python Editor is restricted to the User role only.",
          },
        });
        return;
      }

      const bodyData = req.query;
      const getAllQuestions = await service.getAllQuestions(
        bodyData,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", getAllQuestions);
      super.send(res);
    } catch (error) {
      next(error);
      logger.error(error);
    }
  }

  public async getAllQuestions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const bodyData = req.query;

      const getAllQuestions = await service.getAllQuestions(
        bodyData,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", getAllQuestions);
      super.send(res);
    } catch (error) {
      next(error);
      logger.error(error);
    }
  }

  public async getQuestionByRefId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const bodyData = req.query;

      const getQuestionByRefId = await service.getQuestionByRefId(
        bodyData,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", getQuestionByRefId);
      super.send(res);
    } catch (error) {
      next(error);
      logger.error(error);
    }
  }

  public async createOrUpdateQuestion(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const bodyData = req.body;

      const createOrUpdateQuestion = await service.createOrUpdateQuestion(
        bodyData,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        "",
        createOrUpdateQuestion,
      );
      super.send(res);
    } catch (error) {
      next(error);
      logger.error(error);
    }
  }

  public async deleteQuestion(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const bodyData = req.body;

      const deleteQuestion = await service.deleteQuestion(
        bodyData,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", deleteQuestion);
      super.send(res);
    } catch (error) {
      next(error);
      logger.error(error);
    }
  }

  public async createQuestionAnswer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const bodyData = req.body;

      const createQuestionAnswer = await service.createQuestionAnswer(
        bodyData,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", createQuestionAnswer);
      super.send(res);
    } catch (error) {
      next(error);
      logger.error(error);
    }
  }

  public async updateQuestionAnswer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const bodyData = req.body;

      const updateQuestionAnswer = await service.updateQuestionAnswer(
        bodyData,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", updateQuestionAnswer);
      super.send(res);
    } catch (error) {
      next(error);
      logger.error(error);
    }
  }

  public async deleteQuestionAnswer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const bodyData = req.body;

      const deleteQuestionAnswer = await service.deleteQuestionAnswer(
        bodyData,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", deleteQuestionAnswer);
      super.send(res);
    } catch (error) {
      next(error);
      logger.error(error);
    }
  }
}
