"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class QuestionAnswer extends sequelize_1.Model {
}
QuestionAnswer.init({
    answerId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    answerRefId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    questionId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    answerText: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    isCorrect: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    tableName: "question_answer",
    paranoid: true,
    timestamps: true,
});
// Each answer option belongs to one question.
// QuestionAnswer.belongsTo(QuestionMaster, {
//   foreignKey: "questionId",
//   targetKey: "questionId",
//   as: "question",
// });
// QuestionMaster.hasMany(QuestionAnswer, {
//   foreignKey: "questionId",
//   sourceKey: "questionId",
//   as: "answers",
// });
exports.default = QuestionAnswer;
//# sourceMappingURL=QuestionAnswer.js.map