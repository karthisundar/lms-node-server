import { NextFunction, Response, Request, Router } from "express";
import BaseApi from "../BaseApi";
import { StatusCodes } from "http-status-codes";
import { returnSuccess } from "../../abstractions/ApiResponses";
import * as service from "./video.service";
import videoUpload from "../../middleware/videoUpload";
import { checkAccess, checkAdminAccess } from "../../middleware/authorization";
import { verifyJWT } from "../auth/jwt.utils";
import path from "path";

export class VideoController extends BaseApi {
  constructor() {
    super();
  }

  public register(): Router {
    this.router.post("/upload", checkAdminAccess, videoUpload.single("video"), this.uploadVideo.bind(this));
    this.router.post("/createVideo", checkAdminAccess, this.createVideo.bind(this));
    this.router.get("/getAllVideos", checkAccess, this.getAllVideos.bind(this));
    this.router.get("/getVideo", checkAccess, this.getVideo.bind(this));
    this.router.post("/deleteVideo", checkAdminAccess, this.deleteVideo.bind(this));
    this.router.get("/getVideoProgress", checkAccess, this.getVideoProgress.bind(this));
    this.router.post(
      "/createVideoProgress",
      checkAccess,
      this.createVideoProgress.bind(this),
    );
    return this.router;
  }

  public async uploadVideo(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const token = await verifyJWT(authHeader);
      const user = token?.payload;
      if (!user) {
        res.status(401).json({ success: false, message: "Invalid session" });
        return;
      }

      const file = (req as any).file;
      if (!file) {
        res.status(400).json({ success: false, message: "No video file provided" });
        return;
      }

      // Safe relative object key or filename
      const relativeKey = file.key || `videos/${file.filename}`;
      const filename = path.basename(relativeKey);

      res.locals.data = returnSuccess(StatusCodes.OK, "Video uploaded successfully", {
        fileName: filename,
        relativeKey,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      });
      super.send(res);
    } catch (error) {
      next(error);
    }
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

  public async createVideoProgress(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const createVideoProgress = await service.createVideoProgress(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", createVideoProgress);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
  public async getVideoProgress(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getVideoProgress = await service.getVideoProgress(
        req.query?.videoRefId,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", getVideoProgress);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
}
