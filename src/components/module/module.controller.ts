import { NextFunction, Response, Request, Router } from "express";
import BaseApi from "../BaseApi";
import logger from "../../lib/logger";
import { StatusCodes } from "http-status-codes";
import { returnSuccess } from "../../abstractions/ApiResponses";
import * as service from "./module.service";

export class ModuleController extends BaseApi {
  constructor() {
    super();
  }

  public register(): Router {
    this.router.post("/createModule", this.createModule.bind(this));
    this.router.post("/deleteModule", this.deleteModule.bind(this));
    this.router.get("/getAllModules", this.getAllModules.bind(this));
    this.router.get("/getModule", this.getModule.bind(this));
    return this.router;
  }

  public async createModule(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const createModule = await service.createModule(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", createModule);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async getAllModules(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getAllModules = await service.getAllModules(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getAllModules);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
  public async getModule(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getModule = await service.getModule(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getModule);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async deleteModule(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deleteModule = await service.deleteModule(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", deleteModule);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
}
