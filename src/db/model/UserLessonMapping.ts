import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

interface userLessonAttributes {
  userLessonId: number;
  userLessonRefId: string;

  userId: number;
  lessonId: string;

  status: number;

  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type userLessonInput = Optional<
  userLessonAttributes,
  | "userLessonId"
  | "userLessonRefId"
  | "status"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type userLessonOutput = Required<userLessonAttributes>;

class UserLessonMapping
  extends Model<userLessonOutput, userLessonInput>
  implements userLessonAttributes
{
  declare userLessonId: number;
  declare userLessonRefId: string;

  declare userId: number;
  declare lessonId: string;

  declare status: number;

  declare createdBy: number;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
  declare readonly deletedAt: Date | null;
}

UserLessonMapping.init(
  {
    userLessonId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    userLessonRefId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    lessonId: {
      type: DataTypes.UUID,
      allowNull: false,
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
    tableName: "user_lesson_mapping",
    paranoid: true,
  },
);

export default UserLessonMapping;
