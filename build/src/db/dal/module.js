"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteModule = exports.getModule = exports.getAllModules = exports.createModule = void 0;
const sequelize_1 = require("sequelize");
const crypto_1 = require("crypto");
const config_1 = __importDefault(require("../config"));
const ModuleMaster_1 = __importDefault(require("../model/ModuleMaster"));
const CourseMaster_1 = __importDefault(require("../model/CourseMaster"));
const user_1 = require("./user");
const pagination_1 = require("../../components/util/pagination");
const logger_1 = __importDefault(require("../../lib/logger"));
const createModule = async (queryData, payload) => {
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
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
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
        const course = await CourseMaster_1.default.findOne({
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
            const existingModule = await ModuleMaster_1.default.findOne({
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
            const duplicateModule = await ModuleMaster_1.default.findOne({
                where: {
                    courseId,
                    moduleName,
                    moduleRefId: {
                        [sequelize_1.Op.ne]: moduleRefId,
                    },
                },
            });
            if (duplicateModule) {
                throw new Error("MODULE_E_00004");
            }
            /**
             * Update module
             */
            const updateObj = {
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
            await config_1.default.transaction(async (transaction) => {
                await ModuleMaster_1.default.update(updateObj, {
                    where: {
                        moduleRefId,
                    },
                    transaction,
                });
            });
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
        const existingModule = await ModuleMaster_1.default.findOne({
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
        const existingModuleCode = await ModuleMaster_1.default.findOne({
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
        const createObj = {
            moduleRefId: (0, crypto_1.randomUUID)(),
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
        await config_1.default.transaction(async (transaction) => {
            await ModuleMaster_1.default.create(createObj, {
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error createModule/moduleMaster.ts", error);
        throw error;
    }
};
exports.createModule = createModule;
const getAllModules = async (queryData) => {
    try {
        const page = Math.max(Number(queryData?.page) || 1, 1);
        const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);
        const whereObj = {};
        /**
         * ========================================================
         * COURSE FILTER
         * ========================================================
         */
        const courseRefId = queryData?.courseRefId?.trim();
        if (courseRefId) {
            const course = await CourseMaster_1.default.findOne({
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
            whereObj[sequelize_1.Op.or] = [
                {
                    moduleName: {
                        [sequelize_1.Op.like]: `%${search}%`,
                    },
                },
                {
                    moduleCode: {
                        [sequelize_1.Op.like]: `%${search}%`,
                    },
                },
                {
                    description: {
                        [sequelize_1.Op.like]: `%${search}%`,
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
        const { count, rows } = await ModuleMaster_1.default.findAndCountAll({
            where: whereObj,
            include: [
                {
                    model: CourseMaster_1.default,
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
        const result = await (0, pagination_1.paginationService)(rows, page, pageSize);
        /**
         * If your paginationService already
         * returns the complete structure,
         * simply return it.
         */
        return result;
    }
    catch (error) {
        logger_1.default.error("Error getAllModules/moduleMaster.ts", error);
        throw error;
    }
};
exports.getAllModules = getAllModules;
const getModule = async (moduleRefId) => {
    try {
        if (!moduleRefId?.trim()) {
            throw new Error("MODULE_E_00001");
        }
        const moduleData = await ModuleMaster_1.default.findOne({
            where: {
                moduleRefId: moduleRefId.trim(),
            },
            include: [
                {
                    model: CourseMaster_1.default,
                    as: "course",
                    attributes: ["courseId", "courseRefId", "courseCode", "courseName"],
                },
            ],
        });
        if (!moduleData) {
            throw new Error("MODULE_E_00001");
        }
        return moduleData;
    }
    catch (error) {
        logger_1.default.error("Error getModule/moduleMaster.ts", error);
        throw error;
    }
};
exports.getModule = getModule;
const deleteModule = async (moduleRefId, payload) => {
    try {
        if (!moduleRefId?.trim()) {
            throw new Error("MODULE_E_00001");
        }
        /**
         * ========================================================
         * LOGGED-IN USER
         * ========================================================
         */
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!findUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        /**
         * ========================================================
         * FIND MODULE
         * ========================================================
         */
        const existingModule = await ModuleMaster_1.default.findOne({
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
        await config_1.default.transaction(async (transaction) => {
            /**
             * Store deletedBy
             */
            await ModuleMaster_1.default.update({
                deletedBy: findUser.user_id,
                updatedBy: findUser.user_id,
                updatedAt: new Date(),
            }, {
                where: {
                    moduleRefId: moduleRefId.trim(),
                },
                transaction,
            });
            /**
             * Soft delete
             */
            await ModuleMaster_1.default.destroy({
                where: {
                    moduleRefId: moduleRefId.trim(),
                },
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error deleteModule/moduleMaster.ts", error);
        throw error;
    }
};
exports.deleteModule = deleteModule;
//# sourceMappingURL=module.js.map