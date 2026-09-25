import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

export interface lessonVideoMappingAttributes {
  lessonVideoMappingId: number;
  lessonVideoMappingRefId: string;

  lessonRefId: string;
  videoRefId: string;

  displayOrder: number;
  status: string;

  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type lessonVideoMappingInput = Optional<
  lessonVideoMappingAttributes,
  | "lessonVideoMappingId"
  | "lessonVideoMappingRefId"
  | "displayOrder"
  | "status"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type lessonVideoMappingOutput = Required<lessonVideoMappingAttributes>;

class LessonVideoMapping
  extends Model<lessonVideoMappingOutput, lessonVideoMappingInput>
  implements lessonVideoMappingAttributes
{
  declare lessonVideoMappingId: number;

  declare lessonVideoMappingRefId: string;

  declare lessonRefId: string;
  declare videoRefId: string;

  declare displayOrder: number;
  declare status: string;

  declare createdBy: number;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
  declare readonly deletedAt: Date | null;
}

LessonVideoMapping.init(
  {
    lessonVideoMappingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    lessonVideoMappingRefId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    lessonRefId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    videoRefId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    status: {
      type: DataTypes.STRING,
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

    tableName: "lesson_video_mapping",

    paranoid: true,

    timestamps: true,
  },
);

export default LessonVideoMapping;
