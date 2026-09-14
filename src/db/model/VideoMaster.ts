import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

export interface videoAttributes {
  videoId: number;
  videoRefId: string;

  title: string;
  filename: string;
  url: string;

  sessionId: string;
  bucketId: string;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  createdBy: number | null;
  updatedBy: number | null;
  deletedBy: number | null;
}

export type videoInput = Optional<
  videoAttributes,
  | "videoId"
  | "videoRefId"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
>;

export type videoOutput = Required<videoAttributes>;

class VideoMaster
  extends Model<videoOutput, videoInput>
  implements videoAttributes
{
  declare videoId: number;
  declare videoRefId: string;

  declare title: string;
  declare filename: string;
  declare url: string;

  declare sessionId: string;
  declare bucketId: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
  declare readonly deletedAt: Date | null;

  declare createdBy: number | null;
  declare updatedBy: number | null;
  declare deletedBy: number | null;
}

VideoMaster.init(
  {
    videoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    videoRefId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    bucketId: {
      type: DataTypes.UUID,
      allowNull: false,
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
    tableName: "video_master",
    paranoid: true,
    // timestamps: true,
    // underscored: true,
  },
);

export default VideoMaster;
