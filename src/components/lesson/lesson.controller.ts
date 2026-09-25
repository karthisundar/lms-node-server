import { NextFunction, Response, Request, Router } from "express";
import BaseApi from "../BaseApi";
import logger from "../../lib/logger";
import { StatusCodes } from "http-status-codes";
import { returnSuccess } from "../../abstractions/ApiResponses";
import * as service from "./lesson.service";
import lessonNotesUpload from "../../middleware/lessonNotesUpload";

export class LessionController extends BaseApi {
  constructor() {
    super();
  }

  public register(): Router {
    this.router.post("/createLesson", this.createLesson.bind(this));
    this.router.post("/deleteLesson", this.deleteLesson.bind(this));
    this.router.get("/getAllLessons", this.getAllLessons.bind(this));
    this.router.get("/getLesson", this.getLesson.bind(this));
    this.router.get(
      "/getAllLessonVideoMappings",
      this.getAllLessonVideoMappings.bind(this),
    );
    this.router.get(
      "/getLessonVideoMapping",
      this.getLessonVideoMapping.bind(this),
    );
    this.router.post(
      "/createLessonVideoMapping",
      this.createLessonVideoMapping.bind(this),
    );
    this.router.post(
      "/deleteLessonVideoMapping",
      this.deleteLessonVideoMapping.bind(this),
    );
    this.router.post(
      "/createLessonNotes",
      lessonNotesUpload.single("file"),
      this.createLessonNotes.bind(this),
    );
    this.router.post("/deleteLessonNotes", this.deleteLessonNotes.bind(this));
    this.router.get("/getAllLessonNotes", this.getAllLessonNotes.bind(this));
    this.router.get("/getLessonNotes", this.getLessonNotes.bind(this));
    this.router.post(
      "/createUserLessonMapping",
      this.createUserLessonMapping.bind(this),
    );
    this.router.post(
      "/deleteUserLessonMapping",
      this.deleteUserLessonMapping.bind(this),
    );
    this.router.get(
      "/getAllUserLessonMappings",
      this.getAllUserLessonMappings.bind(this),
    );
    this.router.get(
      "/getUserLessonMapping",
      this.getUserLessonMapping.bind(this),
    );
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

  public async createLessonVideoMapping(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const createLessonVideoMapping = await service.createLessonVideoMapping(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        "",
        createLessonVideoMapping,
      );
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async getAllLessonVideoMappings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getAllLessonVideoMappings = await service.getAllLessonVideoMappings(
        req.query,
      );
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        "",
        getAllLessonVideoMappings,
      );
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async getLessonVideoMapping(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getLessonVideoMapping = await service.getLesson(req.query);
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        "",
        getLessonVideoMapping,
      );
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async deleteLessonVideoMapping(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deleteLessonVideoMapping = await service.deleteLessonVideoMapping(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        "",
        deleteLessonVideoMapping,
      );
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async createLessonNotes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const file = req.file;

      const createLessonNotes = await service.createLessonNotes(
        req.body,
        req.headers.authorization,
        file,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", createLessonNotes);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async getAllLessonNotes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getAllLessonNotes = await service.getAllLessonNotes(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getAllLessonNotes);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async getLessonNotes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getLessonNotes = await service.getLessonNotes(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getLessonNotes);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async deleteLessonNotes(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deleteLessonNotes = await service.deleteLessonNotes(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", deleteLessonNotes);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
  public async createUserLessonMapping(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const createUserLessonMapping = await service.createUserLessonMapping(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        "",
        createUserLessonMapping,
      );
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
  public async getAllUserLessonMappings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getAllUserLessonMappings = await service.getAllUserLessonMappings(
        req.query,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        "",
        getAllUserLessonMappings,
      );
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
  public async getUserLessonMapping(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getUserLessonMapping = await service.getUserLessonMapping(
        req.query,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", getUserLessonMapping);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
  public async deleteUserLessonMapping(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deleteUserLessonMapping = await service.deleteUserLessonMapping(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        "",
        deleteUserLessonMapping,
      );
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
}
