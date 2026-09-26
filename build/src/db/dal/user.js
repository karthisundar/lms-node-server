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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDetails = exports.deleteUser = exports.getAllUserMenu = exports.createUser = exports.checkCreateUser = exports.getAllUser = exports.getActionUser = exports.setPassword = exports.checkUserToken = exports.logout = exports.login = void 0;
const User_1 = __importDefault(require("../model/User"));
const jwt = __importStar(require("../../components/auth/jwt.utils"));
const bcrypt = __importStar(require("bcrypt"));
const UserToken_1 = __importDefault(require("../model/UserToken"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../../lib/logger")); // 116
const clientlabel_config_json_1 = __importDefault(require("../../config/clientlabel.config.json"));
const UserRole_1 = __importDefault(require("../model/UserRole"));
const UserMaping_1 = __importDefault(require("../model/UserMaping"));
const userService = __importStar(require("../../components/user/user.service"));
const MenuMaster_1 = __importDefault(require("../model/MenuMaster"));
const MenuItems_1 = __importDefault(require("../model/MenuItems"));
const RoleMenuAccess_1 = __importDefault(require("../model/RoleMenuAccess"));
const pagination_1 = require("../../components/util/pagination");
const login = async (userData) => {
    const email = userData?.email;
    const password = userData?.password;
    const decodedString = atob(password);
    // return true
    const findUser = await User_1.default.findAll({
        attributes: [
            "user_ref_id",
            "name",
            "email",
            "password",
            "phone_number",
            "user_id",
            [config_1.default.col("userRoleMap.role_id"), "role_id"],
            [config_1.default.col("userRoleMap.userRole.role_name"), "role_name"],
            // [sequelizeConnection.col('userResellers.reseller_ref_id'),'reseller_ref_id'],
            // [sequelizeConnection.col('userResellers.name'),'reseller_name'],
        ],
        include: [
            {
                model: UserMaping_1.default,
                required: true,
                attributes: [],
                association: "userRoleMap",
                include: [
                    {
                        model: UserRole_1.default,
                        required: true,
                        attributes: [],
                        association: "userRole",
                        // where:{
                        //     role_id:1
                        // }
                    },
                ],
            },
        ],
        where: {
            email,
        },
        nest: true,
        raw: true,
    });
    const changePassword = await userService.passwordChangetoEncrypt(password, 1);
    const findDataValues = findUser[0];
    if (findUser?.length == 0) {
        throw new Error(clientlabel_config_json_1.default.user.userError.userNotFound.code);
    }
    const findOldPasswordMatch = bcrypt.compareSync(decodedString, findDataValues?.password);
    if (!findOldPasswordMatch)
        throw new Error(clientlabel_config_json_1.default.user.userError.loginError.code);
    const transaction = await config_1.default.transaction();
    try {
        const dataValues = findDataValues;
        dataValues.password = "";
        // delete dataValues.user_id
        let obj = {
            user_ref_id: dataValues?.user_ref_id,
            email: dataValues?.email,
            phone_number: dataValues?.phone_number,
            name: dataValues?.name,
            role_id: dataValues?.role_id,
            role: dataValues?.role_name,
        };
        const createToken = await jwt.signJWT(obj, "1y");
        dataValues.token = createToken;
        //   dataValues.user_id = findUser[0]?.dataValues?.user_id
        dataValues.createdAt = new Date();
        dataValues.updatedAt = new Date();
        dataValues.is_reseller = 0;
        const createUserToken = await UserToken_1.default.create(dataValues, {
            transaction,
        });
        let tokens = {};
        tokens.token = createToken;
        transaction.commit();
        return tokens;
    }
    catch (error) {
        transaction.rollback();
        throw new Error(error);
    }
};
exports.login = login;
const logout = async (token) => {
    const transaction = await config_1.default.transaction();
    try {
        const updateTable = await UserToken_1.default.destroy({
            where: {
                token,
            },
            transaction,
        });
        await transaction.commit();
        return true;
    }
    catch (error) {
        await transaction.rollback();
        throw new Error(error);
    }
};
exports.logout = logout;
const checkUserToken = async (token) => {
    const checkToken = await UserToken_1.default.count({
        where: {
            token,
        },
    });
    return checkToken == 0;
};
exports.checkUserToken = checkUserToken;
const setPassword = async (req, bodyData) => {
    let find_user_ref_id = bodyData?.user_ref_id !== undefined
        ? bodyData?.user_ref_id
        : req?.user_ref_id;
    let oldPassword;
    let newPassword;
    let confirmPasswords;
    //console.log(bodyData?.oldPassword,'req',global.atob(bodyData?.confirmPassword))
    try {
        oldPassword = global.atob(bodyData?.oldPassword);
        newPassword = global.atob(bodyData?.password);
        confirmPasswords = global.atob(bodyData?.confirmPassword);
    }
    catch (error) {
        throw new Error(error);
    }
    let findUserData = await User_1.default.findOne({
        where: {
            user_ref_id: find_user_ref_id,
            // is_active:true
        },
    });
    if (findUserData == null)
        throw new Error(clientlabel_config_json_1.default.user.userError.userNotFound.code);
    const findOldPasswordMatch = bcrypt.compareSync(oldPassword, findUserData?.dataValues?.password);
    const trans = await config_1.default.transaction();
    if (!findOldPasswordMatch)
        throw new Error(clientlabel_config_json_1.default.user.userError.oldPasswordError.code);
    if (!(newPassword == confirmPasswords))
        throw new Error(clientlabel_config_json_1.default.user.userError.passwordAndConfirmPasswordError.code);
    try {
        await User_1.default.update({
            password: bodyData?.hashPassword,
            updatedAt: new Date(),
            updatedBy: findUserData?.dataValues?.user_id,
        }, {
            where: {
                user_ref_id: find_user_ref_id,
            },
        });
        await trans.commit();
        return true;
    }
    catch (error) {
        console.log(error);
        logger_1.default.error(error);
        await trans.rollback();
        return error;
    }
};
exports.setPassword = setPassword;
const getActionUser = async (user_ref_id) => {
    const findUser = await User_1.default.findOne({
        where: {
            user_ref_id,
        },
        nest: true,
        raw: true,
    });
    return findUser;
};
exports.getActionUser = getActionUser;
const getAllUser = async (queryData) => {
    const page = queryData?.page;
    const limit = queryData?.pageSize;
    const getData = await User_1.default.findAll({
        attributes: [
            "user_id",
            "user_ref_id",
            "name",
            "email",
            ["is_active", "status"],
            [config_1.default.col("userRoleMap.role_id"), "role_id"],
            [config_1.default.col("userRoleMap.userRole.role_name"), "role"],
        ],
        include: [
            {
                model: UserMaping_1.default,
                required: true,
                attributes: [],
                association: "userRoleMap",
                include: [
                    {
                        model: UserRole_1.default,
                        required: true,
                        attributes: [],
                        association: "userRole",
                        where: {
                            role_id: 2,
                        },
                    },
                ],
            },
        ],
    });
    await getData?.forEach((d) => {
        const element = d?.toJSON();
        const status = element?.status;
        d.dataValues.status = status ? "active" : "inactive";
    });
    if (!isNaN(page) && !isNaN(limit)) {
        const pag = await (0, pagination_1.paginationService)(getData, page, limit);
        return pag;
    }
    return getData;
};
exports.getAllUser = getAllUser;
const sequelize_1 = require("sequelize");
const checkCreateUser = async (queryData) => {
    const name = queryData?.name;
    const email = queryData?.email;
    const password = queryData?.password;
    const phone_number = queryData?.phoneNumber;
    const user_ref_id = queryData?.user_ref_id;
    // ---- UPDATE FLOW ----
    if (user_ref_id) {
        const findUser = await User_1.default.findOne({ where: { user_ref_id } });
        if (!findUser) {
            throw new Error("User not found");
        }
        if (email) {
            const checkEmail = await User_1.default.findOne({
                where: {
                    email,
                    user_ref_id: { [sequelize_1.Op.ne]: user_ref_id },
                },
            });
            if (checkEmail) {
                throw new Error("Email Already exists");
            }
        }
        // password not mandatory on update, only validate if provided
        if (password) {
            const decodedPassword = Buffer.from(password, "base64").toString("utf-8");
            if (!decodedPassword) {
                throw new Error("Invalid password");
            }
        }
        return;
    }
    // ---- CREATE FLOW ----
    if (email) {
        const checkEmail = await User_1.default.findOne({
            where: {
                email,
            },
        });
        if (checkEmail) {
            throw new Error("Email Already exists");
        }
    }
    if (!password) {
        throw new Error("Password field is mandatory");
    }
};
exports.checkCreateUser = checkCreateUser;
const createUser = async (queryData, payload) => {
    try {
        const name = queryData?.name;
        const email = queryData?.email;
        const password = queryData?.password;
        const phone_number = queryData?.phoneNumber;
        const user_ref_id = queryData?.user_ref_id;
        // console.log(user_ref_id, "user_ref_iduser_ref_id", payload);
        const is_active = queryData?.is_active ?? queryData?.active;
        const findUser = await (0, exports.getActionUser)(payload?.user_ref_id);
        // ---- UPDATE FLOW: user_ref_id present ----
        if (user_ref_id) {
            const updateObj = {
                name,
                phone_number,
                updatedBy: findUser?.user_id,
                updatedAt: new Date(),
            };
            // password comes base64 (btoa) encoded, decode then encrypt
            if (password) {
                const decodedPassword = Buffer.from(password, "base64").toString("utf-8");
                updateObj.password = await userService.passwordChangetoEncrypt(decodedPassword, 1);
            }
            // active/inactive flag, only update if explicitly present
            if (is_active !== undefined && is_active !== null) {
                updateObj.is_active = is_active;
                updateObj.status = is_active;
            }
            // console.log(user_ref_id, "from update");
            await config_1.default.transaction(async (transaction) => {
                await User_1.default.update(updateObj, {
                    where: { user_ref_id },
                    transaction,
                });
            });
            return true;
        }
        // ---- CREATE FLOW: user_ref_id not present, create new user ----
        const decodedPassword = password
            ? Buffer.from(password, "base64").toString("utf-8")
            : password;
        const decodePassword = await userService.passwordChangetoEncrypt(decodedPassword, 1);
        const isActiveDefault = true;
        let obj = {
            name,
            email,
            password: decodePassword,
            phone_number,
            is_active: isActiveDefault,
            createdBy: findUser?.user_id,
            createdAt: new Date(),
            status: isActiveDefault,
        };
        await config_1.default.transaction(async (transaction) => {
            const createUser = await User_1.default.create(obj, { transaction });
            console.log(createUser?.dataValues, "createUser");
            const user_id = createUser?.dataValues?.user_id;
            obj.user_id = user_id;
            obj.role_id = 2;
            await UserMaping_1.default.create(obj, { transaction });
        });
        return true;
    }
    catch (error) {
        logger_1.default.error("Error createUser/user.ts", error);
        throw new Error(error);
    }
};
exports.createUser = createUser;
const getAllUserMenu = async (params) => {
    const getAllUserMenu = await MenuMaster_1.default.findAll({
        attributes: [],
        include: [
            {
                model: MenuItems_1.default,
                required: true,
                attributes: [],
                association: "",
                include: [
                    {
                        model: RoleMenuAccess_1.default,
                        required: true,
                        attributes: [],
                        association: "",
                    },
                ],
            },
        ],
    });
};
exports.getAllUserMenu = getAllUserMenu;
const deleteUser = async (queryData, payload) => {
    const user_ref_id = queryData?.user_ref_id;
    const user = await (0, exports.getActionUser)(payload?.user_ref_id);
    const updatedBy = user?.user_id;
    try {
        await config_1.default.transaction(async (transaction) => {
            await User_1.default.update({
                deletedAt: new Date(),
                deletedBy: updatedBy,
            }, {
                where: {
                    user_ref_id,
                },
                transaction,
            });
        });
    }
    catch (error) {
        logger_1.default.error("Error DeleteUser", error);
        throw new Error(error);
    }
};
exports.deleteUser = deleteUser;
const getUserDetails = async (userRefId, payload) => {
    try {
        const newRefId = userRefId ? userRefId : payload?.user_ref_id;
        const user = await User_1.default.findOne({
            where: {
                user_ref_id: newRefId,
            },
            attributes: [
                "user_id",
                "user_ref_id",
                "name",
                "email",
                "phone_number",
                "is_active",
                "createdAt",
                "updatedAt",
            ],
            raw: true,
        });
        if (!user) {
            throw new Error("USER_E_00001");
        }
        const roleMappings = await UserMaping_1.default.findAll({
            where: {
                user_id: user.user_id,
                status: 1,
            },
            attributes: ["userRoleMappingId", "role_id", "user_id", "status"],
            raw: true,
        });
        const roleIds = roleMappings.map((item) => item.role_id);
        let roles = [];
        if (roleIds.length > 0) {
            roles = await UserRole_1.default.findAll({
                where: {
                    role_id: roleIds,
                },
                raw: true,
            });
        }
        const userRoles = roleMappings.map((mapping) => {
            const role = roles.find((item) => Number(item.role_id) === Number(mapping.role_id));
            return {
                userRoleMappingId: mapping.userRoleMappingId,
                roleId: mapping.role_id,
                roleName: role?.role_name ?? role?.roleName ?? null,
                status: mapping.status,
            };
        });
        return {
            user_id: user.user_id,
            user_ref_id: user.user_ref_id,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            is_active: user.is_active,
            roles: userRoles,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    catch (error) {
        logger_1.default.error("Error getUserDetails/user.ts", error);
        throw error;
    }
};
exports.getUserDetails = getUserDetails;
//# sourceMappingURL=user.js.map