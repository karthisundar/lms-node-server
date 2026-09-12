import * as dal from "../../db/dal/user";
import * as bcrypt from "bcrypt";
import { verifyJWT } from "../auth/jwt.utils";

export const passwordChangetoEncrypt = async (
  password: string,
  fromAccess: any,
): Promise<string> => {
  const bufferObj = Buffer.from(password, "base64");

  const decodedString = bufferObj.toString("utf8");

  const salt = bcrypt.genSaltSync(10);

  const hashPassword =
    fromAccess == 1
      ? bcrypt.hashSync(`${decodedString}`, salt)
      : bcrypt.hashSync(`${password}`, salt);

  return hashPassword;
};

export const login = async (userData: any): Promise<any> => {
  const login = await dal.login(userData);
  return login;
};

export const logout = async (payload: any): Promise<any> => {
  const logout = await dal.logout(payload);
  return logout;
};

export const setPassword = async (token: any, bodyData: any): Promise<any> => {
  const setPassword = await dal.setPassword(
    await verifyJWT(token)?.payload,
    bodyData,
  );

  return setPassword;
};

export const createUser = async (params: any, token: string): Promise<any> => {
  // console.log(token, "from token");
  const createUser = await dal.createUser(
    params,
    await verifyJWT(token)?.payload,
  );
  return createUser;
};

export const checkCreateUser = async (params: any): Promise<any> => {
  const checkCreateUser = await dal.checkCreateUser(params);
  return checkCreateUser;
};

export const getAllUser = async (params: any): Promise<any> => {
  const getAllUser = await dal.getAllUser(params);
  return getAllUser;
};

export const deleteUser = async (params: any, token: string): Promise<any> => {
  const deleteUser = await dal.deleteUser(
    params,
    await verifyJWT(token)?.payload,
  );
  return deleteUser;
};
