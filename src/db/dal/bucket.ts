import Transaction from "sequelize/types/transaction";
import logger from "../../lib/logger";
import sequelizeConnection from "../config";
import SessionMaster from "../model/SessionMaster";
import User from "../model/User";
import UserSessionMapping from "../model/UserSessionMapping";
import { randomUUID } from "crypto";
import { Op } from "sequelize";
import { getActionUser } from "./user";
import BucketMaster from "../model/BucketMaster";
import { paginationService } from "../../components/util/pagination";

export const sessionUser = async (
  queryData: any,
  payload: any,
): Promise<any> => {
  const page = queryData?.page || 1;
  const limit = queryData?.limit || 10;
  try {
    const findData = await SessionMaster.findAll({
      include: [
        {
          model: UserSessionMapping,
          required: true,
          attributes: [],
          association: "",
          include: [
            {
              model: User,
              required: true,
              association: "",
              attributes: [],
              where: {
                user_ref_id: payload?.user_ref_id,
              },
            },
          ],
        },
      ],
    });
  } catch (error) {
    logger.error("Error sessionUserError", error);
    throw new Error(error);
  }
};

const generateSessionCode = (): string => {
  return `SES-${randomUUID().split("-")[0].toUpperCase()}`;
};

export const createSession = async (
  queryData: any,
  payload: any,
): Promise<any> => {
  try {
    const sessionRefId = queryData?.session_ref_id?.trim();

    const sessionName = queryData?.sessionName;
    const description = queryData?.description;

    const startDate = queryData?.startDate
      ? new Date(queryData.startDate)
      : undefined;

    const endDate = queryData?.endDate
      ? new Date(queryData.endDate)
      : undefined;

    const status = queryData?.status || "draft";

    // Get logged-in/action user
    const findUser = await getActionUser(payload?.user_ref_id);

    // =========================================================
    // UPDATE FLOW
    // =========================================================

    if (sessionRefId) {
      const existingSession = await SessionMaster.findOne({
        where: {
          sessionRefId,
        },
      });

      if (!existingSession) {
        throw new Error("SESSION_E_00001");
      }

      const updateObj: any = {
        sessionName,
        description,
        startDate,
        endDate,
        status,
        updatedBy: findUser?.user_id,
        updatedAt: new Date(),
      };

      await sequelizeConnection.transaction(
        async (transaction: Transaction) => {
          await SessionMaster.update(updateObj, {
            where: {
              sessionRefId,
            },
            transaction,
          });
        },
      );

      return true;
    }

    // =========================================================
    // CREATE FLOW
    // =========================================================

    const sessionCode = queryData?.sessionCode?.trim() || generateSessionCode();

    const newSessionObj: any = {
      sessionRefId: randomUUID(),
      sessionCode,
      sessionName,
      description,
      startDate,
      endDate,
      status,

      // Audit fields
      createdBy: findUser?.user_id,
      createdAt: new Date(),
    };

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await SessionMaster.create(newSessionObj, {
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error createSession/sessionMaster.ts", error);

    throw error;
  }
};

/**
 * GET SESSION BY session_ref_id
 */
export const getSessionByRefId = async (
  session_ref_id: string,
): Promise<any> => {
  try {
    const session = await SessionMaster.findOne({
      where: {
        sessionRefId: session_ref_id,
      },
    });

    if (!session) {
      throw new Error("SESSION_E_00001");
    }

    return session;
  } catch (error) {
    logger.error("Error getSessionByRefId/sessionMaster.ts", error);

    throw error;
  }
};

/**
 * GET ALL SESSIONS WITH PAGINATION
 */
export const getAllSession = async (queryData: any): Promise<any> => {
  try {
    const page = Math.max(Number(queryData?.page) || 1, 1);

    const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);

    const offset = (page - 1) * pageSize;

    const whereCondition: any = {};

    // ---------------------------------------------------------
    // SEARCH
    // ---------------------------------------------------------

    if (queryData?.search?.trim()) {
      const search = queryData.search.trim();

      whereCondition[Op.or] = [
        {
          sessionName: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          sessionCode: {
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

    // ---------------------------------------------------------
    // STATUS FILTER
    // ---------------------------------------------------------

    if (queryData?.status?.trim()) {
      whereCondition.status = queryData.status.trim();
    }

    // ---------------------------------------------------------
    // GET DATA
    // ---------------------------------------------------------

    const { count, rows } = await SessionMaster.findAndCountAll({
      where: whereCondition,
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalItem = count;

    const totalPage = Math.ceil(totalItem / pageSize);

    return {
      totalItem,
      totalPage,
      row: rows,
      currentPage: String(page),
    };
  } catch (error) {
    logger.error("Error getAllSession/sessionMaster.ts", error);

    throw error;
  }
};

/**
 * DELETE SESSION
 *
 * Because paranoid: true is enabled,
 * destroy() performs a soft delete.
 */
export const deleteSession = async (session_ref_id: string): Promise<any> => {
  try {
    if (!session_ref_id) {
      throw new Error("SESSION_E_00002");
    }

    const existingSession = await SessionMaster.findOne({
      where: {
        sessionRefId: session_ref_id,
      },
    });

    if (!existingSession) {
      throw new Error("SESSION_E_00001");
    }

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await SessionMaster.destroy({
        where: {
          sessionRefId: session_ref_id,
        },
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error deleteSession/sessionMaster.ts", error);

    throw error;
  }
};
export const createBucket = async (
  queryData: any,
  payload: any,
): Promise<boolean> => {
  try {
    const bucketRefId = queryData?.bucketRefId?.trim();

    const bucketName = queryData?.bucketName?.trim();

    const serviceUrl = queryData?.serviceUrl?.trim();

    const status = queryData?.status ?? 1;

    // Get logged-in/action user
    const findUser = await getActionUser(payload?.user_ref_id);

    // =====================================================
    // UPDATE FLOW
    // =====================================================

    if (bucketRefId) {
      const existingBucket = await BucketMaster.findOne({
        where: {
          bucketRefId,
        },
      });

      if (!existingBucket) {
        throw new Error("BUCKET_E_00001");
      }

      const updateObj: any = {
        bucketName,
        serviceUrl,
        status,
        updatedBy: findUser?.user_id,
        updatedAt: new Date(),
      };

      await sequelizeConnection.transaction(
        async (transaction: Transaction) => {
          await BucketMaster.update(updateObj, {
            where: {
              bucketRefId,
            },
            transaction,
          });
        },
      );

      return true;
    }

    // =====================================================
    // CREATE FLOW
    // =====================================================

    const newBucketObj: any = {
      bucketRefId: randomUUID(),
      bucketName,
      serviceUrl,
      status,

      createdBy: findUser?.user_id,
      createdAt: new Date(),
    };

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await BucketMaster.create(newBucketObj, {
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error createBucket/bucketMaster.ts", error);

    throw error;
  }
};

export const getAllBuckets = async (queryData: any): Promise<any> => {
  try {
    const page = Math.max(Number(queryData?.page) || 1, 1);

    const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);

    // const offset = (page - 1) * pageSize;

    const whereCondition: any = {};

    // =====================================================
    // SEARCH
    // =====================================================

    if (queryData?.search?.trim()) {
      const search = queryData.search.trim();

      whereCondition[Op.or] = [
        {
          bucketName: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          serviceUrl: {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    // =====================================================
    // STATUS FILTER
    // =====================================================

    if (queryData?.status !== undefined && queryData?.status !== null) {
      whereCondition.status = queryData.status;
    }

    // =====================================================
    // GET PAGINATED DATA
    // =====================================================

    const { count, rows } = await BucketMaster.findAndCountAll({
      where: whereCondition,

      // limit: pageSize,
      // offset,
      nest: true,
      raw: true,

      order: [["createdAt", "DESC"]],
    });

    // console.log(rows, "rows");
    // await rows?.

    const pagination = await paginationService(rows, page, pageSize);
    // console.log(pagination, "pagination", rows?.length);
    return pagination;
  } catch (error) {
    logger.error("Error getAllBuckets/bucketMaster.ts", error);

    throw error;
  }
};

export const getBucket = async (queryData: any): Promise<any> => {
  const getBucketMaster = await BucketMaster.findOne({
    where: {
      bucketRefId: queryData?.bucketRefId,
    },
  });
  return getBucketMaster;
};

export const deleteBucket = async (
  bucketRefId: string,
  payload: any,
): Promise<boolean> => {
  try {
    if (!bucketRefId) {
      throw new Error("BUCKET_E_00002");
    }
    const findUser = await getActionUser(payload?.user_ref_id);
    const userId = findUser?.user_id;

    const existingBucket = await BucketMaster.findOne({
      where: {
        bucketRefId,
      },
    });

    if (!existingBucket) {
      throw new Error("BUCKET_E_00001");
    }

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await BucketMaster.destroy({
        where: {
          bucketRefId,
        },
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error deleteBucket/bucketMaster.ts", error);

    throw error;
  }
};
