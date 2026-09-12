import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

export interface sessionMasterAttributes {
  sessionMasterId: number;
  sessionRefId: string;
  sessionCode: string;
  sessionName: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
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
  declare description: string;
  declare startDate: Date;
  declare endDate: Date;
  declare status: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
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
      field: "session_ref_id",
    },

    sessionCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "session_code",
    },

    sessionName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "session_name",
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "start_date",
    },

    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "end_date",
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "draft",
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "updated_at",
    },

    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "deleted_at",
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: "sessions",
    paranoid: true,
    timestamps: true,
    underscored: true,
  },
);

export default SessionMaster;
