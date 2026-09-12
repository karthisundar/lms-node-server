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
        field: "session_ref_id",
    },
    sessionCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "session_code",
    },
    sessionName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        field: "session_name",
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: "start_date",
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: "end_date",
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "draft",
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: "created_at",
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: "updated_at",
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: "deleted_at",
    },
}, {
    sequelize: config_1.default,
    tableName: "sessions",
    paranoid: true,
    timestamps: true,
    underscored: true,
});
exports.default = SessionMaster;
//# sourceMappingURL=SessionMaster.js.map