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
exports.deleteUserLessonMapping = exports.getUserLessonMapping = exports.getAllUserLessonMappings = exports.createUserLessonMapping = exports.deleteLessonNotes = exports.getLessonNotes = exports.getAllLessonNotes = exports.createLessonNotes = exports.deleteLessonVideoMapping = exports.getLessonVideoMapping = exports.getAllLessonVideoMappings = exports.createLessonVideoMapping = exports.deleteLesson = exports.getLesson = exports.getAllLessons = exports.createLesson = void 0;
const dal = __importStar(require("../../db/dal/lesson"));
const jwt_utils_1 = require("../auth/jwt.utils");
const createLesson = async (params, token) => {
    const createLesson = await dal.createLesson(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return createLesson;
};
exports.createLesson = createLesson;
const getAllLessons = async (params) => {
    const getAllLessons = await dal.getAllLessons(params);
    return getAllLessons;
};
exports.getAllLessons = getAllLessons;
const getLesson = async (params) => {
    const getLesson = await dal.getLesson(params);
    return getLesson;
};
exports.getLesson = getLesson;
const deleteLesson = async (params, token) => {
    const deleteLesson = await dal.deleteLesson(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return deleteLesson;
};
exports.deleteLesson = deleteLesson;
const createLessonVideoMapping = async (params, token) => {
    const createLessonVideoMapping = await dal.createLessonVideoMapping(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return createLessonVideoMapping;
};
exports.createLessonVideoMapping = createLessonVideoMapping;
const getAllLessonVideoMappings = async (params) => {
    const getAllLessonVideoMappings = await dal.getAllLessonVideoMappings(params);
    return getAllLessonVideoMappings;
};
exports.getAllLessonVideoMappings = getAllLessonVideoMappings;
const getLessonVideoMapping = async (params) => {
    const getLessonVideoMapping = await dal.getLessonVideoMapping(params);
    return getLessonVideoMapping;
};
exports.getLessonVideoMapping = getLessonVideoMapping;
const deleteLessonVideoMapping = async (params, token) => {
    const deleteLessonVideoMapping = await dal.deleteLessonVideoMapping(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return deleteLessonVideoMapping;
};
exports.deleteLessonVideoMapping = deleteLessonVideoMapping;
const createLessonNotes = async (params, token, files) => {
    const createLessonNotes = await dal.createLessonNotes(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload, files);
    return createLessonNotes;
};
exports.createLessonNotes = createLessonNotes;
const getAllLessonNotes = async (params) => {
    const getAllLessonNotes = await dal.getAllLessonNotes(params);
    return getAllLessonNotes;
};
exports.getAllLessonNotes = getAllLessonNotes;
const getLessonNotes = async (params) => {
    const getLessonNotes = await dal.getLessonNotes(params);
    return getLessonNotes;
};
exports.getLessonNotes = getLessonNotes;
const deleteLessonNotes = async (params, token) => {
    const deleteLessonNotes = await dal.deleteLessonNotes(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return deleteLessonNotes;
};
exports.deleteLessonNotes = deleteLessonNotes;
const createUserLessonMapping = async (params, token) => {
    const createUserLessonMapping = await dal.createUserLessonMapping(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return createUserLessonMapping;
};
exports.createUserLessonMapping = createUserLessonMapping;
const getAllUserLessonMappings = async (params, token) => {
    const getAllUserLessonMappings = await dal.getAllUserLessonMappings(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return getAllUserLessonMappings;
};
exports.getAllUserLessonMappings = getAllUserLessonMappings;
const getUserLessonMapping = async (params, token) => {
    const getUserLessonMapping = await dal.getUserLessonMapping(params?.userLessonRefId, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return getUserLessonMapping;
};
exports.getUserLessonMapping = getUserLessonMapping;
const deleteUserLessonMapping = async (params, token) => {
    const deleteUserLessonMapping = await dal.deleteUserLessonMapping(params?.userLessonRefId, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return deleteUserLessonMapping;
};
exports.deleteUserLessonMapping = deleteUserLessonMapping;
//# sourceMappingURL=lesson.service.js.map