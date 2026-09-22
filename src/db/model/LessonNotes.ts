import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

export interface lessonNoteAttributes {
  lessonNoteId: number;
  lessonNoteRefId: string;

  lessonId: number;

  title: string;
  content: string;

  sequenceNo: number;
  status: number;

  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type lessonNoteInput = Optional<
  lessonNoteAttributes,
  | "lessonNoteId"
  | "lessonNoteRefId"
  | "sequenceNo"
  | "status"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type lessonNoteOutput = Required<lessonNoteAttributes>;

class LessonNoteMaster extends Model<
  lessonNoteOutput,
  lessonNoteInput
> implements lessonNoteAttributes {
  declare lessonNoteId: number;
  declare lessonNoteRefId: string;

  declare lessonId: number;

  declare title: string;
  declare content: string;

  declare sequenceNo: number;
  declare status: number;

  declare createdBy: number;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
  declare readonly deletedAt: Date | null;
}

LessonNoteMaster.init(
  {
    lessonNoteId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    lessonNoteRefId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    lessonId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },

    sequenceNo: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },

    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    tableName: "lesson_note_master",
    paranoid: true,
    timestamps: true,
  },
);

export default LessonNoteMaster;