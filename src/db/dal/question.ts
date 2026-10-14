import { Op, Transaction } from "sequelize";
import sequelizeConnection from "../config";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../abstractions/ApiError";
import "../model/associations";
import LessonMaster from "../model/LessonMaster";
import QuestionAnswer from "../model/QuestionAnswer";
import QuestionMaster from "../model/QuestionMaster";
import CourseMaster from "../model/CourseMaster";
import ModuleMaster from "../model/ModuleMaster";
import UserRoleMapping from "../model/UserMaping";
import LecturerCourseMapping from "../model/LecturerCourseMapping";
import { getActionUser } from "./user";

const ADMIN_ROLE_ID = 1;
const LECTURER_ROLE_ID = 3;

// =====================================================
// AUTHENTICATED USER RESOLUTION
// =====================================================

export const resolveUserId = async (
  payload: any,
  tokenPayload?: any,
): Promise<number> => {
  if (tokenPayload?.user_ref_id) {
    const user = await getActionUser(tokenPayload.user_ref_id);
    if (user?.user_id) {
      return Number(user.user_id);
    }
  }
  if (payload?.userId) {
    return Number(payload.userId);
  }
  throw new ApiError(
    "AUTHENTICATED_USER_ID_NOT_FOUND",
    StatusCodes.UNAUTHORIZED,
  );
};

// =====================================================
// ROLE-BASED ACCESS
// =====================================================

export const getQuestionAccess = async (userId: number) => {
  const mappings = await UserRoleMapping.findAll({
    where: {
      user_id: userId,
      status: 1,
    },
    attributes: ["role_id"],
    raw: true,
  });

  const roleIds = [
    ...new Set(
      mappings
        .map((row: any) => Number(row.role_id))
        .filter((id: number) => Number.isInteger(id)),
    ),
  ];

  // Admin can access all questions.
  if (roleIds.includes(ADMIN_ROLE_ID)) {
    return {
      isAdmin: true,
      lessonIds: null as number[] | null,
    };
  }

  // Other roles are denied unless they are lecturers.
  if (!roleIds.includes(LECTURER_ROLE_ID)) {
    return {
      isAdmin: false,
      lessonIds: [] as number[],
    };
  }

  // Get courses assigned to this lecturer.
  const assignedCourses = await LecturerCourseMapping.findAll({
    where: {
      user_id: userId,
      status: 1,
    },
    attributes: ["courseRefId"],
    raw: true,
  });

  const courseRefs = [
    ...new Set(
      assignedCourses.map((row: any) => row.courseRefId).filter(Boolean),
    ),
  ];

  if (!courseRefs.length) {
    return { isAdmin: false, lessonIds: [] as number[] };
  }

  // Resolve course UUIDs to internal course IDs.
  const courses = await CourseMaster.findAll({
    where: {
      courseRefId: { [Op.in]: courseRefs },
    },
    attributes: ["courseId"],
    raw: true,
  });

  const courseIds = courses.map((row: any) => Number(row.courseId));

  if (!courseIds.length) {
    return { isAdmin: false, lessonIds: [] as number[] };
  }

  // Resolve courses to modules.
  const modules = await ModuleMaster.findAll({
    where: {
      courseId: { [Op.in]: courseIds },
    },
    attributes: ["moduleRefId"],
    raw: true,
  });

  const moduleRefs = [
    ...new Set(modules.map((row: any) => row.moduleRefId).filter(Boolean)),
  ];

  if (!moduleRefs.length) {
    return { isAdmin: false, lessonIds: [] as number[] };
  }

  // moduleRefId is a UUID FK in LessonMaster.
  const lessons = await LessonMaster.findAll({
    where: {
      moduleRefId: { [Op.in]: moduleRefs },
    },
    attributes: ["lessonId"],
    raw: true,
  });

  return {
    isAdmin: false,
    lessonIds: lessons.map((row: any) => Number(row.lessonId)),
  };
};

// =====================================================
// ACCESS VALIDATION
// =====================================================

export const ensureLessonAccess = async (
  userId: number,
  lessonId: number,
): Promise<void> => {
  const access = await getQuestionAccess(userId);

  if (access.isAdmin) {
    return;
  }

  if (!access.lessonIds?.includes(Number(lessonId))) {
    throw new ApiError("LESSON_ACCESS_DENIED", StatusCodes.FORBIDDEN);
  }
};

export const ensureQuestionAccess = async (
  userId: number,
  question: QuestionMaster,
): Promise<void> => {
  await ensureLessonAccess(userId, Number(question.lessonId));
};

// =====================================================
// GET QUESTION WITH ANSWERS
// =====================================================

export const getQuestionWithAnswers = async (
  questionRefId: string,
  transaction?: Transaction,
): Promise<any> => {
  return QuestionMaster.findOne({
    where: { questionRefId },
    include: [
      {
        model: QuestionAnswer,
        as: "answers",
        required: false,
      },
      {
        model: LessonMaster,
        as: "lesson",
        attributes: ["lessonRefId"],
        required: true,
      },
    ],
    order: [[{ model: QuestionAnswer, as: "answers" }, "displayOrder", "ASC"]],
    transaction,
  });
};

// =====================================================
// CREATE OR UPDATE QUESTION + ANSWERS
// If questionRefId exists -> UPDATE
// Otherwise -> CREATE
// =====================================================

export const createOrUpdateQuestion = async (
  payload: any,
  tokenPayload?: any,
): Promise<any> => {
  const transaction = await sequelizeConnection.transaction();

  try {
    const userId = await resolveUserId(payload, tokenPayload);

    let question: QuestionMaster;

    if (payload.questionRefId) {
      // UPDATE existing question
      const existingQuestion = await QuestionMaster.findOne({
        where: { questionRefId: payload.questionRefId },
        transaction,
      });

      if (!existingQuestion) {
        throw new ApiError("QUESTION_NOT_FOUND", StatusCodes.NOT_FOUND);
      }

      // Verify access to existing question
      await ensureQuestionAccess(userId, existingQuestion);

      let targetLessonId = existingQuestion.lessonId;
      if (payload.lessonRefId) {
        const destLesson = await LessonMaster.findOne({
          where: { lessonRefId: payload.lessonRefId },
          transaction,
        });

        if (!destLesson) {
          throw new ApiError("LESSON_NOT_FOUND", StatusCodes.NOT_FOUND);
        }

        await ensureLessonAccess(userId, Number(destLesson.lessonId));
        targetLessonId = destLesson.lessonId;
      }

      const updateFields: any = {
        updatedBy: userId,
      };

      if (payload.lessonRefId) {
        updateFields.lessonId = targetLessonId;
      }

      if (payload.questionText !== undefined) {
        if (!payload.questionText || !String(payload.questionText).trim()) {
          throw new ApiError(
            "QUESTION_REQUIRED_FIELDS_MISSING",
            StatusCodes.BAD_REQUEST,
          );
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
    } else {
      // CREATE new question
      if (
        !payload.lessonRefId ||
        !payload.questionText ||
        !String(payload.questionText).trim()
      ) {
        throw new ApiError(
          "QUESTION_REQUIRED_FIELDS_MISSING",
          StatusCodes.BAD_REQUEST,
        );
      }

      const lesson = await LessonMaster.findOne({
        where: { lessonRefId: payload.lessonRefId },
        transaction,
      });

      if (!lesson) {
        throw new ApiError("LESSON_NOT_FOUND", StatusCodes.NOT_FOUND);
      }

      await ensureLessonAccess(userId, Number(lesson.lessonId));

      question = await QuestionMaster.create(
        {
          lessonId: lesson.lessonId,
          questionText: String(payload.questionText).trim(),
          questionType: payload.questionType ?? "MCQ",
          marks: payload.marks ?? 1,
          negativeMarks: payload.negativeMarks ?? 0,
          explanation: payload.explanation ?? null,
          displayOrder: payload.displayOrder ?? 1,
          status: payload.status ?? "active",
          createdBy: userId,
        },
        { transaction },
      );
    }

    // Create or update answer options
    if (payload.answers !== undefined) {
      if (!Array.isArray(payload.answers)) {
        throw new ApiError("ANSWERS_MUST_BE_ARRAY", StatusCodes.BAD_REQUEST);
      }

      for (let index = 0; index < payload.answers.length; index++) {
        const answer = payload.answers[index];
        if (!answer || typeof answer !== "object") {
          throw new ApiError(
            "ANSWER_REQUIRED_FIELDS_MISSING",
            StatusCodes.BAD_REQUEST,
          );
        }

        if (!answer.answerText || !String(answer.answerText).trim()) {
          throw new ApiError("ANSWER_TEXT_REQUIRED", StatusCodes.BAD_REQUEST);
        }

        if (answer.answerRefId) {
          const existingAnswer = await QuestionAnswer.findOne({
            where: {
              answerRefId: answer.answerRefId,
              questionId: question.questionId,
            },
            transaction,
          });

          if (!existingAnswer) {
            throw new ApiError("ANSWER_NOT_FOUND", StatusCodes.NOT_FOUND);
          }

          const answerUpdates: any = {
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
        } else {
          await QuestionAnswer.create(
            {
              questionId: question.questionId,
              answerText: String(answer.answerText).trim(),
              isCorrect: answer.isCorrect ?? false,
              displayOrder: answer.displayOrder ?? index + 1,
              status: answer.status ?? "active",
              createdBy: userId,
            },
            { transaction },
          );
        }
      }
    }

    const questionRefId = question.questionRefId;
    await transaction.commit();

    return await getQuestionWithAnswers(questionRefId);
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rbErr) {}
    throw error;
  }
};

// =====================================================
// GET ALL QUESTIONS
// =====================================================

export const getAllQuestions = async (
  payload: any,
  tokenPayload?: any,
): Promise<any> => {
  const page = Math.max(Number(payload?.page) || 1, 1);
  const limit = Math.min(Math.max(Number(payload?.limit) || 10, 1), 100);

  const userId = await resolveUserId(payload, tokenPayload);
  const access = await getQuestionAccess(userId);

  const where: any = {};

  if (!access.isAdmin) {
    where.lessonId = {
      [Op.in]: access.lessonIds ?? [],
    };
  }

  if (payload?.lessonRefId) {
    const lesson = await LessonMaster.findOne({
      where: { lessonRefId: payload.lessonRefId },
      attributes: ["lessonId"],
    });

    if (!lesson) {
      throw new ApiError("LESSON_NOT_FOUND", StatusCodes.NOT_FOUND);
    }

    if (
      !access.isAdmin &&
      !access.lessonIds?.includes(Number(lesson.lessonId))
    ) {
      throw new ApiError("LESSON_ACCESS_DENIED", StatusCodes.FORBIDDEN);
    }

    where.lessonId = lesson.lessonId;
  }

  if (payload?.status !== undefined && payload?.status !== "") {
    where.status = payload.status;
  }

  const result = await QuestionMaster.findAndCountAll({
    where,
    include: [
      {
        model: QuestionAnswer,
        as: "answers",
        required: false,
      },
      {
        model: LessonMaster,
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

// =====================================================
// GET ONE QUESTION
// =====================================================

export const getQuestionByRefId = async (
  queryData: any,
  tokenPayload?: any,
): Promise<any> => {
  const { questionRefId } = queryData || {};
  if (!questionRefId) {
    throw new ApiError(
      "QUESTION_REQUIRED_FIELDS_MISSING",
      StatusCodes.BAD_REQUEST,
    );
  }

  const userId = await resolveUserId(queryData, tokenPayload);

  const question = await QuestionMaster.findOne({
    where: { questionRefId },
    include: [
      {
        model: QuestionAnswer,
        as: "answers",
        required: false,
      },
      {
        model: LessonMaster,
        as: "lesson",
        attributes: ["lessonRefId"],
        required: true,
      },
    ],
  });

  if (!question) {
    throw new ApiError("QUESTION_NOT_FOUND", StatusCodes.NOT_FOUND);
  }

  await ensureQuestionAccess(userId, question);

  return question;
};

// =====================================================
// DELETE QUESTION + ANSWERS (SOFT DELETE)
// =====================================================

export const deleteQuestion = async (
  queryData: any,
  tokenPayload?: any,
): Promise<any> => {
  const transaction = await sequelizeConnection.transaction();
  const { questionRefId } = queryData || {};

  try {
    const userId = await resolveUserId(queryData, tokenPayload);

    if (!questionRefId) {
      throw new ApiError(
        "QUESTION_REQUIRED_FIELDS_MISSING",
        StatusCodes.BAD_REQUEST,
      );
    }

    const question = await QuestionMaster.findOne({
      where: { questionRefId },
      transaction,
    });

    if (!question) {
      throw new ApiError("QUESTION_NOT_FOUND", StatusCodes.NOT_FOUND);
    }

    await ensureQuestionAccess(userId, question);

    const answers = await QuestionAnswer.findAll({
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
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rbErr) {}
    throw error;
  }
};

// =====================================================
// CREATE ONE ANSWER
// =====================================================

export const createQuestionAnswer = async (
  payload: any,
  tokenPayload?: any,
): Promise<any> => {
  const userId = await resolveUserId(payload, tokenPayload);

  if (!payload?.questionRefId) {
    throw new ApiError(
      "ANSWER_REQUIRED_FIELDS_MISSING",
      StatusCodes.BAD_REQUEST,
    );
  }

  if (!payload?.answerText || !String(payload.answerText).trim()) {
    throw new ApiError("ANSWER_TEXT_REQUIRED", StatusCodes.BAD_REQUEST);
  }

  const question = await QuestionMaster.findOne({
    where: { questionRefId: payload.questionRefId },
  });

  if (!question) {
    throw new ApiError("QUESTION_NOT_FOUND", StatusCodes.NOT_FOUND);
  }

  await ensureQuestionAccess(userId, question);

  return QuestionAnswer.create({
    questionId: question.questionId,
    answerText: String(payload.answerText).trim(),
    isCorrect: payload.isCorrect ?? false,
    displayOrder: payload.displayOrder ?? 1,
    status: payload.status ?? "active",
    createdBy: userId,
  });
};

// =====================================================
// UPDATE ONE ANSWER
// =====================================================

export const updateQuestionAnswer = async (
  payload: any,
  tokenPayload?: any,
): Promise<any> => {
  const userId = await resolveUserId(payload, tokenPayload);

  if (!payload?.answerRefId) {
    throw new ApiError(
      "ANSWER_REQUIRED_FIELDS_MISSING",
      StatusCodes.BAD_REQUEST,
    );
  }

  const answer = await QuestionAnswer.findOne({
    where: { answerRefId: payload.answerRefId },
  });

  if (!answer) {
    throw new ApiError("ANSWER_NOT_FOUND", StatusCodes.NOT_FOUND);
  }

  const question = await QuestionMaster.findByPk(answer.questionId);

  if (!question) {
    throw new ApiError("QUESTION_NOT_FOUND", StatusCodes.NOT_FOUND);
  }

  await ensureQuestionAccess(userId, question);

  const updates: any = {};

  if (payload.answerText !== undefined) {
    if (!payload.answerText || !String(payload.answerText).trim()) {
      throw new ApiError("ANSWER_TEXT_REQUIRED", StatusCodes.BAD_REQUEST);
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

// =====================================================
// DELETE ONE ANSWER (SOFT DELETE)
// =====================================================

export const deleteQuestionAnswer = async (
  queryData: any,
  tokenPayload?: any,
): Promise<any> => {
  const userId = await resolveUserId(queryData, tokenPayload);

  const answerRefId = queryData?.answerRefId;
  if (!answerRefId) {
    throw new ApiError(
      "ANSWER_REQUIRED_FIELDS_MISSING",
      StatusCodes.BAD_REQUEST,
    );
  }

  const answer = await QuestionAnswer.findOne({
    where: { answerRefId },
  });

  if (!answer) {
    throw new ApiError("ANSWER_NOT_FOUND", StatusCodes.NOT_FOUND);
  }

  const question = await QuestionMaster.findByPk(answer.questionId);
  if (!question) {
    throw new ApiError("QUESTION_NOT_FOUND", StatusCodes.NOT_FOUND);
  }

  await ensureQuestionAccess(userId, question);

  await answer.update({ deletedBy: userId });
  await answer.destroy();

  return { message: "Answer deleted successfully" };
};
