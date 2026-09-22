import { Op, Transaction } from "sequelize";
import { randomUUID } from "crypto";

import sequelizeConnection from "../config";

import ModuleMaster from "../model/ModuleMaster";
import CourseMaster from "../model/CourseMaster";

import { getActionUser } from "./user";
import { paginationService } from "../../components/util/pagination";

import logger from "../../lib/logger";

export const createModule = async (
  queryData: any,
  payload: any,
): Promise<any> => {
  try {
    const moduleRefId = queryData?.moduleRefId?.trim();

    const courseRefId = queryData?.courseRefId?.trim();

    const moduleName = queryData?.moduleName?.trim();
    const description = queryData?.description?.trim() || null;

    const moduleCode = queryData?.moduleCode?.trim() || null;

    const displayOrder = Number(queryData?.displayOrder) || 1;

    const status = queryData?.status?.trim() || "draft";

    /**
     * ========================================================
     * VALIDATION
     * ========================================================
     */

    if (!moduleName) {
      throw new Error("MODULE_E_00002");
    }

    if (!courseRefId) {
      throw new Error("COURSE_E_00001");
    }

    /**
     * ========================================================
     * GET LOGGED-IN USER
     * ========================================================
     */

    const findUser = await getActionUser(payload?.user_ref_id);

    if (!findUser?.user_id) {
      throw new Error("USER_E_00001");
    }

    /**
     * ========================================================
     * FIND COURSE
     * ========================================================
     *
     * Convert:
     *
     * courseRefId -> courseId
     */

    const course = await CourseMaster.findOne({
      where: {
        courseRefId,
      },
      raw: true,
    });

    if (!course) {
      throw new Error("COURSE_E_00001");
    }

    const courseId = course.courseId;

    /**
     * ========================================================
     * UPDATE FLOW
     * ========================================================
     */

    if (moduleRefId) {
      const existingModule = await ModuleMaster.findOne({
        where: {
          moduleRefId,
        },
      });

      if (!existingModule) {
        throw new Error("MODULE_E_00001");
      }

      /**
       * Check duplicate module name
       * inside same course.
       *
       * Exclude current module.
       */

      const duplicateModule = await ModuleMaster.findOne({
        where: {
          courseId,

          moduleName,

          moduleRefId: {
            [Op.ne]: moduleRefId,
          },
        },
      });

      if (duplicateModule) {
        throw new Error("MODULE_E_00004");
      }

      /**
       * Update module
       */

      const updateObj: any = {
        courseId,
        moduleName,
        description,
        displayOrder,
        status,
        updatedBy: findUser.user_id,
        updatedAt: new Date(),
      };

      /**
       * Only update moduleCode
       * if it is provided.
       */

      if (moduleCode) {
        updateObj.moduleCode = moduleCode;
      }

      await sequelizeConnection.transaction(
        async (transaction: Transaction) => {
          await ModuleMaster.update(updateObj, {
            where: {
              moduleRefId,
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
     * Check duplicate module name
     * within the same course.
     */

    const existingModule = await ModuleMaster.findOne({
      where: {
        courseId,
        moduleName,
      },
    });

    if (existingModule) {
      throw new Error("MODULE_E_00004");
    }

    /**
     * Generate module code
     * if frontend doesn't send one.
     */

    const finalModuleCode = moduleCode || `MOD-${Date.now()}`;

    /**
     * Check duplicate module code.
     */

    const existingModuleCode = await ModuleMaster.findOne({
      where: {
        moduleCode: finalModuleCode,
      },
    });

    if (existingModuleCode) {
      throw new Error("MODULE_E_00005");
    }

    /**
     * Create object
     */

    const createObj: any = {
      moduleRefId: randomUUID(),

      courseId,

      moduleCode: finalModuleCode,

      moduleName,

      description,

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
     * Insert
     */

    await sequelizeConnection.transaction(async (transaction: Transaction) => {
      await ModuleMaster.create(createObj, {
        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error createModule/moduleMaster.ts", error);

    throw error;
  }
};


export const getAllModules = async (queryData: any): Promise<any> => {
  try {
    const page = Math.max(Number(queryData?.page) || 1, 1);

    const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);

    const whereObj: any = {};

    /**
     * ========================================================
     * COURSE FILTER
     * ========================================================
     */

    const courseRefId = queryData?.courseRefId?.trim();

    if (courseRefId) {
      const course = await CourseMaster.findOne({
        where: {
          courseRefId,
        },
        attributes: ["courseId"],
        raw: true,
      });

      if (!course) {
        throw new Error("COURSE_E_00001");
      }

      whereObj.courseId = course.courseId;
    }

    /**
     * ========================================================
     * SEARCH
     * ========================================================
     */

    const search = queryData?.search?.trim();

    if (search) {
      whereObj[Op.or] = [
        {
          moduleName: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          moduleCode: {
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
     * GET DATA
     * ========================================================
     *
     * IMPORTANT:
     *
     * No limit
     * No offset
     *
     * Your paginationService handles
     * pagination.
     */

    const { count, rows } = await ModuleMaster.findAndCountAll({
      where: whereObj,

      include: [
        {
          model: CourseMaster,
          as: "course",
          attributes: ["courseId", "courseRefId", "courseCode", "courseName"],
          required: false,
        },
      ],

      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "DESC"],
      ],

      raw: true,

      nest: true,
    });

    /**
     * ========================================================
     * PAGINATION SERVICE
     * ========================================================
     */

    const result = await paginationService(rows, page, pageSize);

    /**
     * If your paginationService already
     * returns the complete structure,
     * simply return it.
     */

    return result;
  } catch (error) {
    logger.error("Error getAllModules/moduleMaster.ts", error);

    throw error;
  }
};

export const getModule = async (moduleRefId: string): Promise<any> => {
  try {
    if (!moduleRefId?.trim()) {
      throw new Error("MODULE_E_00001");
    }

    const moduleData = await ModuleMaster.findOne({
      where: {
        moduleRefId: moduleRefId.trim(),
      },

      include: [
        {
          model: CourseMaster,
          as: "course",
          attributes: ["courseId", "courseRefId", "courseCode", "courseName"],
        },
      ],
    });

    if (!moduleData) {
      throw new Error("MODULE_E_00001");
    }

    return moduleData;
  } catch (error) {
    logger.error("Error getModule/moduleMaster.ts", error);

    throw error;
  }
};

export const deleteModule = async (
  moduleRefId: string,
  payload: any,
): Promise<any> => {
  try {
    if (!moduleRefId?.trim()) {
      throw new Error("MODULE_E_00001");
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
     * FIND MODULE
     * ========================================================
     */

    const existingModule = await ModuleMaster.findOne({
      where: {
        moduleRefId: moduleRefId.trim(),
      },
    });

    if (!existingModule) {
      throw new Error("MODULE_E_00001");
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

      await ModuleMaster.update(
        {
          deletedBy: findUser.user_id,

          updatedBy: findUser.user_id,

          updatedAt: new Date(),
        },
        {
          where: {
            moduleRefId: moduleRefId.trim(),
          },

          transaction,
        },
      );

      /**
       * Soft delete
       */

      await ModuleMaster.destroy({
        where: {
          moduleRefId: moduleRefId.trim(),
        },

        transaction,
      });
    });

    return true;
  } catch (error) {
    logger.error("Error deleteModule/moduleMaster.ts", error);

    throw error;
  }
};
