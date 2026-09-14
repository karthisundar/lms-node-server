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
exports.deleteVideo = exports.getVideo = exports.getAllVideos = exports.createVideo = void 0;
const dal = __importStar(require("../../db/dal/videos"));
const jwt_utils_1 = require("../auth/jwt.utils");
const createVideo = async (params, token) => {
    const createVideo = await dal.createVideo(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return createVideo;
};
exports.createVideo = createVideo;
const getAllVideos = async (params) => {
    const getAllVideos = await dal.getAllVideos(params);
    return getAllVideos;
};
exports.getAllVideos = getAllVideos;
const getVideo = async (params) => {
    const getVideo = await dal.getVideo(params);
    return getVideo;
};
exports.getVideo = getVideo;
const deleteVideo = async (params, token) => {
    const deleteVideo = await dal.deleteVideo(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return deleteVideo;
};
exports.deleteVideo = deleteVideo;
//# sourceMappingURL=video.service.js.map