"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVideo = exports.getVideo = exports.getAllVideos = exports.createVideo = void 0;
const sequelize_1 = require("sequelize");
const crypto_1 = require("crypto");
const config_1 = __importDefault(require("../config"));
const VideoMaster_1 = __importDefault(require("../model/VideoMaster"));
const user_1 = require("./user");
const logger_1 = __importDefault(require("../../lib/logger"));
const pagination_1 = require("../../components/util/pagination");
const createVideo = async (queryData, payload) => {
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
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!findUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        /**
         * =========================================
         * UPDATE
         * =========================================
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
            const updateObj = {
                title,
                filename,
                url,
                sessionId,
                bucketId,
                updatedBy: findUser.user_id,
                updatedAt: new Date(),
            };
            await config_1.default.transaction(async (transaction) => {
                await VideoMaster_1.default.update(updateObj, {
                    where: {
                        videoRefId,
                    },
                    transaction,
                });
            });
            return true;
        }
        /**
         * =========================================
         * CREATE
         * =========================================
         */
        const createObj = {
            videoRefId: (0, crypto_1.randomUUID)(),
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
        await config_1.default.transaction(async (transaction) => {
            await VideoMaster_1.default.create(createObj, {
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error createVideo/videoMaster.ts", error);
        throw error;
    }
};
exports.createVideo = createVideo;
const getAllVideos = async (queryData) => {
    try {
        const page = Math.max(Number(queryData?.page) || 1, 1);
        const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);
        const whereObj = {};
        /**
         * Optional search
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
                    filename: {
                        [sequelize_1.Op.like]: `%${search}%`,
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
        const { count, rows } = await VideoMaster_1.default.findAndCountAll({
            where: whereObj,
            nest: true,
            raw: true,
            order: [["createdAt", "DESC"]],
        });
        /**
         * Use existing project pagination service
         */
        const pagi = await (0, pagination_1.paginationService)(rows, page, pageSize);
        return pagi;
    }
    catch (error) {
        logger_1.default.error("Error getAllVideos/videoMaster.ts", error);
        throw error;
    }
};
exports.getAllVideos = getAllVideos;
const getVideo = async (videoRefId) => {
    try {
        if (!videoRefId) {
            throw new Error("VIDEO_E_00001");
        }
        const video = await VideoMaster_1.default.findOne({
            where: {
                videoRefId,
            },
        });
        if (!video) {
            throw new Error("VIDEO_E_00001");
        }
        return video;
    }
    catch (error) {
        logger_1.default.error("Error getVideo/videoMaster.ts", error);
        throw error;
    }
};
exports.getVideo = getVideo;
const deleteVideo = async (videoRefId, payload) => {
    try {
        if (!videoRefId) {
            throw new Error("VIDEO_E_00001");
        }
        /**
         * Get logged-in user
         */
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!findUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        /**
         * Find existing video
         */
        const existingVideo = await VideoMaster_1.default.findOne({
            where: {
                videoRefId,
            },
        });
        if (!existingVideo) {
            throw new Error("VIDEO_E_00001");
        }
        await config_1.default.transaction(async (transaction) => {
            /**
             * Set deletedBy before soft delete
             */
            await VideoMaster_1.default.update({
                deletedBy: findUser.user_id,
                updatedAt: new Date(),
            }, {
                where: {
                    videoRefId,
                },
                transaction,
            });
            /**
             * Soft delete
             *
             * paranoid: true
             * automatically sets deletedAt
             */
            await VideoMaster_1.default.destroy({
                where: {
                    videoRefId,
                },
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error deleteVideo/videoMaster.ts", error);
        throw error;
    }
};
exports.deleteVideo = deleteVideo;
//# sourceMappingURL=videos.js.map