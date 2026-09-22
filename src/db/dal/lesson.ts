import { Op, Transaction } from "sequelize";
import { randomUUID } from "crypto";

import sequelizeConnection from "../config";

import LessonMaster from "../model/LessonMaster";
import ModuleMaster from "../model/ModuleMaster";
import VideoMaster from "../model/VideoMaster";

import { getActionUser } from "./user";

import logger from "../../lib/logger";
import { paginationService } from "../../components/util/pagination";

/**
 * ============================================================
 * CREATE / UPDATE LESSON
 * ============================================================
 *
 * CREATE:
 * lessonRefId not provided
 *
 * UPDATE:
 * lessonRefId provided
 */
export const createLesson = async (
  queryData: any,
  payload: any,
): Promise<any> => {
  try {
    /**
     * ========================================================
     * INPUT
     * ========================================================
     */

    const lessonRefId = queryData?.lessonRefId?.trim();

    const moduleRefId = queryData?.moduleRefId?.trim();

    const lessonName = queryData?.lessonName?.trim();

    const description = queryData?.description?.trim() || null;

    const videoRefId = queryData?.videoRefId?.trim() || null;

    const notes = queryData?.notes?.trim() || null;

    const displayOrder = Number(queryData?.displayOrder) || 1;

    const status = queryData?.status?.trim() || "draft";

    /**
     * ========================================================
     * VALIDATION
     * ========================================================
     */

    if (!moduleRefId) {
      throw new Error("LESSON_E_00002");
    }

    if (!lessonName) {
      throw new Error("LESSON_E_00003");
    }

    if (!Number.isInteger(displayOrder) || displayOrder < 1) {
      throw new Error("LESSON_E_00004");
    }

    /**
     * ========================================================
     * LOGGED-IN USER
     * ========================================================
     */

    const findUser = await getActionUser(payload?.user_ref_id);

    if (!findUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    /**
     * ========================================================
     * CHECK MODULE
     * ========================================================
     */

    const existingModule = await ModuleMaster.findOne({
      where: {
        moduleRefId,
      },
    });

    if (!existingModule) {
      throw new Error("MODULE_E_00001");
    }

    /**
     * ========================================================
     * CHECK VIDEO
     * ========================================================
     *
     * Video is optional.
     *
     * If videoRefId is provided,
     * make sure it exists.
     */

    if (videoRefId) {
      const existingVideo = await VideoMaster.findOne({
        where: {
          videoRefId,
        },
      });

      if (!existingVideo) {
        throw new Error("VIDEO_E_00001");
      }
    }

    /**
     * ========================================================
     * UPDATE FLOW
     * ========================================================
     */

    if (lessonRefId) {
      const existingLesson = await LessonMaster.findOne({
        where: {
          lessonRefId,
        },
      });

      if (!existingLesson) {
        throw new Error("LESSON_E_00001");
      }

      /**
       * Check duplicate lesson name
       * inside same module.
       */

      const duplicateLesson = await LessonMaster.findOne({
        where: {
          moduleRefId,

          lessonName,

          lessonRefId: {
            [Op.ne]: lessonRefId,
          },
        },
      });

      if (duplicateLesson) {
        throw new Error("LESSON_E_00005");
      }

      /**
       * Update object
       */

      const updateObj: any = {
        moduleRefId,

        lessonName,

        description,

        videoRefId,

        notes,

        displayOrder,

        status,

        updatedBy: findUser.user_id,

        updatedAt: new Date(),
      };

      /**
       * Update transaction
       */

      await sequelizeConnection.transaction(
        async (transaction: Transaction) => {
          await LessonMaster.update(updateObj, {
            where: {
              lessonRefId,
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
     * Check duplicate lesson name
     * inside same module.
     */

    const existingLesson = await LessonMaster.findOne({
      where: {
        moduleRefId,

        lessonName,
      },
    });

    if (existingLesson) {
      throw new Error("LESSON_E_00005");
    }

    /**
     * Generate lesson code
     */

    const lessonCode = `LES-${Date.now()}`;

    /**
     * Create object
     */

    const createObj: any = {
      lessonRefId: randomUUID(),

      moduleRefId,

      lessonCode,

      lessonName,

      description,

      videoRefId,

      notes,

      displayOrder,

      status,

      createdBy: findUser.user_id,

      updatedBy: null,

      deletedBy: null,

      createdAt: new Date(),

      updatedAt: null,

      deletedAt: null,
    };

    /**
     * Create transaction
     */

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await LessonMaster.create(createObj, {
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error createLesson/lessonMaster.ts", error);

    throw error;
  }
};

/**
 * ============================================================
 * GET ALL LESSONS
 * ============================================================
 *
 * Query:
 *
 * page
 * pageSize
 * search
 * status
 * moduleRefId
 */
export const getAllLessons = async (queryData: any): Promise<any> => {
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
          lessonName: {
            [Op.like]: `%${search}%`,
          },
        },

        {
          lessonCode: {
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
     * MODULE FILTER
     * ========================================================
     */

    if (queryData?.moduleRefId) {
      whereObj.moduleRefId = queryData.moduleRefId;
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
     * GET DATA
     * ========================================================
     *
     * No limit.
     * No offset.
     *
     * paginationService handles
     * pagination.
     */

    const { rows } = await LessonMaster.findAndCountAll({
      where: whereObj,

      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "DESC"],
      ],

      raw: true,
    });

    /**
     * ========================================================
     * PAGINATION
     * ========================================================
     */

    const result = await paginationService(rows, page, pageSize);

    return result;
  } catch (error) {
    logger.error("Error getAllLessons/lessonMaster.ts", error);

    throw error;
  }
};

/**
 * ============================================================
 * GET SINGLE LESSON
 * ============================================================
 *
 * Uses lessonRefId.
 */
export const getLesson = async (lessonRefId: string): Promise<any> => {
  try {
    if (!lessonRefId?.trim()) {
      throw new Error("LESSON_E_00001");
    }

    const lesson = await LessonMaster.findOne({
      where: {
        lessonRefId: lessonRefId.trim(),
      },

      raw: true,
    });

    if (!lesson) {
      throw new Error("LESSON_E_00001");
    }

    return lesson;
  } catch (error) {
    logger.error("Error getLesson/lessonMaster.ts", error);

    throw error;
  }
};

/**
 * ============================================================
 * DELETE LESSON
 * ============================================================
 *
 * Soft delete.
 *
 * paranoid: true
 */
export const deleteLesson = async (
  lessonRefId: string,
  payload: any,
): Promise<any> => {
  try {
    if (!lessonRefId?.trim()) {
      throw new Error("LESSON_E_00001");
    }

    /**
     * ========================================================
     * LOGGED-IN USER
     * ========================================================
     */

    const findUser = await getActionUser(payload?.user_ref_id);

    if (!findUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    /**
     * ========================================================
     * FIND LESSON
     * ========================================================
     */

    const existingLesson = await LessonMaster.findOne({
      where: {
        lessonRefId: lessonRefId.trim(),
      },
    });

    if (!existingLesson) {
      throw new Error("LESSON_E_00001");
    }

    /**
     * ========================================================
     * DELETE
     * ========================================================
     */

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      /**
       * Store deletedBy
       */

      await LessonMaster.update(
        {
          deletedBy: findUser.user_id,

          updatedBy: findUser.user_id,

          updatedAt: new Date(),
        },

        {
          where: {
            lessonRefId: lessonRefId.trim(),
          },

          transaction,
        },
      );

      /**
       * Soft delete
       */

      await LessonMaster.destroy({
        where: {
          lessonRefId: lessonRefId.trim(),
        },

        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error deleteLesson/lessonMaster.ts", error);

    throw error;
  }
};
