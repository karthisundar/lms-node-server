import * as dal from "../../db/dal/lesson";
import { verifyJWT } from "../auth/jwt.utils";

export const createLesson = async (
  params: any,
  token: string,
): Promise<any> => {
  const createLesson = await dal.createLesson(
    params,
    await verifyJWT(token)?.payload,
  );
  return createLesson;
};

export const getAllLessons = async (params: any): Promise<any> => {
  const getAllLessons = await dal.getAllLessons(params);
  return getAllLessons;
};

export const getLesson = async (params: any): Promise<any> => {
  const getLesson = await dal.getLesson(params);
  return getLesson;
};

export const deleteLesson = async (
  params: any,
  token: string,
): Promise<any> => {
  const deleteLesson = await dal.deleteLesson(
    params,
    await verifyJWT(token)?.payload,
  );
  return deleteLesson;
};
