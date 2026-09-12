import { Request, Response, NextFunction } from "express";
import * as service from '../components/user/user.service'
import { returnSuccess } from "../abstractions/ApiResponses";
import { StatusCodes } from "http-status-codes";
import logger from "../lib/logger";
import { verifyJWT } from "../components/auth/jwt.utils";


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


export async function checkAccess(req: Request, res: Response, next: NextFunction): Promise<any> {

  try {
    const token = req.headers?.authorization;
    if (!token || token?.trim() == '') {
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, '')
      return res.status(401).json(res.locals.data);
    }
    // throw new Error(clientLabel.user.userError.logOutUser.code);

  
    next();
  } catch (err: any) {
    logger.error('autharization catch src/middleware/autharization.ts', err);
    next(err)
  }
}

export const checkAccessReseller = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

  try {
    const token = req.headers?.authorization;
    console.log(token, 'token')
    if (!token || token?.trim() == '') {
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, '')
      return res.status(401).json(res.locals.data);
    }
   
    next()
  } catch (err) {
    logger.error('checkAccessReseller catch src/middleware/autharization.ts', err);
    next(err)
  }
}

export const checkReseller = async (req: Request, res: Response, next: NextFunction): Promise<any> => {



  try {
    const token = req.headers?.authorization;
    if (!token || token?.trim() == '') {
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, '')
      return res.status(401).json(res.locals.data);
    }
    const payload = await verifyJWT(token)?.payload;
    if (payload == null) {
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, '')
      return res.status(403).json(res.locals.data);
    }
    if (!payload?.reseller_ref_id) {
      res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, '')
      return res.status(403).json(res.locals.data);
    }
    // const resellerChek = await resellerService.actionReseller(payload?.reseller_ref_id);

    // if (resellerChek == null) {
    //   res.locals.data = returnSuccess(StatusCodes.UNAUTHORIZED, '')
    //   return res.status(403).json(res.locals.data);
    // }

    next();
  } catch (error) {
    logger.error('reseller valid catch src/middleware/autharization.ts', error);
  }
}