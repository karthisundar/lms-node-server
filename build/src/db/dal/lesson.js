"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserLessonMapping = exports.getUserLessonMapping = exports.getAllUserLessonMappings = exports.createUserLessonMapping = exports.deleteLessonNotes = exports.getLessonNotes = exports.getAllLessonNotes = exports.createLessonNotes = exports.deleteLessonVideoMapping = exports.getLessonVideoMapping = exports.getAllLessonVideoMappings = exports.createLessonVideoMapping = exports.deleteLesson = exports.getLesson = exports.getAllLessons = exports.createLesson = void 0;
const sequelize_1 = require("sequelize");
const crypto_1 = require("crypto");
const config_1 = __importDefault(require("../config"));
const LessonMaster_1 = __importDefault(require("../model/LessonMaster"));
const ModuleMaster_1 = __importDefault(require("../model/ModuleMaster"));
const VideoMaster_1 = __importDefault(require("../model/VideoMaster"));
const user_1 = require("./user");
const logger_1 = __importDefault(require("../../lib/logger"));
const pagination_1 = require("../../components/util/pagination");
const LessonVideoMapping_1 = __importDefault(require("../model/LessonVideoMapping"));
const LessonNotes_1 = __importDefault(require("../model/LessonNotes"));
const UserLessonMapping_1 = __importDefault(require("../model/UserLessonMapping"));
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
const createLesson = async (queryData, payload) => {
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
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!findUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        /**
         * ========================================================
         * CHECK MODULE
         * ========================================================
         */
        const existingModule = await ModuleMaster_1.default.findOne({
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
            const existingVideo = await VideoMaster_1.default.findOne({
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
            const existingLesson = await LessonMaster_1.default.findOne({
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
            const duplicateLesson = await LessonMaster_1.default.findOne({
                where: {
                    moduleRefId,
                    lessonName,
                    lessonRefId: {
                        [sequelize_1.Op.ne]: lessonRefId,
                    },
                },
            });
            if (duplicateLesson) {
                throw new Error("LESSON_E_00005");
            }
            /**
             * Update object
             */
            const updateObj = {
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
            await config_1.default.transaction(async (transaction) => {
                await LessonMaster_1.default.update(updateObj, {
                    where: {
                        lessonRefId,
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
         * Check duplicate lesson name
         * inside same module.
         */
        const existingLesson = await LessonMaster_1.default.findOne({
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
        const createObj = {
            lessonRefId: (0, crypto_1.randomUUID)(),
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
        await config_1.default.transaction(async (transaction) => {
            await LessonMaster_1.default.create(createObj, {
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error createLesson/lessonMaster.ts", error);
        throw error;
    }
};
exports.createLesson = createLesson;
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
const getAllLessons = async (queryData) => {
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
                    lessonName: {
                        [sequelize_1.Op.like]: `%${search}%`,
                    },
                },
                {
                    lessonCode: {
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
        const { rows } = await LessonMaster_1.default.findAndCountAll({
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
        const result = await (0, pagination_1.paginationService)(rows, page, pageSize);
        return result;
    }
    catch (error) {
        logger_1.default.error("Error getAllLessons/lessonMaster.ts", error);
        throw error;
    }
};
exports.getAllLessons = getAllLessons;
/**
 * ============================================================
 * GET SINGLE LESSON
 * ============================================================
 *
 * Uses lessonRefId.
 */
const getLesson = async (lessonRefId) => {
    try {
        if (!lessonRefId?.trim()) {
            throw new Error("LESSON_E_00001");
        }
        const lesson = await LessonMaster_1.default.findOne({
            where: {
                lessonRefId: lessonRefId.trim(),
            },
            raw: true,
        });
        if (!lesson) {
            throw new Error("LESSON_E_00001");
        }
        return lesson;
    }
    catch (error) {
        logger_1.default.error("Error getLesson/lessonMaster.ts", error);
        throw error;
    }
};
exports.getLesson = getLesson;
/**
 * ============================================================
 * DELETE LESSON
 * ============================================================
 *
 * Soft delete.
 *
 * paranoid: true
 */
const deleteLesson = async (lessonRefId, payload) => {
    try {
        if (!lessonRefId?.trim()) {
            throw new Error("LESSON_E_00001");
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
         * FIND LESSON
         * ========================================================
         */
        const existingLesson = await LessonMaster_1.default.findOne({
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
        await config_1.default.transaction(async (transaction) => {
            /**
             * Store deletedBy
             */
            await LessonMaster_1.default.update({
                deletedBy: findUser.user_id,
                updatedBy: findUser.user_id,
                updatedAt: new Date(),
            }, {
                where: {
                    lessonRefId: lessonRefId.trim(),
                },
                transaction,
            });
            /**
             * Soft delete
             */
            await LessonMaster_1.default.destroy({
                where: {
                    lessonRefId: lessonRefId.trim(),
                },
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error deleteLesson/lessonMaster.ts", error);
        throw error;
    }
};
exports.deleteLesson = deleteLesson;
const createLessonVideoMapping = async (queryData, payload) => {
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
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!findUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        /**
         * ========================================================
         * CHECK LESSON
         * ========================================================
         */
        const lesson = await LessonMaster_1.default.findOne({
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
        const video = await VideoMaster_1.default.findOne({
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
            const existingMapping = await LessonVideoMapping_1.default.findOne({
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
            const duplicateMapping = await LessonVideoMapping_1.default.findOne({
                where: {
                    lessonRefId,
                    videoRefId,
                    lessonVideoMappingRefId: {
                        [sequelize_1.Op.ne]: lessonVideoMappingRefId,
                    },
                },
            });
            if (duplicateMapping) {
                throw new Error("LESSON_VIDEO_MAPPING_E_00003");
            }
            const updateObj = {
                lessonRefId,
                videoRefId,
                displayOrder,
                status,
                updatedBy: findUser.user_id,
                updatedAt: new Date(),
            };
            await config_1.default.transaction(async (transaction) => {
                await LessonVideoMapping_1.default.update(updateObj, {
                    where: {
                        lessonVideoMappingRefId,
                    },
                    transaction,
                });
            });
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
        const existingMapping = await LessonVideoMapping_1.default.findOne({
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
        const createObj = {
            lessonVideoMappingRefId: (0, crypto_1.randomUUID)(),
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
        await config_1.default.transaction(async (transaction) => {
            await LessonVideoMapping_1.default.create(createObj, {
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error createLessonVideoMapping/lessonVideoMapping.ts", error);
        throw error;
    }
};
exports.createLessonVideoMapping = createLessonVideoMapping;
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
const getAllLessonVideoMappings = async (queryData) => {
    try {
        const page = Math.max(Number(queryData?.page) || 1, 1);
        const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);
        const whereObj = {};
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
        const { rows } = await LessonVideoMapping_1.default.findAndCountAll({
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
        const result = await (0, pagination_1.paginationService)(rows, page, pageSize);
        return result;
    }
    catch (error) {
        logger_1.default.error("Error getAllLessonVideoMappings/lessonVideoMapping.ts", error);
        throw error;
    }
};
exports.getAllLessonVideoMappings = getAllLessonVideoMappings;
/**
 * ============================================================
 * GET SINGLE LESSON VIDEO MAPPING
 * ============================================================
 */
const getLessonVideoMapping = async (lessonVideoMappingRefId) => {
    try {
        if (!lessonVideoMappingRefId?.trim()) {
            throw new Error("LESSON_VIDEO_MAPPING_E_00002");
        }
        const mapping = await LessonVideoMapping_1.default.findOne({
            where: {
                lessonVideoMappingRefId: lessonVideoMappingRefId.trim(),
            },
            raw: true,
        });
        if (!mapping) {
            throw new Error("LESSON_VIDEO_MAPPING_E_00002");
        }
        return mapping;
    }
    catch (error) {
        logger_1.default.error("Error getLessonVideoMapping/lessonVideoMapping.ts", error);
        throw error;
    }
};
exports.getLessonVideoMapping = getLessonVideoMapping;
/**
 * ============================================================
 * DELETE LESSON VIDEO MAPPING
 * ============================================================
 *
 * Soft delete.
 */
const deleteLessonVideoMapping = async (lessonVideoMappingRefId, payload) => {
    try {
        if (!lessonVideoMappingRefId?.trim()) {
            throw new Error("LESSON_VIDEO_MAPPING_E_00002");
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
         * FIND MAPPING
         * ========================================================
         */
        const existingMapping = await LessonVideoMapping_1.default.findOne({
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
        await config_1.default.transaction(async (transaction) => {
            /**
             * Store deletedBy.
             */
            await LessonVideoMapping_1.default.update({
                deletedBy: findUser.user_id,
                updatedBy: findUser.user_id,
                updatedAt: new Date(),
            }, {
                where: {
                    lessonVideoMappingRefId: lessonVideoMappingRefId.trim(),
                },
                transaction,
            });
            /**
             * Soft delete.
             */
            await LessonVideoMapping_1.default.destroy({
                where: {
                    lessonVideoMappingRefId: lessonVideoMappingRefId.trim(),
                },
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error deleteLessonVideoMapping/lessonVideoMapping.ts", error);
        throw error;
    }
};
exports.deleteLessonVideoMapping = deleteLessonVideoMapping;
const createLessonNotes = async (queryData, payload, file) => {
    try {
        const lessonNotesRefId = queryData?.lessonNotesRefId?.trim();
        const lessonId = queryData?.lessonId?.trim();
        const title = queryData?.title?.trim();
        const content = queryData?.content?.trim();
        const status = queryData?.status !== undefined ? Number(queryData.status) : 1;
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
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!findUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        /**
         * ========================================================
         * UPDATE
         * ========================================================
         */
        if (lessonNotesRefId) {
            const existingLessonNotes = await LessonNotes_1.default.findOne({
                where: {
                    lessonNotesRefId,
                },
            });
            if (!existingLessonNotes) {
                throw new Error("LESSON_NOTES_E_00001");
            }
            const updateObj = {
                lessonId,
                title,
                content,
                status,
                updatedBy: findUser.user_id,
                updatedAt: new Date(),
            };
            let oldDocumentKey = null;
            /**
             * New document uploaded
             */
            if (file) {
                oldDocumentKey = existingLessonNotes.documentKey;
                const s3File = file;
                updateObj.documentName = file.originalname;
                updateObj.documentUrl = s3File.location;
                updateObj.documentKey = s3File.key;
                updateObj.documentMimeType = file.mimetype;
                updateObj.documentSize = file.size;
            }
            await config_1.default.transaction(async (transaction) => {
                await LessonNotes_1.default.update(updateObj, {
                    where: {
                        lessonNotesRefId,
                    },
                    transaction,
                });
            });
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
        const createObj = {
            lessonNotesRefId: (0, crypto_1.randomUUID)(),
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
            const s3File = file;
            createObj.documentName = file.originalname;
            createObj.documentUrl = s3File.location;
            createObj.documentKey = s3File.key;
            createObj.documentMimeType = file.mimetype;
            createObj.documentSize = file.size;
        }
        await config_1.default.transaction(async (transaction) => {
            await LessonNotes_1.default.create(createObj, {
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error createLessonNotes/lessonNotes.ts", error);
        throw error;
    }
};
exports.createLessonNotes = createLessonNotes;
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
const getAllLessonNotes = async (queryData) => {
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
                    title: {
                        [sequelize_1.Op.like]: `%${search}%`,
                    },
                },
                {
                    content: {
                        [sequelize_1.Op.like]: `%${search}%`,
                    },
                },
                {
                    lessonId: {
                        [sequelize_1.Op.like]: `%${search}%`,
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
        const { rows } = await LessonNotes_1.default.findAndCountAll({
            where: whereObj,
            order: [["createdAt", "DESC"]],
            raw: true,
        });
        return await (0, pagination_1.paginationService)(rows, page, pageSize);
    }
    catch (error) {
        logger_1.default.error("Error getAllLessonNotes/lessonNotes.ts", error);
        throw error;
    }
};
exports.getAllLessonNotes = getAllLessonNotes;
/**
 * ============================================================
 * GET SINGLE LESSON NOTES
 * ============================================================
 *
 * Uses lessonNotesRefId.
 */
const getLessonNotes = async (lessonNotesRefId) => {
    try {
        if (!lessonNotesRefId?.trim()) {
            throw new Error("LESSON_NOTES_E_00001");
        }
        const lessonNotes = await LessonNotes_1.default.findOne({
            where: {
                lessonNotesRefId: lessonNotesRefId.trim(),
            },
            raw: true,
        });
        if (!lessonNotes) {
            throw new Error("LESSON_NOTES_E_00001");
        }
        return lessonNotes;
    }
    catch (error) {
        logger_1.default.error("Error getLessonNotes/lessonNotes.ts", error);
        throw error;
    }
};
exports.getLessonNotes = getLessonNotes;
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
const deleteLessonNotes = async (lessonNotesRefId, payload) => {
    try {
        if (!lessonNotesRefId?.trim()) {
            throw new Error("LESSON_NOTES_E_00001");
        }
        /**
         * ========================================================
         * LOGGED USER
         * ========================================================
         */
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!findUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        /**
         * ========================================================
         * FIND LESSON NOTE
         * ========================================================
         */
        const existingLessonNotes = await LessonNotes_1.default.findOne({
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
        await config_1.default.transaction(async (transaction) => {
            await LessonNotes_1.default.update({
                deletedBy: findUser.user_id,
                updatedBy: findUser.user_id,
                updatedAt: new Date(),
            }, {
                where: {
                    lessonNotesRefId: lessonNotesRefId.trim(),
                },
                transaction,
            });
            await LessonNotes_1.default.destroy({
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
    }
    catch (error) {
        logger_1.default.error("Error deleteLessonNotes/lessonNotes.ts", error);
        throw error;
    }
};
exports.deleteLessonNotes = deleteLessonNotes;
const createUserLessonMapping = async (queryData, payload) => {
    try {
        const userLessonRefId = queryData?.userLessonRefId?.trim() || "";
        const userId = Number(queryData?.userId);
        const lessonId = queryData?.lessonId?.trim();
        const status = queryData?.status !== undefined && queryData?.status !== null
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
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!findUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        // ========================================================
        // UPDATE
        // ========================================================
        if (userLessonRefId) {
            const existingMapping = await UserLessonMapping_1.default.findOne({
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
            const duplicateMapping = await UserLessonMapping_1.default.findOne({
                where: {
                    userId,
                    lessonId,
                    userLessonRefId: {
                        [sequelize_1.Op.ne]: userLessonRefId,
                    },
                },
            });
            if (duplicateMapping) {
                throw new Error("USER_LESSON_E_00002");
            }
            const updateObj = {
                userId,
                lessonId,
                status,
                updatedBy: findUser.user_id,
                updatedAt: new Date(),
            };
            await config_1.default.transaction(async (transaction) => {
                await UserLessonMapping_1.default.update(updateObj, {
                    where: {
                        userLessonRefId,
                    },
                    transaction,
                });
            });
            return true;
        }
        // ========================================================
        // CREATE
        // ========================================================
        /**
         * Check duplicate mapping
         */
        const existingMapping = await UserLessonMapping_1.default.findOne({
            where: {
                userId,
                lessonId,
            },
        });
        if (existingMapping) {
            throw new Error("USER_LESSON_E_00002");
        }
        const createObj = {
            userLessonRefId: (0, crypto_1.randomUUID)(),
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
        await config_1.default.transaction(async (transaction) => {
            await UserLessonMapping_1.default.create(createObj, {
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error createUserLessonMapping/userLessonMapping.ts", error);
        throw error;
    }
};
exports.createUserLessonMapping = createUserLessonMapping;
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
const getAllUserLessonMappings = async (queryData, payload) => {
    try {
        const page = Math.max(Number(queryData?.page) || 1, 1);
        const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);
        const whereObj = {};
        // ========================================================
        // ROLE RESTRICTION
        // ========================================================
        const loggedUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
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
        }
        else if (queryData?.userId) {
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
        if (queryData?.status !== undefined &&
            queryData?.status !== null &&
            queryData?.status !== "") {
            whereObj.status = Number(queryData.status);
        }
        // ========================================================
        // GET DATA
        // ========================================================
        const { count, rows } = await UserLessonMapping_1.default.findAndCountAll({
            where: whereObj,
            limit: pageSize,
            offset: (page - 1) * pageSize,
            order: [["createdAt", "DESC"]],
            raw: true,
        });
        const totalItem = typeof count === "number"
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
    }
    catch (error) {
        logger_1.default.error("Error getAllUserLessonMappings/userLessonMapping.ts", error);
        throw error;
    }
};
exports.getAllUserLessonMappings = getAllUserLessonMappings;
/**
 * ============================================================
 * GET SINGLE USER LESSON MAPPING
 * ============================================================
 */
const getUserLessonMapping = async (userLessonRefId, payload) => {
    try {
        if (!userLessonRefId?.trim()) {
            throw new Error("USER_LESSON_E_00001");
        }
        const loggedUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!loggedUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        const whereObj = {
            userLessonRefId: userLessonRefId.trim(),
        };
        /**
         * User can only access his own mapping.
         */
        if (Number(payload?.role_id) === 2) {
            whereObj.userId = loggedUser.user_id;
        }
        const mapping = await UserLessonMapping_1.default.findOne({
            where: whereObj,
            raw: true,
        });
        if (!mapping) {
            throw new Error("USER_LESSON_E_00001");
        }
        return mapping;
    }
    catch (error) {
        logger_1.default.error("Error getUserLessonMapping/userLessonMapping.ts", error);
        throw error;
    }
};
exports.getUserLessonMapping = getUserLessonMapping;
/**
 * ============================================================
 * DELETE USER LESSON MAPPING
 * ============================================================
 *
 * Soft delete.
 */
const deleteUserLessonMapping = async (userLessonRefId, payload) => {
    try {
        if (!userLessonRefId?.trim()) {
            throw new Error("USER_LESSON_E_00001");
        }
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!findUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        const whereObj = {
            userLessonRefId: userLessonRefId.trim(),
        };
        /**
         * User cannot delete another user's mapping.
         */
        if (Number(payload?.role_id) === 2) {
            whereObj.userId = findUser.user_id;
        }
        const existingMapping = await UserLessonMapping_1.default.findOne({
            where: whereObj,
        });
        if (!existingMapping) {
            throw new Error("USER_LESSON_E_00001");
        }
        await config_1.default.transaction(async (transaction) => {
            await UserLessonMapping_1.default.update({
                deletedBy: findUser.user_id,
                updatedBy: findUser.user_id,
                updatedAt: new Date(),
            }, {
                where: whereObj,
                transaction,
            });
            await UserLessonMapping_1.default.destroy({
                where: whereObj,
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error deleteUserLessonMapping/userLessonMapping.ts", error);
        throw error;
    }
};
exports.deleteUserLessonMapping = deleteUserLessonMapping;
function deleteS3File(oldDocumentKey) {
    throw new Error("Function not implemented.");
}
//# sourceMappingURL=lesson.js.map