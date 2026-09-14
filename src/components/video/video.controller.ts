import { NextFunction, Response, Request, Router } from "express";
import BaseApi from "../BaseApi";
import logger from "../../lib/logger";
import { StatusCodes } from "http-status-codes";
import { returnSuccess } from "../../abstractions/ApiResponses";
import * as service from "./video.service";

export class VideoController extends BaseApi {
  constructor() {
    super();
  }

  public register(): Router {
    this.router.post("/createVideo", this.createVideo.bind(this));
    this.router.get("/getAllVideos", this.getAllVideos.bind(this));
    this.router.get("/getVideo", this.getVideo.bind(this));
    this.router.post("/deleteVideo", this.deleteVideo.bind(this));
    return this.router;
  }

  public async createVideo(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const createVideo = await service.createVideo(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", createVideo);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async getAllVideos(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getAllVideos = await service.getAllVideos(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getAllVideos);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
  public async getVideo(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getVideo = await service.getVideo(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getVideo);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async deleteVideo(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const createVideo = await service.deleteVideo(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", createVideo);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
}
