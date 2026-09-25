"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class LessonNotes extends sequelize_1.Model {
}
LessonNotes.init({
    lessonNotesId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    lessonNotesRefId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    lessonId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    /**
     * ========================================================
     * S3 DOCUMENT FIELDS
     * ========================================================
     */
    documentName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    documentUrl: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    documentKey: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    documentMimeType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    documentSize: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: true,
    },
    /**
     * ========================================================
     * STATUS
     * ========================================================
     */
    status: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    /**
     * ========================================================
     * AUDIT FIELDS
     * ========================================================
     */
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
    tableName: "lesson_notes",
    paranoid: true,
    timestamps: false,
});
exports.default = LessonNotes;
//# sourceMappingURL=LessonNotes.js.map