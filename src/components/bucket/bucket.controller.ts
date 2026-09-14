import { NextFunction, Response, Request, Router } from "express";
import BaseApi from "../BaseApi";
import logger from "../../lib/logger";
import { StatusCodes } from "http-status-codes";
import { returnSuccess } from "../../abstractions/ApiResponses";
import * as service from "./bucket.service";
import clientLabel from "../../config/clientlabel.config.json";
import serverLabel from "../../config/serverlabel.config.json";
import { checkAccess } from "../../middleware/authorization";

export class BucketController extends BaseApi {
  constructor() {
    super();
  }

  public register(): Router {
    this.router.post("/createSession", this.createSession.bind(this));
    this.router.post("/createBucket", this.createBucket.bind(this));
    this.router.get("/getAllBuckets", this.getAllBuckets.bind(this));
    this.router.get("/getBucket", this.getBucket.bind(this));
    this.router.post("/deleteBucket", this.deleteBucket.bind(this));
    return this.router;
  }

  public async createBucket(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const createBucket = await service.createBucket(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", createBucket);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async createSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const createSession = await service.createSession(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", createSession);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async getAllBuckets(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getAllBuckets = await service.getAllBuckets(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getAllBuckets);
    //   console.log(getAllBuckets, "getAllBuckets from controller");
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async deleteBucket(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deleteBucket = await service.deleteBucket(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", deleteBucket);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async getBucket(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getBucket = await service.getBucket(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getBucket);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
}
