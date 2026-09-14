"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserSessionMapping = exports.getUserSessionMapping = exports.getAllUserSessionMappings = exports.createUserSessionMapping = exports.deleteSession = exports.getSession = exports.getAllSessions = exports.createSession = void 0;
const dal = __importStar(require("../../db/dal/session"));
const jwt_utils_1 = require("../auth/jwt.utils");
const createSession = async (params, token) => {
    const createSession = await dal.createSession(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return createSession;
};
exports.createSession = createSession;
const getAllSessions = async (params) => {
    const getAllSessions = await dal.getAllSessions(params);
    return getAllSessions;
};
exports.getAllSessions = getAllSessions;
const getSession = async (params) => {
    const getSession = await dal.getSession(params);
    return getSession;
};
exports.getSession = getSession;
const deleteSession = async (params, token) => {
    const deleteSession = await dal.deleteSession(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return deleteSession;
};
exports.deleteSession = deleteSession;
const createUserSessionMapping = async (params, token) => {
    const createUserSessionMapping = await dal.createUserSessionMapping(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return createUserSessionMapping;
};
exports.createUserSessionMapping = createUserSessionMapping;
const getAllUserSessionMappings = async (params, token) => {
    const getAllUserSessionMappings = await dal.getAllUserSessionMappings(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return getAllUserSessionMappings;
};
exports.getAllUserSessionMappings = getAllUserSessionMappings;
const getUserSessionMapping = async (params, token) => {
    const getUserSessionMapping = await dal.getUserSessionMapping(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return getUserSessionMapping;
};
exports.getUserSessionMapping = getUserSessionMapping;
const deleteUserSessionMapping = async (params, token) => {
    const deleteUserSessionMapping = await dal.deleteUserSessionMapping(params?.userSessionRefId, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return deleteUserSessionMapping;
};
exports.deleteUserSessionMapping = deleteUserSessionMapping;
//# sourceMappingURL=session.service.js.map