import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

export interface lecturerCourseMappingAttributes {
  lecturerCourseMappingId: number;
  lecturerCourseMappingRefId: string;

  user_id: number;
  courseRefId: string;

  status: number;

  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type lecturerCourseMappingInput = Optional<
  lecturerCourseMappingAttributes,
  | "lecturerCourseMappingId"
  | "lecturerCourseMappingRefId"
  | "status"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type lecturerCourseMappingOutput =
  Required<lecturerCourseMappingAttributes>;

class LecturerCourseMapping
  extends Model<lecturerCourseMappingOutput, lecturerCourseMappingInput>
  implements lecturerCourseMappingAttributes
{
  declare lecturerCourseMappingId: number;
  declare lecturerCourseMappingRefId: string;

  declare user_id: number;
  declare courseRefId: string;

  declare status: number;

  declare createdBy: number;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
  declare readonly deletedAt: Date | null;
}

LecturerCourseMapping.init(
  {
    lecturerCourseMappingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    lecturerCourseMappingRefId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    courseRefId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    status: {
      type: DataTypes.TINYINT,
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
    tableName: "lecturer_course_mapping",
    timestamps: true,
    paranoid: true,
  },
);

export default LecturerCourseMapping;
