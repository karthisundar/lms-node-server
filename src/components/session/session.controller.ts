import { NextFunction, Response, Request, Router } from "express";
import BaseApi from "../BaseApi";
import logger from "../../lib/logger";
import { StatusCodes } from "http-status-codes";
import { returnSuccess } from "../../abstractions/ApiResponses";
import * as service from "./session.service";
import clientLabel from "../../config/clientlabel.config.json";
import serverLabel from "../../config/serverlabel.config.json";
import { checkAccess } from "../../middleware/authorization";