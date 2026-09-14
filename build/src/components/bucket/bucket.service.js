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
exports.getBucket = exports.deleteBucket = exports.getAllBuckets = exports.createBucket = exports.createSession = void 0;
const dal = __importStar(require("../../db/dal/bucket"));
const jwt_utils_1 = require("../auth/jwt.utils");
const createSession = async (params, token) => {
    const createSession = await dal.createSession(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return createSession;
};
exports.createSession = createSession;
const createBucket = async (params, token) => {
    const createBucket = await dal.createBucket(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return createBucket;
};
exports.createBucket = createBucket;
const getAllBuckets = async (params) => {
    const getAllBuckets = await dal.getAllBuckets(params);
    return getAllBuckets;
};
exports.getAllBuckets = getAllBuckets;
const deleteBucket = async (params, token) => {
    const deleteBucket = await dal.deleteBucket(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return deleteBucket;
};
exports.deleteBucket = deleteBucket;
const getBucket = async (params) => {
    const getBucket = await dal.getBucket(params);
    return getBucket;
};
exports.getBucket = getBucket;
//# sourceMappingURL=bucket.service.js.map