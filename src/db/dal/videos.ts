import { Transaction, Op } from "sequelize";
import { randomUUID } from "crypto";
import sequelizeConnection from "../config";

import VideoMaster from "../model/VideoMaster";
import { getActionUser } from "./user";
import logger from "../../lib/logger";
import { paginationService } from "../../components/util/pagination";

export const createVideo = async (
  queryData: any,
  payload: any,
): Promise<any> => {
  try {
    const videoRefId = queryData?.videoRefId?.trim();

    const title = queryData?.title?.trim();
    const filename = queryData?.filename?.trim();
    const url = queryData?.url?.trim();
    const sessionId = queryData?.sessionId?.trim();
    const bucketId = queryData?.bucketId?.trim();

    /**
     * =========================================
     * VALIDATION
     * =========================================
     */

    if (!title) {
      throw new Error("VIDEO_E_00002");
    }

    if (!filename) {
      throw new Error("VIDEO_E_00003");
    }

    if (!url) {
      throw new Error("VIDEO_E_00004");
    }

    if (!sessionId) {
      throw new Error("VIDEO_E_00005");
    }

    if (!bucketId) {
      throw new Error("VIDEO_E_00006");
    }

    /**
     * Get logged-in user
     */
    const findUser = await getActionUser(payload?.user_ref_id);

    if (!findUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    /**
     * =========================================
     * UPDATE
     * =========================================
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

      const updateObj: any = {
        title,
        filename,
        url,
        sessionId,
        bucketId,
        updatedBy: findUser.user_id,
        updatedAt: new Date(),
      };

      await sequelizeConnection.transaction(
        async (transaction: Transaction) => {
          await VideoMaster.update(updateObj, {
            where: {
              videoRefId,
            },
            transaction,
          });
        },
      );

      return true;
    }

    /**
     * =========================================
     * CREATE
     * =========================================
     */

    const createObj: any = {
      videoRefId: randomUUID(),

      title,
      filename,
      url,
      sessionId,
      bucketId,

      createdBy: findUser.user_id,
      createdAt: new Date(),

      updatedAt: null,
      deletedAt: null,
      updatedBy: null,
      deletedBy: null,
    };

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await VideoMaster.create(createObj, {
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error createVideo/videoMaster.ts", error);
    throw error;
  }
};

export const getAllVideos = async (queryData: any): Promise<any> => {
  try {
    const page = Math.max(Number(queryData?.page) || 1, 1);

    const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);

    const whereObj: any = {};

    /**
     * Optional search
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
          filename: {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    /**
     * Optional session filter
     */
    if (queryData?.sessionId) {
      whereObj.sessionId = queryData.sessionId;
    }

    /**
     * Optional bucket filter
     */
    if (queryData?.bucketId) {
      whereObj.bucketId = queryData.bucketId;
    }

    const { count, rows } = await VideoMaster.findAndCountAll({
      where: whereObj,
      nest: true,
      raw: true,
      order: [["createdAt", "DESC"]],
    });

    /**
     * Use existing project pagination service
     */
    const pagi = await paginationService(rows, page, pageSize);

    return pagi;
  } catch (error) {
    logger.error("Error getAllVideos/videoMaster.ts", error);
    throw error;
  }
};


export const getVideo = async (videoRefId: string): Promise<any> => {
  try {
    if (!videoRefId) {
      throw new Error("VIDEO_E_00001");
    }

    const video = await VideoMaster.findOne({
      where: {
        videoRefId,
      },
    });

    if (!video) {
      throw new Error("VIDEO_E_00001");
    }

    return video;
  } catch (error) {
    logger.error("Error getVideo/videoMaster.ts", error);
    throw error;
  }
};

export const deleteVideo = async (
  videoRefId: string,
  payload: any,
): Promise<any> => {
  try {
    if (!videoRefId) {
      throw new Error("VIDEO_E_00001");
    }

    /**
     * Get logged-in user
     */
    const findUser = await getActionUser(payload?.user_ref_id);

    if (!findUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    /**
     * Find existing video
     */
    const existingVideo = await VideoMaster.findOne({
      where: {
        videoRefId,
      },
    });

    if (!existingVideo) {
      throw new Error("VIDEO_E_00001");
    }

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      /**
       * Set deletedBy before soft delete
       */
      await VideoMaster.update(
        {
          deletedBy: findUser.user_id,
          updatedAt: new Date(),
        },
        {
          where: {
            videoRefId,
          },
          transaction,
        },
      );

      /**
       * Soft delete
       *
       * paranoid: true
       * automatically sets deletedAt
       */
      await VideoMaster.destroy({
        where: {
          videoRefId,
        },
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error deleteVideo/videoMaster.ts", error);
    throw error;
  }
};
