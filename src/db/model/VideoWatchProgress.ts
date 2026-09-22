import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

interface videoWatchProgressAttributes {
  videoWatchProgressId: number;
  videoWatchProgressRefId: string;

  userId: number;
  videoId: number;

  lastWatchedDuration: number;
  videoDuration: number;

  isCompleted: boolean;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type videoWatchProgressInput = Optional<
  videoWatchProgressAttributes,
  | "videoWatchProgressId"
  | "videoWatchProgressRefId"
  | "lastWatchedDuration"
  | "videoDuration"
  | "isCompleted"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type videoWatchProgressOutput = Required<videoWatchProgressAttributes>;

class VideoWatchProgress
  extends Model<videoWatchProgressOutput, videoWatchProgressInput>
  implements videoWatchProgressAttributes
{
  declare videoWatchProgressId: number;
  declare videoWatchProgressRefId: string;

  declare userId: number;
  declare videoId: number;

  declare lastWatchedDuration: number;
  declare videoDuration: number;

  declare isCompleted: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
  declare readonly deletedAt: Date | null;
}

VideoWatchProgress.init(
  {
    videoWatchProgressId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    videoWatchProgressRefId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    videoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    lastWatchedDuration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    videoDuration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: "video_watch_progress",
    paranoid: true,
  },
);

export default VideoWatchProgress;
