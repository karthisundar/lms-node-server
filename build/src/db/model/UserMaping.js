"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const UserRole_1 = __importDefault(require("./UserRole"));
class UserRoleMapping extends sequelize_1.Model {
    userRoleMappingId;
    // public tblRoleId!: number;
    role_id;
    user_id;
    status;
    createdBy;
    updatedBy;
    deletedBy;
    // timestamps!
    createdAt;
    updatedAt;
    deletedAt;
}
UserRoleMapping.init({
    userRoleMappingId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    role_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    createdBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    updatedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    deletedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    // tblRoleId:{
    //     type:DataTypes.INTEGER
    // }
}, {
    sequelize: config_1.default,
    paranoid: true,
    tableName: "user_role_mapping",
});
// UserRoleMapping.hasMany(UserRole, { foreignKey: "role_id", sourceKey: "role_id", as: "rolemaster" })
// UserRole.hasMany(UserRoleMapping, { foreignKey: "role_id" })
// UserRoleMapping.hasMany(tblRole,{foreignKey:"roleId",sourceKey:"functionalRoleId",as:'tblRole'})
// tblRole.hasMany(UserRoleMapping,{foreignKey:"roleId"})
// UserRoleMapping.hasMany(Role,{foreignKey:"roleId",sourceKey:"tblRoleId",as:"tblRole"})
// Role.belongsTo(UserRoleMapping,{foreignKey:"tblRoleId"})
// UserRoleMapping.hasOne(Role,{foreignKey:"roleId",sourceKey:"roleId",as:"logintblrole"})
// Role.hasMany(UserRoleMapping,{foreignKey:"roleId"})
// Role.hasOne(UserRoleMapping,{foreignKey:"tblRoleId",sourceKey:"roleId",as:"userRoleMaping"})
// UserRoleMapping.belongsToMany(Role,{through:"roleId"})
UserRoleMapping.hasMany(UserRole_1.default, {
    foreignKey: "role_id",
    sourceKey: "role_id",
    as: "userRole",
});
UserRole_1.default.hasMany(UserRoleMapping, { foreignKey: "role_id" });
// UserRole.hasMany(UserRoleMapping, { foreignKey: "role_id", sourceKey: "role_id", as: "roleUsers" })
// UserRoleMapping.hasMany(UserRole, { foreignKey: "role_id" })
exports.default = UserRoleMapping;
//# sourceMappingURL=UserMaping.js.map