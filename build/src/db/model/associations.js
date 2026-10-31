"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LessonMaster_1 = __importDefault(require("./LessonMaster"));
const QuestionMaster_1 = __importDefault(require("./QuestionMaster"));
const QuestionAnswer_1 = __importDefault(require("./QuestionAnswer"));
const ContactEnquiry_1 = __importDefault(require("./ContactEnquiry"));
const ContactEnquiryEmailLog_1 = __importDefault(require("./ContactEnquiryEmailLog"));
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
// Contact Enquiry associations
ContactEnquiry_1.default.hasMany(ContactEnquiryEmailLog_1.default, {
    foreignKey: "enquiry_id",
    sourceKey: "id",
    as: "emailLogs",
});
ContactEnquiryEmailLog_1.default.belongsTo(ContactEnquiry_1.default, {
    foreignKey: "enquiry_id",
    targetKey: "id",
    as: "enquiry",
});
//# sourceMappingURL=associations.js.map