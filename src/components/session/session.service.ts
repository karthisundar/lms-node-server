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
