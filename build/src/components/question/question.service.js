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
exports.deleteQuestionAnswer = exports.updateQuestionAnswer = exports.createQuestionAnswer = exports.deleteQuestion = exports.getQuestionByRefId = exports.getAllQuestions = exports.createOrUpdateQuestion = void 0;
const dal = __importStar(require("../../db/dal/question"));
const jwt_utils_1 = require("../auth/jwt.utils");
const createOrUpdateQuestion = async (params, token) => {
    const tokenPayload = token ? await (0, jwt_utils_1.verifyJWT)(token)?.payload : undefined;
    const createOrUpdateQuestion = await dal.createOrUpdateQuestion(params, tokenPayload);
    return createOrUpdateQuestion;
};
exports.createOrUpdateQuestion = createOrUpdateQuestion;
const getAllQuestions = async (params, token) => {
    const tokenPayload = token ? await (0, jwt_utils_1.verifyJWT)(token)?.payload : undefined;
    const getAllQuestions = await dal.getAllQuestions(params, tokenPayload);
    return getAllQuestions;
};
exports.getAllQuestions = getAllQuestions;
const getQuestionByRefId = async (params, token) => {
    const tokenPayload = token ? await (0, jwt_utils_1.verifyJWT)(token)?.payload : undefined;
    const getQuestionByRefId = await dal.getQuestionByRefId(params, tokenPayload);
    return getQuestionByRefId;
};
exports.getQuestionByRefId = getQuestionByRefId;
const deleteQuestion = async (params, token) => {
    const tokenPayload = token ? await (0, jwt_utils_1.verifyJWT)(token)?.payload : undefined;
    const deleteQuestion = await dal.deleteQuestion(params, tokenPayload);
    return deleteQuestion;
};
exports.deleteQuestion = deleteQuestion;
const createQuestionAnswer = async (params, token) => {
    const tokenPayload = token ? await (0, jwt_utils_1.verifyJWT)(token)?.payload : undefined;
    const createQuestionAnswer = await dal.createQuestionAnswer(params, tokenPayload);
    return createQuestionAnswer;
};
exports.createQuestionAnswer = createQuestionAnswer;
const updateQuestionAnswer = async (params, token) => {
    const tokenPayload = token ? await (0, jwt_utils_1.verifyJWT)(token)?.payload : undefined;
    const updateQuestionAnswer = await dal.updateQuestionAnswer(params, tokenPayload);
    return updateQuestionAnswer;
};
exports.updateQuestionAnswer = updateQuestionAnswer;
const deleteQuestionAnswer = async (params, token) => {
    const tokenPayload = token ? await (0, jwt_utils_1.verifyJWT)(token)?.payload : undefined;
    const deleteQuestionAnswer = await dal.deleteQuestionAnswer(params, tokenPayload);
    return deleteQuestionAnswer;
};
exports.deleteQuestionAnswer = deleteQuestionAnswer;
//# sourceMappingURL=question.service.js.map