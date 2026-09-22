import { Op, Transaction } from "sequelize";
import { randomUUID } from "crypto";

import sequelizeConnection from "../config";
import CourseMaster from "../model/CourseMaster";

import { getActionUser } from "./user";
import { paginationService } from "../../components/util/pagination";

import logger from "../../lib/logger";

export const createCourse = async (
  queryData: any,
  payload: any,
): Promise<any> => {
  try {
    const courseRefId = queryData?.courseRefId?.trim();

    const courseName = queryData?.courseName?.trim();
    const description = queryData?.description?.trim() || null;
    const status = queryData?.status?.trim() || "draft";

    /**
     * Validate course name
     */
    if (!courseName) {
      throw new Error("COURSE_E_00002");
    }

    /**
     * Logged-in user
     */
    const findUser = await getActionUser(payload?.user_ref_id);

    if (!findUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    /**
     * ========================================================
     * UPDATE FLOW
     * ========================================================
     */
    if (courseRefId) {
      const existingCourse = await CourseMaster.findOne({
        where: {
          courseRefId,
        },
      });

      if (!existingCourse) {
        throw new Error("COURSE_E_00001");
      }

      /**
       * Check duplicate course name
       *
       * Exclude current course.
       */
      const duplicateCourse = await CourseMaster.findOne({
        where: {
          courseName,
          courseRefId: {
            [Op.ne]: courseRefId,
          },
        },
      });

      if (duplicateCourse) {
        throw new Error("COURSE_E_00004");
      }

      const updateObj: any = {
        courseName,
        description,
        status,
        updatedBy: findUser.user_id,
        updatedAt: new Date(),
      };

      await sequelizeConnection.transaction(
        async (transaction: Transaction) => {
          await CourseMaster.update(updateObj, {
            where: {
              courseRefId,
            },
            transaction,
          });
        },
      );

      return true;
    }

    /**
     * ========================================================
     * CREATE FLOW
     * ========================================================
     */

    /**
     * Check duplicate course name
     */
    const existingCourse = await CourseMaster.findOne({
      where: {
        courseName,
      },
    });

    if (existingCourse) {
      throw new Error("COURSE_E_00004");
    }

    /**
     * Generate course code
     *
     * Example:
     * CRS-1726849328123
     */
    const courseCode = `CRS-${Date.now()}`;

    const createObj: any = {
      courseRefId: randomUUID(),
      courseCode,
      courseName,
      description,
      status,

      createdBy: findUser.user_id,
      updatedBy: null,
      deletedBy: null,

      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    };

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await CourseMaster.create(createObj, {
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error createCourse/course.ts", error);
    throw error;
  }
};

export const getAllCourses = async (queryData: any): Promise<any> => {
  try {
    const page = Math.max(Number(queryData?.page) || 1, 1);

    const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);

    const whereObj: any = {};

    /**
     * ========================================================
     * SEARCH
     * ========================================================
     */
    const search = queryData?.search?.trim();

    if (search) {
      whereObj[Op.or] = [
        {
          courseName: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          courseCode: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          description: {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    /**
     * ========================================================
     * STATUS FILTER
     * ========================================================
     */
    if (queryData?.status) {
      whereObj.status = queryData.status;
    }

    /**
     * ========================================================
     * GET ALL DATA
     * ========================================================
     *
     * No limit
     * No offset
     *
     * paginationService will handle pagination.
     */
    const { rows } = await CourseMaster.findAndCountAll({
      where: whereObj,

      order: [["createdAt", "DESC"]],

      raw: true,
    });

    /**
     * ========================================================
     * PAGINATION
     * ========================================================
     */
    const pagi = await paginationService(rows, page, pageSize);

    return pagi;
  } catch (error) {
    logger.error("Error getAllCourses/course.ts", error);

    throw error;
  }
};
export const getCourse = async (courseRefId: string): Promise<any> => {
  try {
    if (!courseRefId?.trim()) {
      throw new Error("COURSE_E_00001");
    }

    const course = await CourseMaster.findOne({
      where: {
        courseRefId: courseRefId.trim(),
      },

      raw: true,
    });

    if (!course) {
      throw new Error("COURSE_E_00001");
    }

    return course;
  } catch (error) {
    logger.error("Error getCourse/course.ts", error);

    throw error;
  }
};

export const deleteCourse = async (
  courseRefId: string,
  payload: any,
): Promise<any> => {
  try {
    if (!courseRefId?.trim()) {
      throw new Error("COURSE_E_00001");
    }

    /**
     * Logged-in user
     */
    const findUser = await getActionUser(payload?.user_ref_id);

    if (!findUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    /**
     * Find course
     */
    const existingCourse = await CourseMaster.findOne({
      where: {
        courseRefId: courseRefId.trim(),
      },
    });

    if (!existingCourse) {
      throw new Error("COURSE_E_00001");
    }

    /**
     * Transaction
     */
    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      /**
       * Store deletedBy first.
       */
      await CourseMaster.update(
        {
          deletedBy: findUser.user_id,
          updatedBy: findUser.user_id,
          updatedAt: new Date(),
        },
        {
          where: {
            courseRefId: courseRefId.trim(),
          },
          transaction,
        },
      );

      /**
       * Because paranoid = true,
       * this performs SOFT DELETE.
       */
      await CourseMaster.destroy({
        where: {
          courseRefId: courseRefId.trim(),
        },
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error deleteCourse/course.ts", error);

    throw error;
  }
};
