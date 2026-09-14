"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class UserSessionMapping extends sequelize_1.Model {
}
UserSessionMapping.init({
    userSessionId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    userSessionRefId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    sessionId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    createdBy: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    updatedBy: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    },
    deletedBy: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
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
}, {
    sequelize: config_1.default,
    tableName: "user_session_mapping",
    paranoid: true,
    // timestamps: true,
    // underscored: true,
});
exports.default = UserSessionMapping;
//# sourceMappingURL=UserSessionMapping.js.map