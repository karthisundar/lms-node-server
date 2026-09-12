import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";
import sequelizeConnection from "../config";

interface userSessionAttributes {
  userSessionId: number;
  userId: number;
  sessionId: number;
  videoUrlId: number;
  status: number;
  createdBy: number;
  updatedBy: number;
  deletedBy: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type userSessionInput = Optional<userSessionAttributes, "userSessionId">;

export type userSessionOutput = Required<userSessionAttributes>;

class UserSessionMapping
  extends Model<userSessionOutput, userSessionAttributes>
  implements userSessionAttributes
{
  declare userSessionId: number;
  declare userId: number;
  declare sessionId: number;
  declare videoUrlId: number;
  declare status: number;
  declare createdBy: number;
  declare updatedBy: number;
  declare deletedBy: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date;
}

UserSessionMapping.init(
  {
    userSessionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    videoUrlId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
    },
    deletedBy: {
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: "user_session_mapping",
    paranoid: true,
  },
);

export default UserSessionMapping;
