import LessonMaster from "./LessonMaster";
import QuestionMaster from "./QuestionMaster";
import QuestionAnswer from "./QuestionAnswer";
import ContactEnquiry from "./ContactEnquiry";
import ContactEnquiryEmailLog from "./ContactEnquiryEmailLog";

// One lesson has many questions.
LessonMaster.hasMany(QuestionMaster, {
  foreignKey: "lessonId",
  sourceKey: "lessonId",
  as: "questions",
});

QuestionMaster.belongsTo(LessonMaster, {
  foreignKey: "lessonId",
  targetKey: "lessonId",
  as: "lesson",
});

// One question has many answers.
QuestionMaster.hasMany(QuestionAnswer, {
  foreignKey: "questionId",
  sourceKey: "questionId",
  as: "answers",
});

QuestionAnswer.belongsTo(QuestionMaster, {
  foreignKey: "questionId",
  targetKey: "questionId",
  as: "question",
});

// Contact Enquiry associations
ContactEnquiry.hasMany(ContactEnquiryEmailLog, {
  foreignKey: "enquiry_id",
  sourceKey: "id",
  as: "emailLogs",
});

ContactEnquiryEmailLog.belongsTo(ContactEnquiry, {
  foreignKey: "enquiry_id",
  targetKey: "id",
  as: "enquiry",
});
