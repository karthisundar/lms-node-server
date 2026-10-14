"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LessonMaster_1 = __importDefault(require("./LessonMaster"));
const QuestionMaster_1 = __importDefault(require("./QuestionMaster"));
const QuestionAnswer_1 = __importDefault(require("./QuestionAnswer"));
// One lesson has many questions.
LessonMaster_1.default.hasMany(QuestionMaster_1.default, {
    foreignKey: "lessonId",
    sourceKey: "lessonId",
    as: "questions",
});
QuestionMaster_1.default.belongsTo(LessonMaster_1.default, {
    foreignKey: "lessonId",
    targetKey: "lessonId",
    as: "lesson",
});
// One question has many answers.
QuestionMaster_1.default.hasMany(QuestionAnswer_1.default, {
    foreignKey: "questionId",
    sourceKey: "questionId",
    as: "answers",
});
QuestionAnswer_1.default.belongsTo(QuestionMaster_1.default, {
    foreignKey: "questionId",
    targetKey: "questionId",
    as: "question",
});
//# sourceMappingURL=associations.js.map