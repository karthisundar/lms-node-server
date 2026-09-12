import ApiError from "../abstractions/ApiError";
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';




const errorHandler = (err: ApiError, req: express.Request, res: express.Response, next: express.NextFunction,): void => {

	if (err) {


		const statusCode: number = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
		let body = {
			statusCode,
			fields: err?.fields,
			response: {
				type: err?.errorMessageType?.type,
				code: [err?.message?.trim() == undefined ? err : err?.message?.trim()],
				message: err?.message?.trim() == undefined ? err : err?.message?.trim() || 'An error occurred during the request.',
				name: err?.name,
				stack: err?.stack?.trim(),
			}

		};
		res.status(statusCode);

		res.send(body);

		next();
	}
}

export default errorHandler