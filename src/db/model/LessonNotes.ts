import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

interface lessonNotesAttributes {
  lessonNotesId: number;
  lessonNotesRefId: string;

  lessonId: string;

  title: string;
  content: string;

  // S3 document information
  documentName: string | null;
  documentUrl: string | null;
  documentKey: string | null;
  documentMimeType: string | null;
  documentSize: number | null;

  status: number;

  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type lessonNotesInput = Optional<
  lessonNotesAttributes,
  | "lessonNotesId"
  | "lessonNotesRefId"
  | "documentName"
  | "documentUrl"
  | "documentKey"
  | "documentMimeType"
  | "documentSize"
  | "status"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type lessonNotesOutput = Required<lessonNotesAttributes>;

class LessonNotes
  extends Model<lessonNotesOutput, lessonNotesInput>
  implements lessonNotesAttributes
{
  declare lessonNotesId: number;
  declare lessonNotesRefId: string;

  declare lessonId: string;

  declare title: string;
  declare content: string;

  // S3 document information
  declare documentName: string | null;
  declare documentUrl: string | null;
  declare documentKey: string | null;
  declare documentMimeType: string | null;
  declare documentSize: number | null;

  declare status: number;

  declare createdBy: number;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
  declare readonly deletedAt: Date | null;
}

LessonNotes.init(
  {
    lessonNotesId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    lessonNotesRefId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    lessonId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    /**
     * ========================================================
     * S3 DOCUMENT FIELDS
     * ========================================================
     */

    documentName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    documentUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    documentKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    documentMimeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    documentSize: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    /**
     * ========================================================
     * STATUS
     * ========================================================
     */

    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    /**
     * ========================================================
     * AUDIT FIELDS
     * ========================================================
     */

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

    tableName: "lesson_notes",

    paranoid: true,

    timestamps: false,
  },
);

export default LessonNotes;
