import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";
import sequelizeConnection from "../config";

interface bucketMasterAttributes {
  bucketId: number;
  bucketName: string;
  serviceUrl: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type bucketMasterInput = Optional<bucketMasterAttributes, "bucketId">;

export type bucketMasterOutput = Required<bucketMasterAttributes>;

class BucketMaster
  extends Model<bucketMasterOutput, bucketMasterAttributes>
  implements bucketMasterAttributes
{
  declare bucketId: number;
  declare bucketName: string;
  declare serviceUrl: string;
  declare status: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date;
}

BucketMaster.init(
  {
    bucketId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bucketName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serviceUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: "bucket_master",
    paranoid: true,
  },
);
export default BucketMaster;