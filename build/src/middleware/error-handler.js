"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const errorHandler = (err, req, res, next) => {
    if (err) {
        const statusCode = err.status || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
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
};
exports.default = errorHandler;
//# sourceMappingURL=error-handler.js.map