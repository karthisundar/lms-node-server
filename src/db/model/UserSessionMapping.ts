import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

interface userSessionAttributes {
  userSessionId: number;
  userSessionRefId: string;

  userId: number;
  sessionId: string;

  status: number;

  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type userSessionInput = Optional<
  userSessionAttributes,
  | "userSessionId"
  | "userSessionRefId"
  | "status"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type userSessionOutput = Required<userSessionAttributes>;

class UserSessionMapping
  extends Model<userSessionOutput, userSessionInput>
  implements userSessionAttributes
{
  declare userSessionId: number;
  declare userSessionRefId: string;

  declare userId: number;
  declare sessionId: string;

  declare status: number;

  declare createdBy: number;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
  declare readonly deletedAt: Date | null;
}

UserSessionMapping.init(
  {
    userSessionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    userSessionRefId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    sessionId: {
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
    tableName: "user_session_mapping",
    paranoid: true,
    // timestamps: true,
    // underscored: true,
  },
);

export default UserSessionMapping;
