import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";
import QuestionMaster from "./QuestionMaster";

export interface questionAnswerAttributes {
  answerId: number;
  answerRefId: string;

  questionId: number;

  answerText: string;
  isCorrect: boolean;
  displayOrder: number;

  status: string;

  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type questionAnswerInput = Optional<
  questionAnswerAttributes,
  | "answerId"
  | "answerRefId"
  | "isCorrect"
  | "displayOrder"
  | "status"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type questionAnswerOutput = Required<questionAnswerAttributes>;

class QuestionAnswer
  extends Model<questionAnswerOutput, questionAnswerInput>
  implements questionAnswerAttributes
{
  declare answerId: number;
  declare answerRefId: string;

  declare questionId: number;

  declare answerText: string;
  declare isCorrect: boolean;
  declare displayOrder: number;

  declare status: string;

  declare createdBy: number;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
  declare readonly deletedAt: Date | null;
}

QuestionAnswer.init(
  {
    answerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    answerRefId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    questionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    answerText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: "question_answer",
    paranoid: true,
    timestamps: true,
  },
);

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
export default QuestionAnswer;
