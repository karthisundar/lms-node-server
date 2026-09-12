import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";
import sequelizeConnection from "../config";

interface videoAttributes {
  videoId: number;
  bucketId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type videoInput = Optional<videoAttributes, "videoId">;

export type videoOutput = Required<videoAttributes>;

class VideoMaster
  extends Model<videoOutput, videoAttributes>
  implements videoAttributes
{
  declare videoId: number;
  declare bucketId: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date;
}

VideoMaster.init(
  {
    videoId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    bucketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    paranoid: true,
    sequelize: sequelizeConnection,
    tableName: "video_master",
  },
);

export default VideoMaster;
