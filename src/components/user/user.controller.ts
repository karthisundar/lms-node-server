import { NextFunction, Response, Request, Router } from "express";
import BaseApi from "../BaseApi";
import logger from "../../lib/logger";
import { StatusCodes } from "http-status-codes";
import { returnSuccess } from "../../abstractions/ApiResponses";
import * as service from "./user.service";
import clientLabel from "../../config/clientlabel.config.json";
import serverLabel from "../../config/serverlabel.config.json";
import { checkAccess } from "../../middleware/authorization";
import { validator } from "../validator";
import { checkSchema } from "express-validator";
import { checkCreateUser } from "./user.validator";
// import {  loginUser } from "./user.validator";

export default class UserController extends BaseApi {
  constructor() {
    super();
  }

  public register(): Router {
    // this.router.post('/login',validator(checkSchema(loginUser)),this.login.bind(this));
    this.router.post("/login", this.login.bind(this));
    this.router.get("/logout", this.logout.bind(this));
    this.router.post("/setPassword", checkAccess, this.setPassword.bind(this));
    this.router.post(
      "/createUser",
      checkAccess,
      validator(checkSchema(checkCreateUser)),
      this.createUser.bind(this),
    );
    this.router.get("/getAllUsers", checkAccess, this.getAllUser.bind(this));
    this.router.get("/clientLabel", this.clientLabelJson.bind(this));
    this.router.post("/deleteUser", this.deleteUser.bind(this));

    return this.router;
  }

  public async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const bodyData = req.body;

      const login = await service.login(bodyData);
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        clientLabel.user.login.code,
        [login],
      );
      super.send(res);
    } catch (error) {
      next(error);
      logger.error(error);
    }
  }

  public async logout(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const token = req?.headers.authorization;
      const logout = await service.logout(token);
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        clientLabel.user.logOutUser.code,
        logout,
      );
      super.send(res);
    } catch (error) {
      next(error);
      logger.error(error);
    }
  }

  public async createUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const createUser = await service.createUser(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", createUser);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async getAllUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const getAllUser = await service.getAllUser(req.query);
      res.locals.data = returnSuccess(StatusCodes.OK, "", getAllUser);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  // public async checkDeviceAccessToken(req:Request,res:Response,next:NextFunction) : Promise <void>{
  //     try {

  //         const token = req.query;
  //         const checkDeviceAccessToken = await service.checkDeviceAccessToken(token);
  //         res.locals.data = returnSuccess(StatusCodes.OK,clientLabel.user.getDeviceToken.code,checkDeviceAccessToken);
  //         super.send(res);
  //     } catch (error) {
  //         next(error);
  //         logger.error(error);
  //     }
  // }
  // public async deleteAllowedDeviceToken(req:Request,res:Response,next:NextFunction) : Promise <void>{
  //     try {

  //         const token = req.query;
  //         const checkDeviceAccessToken = await service.deleteAllowedDeviceToken(token);
  //         res.locals.data = returnSuccess(StatusCodes.OK,clientLabel.user.getDeviceToken.code,checkDeviceAccessToken);
  //         super.send(res);
  //     } catch (error) {
  //         next(error);
  //         logger.error(error);
  //     }
  // }
  // public async getAllAllowdDevice(req:Request,res:Response,next:NextFunction) : Promise <void>{
  //     try {

  //         const token = req.query;
  //         const getAllAllowdDevice = await service.getAllAllowdDevice(token);
  //         res.locals.data = returnSuccess(StatusCodes.OK,clientLabel.user.getDeviceToken.code,getAllAllowdDevice);
  //         super.send(res);
  //     } catch (error) {
  //         next(error);
  //         logger.error(error);
  //     }
  // }
  // public async createDeviceToken(req:Request,res:Response,next:NextFunction) : Promise <void>{
  //     try {

  //         const token = req.headers.authorization;
  //         const createDeviceToken = await service.createDeviceToken(req.body,token);
  //         res.locals.data = returnSuccess(StatusCodes.OK,clientLabel.user.deviceIdCreate.code,createDeviceToken);
  //         super.send(res);
  //     } catch (error) {
  //         next(error);
  //         logger.error(error);
  //     }
  // }
  public async setPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const token = req?.headers.authorization;
      const hashPassword = await service.passwordChangetoEncrypt(
        req?.body?.password,
        1,
      );

      let bodyData = req.body;
      bodyData.hashPassword = hashPassword;

      const changePassword = await service.setPassword(token, bodyData);
      res.locals.data = returnSuccess(
        StatusCodes.OK,
        clientLabel.user.passwordChanged.code,
        changePassword,
      );
      super.send(res);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  public async clientLabelJson(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.locals.data = returnSuccess(StatusCodes.OK, "", serverLabel);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }

  public async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deleteUser = await service.deleteUser(
        req.body,
        req.headers.authorization,
      );
      res.locals.data = returnSuccess(StatusCodes.OK, "", deleteUser);
      super.send(res);
    } catch (error) {
      next(error);
    }
  }
}
