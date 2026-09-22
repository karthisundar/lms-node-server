import * as dal from "../../db/dal/module";
import { verifyJWT } from "../auth/jwt.utils";

export const createModule = async (
  params: any,
  token: string,
): Promise<any> => {
  const createModule = await dal.createModule(
    params,
    await verifyJWT(token)?.payload,
  );
  return createModule;
};

export const getAllModules = async (params:any):Promise<any> => {
    const getAllModules = await dal.getAllModules(params);
    return getAllModules;
}

export const getModule = async (params:any):Promise<any> => {
    const getModule = await dal.getModule(params);
    return getModule;
}

export const deleteModule = async (
  params: any,
  token: string,
): Promise<any> => {
  const deleteModule = await dal.deleteModule(
    params,
    await verifyJWT(token)?.payload,
  );
  return deleteModule;
};
