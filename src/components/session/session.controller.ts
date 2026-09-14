import { NextFunction, Response, Request, Router } from "express";
import BaseApi from "../BaseApi";
import logger from "../../lib/logger";
import { StatusCodes } from "http-status-codes";
import { returnSuccess } from "../../abstractions/ApiResponses";
import * as service from "./session.service";

export class SessionController extends BaseApi {
  constructor() {
    super();
  }

  public register(): Router {
    this.router.post("/createSession", this.createSession.bind(this));
    this.router.get("/getAllSessions", this.getAllSessions.bind(this));
    this.router.get("/getSession", this.getSession.bind(this));
    this.router.post("/deleteSession", this.deleteSession.bind(this));
    this.router.post(
      "/createUserSessionMapping",
      this.createUserSessionMapping.bind(this),
    );
    this.router.get(
      "/getAllUserSessionMappings",
      this.getAllUserSessionMappings.bind(this),
    );
    this.router.get(
      "/getUserSessionMapping",
      this.getUserSessionMapping.bind(this),
    );
    this.router.post(
      "/deleteUserSessionMapping",
      this.deleteUserSessionMapping.bind(this),
    );
    return this.router;
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

  public async getAllSessions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getAllSessions = await service.getAllSessions(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getAllSessions);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
  public async getSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getSession = await service.getSession(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getSession);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async deleteSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deleteSession = await service.deleteSession(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", deleteSession);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async createUserSessionMapping(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const createUserSessionMapping = await service.createUserSessionMapping(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        "",
        createUserSessionMapping,
      );
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async getAllUserSessionMappings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const createUserSessionMapping = await service.getAllUserSessionMappings(
        req.query,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        "",
        createUserSessionMapping,
      );
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
  public async getUserSessionMapping(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const createUserSessionMapping = await service.getUserSessionMapping(
        req.query,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        "",
        createUserSessionMapping,
      );
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async deleteUserSessionMapping(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deleteUserSessionMapping = await service.deleteUserSessionMapping(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        "",
        deleteUserSessionMapping,
      );
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
}
