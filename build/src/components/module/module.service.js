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
exports.deleteModule = exports.getModule = exports.getAllModules = exports.createModule = void 0;
const dal = __importStar(require("../../db/dal/module"));
const jwt_utils_1 = require("../auth/jwt.utils");
const createModule = async (params, token) => {
    const createModule = await dal.createModule(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return createModule;
};
exports.createModule = createModule;
const getAllModules = async (params) => {
    const getAllModules = await dal.getAllModules(params);
    return getAllModules;
};
exports.getAllModules = getAllModules;
const getModule = async (params) => {
    const getModule = await dal.getModule(params);
    return getModule;
};
exports.getModule = getModule;
const deleteModule = async (params, token) => {
    const deleteModule = await dal.deleteModule(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return deleteModule;
};
exports.deleteModule = deleteModule;
//# sourceMappingURL=module.service.js.map