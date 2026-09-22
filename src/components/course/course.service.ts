import * as dal from "../../db/dal/course";
import { verifyJWT } from "../auth/jwt.utils";

export const createCourse = async (
  params: any,
  token: string,
): Promise<any> => {
  const createCourse = await dal.createCourse(
    params,
    await verifyJWT(token)?.payload,
  );
  return createCourse;
};
export const getAllCourses = async (params: any): Promise<any> => {
  const getAllCourses = await dal.getAllCourses(params);
  return getAllCourses;
};

export const getCourse = async (params: any): Promise<any> => {
  const getAllCourses = await dal.getAllCourses(params);
  return getAllCourses;
};

export const deleteCourse = async (
  params: any,
  token: string,
): Promise<any> => {
  const deleteCourse = await dal.deleteCourse(
    params,
    await verifyJWT(token)?.payload,
  );
  return deleteCourse;
};
