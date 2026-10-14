import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";
import LessonMaster from "./LessonMaster";
import QuestionAnswer from "./QuestionAnswer";

export interface questionMasterAttributes {
  questionId: number;
  questionRefId: string;

  lessonId: number;

  questionText: string;
  questionType: string;

  marks: number;
  negativeMarks: number;

  explanation: string | null;
  displayOrder: number;

  status: string;

  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type questionMasterInput = Optional<
  questionMasterAttributes,
  | "questionId"
  | "questionRefId"
  | "negativeMarks"
  | "explanation"
  | "displayOrder"
  | "status"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type questionMasterOutput = Required<questionMasterAttributes>;

class QuestionMaster
  extends Model<questionMasterOutput, questionMasterInput>
  implements questionMasterAttributes
{
  declare questionId: number;
  declare questionRefId: string;

  declare lessonId: number;

  declare questionText: string;
  declare questionType: string;

  declare marks: number;
  declare negativeMarks: number;

  declare explanation: string | null;
  declare displayOrder: number;

  declare status: string;

  declare createdBy: number;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
  declare readonly deletedAt: Date | null;
}

QuestionMaster.init(
  {
    questionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    questionRefId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    lessonId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    questionType: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "MCQ",
    },

    marks: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 1,
    },

    negativeMarks: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0,
    },

    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "active",
    },

    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    updatedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    deletedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: "question_master",
    paranoid: true,
    timestamps: true,
  },
);

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

export default QuestionMaster;
