"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class UserRole extends sequelize_1.Model {
    id;
    role_id;
    role_name;
    createdBy;
    updatedBy;
    deletedBy;
    createdAt;
    updatedAt;
    deletedAt;
}
UserRole.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    role_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    role_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    createdBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    updatedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    deletedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    }
}, {
    sequelize: config_1.default,
    paranoid: true,
    tableName: "user_role"
});
// UserRole.hasMany(RolePolicy, { foreignKey: "role_id", as: "userRolePolicy", sourceKey: "role_id" })
// RolePolicy.hasMany(UserRole, { foreignKey: "role_id" })
exports.default = UserRole;
//# sourceMappingURL=UserRole.js.map