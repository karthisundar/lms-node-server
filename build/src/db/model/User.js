"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const UserMaping_1 = __importDefault(require("./UserMaping"));
class User extends sequelize_1.Model {
}
User.init({
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_ref_id: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
    },
    phone_number: {
        type: sequelize_1.DataTypes.STRING,
    },
    is_active: {
        type: sequelize_1.DataTypes.TINYINT("1"),
        defaultValue: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    createdBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    updatedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    deletedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize: config_1.default,
    paranoid: true,
    tableName: "user",
});
User.hasMany(UserMaping_1.default, {
    foreignKey: "user_id",
    sourceKey: "user_id",
    as: "userRoleMap",
});
UserMaping_1.default.hasMany(User, { foreignKey: "user_id" });
// UserRoleMapping.hasMany(User, {
//   foreignKey: "user_id",
//   sourceKey: "user_id",
//   as: "mapUser",
// });
// User.hasMany(UserRoleMapping, { foreignKey: "user_id" });
// User.hasMany(UserPolicy,{foreignKey:"user_id",as:"userPolicyData",sourceKey:"user_id"})
// UserPolicy.hasMany(User,{foreignKey:"user_id"})
exports.default = User;
//# sourceMappingURL=User.js.map