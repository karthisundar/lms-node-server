import { Op, Transaction } from "sequelize";
import { randomUUID } from "crypto";

import sequelizeConnection from "../config";

import LessonMaster from "../model/LessonMaster";
import ModuleMaster from "../model/ModuleMaster";
import VideoMaster from "../model/VideoMaster";

import { getActionUser } from "./user";

import logger from "../../lib/logger";
import { paginationService } from "../../components/util/pagination";
import LessonVideoMapping from "../model/LessonVideoMapping";
import LessonNotes from "../model/LessonNotes";
import UserLessonMapping from "../model/UserLessonMapping";

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
export const createLessonVideoMapping = async (
  queryData: any,
  payload: any,
): Promise<any> => {
  try {
    /**
     * ========================================================
     * INPUT
     * ========================================================
     */

    const lessonVideoMappingRefId = queryData?.lessonVideoMappingRefId?.trim();

    const lessonRefId = queryData?.lessonRefId?.trim();

    const videoRefId = queryData?.videoRefId?.trim();

    const displayOrder = Number(queryData?.displayOrder) || 1;

    const status = queryData?.status?.trim() || "active";

    /**
     * ========================================================
     * VALIDATION
     * ========================================================
     */

    if (!lessonRefId) {
      throw new Error("LESSON_E_00001");
    }

    if (!videoRefId) {
      throw new Error("VIDEO_E_00001");
    }

    if (!Number.isInteger(displayOrder) || displayOrder < 1) {
      throw new Error("LESSON_VIDEO_MAPPING_E_00001");
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
     * CHECK LESSON
     * ========================================================
     */

    const lesson = await LessonMaster.findOne({
      where: {
        lessonRefId,
      },
    });

    if (!lesson) {
      throw new Error("LESSON_E_00001");
    }

    /**
     * ========================================================
     * CHECK VIDEO
     * ========================================================
     */

    const video = await VideoMaster.findOne({
      where: {
        videoRefId,
      },
    });

    if (!video) {
      throw new Error("VIDEO_E_00001");
    }

    /**
     * ========================================================
     * UPDATE
     * ========================================================
     */

    if (lessonVideoMappingRefId) {
      const existingMapping = await LessonVideoMapping.findOne({
        where: {
          lessonVideoMappingRefId,
        },
      });

      if (!existingMapping) {
        throw new Error("LESSON_VIDEO_MAPPING_E_00002");
      }

      /**
       * Check duplicate lesson + video
       *
       * Exclude current mapping.
       */

      const duplicateMapping = await LessonVideoMapping.findOne({
        where: {
          lessonRefId,

          videoRefId,

          lessonVideoMappingRefId: {
            [Op.ne]: lessonVideoMappingRefId,
          },
        },
      });

      if (duplicateMapping) {
        throw new Error("LESSON_VIDEO_MAPPING_E_00003");
      }

      const updateObj: any = {
        lessonRefId,

        videoRefId,

        displayOrder,

        status,

        updatedBy: findUser.user_id,

        updatedAt: new Date(),
      };

      await sequelizeConnection.transaction(
        async (transaction: Transaction) => {
          await LessonVideoMapping.update(updateObj, {
            where: {
              lessonVideoMappingRefId,
            },

            transaction,
          });
        },
      );

      return true;
    }

    /**
     * ========================================================
     * CREATE
     * ========================================================
     */

    /**
     * Check duplicate mapping.
     */

    const existingMapping = await LessonVideoMapping.findOne({
      where: {
        lessonRefId,

        videoRefId,
      },
    });

    if (existingMapping) {
      throw new Error("LESSON_VIDEO_MAPPING_E_00003");
    }

    /**
     * Create object.
     */

    const createObj: any = {
      lessonVideoMappingRefId: randomUUID(),

      lessonRefId,

      videoRefId,

      displayOrder,

      status,

      createdBy: findUser.user_id,

      updatedBy: null,

      deletedBy: null,

      createdAt: new Date(),

      updatedAt: null,

      deletedAt: null,
    };

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await LessonVideoMapping.create(createObj, {
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error createLessonVideoMapping/lessonVideoMapping.ts", error);

    throw error;
  }
};

/**
 * ============================================================
 * GET ALL LESSON VIDEO MAPPINGS
 * ============================================================
 *
 * Query:
 *
 * page
 * pageSize
 * search
 * status
 * lessonRefId
 * videoRefId
 */
export const getAllLessonVideoMappings = async (
  queryData: any,
): Promise<any> => {
  try {
    const page = Math.max(Number(queryData?.page) || 1, 1);

    const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);

    const whereObj: any = {};

    /**
     * ========================================================
     * LESSON FILTER
     * ========================================================
     */

    if (queryData?.lessonRefId) {
      whereObj.lessonRefId = queryData.lessonRefId;
    }

    /**
     * ========================================================
     * VIDEO FILTER
     * ========================================================
     */

    if (queryData?.videoRefId) {
      whereObj.videoRefId = queryData.videoRefId;
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

    const { rows } = await LessonVideoMapping.findAndCountAll({
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
    logger.error(
      "Error getAllLessonVideoMappings/lessonVideoMapping.ts",
      error,
    );

    throw error;
  }
};

/**
 * ============================================================
 * GET SINGLE LESSON VIDEO MAPPING
 * ============================================================
 */
export const getLessonVideoMapping = async (
  lessonVideoMappingRefId: string,
): Promise<any> => {
  try {
    if (!lessonVideoMappingRefId?.trim()) {
      throw new Error("LESSON_VIDEO_MAPPING_E_00002");
    }

    const mapping = await LessonVideoMapping.findOne({
      where: {
        lessonVideoMappingRefId: lessonVideoMappingRefId.trim(),
      },

      raw: true,
    });

    if (!mapping) {
      throw new Error("LESSON_VIDEO_MAPPING_E_00002");
    }

    return mapping;
  } catch (error) {
    logger.error("Error getLessonVideoMapping/lessonVideoMapping.ts", error);

    throw error;
  }
};

/**
 * ============================================================
 * DELETE LESSON VIDEO MAPPING
 * ============================================================
 *
 * Soft delete.
 */
export const deleteLessonVideoMapping = async (
  lessonVideoMappingRefId: string,
  payload: any,
): Promise<any> => {
  try {
    if (!lessonVideoMappingRefId?.trim()) {
      throw new Error("LESSON_VIDEO_MAPPING_E_00002");
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
     * FIND MAPPING
     * ========================================================
     */

    const existingMapping = await LessonVideoMapping.findOne({
      where: {
        lessonVideoMappingRefId: lessonVideoMappingRefId.trim(),
      },
    });

    if (!existingMapping) {
      throw new Error("LESSON_VIDEO_MAPPING_E_00002");
    }

    /**
     * ========================================================
     * DELETE
     * ========================================================
     */

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      /**
       * Store deletedBy.
       */

      await LessonVideoMapping.update(
        {
          deletedBy: findUser.user_id,

          updatedBy: findUser.user_id,

          updatedAt: new Date(),
        },

        {
          where: {
            lessonVideoMappingRefId: lessonVideoMappingRefId.trim(),
          },

          transaction,
        },
      );

      /**
       * Soft delete.
       */

      await LessonVideoMapping.destroy({
        where: {
          lessonVideoMappingRefId: lessonVideoMappingRefId.trim(),
        },

        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error deleteLessonVideoMapping/lessonVideoMapping.ts", error);

    throw error;
  }
};
interface LessonNotesUploadFile {
  originalname: string;
  mimetype: string;
  size: number;
  key: string;
  location: string;
}
export const createLessonNotes = async (
  queryData: any,
  payload: any,
  file?: LessonNotesUploadFile,
): Promise<any> => {
  try {
    const lessonNotesRefId = queryData?.lessonNotesRefId?.trim();

    const lessonId = queryData?.lessonId?.trim();

    const title = queryData?.title?.trim();

    const content = queryData?.content?.trim();

    const status =
      queryData?.status !== undefined ? Number(queryData.status) : 1;

    /**
     * ========================================================
     * VALIDATION
     * ========================================================
     */

    if (!lessonId) {
      throw new Error("LESSON_E_00001");
    }

    if (!title) {
      throw new Error("LESSON_NOTES_E_00002");
    }

    if (!content) {
      throw new Error("LESSON_NOTES_E_00003");
    }

    /**
     * ========================================================
     * LOGGED USER
     * ========================================================
     */

    const findUser = await getActionUser(payload?.user_ref_id);

    if (!findUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    /**
     * ========================================================
     * UPDATE
     * ========================================================
     */

    if (lessonNotesRefId) {
      const existingLessonNotes = await LessonNotes.findOne({
        where: {
          lessonNotesRefId,
        },
      });

      if (!existingLessonNotes) {
        throw new Error("LESSON_NOTES_E_00001");
      }

      const updateObj: any = {
        lessonId,
        title,
        content,
        status,

        updatedBy: findUser.user_id,
        updatedAt: new Date(),
      };

      let oldDocumentKey: string | null = null;

      /**
       * New document uploaded
       */
      if (file) {
        oldDocumentKey = existingLessonNotes.documentKey;

        const s3File = file as typeof file & {
          key: string;
          location: string;
        };

        updateObj.documentName = file.originalname;

        updateObj.documentUrl = s3File.location;

        updateObj.documentKey = s3File.key;

        updateObj.documentMimeType = file.mimetype;

        updateObj.documentSize = file.size;
      }

      await sequelizeConnection.transaction(
        async (transaction: Transaction) => {
          await LessonNotes.update(updateObj, {
            where: {
              lessonNotesRefId,
            },
            transaction,
          });
        },
      );

      /**
       * Delete old S3 file only after DB update.
       */
      if (file && oldDocumentKey) {
        await deleteS3File(oldDocumentKey);
      }

      return true;
    }

    /**
     * ========================================================
     * CREATE
     * ========================================================
     */

    const createObj: any = {
      lessonNotesRefId: randomUUID(),

      lessonId,

      title,
      content,

      status,

      createdBy: findUser.user_id,

      updatedBy: null,
      deletedBy: null,

      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,

      documentName: null,
      documentUrl: null,
      documentKey: null,
      documentMimeType: null,
      documentSize: null,
    };

    /**
     * Add S3 document information
     */
    if (file) {
      const s3File = file as typeof file & {
        key: string;
        location: string;
      };

      createObj.documentName = file.originalname;

      createObj.documentUrl = s3File.location;

      createObj.documentKey = s3File.key;

      createObj.documentMimeType = file.mimetype;

      createObj.documentSize = file.size;
    }

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await LessonNotes.create(createObj, {
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error createLessonNotes/lessonNotes.ts", error);

    throw error;
  }
};

/**
 * ============================================================
 * GET ALL LESSON NOTES
 * ============================================================
 *
 * Supports:
 *
 * page
 * pageSize
 * search
 * lessonId
 * status
 */
export const getAllLessonNotes = async (queryData: any): Promise<any> => {
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
          title: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          content: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          lessonId: {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    /**
     * ========================================================
     * LESSON FILTER
     * ========================================================
     */

    if (queryData?.lessonId) {
      whereObj.lessonId = queryData.lessonId;
    }

    /**
     * ========================================================
     * STATUS FILTER
     * ========================================================
     */

    if (queryData?.status !== undefined && queryData?.status !== "") {
      whereObj.status = Number(queryData.status);
    }

    /**
     * ========================================================
     * GET DATA
     * ========================================================
     *
     * No limit / offset here.
     *
     * paginationService handles pagination.
     */

    const { rows } = await LessonNotes.findAndCountAll({
      where: whereObj,

      order: [["createdAt", "DESC"]],

      raw: true,
    });

    return await paginationService(rows, page, pageSize);
  } catch (error) {
    logger.error("Error getAllLessonNotes/lessonNotes.ts", error);

    throw error;
  }
};

/**
 * ============================================================
 * GET SINGLE LESSON NOTES
 * ============================================================
 *
 * Uses lessonNotesRefId.
 */
export const getLessonNotes = async (
  lessonNotesRefId: string,
): Promise<any> => {
  try {
    if (!lessonNotesRefId?.trim()) {
      throw new Error("LESSON_NOTES_E_00001");
    }

    const lessonNotes = await LessonNotes.findOne({
      where: {
        lessonNotesRefId: lessonNotesRefId.trim(),
      },

      raw: true,
    });

    if (!lessonNotes) {
      throw new Error("LESSON_NOTES_E_00001");
    }

    return lessonNotes;
  } catch (error) {
    logger.error("Error getLessonNotes/lessonNotes.ts", error);

    throw error;
  }
};

/**
 * ============================================================
 * DELETE LESSON NOTES
 * ============================================================
 *
 * Soft delete because:
 *
 * paranoid: true
 *
 * deletedBy is stored before destroy().
 */
export const deleteLessonNotes = async (
  lessonNotesRefId: string,
  payload: any,
): Promise<any> => {
  try {
    if (!lessonNotesRefId?.trim()) {
      throw new Error("LESSON_NOTES_E_00001");
    }

    /**
     * ========================================================
     * LOGGED USER
     * ========================================================
     */

    const findUser = await getActionUser(payload?.user_ref_id);

    if (!findUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    /**
     * ========================================================
     * FIND LESSON NOTE
     * ========================================================
     */

    const existingLessonNotes = await LessonNotes.findOne({
      where: {
        lessonNotesRefId: lessonNotesRefId.trim(),
      },
    });

    if (!existingLessonNotes) {
      throw new Error("LESSON_NOTES_E_00001");
    }

    const documentKey = existingLessonNotes.documentKey;

    /**
     * ========================================================
     * DATABASE DELETE
     * ========================================================
     */

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await LessonNotes.update(
        {
          deletedBy: findUser.user_id,
          updatedBy: findUser.user_id,
          updatedAt: new Date(),
        },
        {
          where: {
            lessonNotesRefId: lessonNotesRefId.trim(),
          },
          transaction,
        },
      );

      await LessonNotes.destroy({
        where: {
          lessonNotesRefId: lessonNotesRefId.trim(),
        },

        transaction,
      });
    });

    /**
     * ========================================================
     * DELETE S3 FILE
     * ========================================================
     */

    if (documentKey) {
      await deleteS3File(documentKey);
    }

    return true;
  } catch (error) {
    logger.error("Error deleteLessonNotes/lessonNotes.ts", error);

    throw error;
  }
};

export const createUserLessonMapping = async (
  queryData: any,
  payload: any,
): Promise<any> => {
  try {
    const userLessonRefId = queryData?.userLessonRefId?.trim() || "";

    const userId = Number(queryData?.userId);
    const lessonId = queryData?.lessonId?.trim();

    const status =
      queryData?.status !== undefined && queryData?.status !== null
        ? Number(queryData.status)
        : 1;

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!userId || Number.isNaN(userId)) {
      throw new Error("USER_E_00001");
    }

    if (!lessonId) {
      throw new Error("LESSON_E_00001");
    }

    // ========================================================
    // LOGGED-IN USER
    // ========================================================

    const findUser = await getActionUser(payload?.user_ref_id);

    if (!findUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    // ========================================================
    // UPDATE
    // ========================================================

    if (userLessonRefId) {
      const existingMapping = await UserLessonMapping.findOne({
        where: {
          userLessonRefId,
        },
      });

      if (!existingMapping) {
        throw new Error("USER_LESSON_E_00001");
      }

      /**
       * Prevent duplicate mapping
       *
       * Same user + same lesson
       */
      const duplicateMapping = await UserLessonMapping.findOne({
        where: {
          userId,
          lessonId,
          userLessonRefId: {
            [Op.ne]: userLessonRefId,
          },
        },
      });

      if (duplicateMapping) {
        throw new Error("USER_LESSON_E_00002");
      }

      const updateObj: any = {
        userId,
        lessonId,
        status,

        updatedBy: findUser.user_id,
        updatedAt: new Date(),
      };

      await sequelizeConnection.transaction(
        async (transaction: Transaction) => {
          await UserLessonMapping.update(updateObj, {
            where: {
              userLessonRefId,
            },
            transaction,
          });
        },
      );

      return true;
    }

    // ========================================================
    // CREATE
    // ========================================================

    /**
     * Check duplicate mapping
     */
    const existingMapping = await UserLessonMapping.findOne({
      where: {
        userId,
        lessonId,
      },
    });

    if (existingMapping) {
      throw new Error("USER_LESSON_E_00002");
    }

    const createObj: any = {
      userLessonRefId: randomUUID(),

      userId,
      lessonId,
      status,

      createdBy: findUser.user_id,

      updatedBy: null,
      deletedBy: null,

      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    };

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await UserLessonMapping.create(createObj, {
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error createUserLessonMapping/userLessonMapping.ts", error);

    throw error;
  }
};

/**
 * ============================================================
 * GET ALL USER LESSON MAPPINGS
 * ============================================================
 *
 * Admin:
 *   Can get all user lesson mappings.
 *
 * User:
 *   Can only get his own mappings.
 *
 * queryData.role can be used if role information is already
 * available in the controller.
 */
export const getAllUserLessonMappings = async (
  queryData: any,
  payload: any,
): Promise<any> => {
  try {
    const page = Math.max(Number(queryData?.page) || 1, 1);

    const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);

    const whereObj: any = {};

    // ========================================================
    // ROLE RESTRICTION
    // ========================================================

    const loggedUser = await getActionUser(payload?.user_ref_id);

    if (!loggedUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    /**
     * If user role is available as role_id.
     *
     * Admin = 1
     * User  = 2
     *
     * Adjust these values if your application uses
     * different role IDs.
     */
    if (Number(payload?.role_id) === 2) {
      whereObj.userId = loggedUser.user_id;
    } else if (queryData?.userId) {
      whereObj.userId = Number(queryData.userId);
    }

    // ========================================================
    // LESSON FILTER
    // ========================================================

    if (queryData?.lessonId) {
      whereObj.lessonId = queryData.lessonId.trim();
    }

    // ========================================================
    // STATUS FILTER
    // ========================================================

    if (
      queryData?.status !== undefined &&
      queryData?.status !== null &&
      queryData?.status !== ""
    ) {
      whereObj.status = Number(queryData.status);
    }

    // ========================================================
    // GET DATA
    // ========================================================

    const { count, rows } = await UserLessonMapping.findAndCountAll({
      where: whereObj,

      limit: pageSize,
      offset: (page - 1) * pageSize,

      order: [["createdAt", "DESC"]],

      raw: true,
    });

    const totalItem =
      typeof count === "number"
        ? count
        : Array.isArray(count)
          ? rows.length
          : 0;

    const totalPage = Math.ceil(totalItem / pageSize);

    return {
      totalItem,
      totalPage,
      row: rows,
      currentPage: String(page),
    };
  } catch (error) {
    logger.error("Error getAllUserLessonMappings/userLessonMapping.ts", error);

    throw error;
  }
};

/**
 * ============================================================
 * GET SINGLE USER LESSON MAPPING
 * ============================================================
 */
export const getUserLessonMapping = async (
  userLessonRefId: string,
  payload: any,
): Promise<any> => {
  try {
    if (!userLessonRefId?.trim()) {
      throw new Error("USER_LESSON_E_00001");
    }

    const loggedUser = await getActionUser(payload?.user_ref_id);

    if (!loggedUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    const whereObj: any = {
      userLessonRefId: userLessonRefId.trim(),
    };

    /**
     * User can only access his own mapping.
     */
    if (Number(payload?.role_id) === 2) {
      whereObj.userId = loggedUser.user_id;
    }

    const mapping = await UserLessonMapping.findOne({
      where: whereObj,
      raw: true,
    });

    if (!mapping) {
      throw new Error("USER_LESSON_E_00001");
    }

    return mapping;
  } catch (error) {
    logger.error("Error getUserLessonMapping/userLessonMapping.ts", error);

    throw error;
  }
};

/**
 * ============================================================
 * DELETE USER LESSON MAPPING
 * ============================================================
 *
 * Soft delete.
 */
export const deleteUserLessonMapping = async (
  userLessonRefId: string,
  payload: any,
): Promise<any> => {
  try {
    if (!userLessonRefId?.trim()) {
      throw new Error("USER_LESSON_E_00001");
    }

    const findUser = await getActionUser(payload?.user_ref_id);

    if (!findUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    const whereObj: any = {
      userLessonRefId: userLessonRefId.trim(),
    };

    /**
     * User cannot delete another user's mapping.
     */
    if (Number(payload?.role_id) === 2) {
      whereObj.userId = findUser.user_id;
    }

    const existingMapping = await UserLessonMapping.findOne({
      where: whereObj,
    });

    if (!existingMapping) {
      throw new Error("USER_LESSON_E_00001");
    }

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await UserLessonMapping.update(
        {
          deletedBy: findUser.user_id,
          updatedBy: findUser.user_id,
          updatedAt: new Date(),
        },
        {
          where: whereObj,
          transaction,
        },
      );

      await UserLessonMapping.destroy({
        where: whereObj,
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error deleteUserLessonMapping/userLessonMapping.ts", error);

    throw error;
  }
};
function deleteS3File(oldDocumentKey: string) {
  throw new Error("Function not implemented.");
}
