import { NextFunction, Response, Request, Router } from "express";
import BaseApi from "../BaseApi";
import logger from "../../lib/logger";
import { StatusCodes } from "http-status-codes";
import { returnSuccess } from "../../abstractions/ApiResponses";
import * as service from "./course.service";

export class CourseController extends BaseApi {
  constructor() {
    super();
  }

  public register(): Router {
    this.router.post("/createCourse", this.createCourse.bind(this));
    this.router.post("/deleteCourse", this.deleteCourse.bind(this));
    this.router.get("/getAllCourses", this.getAllCourses.bind(this));
    this.router.get("/getCourse", this.getCourse.bind(this));
    return this.router;
  }

  public async createCourse(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const createCourse = await service.createCourse(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", createCourse);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
  public async getAllCourses(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getAllCourses = await service.getAllCourses(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getAllCourses);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
  public async getCourse(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getCourse = await service.getCourse(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getCourse);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async deleteCourse(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deleteCourse = await service.deleteCourse(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", deleteCourse);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
}
