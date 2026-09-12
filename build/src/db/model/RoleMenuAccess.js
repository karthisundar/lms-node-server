"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class RoleMenuAccess extends sequelize_1.Model {
    roleMenuAccessId;
    roleId;
    menuItemsId;
    createdAt;
    updatedAt;
    deletedAt;
}
RoleMenuAccess.init({
    roleMenuAccessId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    roleId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    menuItemsId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
    },
}, {
    sequelize: config_1.default,
    paranoid: true,
    tableName: "role_menu_access",
});
exports.default = RoleMenuAccess;
//# sourceMappingURL=RoleMenuAccess.js.map