import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

export interface lessonMasterAttributes {
  lessonId: number;
  lessonRefId: string;

  moduleRefId: string;

  lessonCode: string;
  lessonName: string;
  description: string | null;

  videoRefId: string | null;
  notes: string | null;

  displayOrder: number;
  status: string;

  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type lessonMasterInput = Optional<
  lessonMasterAttributes,
  | "lessonId"
  | "lessonRefId"
  | "description"
  | "videoRefId"
  | "notes"
  | "displayOrder"
  | "status"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type lessonMasterOutput = Required<lessonMasterAttributes>;

class LessonMaster
  extends Model<lessonMasterOutput, lessonMasterInput>
  implements lessonMasterAttributes
{
  declare lessonId: number;

  declare lessonRefId: string;

  declare moduleRefId: string;

  declare lessonCode: string;
  declare lessonName: string;
  declare description: string | null;

  declare videoRefId: string | null;
  declare notes: string | null;

  declare displayOrder: number;
  declare status: string;

  declare createdBy: number;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
  declare readonly deletedAt: Date | null;
}

LessonMaster.init(
  {
    lessonId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    lessonRefId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    moduleRefId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    lessonCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    lessonName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    videoRefId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "draft",
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

    tableName: "lesson_master",

    paranoid: true,

    timestamps: true,
  },
);

export default LessonMaster;
