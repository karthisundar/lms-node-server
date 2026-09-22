"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.getCourse = exports.getAllCourses = exports.createCourse = void 0;
const sequelize_1 = require("sequelize");
const crypto_1 = require("crypto");
const config_1 = __importDefault(require("../config"));
const CourseMaster_1 = __importDefault(require("../model/CourseMaster"));
const user_1 = require("./user");
const pagination_1 = require("../../components/util/pagination");
const logger_1 = __importDefault(require("../../lib/logger"));
const createCourse = async (queryData, payload) => {
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
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!findUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        /**
         * ========================================================
         * UPDATE FLOW
         * ========================================================
         */
        if (courseRefId) {
            const existingCourse = await CourseMaster_1.default.findOne({
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
            const duplicateCourse = await CourseMaster_1.default.findOne({
                where: {
                    courseName,
                    courseRefId: {
                        [sequelize_1.Op.ne]: courseRefId,
                    },
                },
            });
            if (duplicateCourse) {
                throw new Error("COURSE_E_00004");
            }
            const updateObj = {
                courseName,
                description,
                status,
                updatedBy: findUser.user_id,
                updatedAt: new Date(),
            };
            await config_1.default.transaction(async (transaction) => {
                await CourseMaster_1.default.update(updateObj, {
                    where: {
                        courseRefId,
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
         * Check duplicate course name
         */
        const existingCourse = await CourseMaster_1.default.findOne({
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
        const createObj = {
            courseRefId: (0, crypto_1.randomUUID)(),
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
        await config_1.default.transaction(async (transaction) => {
            await CourseMaster_1.default.create(createObj, {
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error createCourse/course.ts", error);
        throw error;
    }
};
exports.createCourse = createCourse;
const getAllCourses = async (queryData) => {
    try {
        const page = Math.max(Number(queryData?.page) || 1, 1);
        const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);
        const whereObj = {};
        /**
         * ========================================================
         * SEARCH
         * ========================================================
         */
        const search = queryData?.search?.trim();
        if (search) {
            whereObj[sequelize_1.Op.or] = [
                {
                    courseName: {
                        [sequelize_1.Op.like]: `%${search}%`,
                    },
                },
                {
                    courseCode: {
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
         * GET ALL DATA
         * ========================================================
         *
         * No limit
         * No offset
         *
         * paginationService will handle pagination.
         */
        const { rows } = await CourseMaster_1.default.findAndCountAll({
            where: whereObj,
            order: [["createdAt", "DESC"]],
            raw: true,
        });
        /**
         * ========================================================
         * PAGINATION
         * ========================================================
         */
        const pagi = await (0, pagination_1.paginationService)(rows, page, pageSize);
        return pagi;
    }
    catch (error) {
        logger_1.default.error("Error getAllCourses/course.ts", error);
        throw error;
    }
};
exports.getAllCourses = getAllCourses;
const getCourse = async (courseRefId) => {
    try {
        if (!courseRefId?.trim()) {
            throw new Error("COURSE_E_00001");
        }
        const course = await CourseMaster_1.default.findOne({
            where: {
                courseRefId: courseRefId.trim(),
            },
            raw: true,
        });
        if (!course) {
            throw new Error("COURSE_E_00001");
        }
        return course;
    }
    catch (error) {
        logger_1.default.error("Error getCourse/course.ts", error);
        throw error;
    }
};
exports.getCourse = getCourse;
const deleteCourse = async (courseRefId, payload) => {
    try {
        if (!courseRefId?.trim()) {
            throw new Error("COURSE_E_00001");
        }
        /**
         * Logged-in user
         */
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!findUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        /**
         * Find course
         */
        const existingCourse = await CourseMaster_1.default.findOne({
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
        await config_1.default.transaction(async (transaction) => {
            /**
             * Store deletedBy first.
             */
            await CourseMaster_1.default.update({
                deletedBy: findUser.user_id,
                updatedBy: findUser.user_id,
                updatedAt: new Date(),
            }, {
                where: {
                    courseRefId: courseRefId.trim(),
                },
                transaction,
            });
            /**
             * Because paranoid = true,
             * this performs SOFT DELETE.
             */
            await CourseMaster_1.default.destroy({
                where: {
                    courseRefId: courseRefId.trim(),
                },
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error deleteCourse/course.ts", error);
        throw error;
    }
};
exports.deleteCourse = deleteCourse;
//# sourceMappingURL=course.js.map