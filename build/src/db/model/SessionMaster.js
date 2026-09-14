"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class SessionMaster extends sequelize_1.Model {
}
SessionMaster.init({
    sessionMasterId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    sessionRefId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    sessionCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        // unique: true,
    },
    sessionName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "draft",
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
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    },
    updatedBy: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    },
    deletedBy: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    },
}, {
    sequelize: config_1.default,
    tableName: "sessions",
    paranoid: true,
    timestamps: true,
    // underscored: true,
});
exports.default = SessionMaster;
//# sourceMappingURL=SessionMaster.js.map