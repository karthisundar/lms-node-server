import { NextFunction, Response, Request, Router } from "express";
import BaseApi from "../BaseApi";
import logger from "../../lib/logger";
import { StatusCodes } from "http-status-codes";
import { returnSuccess } from "../../abstractions/ApiResponses";
import * as service from "./question.service";

export default class QuestionController extends BaseApi {
  constructor() {
    super();
  }

  public register(): Router {
    this.router.get("/getAllQuestions", this.getAllQuestions.bind(this));
    this.router.get("/getQuestionByRefId", this.getQuestionByRefId.bind(this));
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
