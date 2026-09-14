import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

export interface sessionMasterAttributes {
  sessionMasterId: number;
  sessionRefId: string;
  sessionCode: string;
  sessionName: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  createdBy: number | null;
  updatedBy: number | null;
  deletedBy: number | null;
}

export type sessionMasterInput = Optional<
  sessionMasterAttributes,
  | "sessionMasterId"
  | "sessionRefId"
  | "sessionCode"
  | "description"
  | "startDate"
  | "endDate"
  | "status"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
>;

export type sessionMasterOutput = Required<sessionMasterAttributes>;

class SessionMaster
  extends Model<sessionMasterOutput, sessionMasterInput>
  implements sessionMasterAttributes
{
  declare sessionMasterId: number;
  declare sessionRefId: string;
  declare sessionCode: string;
  declare sessionName: string;
  declare description: string | null;
  declare startDate: Date | null;
  declare endDate: Date | null;
  declare status: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
  declare readonly deletedAt: Date | null;
  declare createdBy: number | null;
  declare updatedBy: number | null;
  declare deletedBy: number | null;
}

SessionMaster.init(
  {
    sessionMasterId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    sessionRefId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    sessionCode: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },

    sessionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "draft",
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

    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    updatedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    deletedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: "sessions",
    paranoid: true,
    timestamps: true,
    // underscored: true,
  },
);

export default SessionMaster;