import { Transaction, Op } from "sequelize";
import { randomUUID } from "crypto";
import sequelizeConnection from "../config";
// import SessionMaster from "../models/sessionMaster";

import { getActionUser } from "./user";
import SessionMaster from "../model/SessionMaster";
import logger from "../../lib/logger";
import { paginationService } from "../../components/util/pagination";
import UserSessionMapping from "../model/UserSessionMapping";
// import logger from "../utils/logger";

/**
 * Create / Update Session Master
 *
 * If sessionRefId exists -> UPDATE
 * If sessionRefId does not exist -> CREATE
 */
export const createSession = async (
  queryData: any,
  payload: any,
): Promise<any> => {
  try {
    const sessionRefId = queryData?.sessionRefId?.trim();

    const sessionName = queryData?.name?.trim();
    const description = queryData?.description?.trim() || null;
    const date = queryData?.date ? new Date(queryData.date) : null;
    const status = queryData?.status || "draft";

    if (!sessionName) {
      throw new Error("SESSION_E_00002");
    }

    if (date && Number.isNaN(date.getTime())) {
      throw new Error("SESSION_E_00003");
    }

    /**
     * Get logged-in/action user
     */
    const findUser = await getActionUser(payload?.user_ref_id);
    // console.log(findUser, "findUser", payload);

    if (!findUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    /**
     * =========================================
     * UPDATE
     * =========================================
     */
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
        startDate: date,
        status,
        updatedBy: findUser.user_id,
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

    /**
     * =========================================
     * CREATE
     * =========================================
     */

    const sessionCode = `SES-${Date.now()}`;

    const createObj: any = {
      sessionRefId: randomUUID(),
      sessionCode,
      sessionName,
      description,
      startDate: date,
      endDate: null,
      status,
      createdBy: findUser.user_id,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
      updatedBy: null,
      deletedBy: null,
    };

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await SessionMaster.create(createObj, {
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
 * =========================================
 * GET ALL SESSIONS
 * =========================================
 */
export const getAllSessions = async (queryData: any): Promise<any> => {
  try {
    const page = Math.max(Number(queryData?.page) || 1, 1);
    const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);

    const offset = (page - 1) * pageSize;

    const whereObj: any = {};

    /**
     * Optional search
     */
    const search = queryData?.search?.trim();

    if (search) {
      whereObj[Op.or] = [
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

    /**
     * Optional status filter
     */
    if (queryData?.status) {
      whereObj.status = queryData.status;
    }

    const { count, rows } = await SessionMaster.findAndCountAll({
      where: whereObj,
      //   limit: pageSize,
      //   offset,
      nest: true,
      raw: true,
      order: [["createdAt", "DESC"]],
    });

    // const totalPage = Math.ceil(count / pageSize);

    // return {
    //   totalItem: count,
    //   totalPage,
    //   row: rows,
    //   currentPage: String(page),
    // };
    const pagi = await paginationService(rows, page, pageSize);
    return pagi;
  } catch (error) {
    logger.error("Error getAllSessions/sessionMaster.ts", error);
    throw error;
  }
};

/**
 * =========================================
 * GET SINGLE SESSION
 * =========================================
 *
 * sessionRefId is used instead of sessionMasterId
 */
export const getSession = async (sessionRefId: string): Promise<any> => {
  try {
    if (!sessionRefId) {
      throw new Error("SESSION_E_00001");
    }

    const session = await SessionMaster.findOne({
      where: {
        sessionRefId,
      },
    });

    if (!session) {
      throw new Error("SESSION_E_00001");
    }

    return session;
  } catch (error) {
    logger.error("Error getSession/sessionMaster.ts", error);
    throw error;
  }
};

/**
 * =========================================
 * DELETE SESSION
 * =========================================
 *
 * Soft delete because paranoid: true
 *
 * First:
 *   deletedBy = logged-in user
 *
 * Then:
 *   destroy()
 *
 * Sequelize automatically sets deletedAt.
 */
export const deleteSession = async (
  sessionRefId: string,
  payload: any,
): Promise<any> => {
  try {
    if (!sessionRefId) {
      throw new Error("SESSION_E_00001");
    }

    const findUser = await getActionUser(payload?.user_ref_id);

    if (!findUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    const existingSession = await SessionMaster.findOne({
      where: {
        sessionRefId,
      },
    });

    if (!existingSession) {
      throw new Error("SESSION_E_00001");
    }

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      /**
       * Set deletedBy before soft delete
       */
      await SessionMaster.update(
        {
          deletedBy: findUser.user_id,
          updatedAt: new Date(),
        },
        {
          where: {
            sessionRefId,
          },
          transaction,
        },
      );

      /**
       * Because paranoid: true,
       * this performs a soft delete
       * and automatically sets deletedAt.
       */
      await SessionMaster.destroy({
        where: {
          sessionRefId,
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

const ADMIN_ROLE_ID = 1;
const USER_ROLE_ID = 2;

export const createUserSessionMapping = async (
  queryData: any,
  payload: any,
): Promise<any> => {
  try {
    const userSessionRefId = queryData?.userSessionRefId?.trim() || "";

    const userId = queryData?.userId ? Number(queryData.userId) : null;

    const sessionId = queryData?.sessionId?.trim() || "";

    const status =
      queryData?.status !== undefined && queryData?.status !== null
        ? Number(queryData.status)
        : 1;

    /**
     * =========================================
     * VALIDATION
     * =========================================
     */

    if (!userId) {
      throw new Error("USER_SESSION_E_00002");
    }

    if (!sessionId) {
      throw new Error("USER_SESSION_E_00003");
    }

    /**
     * =========================================
     * GET ACTION USER
     * =========================================
     */

    const actionUser = await getActionUser(payload?.user_ref_id);

    if (!actionUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    /**
     * =========================================
     * CREATE
     * =========================================
     */

    if (!userSessionRefId) {
      /**
       * Only admin should be allowed to
       * create mapping for another user.
       *
       * Normal user can only create mapping
       * for himself.
       */
      if (
        payload.role_id !== ADMIN_ROLE_ID &&
        Number(actionUser.user_id) !== userId
      ) {
        throw new Error("USER_SESSION_E_00004");
      }

      /**
       * Optional duplicate check
       *
       * One user should not have the same
       * session mapped more than once.
       */
      const existingMapping = await UserSessionMapping.findOne({
        where: {
          userId,
          sessionId,
        },
      });

      if (existingMapping) {
        throw new Error("USER_SESSION_E_00005");
      }

      const createObj: any = {
        userSessionRefId: randomUUID(),

        userId,
        sessionId,
        status,

        createdBy: actionUser.user_id,
        createdAt: new Date(),

        updatedBy: null,
        updatedAt: null,

        deletedBy: null,
        deletedAt: null,
      };

      await sequelizeConnection.transaction(
        async (transaction: Transaction) => {
          await UserSessionMapping.create(createObj, {
            transaction,
          });
        },
      );

      return true;
    }

    /**
     * =========================================
     * UPDATE
     * =========================================
     */

    const existingMapping = await UserSessionMapping.findOne({
      where: {
        userSessionRefId,
      },
    });

    if (!existingMapping) {
      throw new Error("USER_SESSION_E_00001");
    }

    /**
     * User can update only his own mapping.
     *
     * Admin can update any mapping.
     */
    if (
      payload.role_id !== ADMIN_ROLE_ID &&
      Number(existingMapping.userId) !== Number(actionUser.user_id)
    ) {
      throw new Error("USER_SESSION_E_00004");
    }

    const updateObj: any = {
      userId,
      sessionId,
      status,

      updatedBy: actionUser.user_id,
      updatedAt: new Date(),
    };

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await UserSessionMapping.update(updateObj, {
        where: {
          userSessionRefId,
        },
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error createUserSessionMapping/userSessionMapping.ts", error);

    throw error;
  }
};


export const getAllUserSessionMappings = async (
  queryData: any,
  payload: any,
): Promise<any> => {
  try {
    const page = Math.max(Number(queryData?.page) || 1, 1);

    const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);

    /**
     * =========================================
     * GET ACTION USER
     * =========================================
     */

    const actionUser = await getActionUser(payload?.user_ref_id);

    if (!actionUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    const whereObj: any = {};

    /**
     * =========================================
     * ROLE BASED FILTER
     * =========================================
     *
     * ADMIN -> no user filter
     *
     * USER -> only own mappings
     */
    if (payload.role_id !== ADMIN_ROLE_ID) {
      whereObj.userId = actionUser.user_id;
    }

    /**
     * =========================================
     * OPTIONAL USER FILTER
     * =========================================
     *
     * Admin can filter by userId.
     *
     * Normal user cannot override
     * the logged-in-user restriction.
     */
    if (payload.role_id === ADMIN_ROLE_ID && queryData?.userId) {
      whereObj.userId = Number(queryData.userId);
    }

    /**
     * =========================================
     * OPTIONAL SESSION FILTER
     * =========================================
     */

    if (queryData?.sessionId) {
      whereObj.sessionId = queryData.sessionId.trim();
    }

    /**
     * =========================================
     * OPTIONAL STATUS FILTER
     * =========================================
     */

    if (
      queryData?.status !== undefined &&
      queryData?.status !== null &&
      queryData?.status !== ""
    ) {
      whereObj.status = Number(queryData.status);
    }

    /**
     * =========================================
     * GET DATA
     * =========================================
     *
     * Keep this consistent with your existing
     * paginationService implementation.
     */
    const { count, rows } = await UserSessionMapping.findAndCountAll({
      where: whereObj,
      nest: true,
      raw: true,
      order: [["createdAt", "DESC"]],
    });

    /**
     * Existing project pagination service
     */
    const pagi = await paginationService(rows, page, pageSize);

    return pagi;
  } catch (error) {
    logger.error(
      "Error getAllUserSessionMappings/userSessionMapping.ts",
      error,
    );

    throw error;
  }
};


export const getUserSessionMapping = async (
  userSessionRefId: string,
  payload: any,
): Promise<any> => {
  try {
    if (!userSessionRefId) {
      throw new Error("USER_SESSION_E_00001");
    }

    /**
     * Get logged-in user
     */
    const actionUser = await getActionUser(payload?.user_ref_id);

    if (!actionUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    const mapping = await UserSessionMapping.findOne({
      where: {
        userSessionRefId,
      },
    });

    if (!mapping) {
      throw new Error("USER_SESSION_E_00001");
    }

    /**
     * Normal user can only access
     * his own mapping.
     */
    if (
      payload.role_id !== ADMIN_ROLE_ID &&
      Number(mapping.userId) !== Number(actionUser.user_id)
    ) {
      throw new Error("USER_SESSION_E_00004");
    }

    return mapping;
  } catch (error) {
    logger.error("Error getUserSessionMapping/userSessionMapping.ts", error);

    throw error;
  }
};

export const deleteUserSessionMapping = async (
  userSessionRefId: string,
  payload: any,
): Promise<any> => {
  try {
    if (!userSessionRefId) {
      throw new Error("USER_SESSION_E_00001");
    }

    /**
     * Get logged-in user
     */
    const actionUser = await getActionUser(payload?.user_ref_id);

    if (!actionUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    /**
     * Find mapping
     */
    const existingMapping = await UserSessionMapping.findOne({
      where: {
        userSessionRefId,
      },
    });

    if (!existingMapping) {
      throw new Error("USER_SESSION_E_00001");
    }

    /**
     * Normal user can delete only
     * his own mapping.
     */
    if (
      payload.role_id !== ADMIN_ROLE_ID &&
      Number(existingMapping.userId) !== Number(actionUser.user_id)
    ) {
      throw new Error("USER_SESSION_E_00004");
    }

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      /**
       * Set deletedBy before soft delete
       */
      await UserSessionMapping.update(
        {
          deletedBy: actionUser.user_id,
          updatedAt: new Date(),
        },
        {
          where: {
            userSessionRefId,
          },
          transaction,
        },
      );

      /**
       * paranoid: true
       *
       * This performs soft delete and
       * automatically sets deletedAt.
       */
      await UserSessionMapping.destroy({
        where: {
          userSessionRefId,
        },
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error deleteUserSessionMapping/userSessionMapping.ts", error);

    throw error;
  }
};
