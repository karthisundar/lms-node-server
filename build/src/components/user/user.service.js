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
exports.deleteUser = exports.getAllUser = exports.checkCreateUser = exports.createUser = exports.setPassword = exports.logout = exports.login = exports.passwordChangetoEncrypt = void 0;
const dal = __importStar(require("../../db/dal/user"));
const bcrypt = __importStar(require("bcrypt"));
const jwt_utils_1 = require("../auth/jwt.utils");
const passwordChangetoEncrypt = async (password, fromAccess) => {
    const bufferObj = Buffer.from(password, "base64");
    const decodedString = bufferObj.toString("utf8");
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = fromAccess == 1
        ? bcrypt.hashSync(`${decodedString}`, salt)
        : bcrypt.hashSync(`${password}`, salt);
    return hashPassword;
};
exports.passwordChangetoEncrypt = passwordChangetoEncrypt;
const login = async (userData) => {
    const login = await dal.login(userData);
    return login;
};
exports.login = login;
const logout = async (payload) => {
    const logout = await dal.logout(payload);
    return logout;
};
exports.logout = logout;
const setPassword = async (token, bodyData) => {
    const setPassword = await dal.setPassword(await (0, jwt_utils_1.verifyJWT)(token)?.payload, bodyData);
    return setPassword;
};
exports.setPassword = setPassword;
const createUser = async (params, token) => {
    // console.log(token, "from token");
    const createUser = await dal.createUser(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return createUser;
};
exports.createUser = createUser;
const checkCreateUser = async (params) => {
    const checkCreateUser = await dal.checkCreateUser(params);
    return checkCreateUser;
};
exports.checkCreateUser = checkCreateUser;
const getAllUser = async (params) => {
    const getAllUser = await dal.getAllUser(params);
    return getAllUser;
};
exports.getAllUser = getAllUser;
const deleteUser = async (params, token) => {
    const deleteUser = await dal.deleteUser(params, await (0, jwt_utils_1.verifyJWT)(token)?.payload);
    return deleteUser;
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.service.js.map