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
export const createLessonVideoMapping = async (
  params: any,
  token: string,
): Promise<any> => {
  const createLessonVideoMapping = await dal.createLessonVideoMapping(
    params,
    await verifyJWT(token)?.payload,
  );
  return createLessonVideoMapping;
};

export const getAllLessonVideoMappings = async (params: any): Promise<any> => {
  const getAllLessonVideoMappings = await dal.getAllLessonVideoMappings(params);
  return getAllLessonVideoMappings;
};

export const getLessonVideoMapping = async (params: any): Promise<any> => {
  const getLessonVideoMapping = await dal.getLessonVideoMapping(params);
  return getLessonVideoMapping;
};

export const deleteLessonVideoMapping = async (
  params: any,
  token: string,
): Promise<any> => {
  const deleteLessonVideoMapping = await dal.deleteLessonVideoMapping(
    params,
    await verifyJWT(token)?.payload,
  );
  return deleteLessonVideoMapping;
};

export const createLessonNotes = async (
  params: any,
  token: string,
  files?: any,
): Promise<any> => {
  const createLessonNotes = await dal.createLessonNotes(
    params,
    await verifyJWT(token)?.payload,
    files,
  );
  return createLessonNotes;
};

export const getAllLessonNotes = async (params: any): Promise<any> => {
  const getAllLessonNotes = await dal.getAllLessonNotes(params);
  return getAllLessonNotes;
};

export const getLessonNotes = async (params: any): Promise<any> => {
  const getLessonNotes = await dal.getLessonNotes(params);
  return getLessonNotes;
};

export const deleteLessonNotes = async (
  params: any,
  token: string,
): Promise<any> => {
  const deleteLessonNotes = await dal.deleteLessonNotes(
    params,
    await verifyJWT(token)?.payload,
  );
  return deleteLessonNotes;
};

export const createUserLessonMapping = async (
  params: any,
  token: string,
): Promise<any> => {
  const createUserLessonMapping = await dal.createUserLessonMapping(
    params,
    await verifyJWT(token)?.payload,
  );
  return createUserLessonMapping;
};

export const getAllUserLessonMappings = async (
  params: any,
  token: string,
): Promise<any> => {
  const getAllUserLessonMappings = await dal.getAllUserLessonMappings(
    params,
    await verifyJWT(token)?.payload,
  );
  return getAllUserLessonMappings;
};

export const getUserLessonMapping = async (
  params: any,
  token: string,
): Promise<any> => {
  const getUserLessonMapping = await dal.getUserLessonMapping(
    params?.userLessonRefId,
    await verifyJWT(token)?.payload,
  );
  return getUserLessonMapping;
};

export const deleteUserLessonMapping = async (
  params: any,
  token: string,
): Promise<any> => {
  const deleteUserLessonMapping = await dal.deleteUserLessonMapping(
    params?.userLessonRefId,
    await verifyJWT(token)?.payload,
  );
  return deleteUserLessonMapping;
};
