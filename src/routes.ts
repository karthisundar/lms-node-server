import { Router } from "express";
import UserController from "./components/user/user.controller";
import { BucketController } from "./components/bucket/bucket.controller";
import { SessionController } from "./components/session/session.controller";
import { VideoController } from "./components/video/video.controller";
import { CourseController } from "./components/course/course.controller";
import { ModuleController } from "./components/module/module.controller";
import { LessionController } from "./components/lesson/lesson.controller";

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

  const courseController = new CourseController();
  router.use("/api/course", courseController.register());

  const moduleController = new ModuleController();
  router.use("/api/module", moduleController.register());

  const lessonController = new LessionController();
  router.use("/api/lesson", lessonController.register());

  return router;
}
