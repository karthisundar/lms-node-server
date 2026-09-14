import * as dal from "../../db/dal/bucket";
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

export const createBucket = async (
  params: any,
  token: string,
): Promise<any> => {
  const createBucket = await dal.createBucket(
    params,
    await verifyJWT(token)?.payload,
  );
  return createBucket;
};

export const getAllBuckets = async (params: any): Promise<any> => {
  const getAllBuckets = await dal.getAllBuckets(params);
  return getAllBuckets;
};

export const deleteBucket = async (
  params: any,
  token: string,
): Promise<any> => {
  const deleteBucket = await dal.deleteBucket(
    params,
    await verifyJWT(token)?.payload,
  );
  return deleteBucket;
};

export const getBucket = async (params: any): Promise<any> => {
  const getBucket = await dal.getBucket(params);
  return getBucket;
};
