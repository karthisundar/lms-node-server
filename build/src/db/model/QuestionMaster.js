"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class QuestionMaster extends sequelize_1.Model {
}
QuestionMaster.init({
    questionId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    questionRefId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    lessonId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    questionText: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    questionType: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "MCQ",
    },
    marks: {
        type: sequelize_1.DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 1,
    },
    negativeMarks: {
        type: sequelize_1.DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
    },
    explanation: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    displayOrder: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    status: {
        type: sequelize_1.DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "active",
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
        defaultValue: sequelize_1.DataTypes.NOW,
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
    tableName: "question_master",
    paranoid: true,
    timestamps: true,
});
// One lesson has many questions.
// LessonMaster.hasMany(QuestionMaster, {
//   foreignKey: "lessonId",
//   sourceKey: "lessonId",
//   as: "questions",
// });
// QuestionMaster.belongsTo(LessonMaster, {
//   foreignKey: "lessonId",
//   targetKey: "lessonId",
//   as: "lesson",
// });
// One question has many answers.
exports.default = QuestionMaster;
//# sourceMappingURL=QuestionMaster.js.map