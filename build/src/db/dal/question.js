"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestionAnswer = exports.updateQuestionAnswer = exports.createQuestionAnswer = exports.deleteQuestion = exports.getQuestionByRefId = exports.getAllQuestions = exports.createOrUpdateQuestion = exports.getQuestionWithAnswers = exports.ensureQuestionAccess = exports.ensureLessonAccess = exports.getQuestionAccess = exports.resolveUserId = void 0;
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../abstractions/ApiError"));
require("../model/associations");
const LessonMaster_1 = __importDefault(require("../model/LessonMaster"));
const QuestionAnswer_1 = __importDefault(require("../model/QuestionAnswer"));
const QuestionMaster_1 = __importDefault(require("../model/QuestionMaster"));
const CourseMaster_1 = __importDefault(require("../model/CourseMaster"));
const ModuleMaster_1 = __importDefault(require("../model/ModuleMaster"));
const UserMaping_1 = __importDefault(require("../model/UserMaping"));
const LecturerCourseMapping_1 = __importDefault(require("../model/LecturerCourseMapping"));
const user_1 = require("./user");
const ADMIN_ROLE_ID = 1;
const LECTURER_ROLE_ID = 3;
// =====================================================
// AUTHENTICATED USER RESOLUTION
// =====================================================
const resolveUserId = async (payload, tokenPayload) => {
    if (tokenPayload?.user_ref_id) {
        const user = await (0, user_1.getActionUser)(tokenPayload.user_ref_id);
        if (user?.user_id) {
            return Number(user.user_id);
        }
    }
    if (payload?.userId) {
        return Number(payload.userId);
    }
    throw new ApiError_1.default("AUTHENTICATED_USER_ID_NOT_FOUND", http_status_codes_1.StatusCodes.UNAUTHORIZED);
};
exports.resolveUserId = resolveUserId;
// =====================================================
// ROLE-BASED ACCESS
// =====================================================
const getQuestionAccess = async (userId) => {
    const mappings = await UserMaping_1.default.findAll({
        where: {
            user_id: userId,
            status: 1,
        },
        attributes: ["role_id"],
        raw: true,
    });
    const roleIds = [
        ...new Set(mappings
            .map((row) => Number(row.role_id))
            .filter((id) => Number.isInteger(id))),
    ];
    // Admin can access all questions.
    if (roleIds.includes(ADMIN_ROLE_ID)) {
        return {
            isAdmin: true,
            lessonIds: null,
        };
    }
    // Other roles are denied unless they are lecturers.
    if (!roleIds.includes(LECTURER_ROLE_ID)) {
        return {
            isAdmin: false,
            lessonIds: [],
        };
    }
    // Get courses assigned to this lecturer.
    const assignedCourses = await LecturerCourseMapping_1.default.findAll({
        where: {
            user_id: userId,
            status: 1,
        },
        attributes: ["courseRefId"],
        raw: true,
    });
    const courseRefs = [
        ...new Set(assignedCourses.map((row) => row.courseRefId).filter(Boolean)),
    ];
    if (!courseRefs.length) {
        return { isAdmin: false, lessonIds: [] };
    }
    // Resolve course UUIDs to internal course IDs.
    const courses = await CourseMaster_1.default.findAll({
        where: {
            courseRefId: { [sequelize_1.Op.in]: courseRefs },
        },
        attributes: ["courseId"],
        raw: true,
    });
    const courseIds = courses.map((row) => Number(row.courseId));
    if (!courseIds.length) {
        return { isAdmin: false, lessonIds: [] };
    }
    // Resolve courses to modules.
    const modules = await ModuleMaster_1.default.findAll({
        where: {
            courseId: { [sequelize_1.Op.in]: courseIds },
        },
        attributes: ["moduleRefId"],
        raw: true,
    });
    const moduleRefs = [
        ...new Set(modules.map((row) => row.moduleRefId).filter(Boolean)),
    ];
    if (!moduleRefs.length) {
        return { isAdmin: false, lessonIds: [] };
    }
    // moduleRefId is a UUID FK in LessonMaster.
    const lessons = await LessonMaster_1.default.findAll({
        where: {
            moduleRefId: { [sequelize_1.Op.in]: moduleRefs },
        },
        attributes: ["lessonId"],
        raw: true,
    });
    return {
        isAdmin: false,
        lessonIds: lessons.map((row) => Number(row.lessonId)),
    };
};
exports.getQuestionAccess = getQuestionAccess;
// =====================================================
// ACCESS VALIDATION
// =====================================================
const ensureLessonAccess = async (userId, lessonId) => {
    const access = await (0, exports.getQuestionAccess)(userId);
    if (access.isAdmin) {
        return;
    }
    if (!access.lessonIds?.includes(Number(lessonId))) {
        throw new ApiError_1.default("LESSON_ACCESS_DENIED", http_status_codes_1.StatusCodes.FORBIDDEN);
    }
};
exports.ensureLessonAccess = ensureLessonAccess;
const ensureQuestionAccess = async (userId, question) => {
    await (0, exports.ensureLessonAccess)(userId, Number(question.lessonId));
};
exports.ensureQuestionAccess = ensureQuestionAccess;
// =====================================================
// GET QUESTION WITH ANSWERS
// =====================================================
const getQuestionWithAnswers = async (questionRefId, transaction) => {
    return QuestionMaster_1.default.findOne({
        where: { questionRefId },
        include: [
            {
                model: QuestionAnswer_1.default,
                as: "answers",
                required: false,
            },
            {
                model: LessonMaster_1.default,
                as: "lesson",
                attributes: ["lessonRefId"],
                required: true,
            },
        ],
        order: [[{ model: QuestionAnswer_1.default, as: "answers" }, "displayOrder", "ASC"]],
        transaction,
    });
};
exports.getQuestionWithAnswers = getQuestionWithAnswers;
// =====================================================
// CREATE OR UPDATE QUESTION + ANSWERS
// If questionRefId exists -> UPDATE
// Otherwise -> CREATE
// =====================================================
const createOrUpdateQuestion = async (payload, tokenPayload) => {
    const transaction = await config_1.default.transaction();
    try {
        const userId = await (0, exports.resolveUserId)(payload, tokenPayload);
        let question;
        if (payload.questionRefId) {
            // UPDATE existing question
            const existingQuestion = await QuestionMaster_1.default.findOne({
                where: { questionRefId: payload.questionRefId },
                transaction,
            });
            if (!existingQuestion) {
                throw new ApiError_1.default("QUESTION_NOT_FOUND", http_status_codes_1.StatusCodes.NOT_FOUND);
            }
            // Verify access to existing question
            await (0, exports.ensureQuestionAccess)(userId, existingQuestion);
            let targetLessonId = existingQuestion.lessonId;
            if (payload.lessonRefId) {
                const destLesson = await LessonMaster_1.default.findOne({
                    where: { lessonRefId: payload.lessonRefId },
                    transaction,
                });
                if (!destLesson) {
                    throw new ApiError_1.default("LESSON_NOT_FOUND", http_status_codes_1.StatusCodes.NOT_FOUND);
                }
                await (0, exports.ensureLessonAccess)(userId, Number(destLesson.lessonId));
                targetLessonId = destLesson.lessonId;
            }
            const updateFields = {
                updatedBy: userId,
            };
            if (payload.lessonRefId) {
                updateFields.lessonId = targetLessonId;
            }
            if (payload.questionText !== undefined) {
                if (!payload.questionText || !String(payload.questionText).trim()) {
                    throw new ApiError_1.default("QUESTION_REQUIRED_FIELDS_MISSING", http_status_codes_1.StatusCodes.BAD_REQUEST);
                }
                updateFields.questionText = String(payload.questionText).trim();
            }
            if (payload.questionType !== undefined) {
                updateFields.questionType = payload.questionType;
            }
            if (payload.marks !== undefined) {
                updateFields.marks = payload.marks;
            }
            if (payload.negativeMarks !== undefined) {
                updateFields.negativeMarks = payload.negativeMarks;
            }
            if (payload.explanation !== undefined) {
                updateFields.explanation = payload.explanation;
            }
            if (payload.displayOrder !== undefined) {
                updateFields.displayOrder = payload.displayOrder;
            }
            if (payload.status !== undefined) {
                updateFields.status = payload.status;
            }
            await existingQuestion.update(updateFields, { transaction });
            question = existingQuestion;
        }
        else {
            // CREATE new question
            if (!payload.lessonRefId ||
                !payload.questionText ||
                !String(payload.questionText).trim()) {
                throw new ApiError_1.default("QUESTION_REQUIRED_FIELDS_MISSING", http_status_codes_1.StatusCodes.BAD_REQUEST);
            }
            const lesson = await LessonMaster_1.default.findOne({
                where: { lessonRefId: payload.lessonRefId },
                transaction,
            });
            if (!lesson) {
                throw new ApiError_1.default("LESSON_NOT_FOUND", http_status_codes_1.StatusCodes.NOT_FOUND);
            }
            await (0, exports.ensureLessonAccess)(userId, Number(lesson.lessonId));
            question = await QuestionMaster_1.default.create({
                lessonId: lesson.lessonId,
                questionText: String(payload.questionText).trim(),
                questionType: payload.questionType ?? "MCQ",
                marks: payload.marks ?? 1,
                negativeMarks: payload.negativeMarks ?? 0,
                explanation: payload.explanation ?? null,
                displayOrder: payload.displayOrder ?? 1,
                status: payload.status ?? "active",
                createdBy: userId,
            }, { transaction });
        }
        // Create or update answer options
        if (payload.answers !== undefined) {
            if (!Array.isArray(payload.answers)) {
                throw new ApiError_1.default("ANSWERS_MUST_BE_ARRAY", http_status_codes_1.StatusCodes.BAD_REQUEST);
            }
            for (let index = 0; index < payload.answers.length; index++) {
                const answer = payload.answers[index];
                if (!answer || typeof answer !== "object") {
                    throw new ApiError_1.default("ANSWER_REQUIRED_FIELDS_MISSING", http_status_codes_1.StatusCodes.BAD_REQUEST);
                }
                if (!answer.answerText || !String(answer.answerText).trim()) {
                    throw new ApiError_1.default("ANSWER_TEXT_REQUIRED", http_status_codes_1.StatusCodes.BAD_REQUEST);
                }
                if (answer.answerRefId) {
                    const existingAnswer = await QuestionAnswer_1.default.findOne({
                        where: {
                            answerRefId: answer.answerRefId,
                            questionId: question.questionId,
                        },
                        transaction,
                    });
                    if (!existingAnswer) {
                        throw new ApiError_1.default("ANSWER_NOT_FOUND", http_status_codes_1.StatusCodes.NOT_FOUND);
                    }
                    const answerUpdates = {
                        updatedBy: userId,
                    };
                    if (answer.answerText !== undefined) {
                        answerUpdates.answerText = String(answer.answerText).trim();
                    }
                    if (answer.isCorrect !== undefined) {
                        answerUpdates.isCorrect = answer.isCorrect;
                    }
                    if (answer.displayOrder !== undefined) {
                        answerUpdates.displayOrder = answer.displayOrder;
                    }
                    if (answer.status !== undefined) {
                        answerUpdates.status = answer.status;
                    }
                    await existingAnswer.update(answerUpdates, { transaction });
                }
                else {
                    await QuestionAnswer_1.default.create({
                        questionId: question.questionId,
                        answerText: String(answer.answerText).trim(),
                        isCorrect: answer.isCorrect ?? false,
                        displayOrder: answer.displayOrder ?? index + 1,
                        status: answer.status ?? "active",
                        createdBy: userId,
                    }, { transaction });
                }
            }
        }
        const questionRefId = question.questionRefId;
        await transaction.commit();
        return await (0, exports.getQuestionWithAnswers)(questionRefId);
    }
    catch (error) {
        try {
            await transaction.rollback();
        }
        catch (rbErr) { }
        throw error;
    }
};
exports.createOrUpdateQuestion = createOrUpdateQuestion;
// =====================================================
// GET ALL QUESTIONS
// =====================================================
const getAllQuestions = async (payload, tokenPayload) => {
    const page = Math.max(Number(payload?.page) || 1, 1);
    const limit = Math.min(Math.max(Number(payload?.limit) || 10, 1), 100);
    const userId = await (0, exports.resolveUserId)(payload, tokenPayload);
    const access = await (0, exports.getQuestionAccess)(userId);
    const where = {};
    if (!access.isAdmin) {
        where.lessonId = {
            [sequelize_1.Op.in]: access.lessonIds ?? [],
        };
    }
    if (payload?.lessonRefId) {
        const lesson = await LessonMaster_1.default.findOne({
            where: { lessonRefId: payload.lessonRefId },
            attributes: ["lessonId"],
        });
        if (!lesson) {
            throw new ApiError_1.default("LESSON_NOT_FOUND", http_status_codes_1.StatusCodes.NOT_FOUND);
        }
        if (!access.isAdmin &&
            !access.lessonIds?.includes(Number(lesson.lessonId))) {
            throw new ApiError_1.default("LESSON_ACCESS_DENIED", http_status_codes_1.StatusCodes.FORBIDDEN);
        }
        where.lessonId = lesson.lessonId;
    }
    if (payload?.status !== undefined && payload?.status !== "") {
        where.status = payload.status;
    }
    const result = await QuestionMaster_1.default.findAndCountAll({
        where,
        include: [
            {
                model: QuestionAnswer_1.default,
                as: "answers",
                required: false,
            },
            {
                model: LessonMaster_1.default,
                as: "lesson",
                attributes: ["lessonRefId"],
                required: true,
            },
        ],
        distinct: true,
        limit,
        offset: (page - 1) * limit,
        order: [
            ["displayOrder", "ASC"],
            ["questionId", "DESC"],
        ],
    });
    return {
        row: result.rows,
        totalItem: result.count,
        totalPage: Math.ceil(result.count / limit),
        currentPage: page,
    };
};
exports.getAllQuestions = getAllQuestions;
// =====================================================
// GET ONE QUESTION
// =====================================================
const getQuestionByRefId = async (queryData, tokenPayload) => {
    const { questionRefId } = queryData || {};
    if (!questionRefId) {
        throw new ApiError_1.default("QUESTION_REQUIRED_FIELDS_MISSING", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    const userId = await (0, exports.resolveUserId)(queryData, tokenPayload);
    const question = await QuestionMaster_1.default.findOne({
        where: { questionRefId },
        include: [
            {
                model: QuestionAnswer_1.default,
                as: "answers",
                required: false,
            },
            {
                model: LessonMaster_1.default,
                as: "lesson",
                attributes: ["lessonRefId"],
                required: true,
            },
        ],
    });
    if (!question) {
        throw new ApiError_1.default("QUESTION_NOT_FOUND", http_status_codes_1.StatusCodes.NOT_FOUND);
    }
    await (0, exports.ensureQuestionAccess)(userId, question);
    return question;
};
exports.getQuestionByRefId = getQuestionByRefId;
// =====================================================
// DELETE QUESTION + ANSWERS (SOFT DELETE)
// =====================================================
const deleteQuestion = async (queryData, tokenPayload) => {
    const transaction = await config_1.default.transaction();
    const { questionRefId } = queryData || {};
    try {
        const userId = await (0, exports.resolveUserId)(queryData, tokenPayload);
        if (!questionRefId) {
            throw new ApiError_1.default("QUESTION_REQUIRED_FIELDS_MISSING", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        const question = await QuestionMaster_1.default.findOne({
            where: { questionRefId },
            transaction,
        });
        if (!question) {
            throw new ApiError_1.default("QUESTION_NOT_FOUND", http_status_codes_1.StatusCodes.NOT_FOUND);
        }
        await (0, exports.ensureQuestionAccess)(userId, question);
        const answers = await QuestionAnswer_1.default.findAll({
            where: { questionId: question.questionId },
            transaction,
        });
        for (const answer of answers) {
            await answer.update({ deletedBy: userId }, { transaction });
            await answer.destroy({ transaction });
        }
        await question.update({ deletedBy: userId }, { transaction });
        await question.destroy({ transaction });
        await transaction.commit();
        return { message: "Question deleted successfully" };
    }
    catch (error) {
        try {
            await transaction.rollback();
        }
        catch (rbErr) { }
        throw error;
    }
};
exports.deleteQuestion = deleteQuestion;
// =====================================================
// CREATE ONE ANSWER
// =====================================================
const createQuestionAnswer = async (payload, tokenPayload) => {
    const userId = await (0, exports.resolveUserId)(payload, tokenPayload);
    if (!payload?.questionRefId) {
        throw new ApiError_1.default("ANSWER_REQUIRED_FIELDS_MISSING", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    if (!payload?.answerText || !String(payload.answerText).trim()) {
        throw new ApiError_1.default("ANSWER_TEXT_REQUIRED", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    const question = await QuestionMaster_1.default.findOne({
        where: { questionRefId: payload.questionRefId },
    });
    if (!question) {
        throw new ApiError_1.default("QUESTION_NOT_FOUND", http_status_codes_1.StatusCodes.NOT_FOUND);
    }
    await (0, exports.ensureQuestionAccess)(userId, question);
    return QuestionAnswer_1.default.create({
        questionId: question.questionId,
        answerText: String(payload.answerText).trim(),
        isCorrect: payload.isCorrect ?? false,
        displayOrder: payload.displayOrder ?? 1,
        status: payload.status ?? "active",
        createdBy: userId,
    });
};
exports.createQuestionAnswer = createQuestionAnswer;
// =====================================================
// UPDATE ONE ANSWER
// =====================================================
const updateQuestionAnswer = async (payload, tokenPayload) => {
    const userId = await (0, exports.resolveUserId)(payload, tokenPayload);
    if (!payload?.answerRefId) {
        throw new ApiError_1.default("ANSWER_REQUIRED_FIELDS_MISSING", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    const answer = await QuestionAnswer_1.default.findOne({
        where: { answerRefId: payload.answerRefId },
    });
    if (!answer) {
        throw new ApiError_1.default("ANSWER_NOT_FOUND", http_status_codes_1.StatusCodes.NOT_FOUND);
    }
    const question = await QuestionMaster_1.default.findByPk(answer.questionId);
    if (!question) {
        throw new ApiError_1.default("QUESTION_NOT_FOUND", http_status_codes_1.StatusCodes.NOT_FOUND);
    }
    await (0, exports.ensureQuestionAccess)(userId, question);
    const updates = {};
    if (payload.answerText !== undefined) {
        if (!payload.answerText || !String(payload.answerText).trim()) {
            throw new ApiError_1.default("ANSWER_TEXT_REQUIRED", http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        updates.answerText = String(payload.answerText).trim();
    }
    for (const field of ["isCorrect", "displayOrder", "status"]) {
        if (payload[field] !== undefined) {
            updates[field] = payload[field];
        }
    }
    updates.updatedBy = userId;
    await answer.update(updates);
    return answer;
};
exports.updateQuestionAnswer = updateQuestionAnswer;
// =====================================================
// DELETE ONE ANSWER (SOFT DELETE)
// =====================================================
const deleteQuestionAnswer = async (queryData, tokenPayload) => {
    const userId = await (0, exports.resolveUserId)(queryData, tokenPayload);
    const answerRefId = queryData?.answerRefId;
    if (!answerRefId) {
        throw new ApiError_1.default("ANSWER_REQUIRED_FIELDS_MISSING", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    const answer = await QuestionAnswer_1.default.findOne({
        where: { answerRefId },
    });
    if (!answer) {
        throw new ApiError_1.default("ANSWER_NOT_FOUND", http_status_codes_1.StatusCodes.NOT_FOUND);
    }
    const question = await QuestionMaster_1.default.findByPk(answer.questionId);
    if (!question) {
        throw new ApiError_1.default("QUESTION_NOT_FOUND", http_status_codes_1.StatusCodes.NOT_FOUND);
    }
    await (0, exports.ensureQuestionAccess)(userId, question);
    await answer.update({ deletedBy: userId });
    await answer.destroy();
    return { message: "Answer deleted successfully" };
};
exports.deleteQuestionAnswer = deleteQuestionAnswer;
//# sourceMappingURL=question.js.map