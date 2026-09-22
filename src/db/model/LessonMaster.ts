import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

export interface lessonMasterAttributes {
  lessonId: number;
  lessonRefId: string;

  moduleId: number;

  lessonCode: string;
  lessonName: string;
  description: string | null;

  sequenceNo: number;
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
  | "sequenceNo"
  | "status"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type lessonMasterOutput = Required<lessonMasterAttributes>;

class LessonMaster extends Model<
  lessonMasterOutput,
  lessonMasterInput
> implements lessonMasterAttributes {
  declare lessonId: number;
  declare lessonRefId: string;

  declare moduleId: number;

  declare lessonCode: string;
  declare lessonName: string;
  declare description: string | null;

  declare sequenceNo: number;
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

    moduleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    lessonCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    lessonName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    sequenceNo: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },

    status: {
      type: DataTypes.STRING(30),
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
    tableName: "lesson_master",
    paranoid: true,
    timestamps: true,
  },
);

export default LessonMaster;