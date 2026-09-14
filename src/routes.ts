import { Router } from "express";
import UserController from "./components/user/user.controller";
import { BucketController } from "./components/bucket/bucket.controller";
import { SessionController } from "./components/session/session.controller";
import { VideoController } from "./components/video/video.controller";

export default function registerRoutes(): Router {
  const router = Router();

  const userController = new UserController();
  router.use("/api/user", userController.register());

  const bucketController = new BucketController();
  router.use("/api/bucketMaster", bucketController.register());

  const sessionController = new SessionController();
  router.use("/api/sessionMaster", sessionController.register());

  const videoController = new VideoController();
  router.use("/api/video", videoController.register());

  return router;
}
