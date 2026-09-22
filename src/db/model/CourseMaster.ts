import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

export interface courseMasterAttributes {
  courseId: number;
  courseRefId: string;

  courseCode: string;
  courseName: string;
  description: string | null;

  status: string;

  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type courseMasterInput = Optional<
  courseMasterAttributes,
  | "courseId"
  | "courseRefId"
  | "description"
  | "status"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type courseMasterOutput = Required<courseMasterAttributes>;

class CourseMaster extends Model<
  courseMasterOutput,
  courseMasterInput
> implements courseMasterAttributes {
  declare courseId: number;
  declare courseRefId: string;

  declare courseCode: string;
  declare courseName: string;
  declare description: string | null;

  declare status: string;

  declare createdBy: number;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
  declare readonly deletedAt: Date | null;
}

CourseMaster.init(
  {
    courseId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    courseRefId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    courseCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    courseName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "course_master",
    paranoid: true,
    timestamps: true,
  },
);

export default CourseMaster;