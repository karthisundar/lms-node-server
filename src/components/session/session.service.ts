import * as dal from "../../db/dal/session";
import { verifyJWT } from "../auth/jwt.utils";

export const createSession = async (
  params: any,
  token: string,
): Promise<any> => {
  const createSession = await dal.createSession(
    params,
    await verifyJWT(token)?.payload,
  );
  return createSession;
};

export const getAllSessions = async (params: any): Promise<any> => {
  const getAllSessions = await dal.getAllSessions(params);
  return getAllSessions;
};

export const getSession = async (params: any): Promise<any> => {
  const getSession = await dal.getSession(params);
  return getSession;
};

export const deleteSession = async (
  params: any,
  token: string,
): Promise<any> => {
  const deleteSession = await dal.deleteSession(
    params,
    await verifyJWT(token)?.payload,
  );
  return deleteSession;
};

export const createUserSessionMapping = async (
  params: any,
  token: string,
): Promise<any> => {
  const createUserSessionMapping = await dal.createUserSessionMapping(
    params,
    await verifyJWT(token)?.payload,
  );
  return createUserSessionMapping;
};

export const getAllUserSessionMappings = async (
  params: any,
  token: string,
): Promise<any> => {
  const getAllUserSessionMappings = await dal.getAllUserSessionMappings(
    params,
    await verifyJWT(token)?.payload,
  );
  return getAllUserSessionMappings;
};

export const getUserSessionMapping = async (
  params: any,
  token: string,
): Promise<any> => {
  const getUserSessionMapping = await dal.getUserSessionMapping(
    params,
    await verifyJWT(token)?.payload,
  );
  return getUserSessionMapping;
};

export const deleteUserSessionMapping = async (
  params: any,
  token: string,
): Promise<any> => {
  const deleteUserSessionMapping = await dal.deleteUserSessionMapping(
    params?.userSessionRefId,
    await verifyJWT(token)?.payload,
  );
  return deleteUserSessionMapping;
};
