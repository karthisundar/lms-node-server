"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkReseller = exports.checkAccessReseller = void 0;
exports.checkAccess = checkAccess;
const ApiResponses_1 = require("../abstractions/ApiResponses");
const http_status_codes_1 = require("http-status-codes");
const logger_1 = __importDefault(require("../lib/logger"));
const jwt_utils_1 = require("../components/auth/jwt.utils");
// export const checkAccess1 = (data : string)  => {
//     return async (req:Request, res:Response, next:NextFunction) => { 
//         try{
//             console.log(req.headers?.authorization,'req.headers?.authorization')
//             const checkSessionExpired:any = await service.checkUserToken(req.headers?.authorization);
//             checkSessionExpired?.statusCode==400?  res.locals.data=checkSessionExpired :res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED,'')
//            if(checkSessionExpired){
//             throw new Error('error')
//            }
//         }catch(err:any) {
//             next(err)
//         }
//         next()
//     }
// }
// // checkAccessMiddleware.ts
async function checkAccess(req, res, next) {
    try {
        const token = req.headers?.authorization;
        if (!token || token?.trim() == '') {
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, '');
            return res.status(401).json(res.locals.data);
        }
        // throw new Error(clientLabel.user.userError.logOutUser.code);
        next();
    }
    catch (err) {
        logger_1.default.error('autharization catch src/middleware/autharization.ts', err);
        next(err);
    }
}
const checkAccessReseller = async (req, res, next) => {
    try {
        const token = req.headers?.authorization;
        console.log(token, 'token');
        if (!token || token?.trim() == '') {
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, '');
            return res.status(401).json(res.locals.data);
        }
        next();
    }
    catch (err) {
        logger_1.default.error('checkAccessReseller catch src/middleware/autharization.ts', err);
        next(err);
    }
};
exports.checkAccessReseller = checkAccessReseller;
const checkReseller = async (req, res, next) => {
    try {
        const token = req.headers?.authorization;
        if (!token || token?.trim() == '') {
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, '');
            return res.status(401).json(res.locals.data);
        }
        const payload = await (0, jwt_utils_1.verifyJWT)(token)?.payload;
        if (payload == null) {
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, '');
            return res.status(403).json(res.locals.data);
        }
        if (!payload?.reseller_ref_id) {
            res.locals.data = (0, ApiResponses_1.returnSuccess)(http_status_codes_1.StatusCodes.UNAUTHORIZED, '');
            return res.status(403).json(res.locals.data);
        }
        // const resellerChek = await resellerService.actionReseller(payload?.reseller_ref_id);
        // if (resellerChek == null) {
        //   res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, '')
        //   return res.status(403).json(res.locals.data);
        // }
        next();
    }
    catch (error) {
        logger_1.default.error('reseller valid catch src/middleware/autharization.ts', error);
    }
};
exports.checkReseller = checkReseller;
//# sourceMappingURL=authorization.js.map