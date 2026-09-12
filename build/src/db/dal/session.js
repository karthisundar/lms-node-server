"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSession = exports.getAllSession = exports.getSessionByRefId = exports.createSession = exports.sessionUser = void 0;
const logger_1 = __importDefault(require("../../lib/logger"));
const config_1 = __importDefault(require("../config"));
const SessionMaster_1 = __importDefault(require("../model/SessionMaster"));
const User_1 = __importDefault(require("../model/User"));
const UserSessionMapping_1 = __importDefault(require("../model/UserSessionMapping"));
const crypto_1 = require("crypto");
const sequelize_1 = require("sequelize");
const user_1 = require("./user");
const sessionUser = async (queryData, payload) => {
    const page = queryData?.page || 1;
    const limit = queryData?.limit || 10;
    try {
        const findData = await SessionMaster_1.default.findAll({
            include: [
                {
                    model: UserSessionMapping_1.default,
                    required: true,
                    attributes: [],
                    association: "",
                    include: [
                        {
                            model: User_1.default,
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
    }
    catch (error) {
        logger_1.default.error("Error sessionUserError", error);
        throw new Error(error);
    }
};
exports.sessionUser = sessionUser;
const generateSessionCode = () => {
    return `SES-${(0, crypto_1.randomUUID)().split("-")[0].toUpperCase()}`;
};
const createSession = async (queryData, payload) => {
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
        const findUser = await (0, user_1.getActionUser)(payload?.user_ref_id);
        // =========================================================
        // UPDATE FLOW
        // =========================================================
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
                startDate,
                endDate,
                status,
                updatedBy: findUser?.user_id,
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
        // =========================================================
        // CREATE FLOW
        // =========================================================
        const sessionCode = queryData?.sessionCode?.trim() || generateSessionCode();
        const newSessionObj = {
            sessionRefId: (0, crypto_1.randomUUID)(),
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
        await config_1.default.transaction(async (transaction) => {
            await SessionMaster_1.default.create(newSessionObj, {
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
 * GET SESSION BY session_ref_id
 */
const getSessionByRefId = async (session_ref_id) => {
    try {
        const session = await SessionMaster_1.default.findOne({
            where: {
                sessionRefId: session_ref_id,
            },
        });
        if (!session) {
            throw new Error("SESSION_E_00001");
        }
        return session;
    }
    catch (error) {
        logger_1.default.error("Error getSessionByRefId/sessionMaster.ts", error);
        throw error;
    }
};
exports.getSessionByRefId = getSessionByRefId;
/**
 * GET ALL SESSIONS WITH PAGINATION
 */
const getAllSession = async (queryData) => {
    try {
        const page = Math.max(Number(queryData?.page) || 1, 1);
        const pageSize = Math.max(Number(queryData?.pageSize) || 10, 1);
        const offset = (page - 1) * pageSize;
        const whereCondition = {};
        // ---------------------------------------------------------
        // SEARCH
        // ---------------------------------------------------------
        if (queryData?.search?.trim()) {
            const search = queryData.search.trim();
            whereCondition[sequelize_1.Op.or] = [
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
        // ---------------------------------------------------------
        // STATUS FILTER
        // ---------------------------------------------------------
        if (queryData?.status?.trim()) {
            whereCondition.status = queryData.status.trim();
        }
        // ---------------------------------------------------------
        // GET DATA
        // ---------------------------------------------------------
        const { count, rows } = await SessionMaster_1.default.findAndCountAll({
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
    }
    catch (error) {
        logger_1.default.error("Error getAllSession/sessionMaster.ts", error);
        throw error;
    }
};
exports.getAllSession = getAllSession;
/**
 * DELETE SESSION
 *
 * Because paranoid: true is enabled,
 * destroy() performs a soft delete.
 */
const deleteSession = async (session_ref_id) => {
    try {
        if (!session_ref_id) {
            throw new Error("SESSION_E_00002");
        }
        const existingSession = await SessionMaster_1.default.findOne({
            where: {
                sessionRefId: session_ref_id,
            },
        });
        if (!existingSession) {
            throw new Error("SESSION_E_00001");
        }
        await config_1.default.transaction(async (transaction) => {
            await SessionMaster_1.default.destroy({
                where: {
                    sessionRefId: session_ref_id,
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
//# sourceMappingURL=session.js.map