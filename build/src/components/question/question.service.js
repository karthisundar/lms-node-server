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
exports.checkPythonSyntax = exports.deleteQuestionAnswer = exports.updateQuestionAnswer = exports.createQuestionAnswer = exports.deleteQuestion = exports.getQuestionByRefId = exports.getAllQuestions = exports.createOrUpdateQuestion = void 0;
const dal = __importStar(require("../../db/dal/question"));
const jwt_utils_1 = require("../auth/jwt.utils");
const child_process_1 = require("child_process");
const extractTokenPayload = async (token) => {
    if (!token)
        return undefined;
    const clean = token.startsWith("Bearer ") ? token.slice(7) : token;
    const decoded = await (0, jwt_utils_1.verifyJWT)(clean);
    return decoded?.payload;
};
const createOrUpdateQuestion = async (params, token) => {
    const tokenPayload = await extractTokenPayload(token);
    const createOrUpdateQuestion = await dal.createOrUpdateQuestion(params, tokenPayload);
    return createOrUpdateQuestion;
};
exports.createOrUpdateQuestion = createOrUpdateQuestion;
const getAllQuestions = async (params, token) => {
    const tokenPayload = await extractTokenPayload(token);
    const getAllQuestions = await dal.getAllQuestions(params, tokenPayload);
    return getAllQuestions;
};
exports.getAllQuestions = getAllQuestions;
const getQuestionByRefId = async (params, token) => {
    const tokenPayload = await extractTokenPayload(token);
    const getQuestionByRefId = await dal.getQuestionByRefId(params, tokenPayload);
    return getQuestionByRefId;
};
exports.getQuestionByRefId = getQuestionByRefId;
const deleteQuestion = async (params, token) => {
    const tokenPayload = await extractTokenPayload(token);
    const deleteQuestion = await dal.deleteQuestion(params, tokenPayload);
    return deleteQuestion;
};
exports.deleteQuestion = deleteQuestion;
const createQuestionAnswer = async (params, token) => {
    const tokenPayload = await extractTokenPayload(token);
    const createQuestionAnswer = await dal.createQuestionAnswer(params, tokenPayload);
    return createQuestionAnswer;
};
exports.createQuestionAnswer = createQuestionAnswer;
const updateQuestionAnswer = async (params, token) => {
    const tokenPayload = await extractTokenPayload(token);
    const updateQuestionAnswer = await dal.updateQuestionAnswer(params, tokenPayload);
    return updateQuestionAnswer;
};
exports.updateQuestionAnswer = updateQuestionAnswer;
const deleteQuestionAnswer = async (params, token) => {
    const tokenPayload = await extractTokenPayload(token);
    const deleteQuestionAnswer = await dal.deleteQuestionAnswer(params, tokenPayload);
    return deleteQuestionAnswer;
};
exports.deleteQuestionAnswer = deleteQuestionAnswer;
const checkPythonSyntax = async (code) => {
    if (code === undefined || code === null || !code.trim()) {
        return {
            valid: false,
            message: "Code is empty. Please enter Python code to check.",
        };
    }
    return new Promise((resolve) => {
        const pyScript = [
            "import ast, sys, json",
            "try:",
            "    source = sys.stdin.read()",
            "    ast.parse(source)",
            '    print(json.dumps({"valid": True, "message": "Python syntax is valid! No syntax errors found."}))',
            "except SyntaxError as e:",
            '    print(json.dumps({"valid": False, "message": e.msg, "line": e.lineno, "column": e.offset, "text": e.text.strip() if e.text else ""}))',
            "except Exception as e:",
            '    print(json.dumps({"valid": False, "message": str(e)}))',
        ].join("\n");
        const py = (0, child_process_1.spawn)("python", ["-c", pyScript]);
        let stdout = "";
        let stderr = "";
        py.stdout.on("data", (chunk) => {
            stdout += chunk;
        });
        py.stderr.on("data", (chunk) => {
            stderr += chunk;
        });
        py.on("error", (err) => {
            resolve({
                valid: false,
                message: "Failed to run Python syntax checker: " + err.message,
            });
        });
        py.on("close", () => {
            try {
                const parsed = JSON.parse(stdout.trim());
                resolve(parsed);
            }
            catch {
                resolve({
                    valid: false,
                    message: stderr ? stderr.trim() : "Syntax validation encountered an unexpected error.",
                });
            }
        });
        py.stdin.write(code);
        py.stdin.end();
    });
};
exports.checkPythonSyntax = checkPythonSyntax;
//# sourceMappingURL=question.service.js.map