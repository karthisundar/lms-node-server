"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserSessionMapping = exports.getUserSessionMapping = exports.getAllUserSessionMappings = exports.createUserSessionMapping = exports.deleteSession = exports.getSession = exports.getAllSessions = exports.createSession = void 0;
const sequelize_1 = require("sequelize");
const crypto_1 = require("crypto");
const config_1 = __importDefault(require("../config"));
// import SessionMaster from "../models/sessionMaster";
const user_1 = require("./user");
const SessionMaster_1 = __importDefault(require("../model/SessionMaster"));
const logger_1 = __importDefault(require("../../lib/logger"));
const pagination_1 = require("../../components/util/pagination");
const UserSessionMapping_1 = __importDefault(require("../model/UserSessionMapping"));
// import logger from "../utils/logger";
/**
 * Create / Update Session Master
 *
 * If sessionRefId exists -> UPDATE
 * If sessionRefId does not exist -> CREATE
 */
const createSession = async (queryData, payload) => {
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
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
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
            const existingSession = await SessionMaster_1.default.findOne({
                where: {
                    sessionRefId,
                },
            });
            if (!existingSession) {
                throw new Error("SESSION_E_00001");
            }
            const updateObj = {
                sessionName,
                description,
                startDate: date,
                status,
                updatedBy: findUser.user_id,
                updatedAt: new Date(),
            };
            await config_1.default.transaction(async (transaction) => {
                await SessionMaster_1.default.update(updateObj, {
                    where: {
                        sessionRefId,
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
        const sessionCode = `SES-${Date.now()}`;
        const createObj = {
            sessionRefId: (0, crypto_1.randomUUID)(),
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
        await config_1.default.transaction(async (transaction) => {
            await SessionMaster_1.default.create(createObj, {
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error createSession/sessionMaster.ts", error);
        throw error;
    }
};
exports.createSession = createSession;
/**
 * =========================================
 * GET ALL SESSIONS
 * =========================================
 */
const getAllSessions = async (queryData) => {
    try {
        const page = Math.max(Number(queryData?.page) || 1, 1);
        const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);
        const offset = (page - 1) * pageSize;
        const whereObj = {};
        /**
         * Optional search
         */
        const search = queryData?.search?.trim();
        if (search) {
            whereObj[sequelize_1.Op.or] = [
                {
                    sessionName: {
                        [sequelize_1.Op.like]: `%${search}%`,
                    },
                },
                {
                    sessionCode: {
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
         * Optional status filter
         */
        if (queryData?.status) {
            whereObj.status = queryData.status;
        }
        const { count, rows } = await SessionMaster_1.default.findAndCountAll({
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
        const pagi = await (0, pagination_1.paginationService)(rows, page, pageSize);
        return pagi;
    }
    catch (error) {
        logger_1.default.error("Error getAllSessions/sessionMaster.ts", error);
        throw error;
    }
};
exports.getAllSessions = getAllSessions;
/**
 * =========================================
 * GET SINGLE SESSION
 * =========================================
 *
 * sessionRefId is used instead of sessionMasterId
 */
const getSession = async (sessionRefId) => {
    try {
        if (!sessionRefId) {
            throw new Error("SESSION_E_00001");
        }
        const session = await SessionMaster_1.default.findOne({
            where: {
                sessionRefId,
            },
        });
        if (!session) {
            throw new Error("SESSION_E_00001");
        }
        return session;
    }
    catch (error) {
        logger_1.default.error("Error getSession/sessionMaster.ts", error);
        throw error;
    }
};
exports.getSession = getSession;
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
const deleteSession = async (sessionRefId, payload) => {
    try {
        if (!sessionRefId) {
            throw new Error("SESSION_E_00001");
        }
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!findUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        const existingSession = await SessionMaster_1.default.findOne({
            where: {
                sessionRefId,
            },
        });
        if (!existingSession) {
            throw new Error("SESSION_E_00001");
        }
        await config_1.default.transaction(async (transaction) => {
            /**
             * Set deletedBy before soft delete
             */
            await SessionMaster_1.default.update({
                deletedBy: findUser.user_id,
                updatedAt: new Date(),
            }, {
                where: {
                    sessionRefId,
                },
                transaction,
            });
            /**
             * Because paranoid: true,
             * this performs a soft delete
             * and automatically sets deletedAt.
             */
            await SessionMaster_1.default.destroy({
                where: {
                    sessionRefId,
                },
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error deleteSession/sessionMaster.ts", error);
        throw error;
    }
};
exports.deleteSession = deleteSession;
const ADMIN_ROLE_ID = 1;
const USER_ROLE_ID = 2;
const createUserSessionMapping = async (queryData, payload) => {
    try {
        const userSessionRefId = queryData?.userSessionRefId?.trim() || "";
        const userId = queryData?.userId ? Number(queryData.userId) : null;
        const sessionId = queryData?.sessionId?.trim() || "";
        const status = queryData?.status !== undefined && queryData?.status !== null
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
        const actionUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
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
            if (payload.role_id !== ADMIN_ROLE_ID &&
                Number(actionUser.user_id) !== userId) {
                throw new Error("USER_SESSION_E_00004");
            }
            /**
             * Optional duplicate check
             *
             * One user should not have the same
             * session mapped more than once.
             */
            const existingMapping = await UserSessionMapping_1.default.findOne({
                where: {
                    userId,
                    sessionId,
                },
            });
            if (existingMapping) {
                throw new Error("USER_SESSION_E_00005");
            }
            const createObj = {
                userSessionRefId: (0, crypto_1.randomUUID)(),
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
            await config_1.default.transaction(async (transaction) => {
                await UserSessionMapping_1.default.create(createObj, {
                    transaction,
                });
            });
            return true;
        }
        /**
         * =========================================
         * UPDATE
         * =========================================
         */
        const existingMapping = await UserSessionMapping_1.default.findOne({
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
        if (payload.role_id !== ADMIN_ROLE_ID &&
            Number(existingMapping.userId) !== Number(actionUser.user_id)) {
            throw new Error("USER_SESSION_E_00004");
        }
        const updateObj = {
            userId,
            sessionId,
            status,
            updatedBy: actionUser.user_id,
            updatedAt: new Date(),
        };
        await config_1.default.transaction(async (transaction) => {
            await UserSessionMapping_1.default.update(updateObj, {
                where: {
                    userSessionRefId,
                },
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error createUserSessionMapping/userSessionMapping.ts", error);
        throw error;
    }
};
exports.createUserSessionMapping = createUserSessionMapping;
const getAllUserSessionMappings = async (queryData, payload) => {
    try {
        const page = Math.max(Number(queryData?.page) || 1, 1);
        const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);
        /**
         * =========================================
         * GET ACTION USER
         * =========================================
         */
        const actionUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!actionUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        const whereObj = {};
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
        if (queryData?.status !== undefined &&
            queryData?.status !== null &&
            queryData?.status !== "") {
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
        const { count, rows } = await UserSessionMapping_1.default.findAndCountAll({
            where: whereObj,
            nest: true,
            raw: true,
            order: [["createdAt", "DESC"]],
        });
        /**
         * Existing project pagination service
         */
        const pagi = await (0, pagination_1.paginationService)(rows, page, pageSize);
        return pagi;
    }
    catch (error) {
        logger_1.default.error("Error getAllUserSessionMappings/userSessionMapping.ts", error);
        throw error;
    }
};
exports.getAllUserSessionMappings = getAllUserSessionMappings;
const getUserSessionMapping = async (userSessionRefId, payload) => {
    try {
        if (!userSessionRefId) {
            throw new Error("USER_SESSION_E_00001");
        }
        /**
         * Get logged-in user
         */
        const actionUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!actionUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        const mapping = await UserSessionMapping_1.default.findOne({
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
        if (payload.role_id !== ADMIN_ROLE_ID &&
            Number(mapping.userId) !== Number(actionUser.user_id)) {
            throw new Error("USER_SESSION_E_00004");
        }
        return mapping;
    }
    catch (error) {
        logger_1.default.error("Error getUserSessionMapping/userSessionMapping.ts", error);
        throw error;
    }
};
exports.getUserSessionMapping = getUserSessionMapping;
const deleteUserSessionMapping = async (userSessionRefId, payload) => {
    try {
        if (!userSessionRefId) {
            throw new Error("USER_SESSION_E_00001");
        }
        /**
         * Get logged-in user
         */
        const actionUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        if (!actionUser?.user_id) {
            throw new Error("USER_E_00001");
        }
        /**
         * Find mapping
         */
        const existingMapping = await UserSessionMapping_1.default.findOne({
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
        if (payload.role_id !== ADMIN_ROLE_ID &&
            Number(existingMapping.userId) !== Number(actionUser.user_id)) {
            throw new Error("USER_SESSION_E_00004");
        }
        await config_1.default.transaction(async (transaction) => {
            /**
             * Set deletedBy before soft delete
             */
            await UserSessionMapping_1.default.update({
                deletedBy: actionUser.user_id,
                updatedAt: new Date(),
            }, {
                where: {
                    userSessionRefId,
                },
                transaction,
            });
            /**
             * paranoid: true
             *
             * This performs soft delete and
             * automatically sets deletedAt.
             */
            await UserSessionMapping_1.default.destroy({
                where: {
                    userSessionRefId,
                },
                transaction,
            });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error deleteUserSessionMapping/userSessionMapping.ts", error);
        throw error;
    }
};
exports.deleteUserSessionMapping = deleteUserSessionMapping;
//# sourceMappingURL=session.js.map