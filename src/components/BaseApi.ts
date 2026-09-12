import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../lib/logger';

export default abstract class BaseApi{
    protected router: Router;

    protected constructor() {
		this.router = Router();
	}

    public abstract register(): void;
    public abstract register(): void;

    public send(res: Response, statusCode: number = StatusCodes.OK): void {
        let obj = {};
		obj = res.locals.data;

        if (
			
			environment.isTestEnvironment()
		) {
			logger.info(JSON.stringify(obj, null, 2));
	
        }

        res.status(statusCode).send(obj);
    }
}