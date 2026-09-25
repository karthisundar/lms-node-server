"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerRoutes;
const express_1 = require("express");
const user_controller_1 = __importDefault(require("./components/user/user.controller"));
const bucket_controller_1 = require("./components/bucket/bucket.controller");
const session_controller_1 = require("./components/session/session.controller");
const video_controller_1 = require("./components/video/video.controller");
const course_controller_1 = require("./components/course/course.controller");
const module_controller_1 = require("./components/module/module.controller");
const lesson_controller_1 = require("./components/lesson/lesson.controller");
function registerRoutes() {
    const router = (0, express_1.Router)();
    const userController = new user_controller_1.default();
    router.use("/api/user", userController.register());
    const bucketController = new bucket_controller_1.BucketController();
    router.use("/api/bucketMaster", bucketController.register());
    const sessionController = new session_controller_1.SessionController();
    router.use("/api/sessionMaster", sessionController.register());
    const videoController = new video_controller_1.VideoController();
    router.use("/api/video", videoController.register());
    const courseController = new course_controller_1.CourseController();
    router.use("/api/course", courseController.register());
    const moduleController = new module_controller_1.ModuleController();
    router.use("/api/module", moduleController.register());
    const lessonController = new lesson_controller_1.LessionController();
    router.use("/api/lesson", lessonController.register());
    return router;
}
//# sourceMappingURL=routes.js.map