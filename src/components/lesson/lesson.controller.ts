import { NextFunction, Response, Request, Router } from "express";
import BaseApi from "../BaseApi";
import logger from "../../lib/logger";
import { StatusCodes } from "http-status-codes";
import { returnSuccess } from "../../abstractions/ApiResponses";
import * as service from "./lesson.service";

export class LessionController extends BaseApi {
  constructor() {
    super();
  }

  public register(): Router {
    this.router.post("/createLesson", this.createLesson.bind(this));
    this.router.post("/deleteLesson", this.deleteLesson.bind(this));
    this.router.get("/getAllLessons", this.getAllLessons.bind(this));
    this.router.get("/getLesson", this.getLesson.bind(this));
    return this.router;
  }

  public async createLesson(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const createLesson = await service.createLesson(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", createLesson);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async getAllLessons(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getAllLessons = await service.getAllLessons(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getAllLessons);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
  public async getLesson(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getLesson = await service.getLesson(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getLesson);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async deleteLesson(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deleteLesson = await service.deleteLesson(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", deleteLesson);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
}
