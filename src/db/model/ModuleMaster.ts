import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../config";

export interface moduleMasterAttributes {
  moduleId: number;
  moduleRefId: string;

  courseId: number;

  moduleCode: string;
  moduleName: string;
  description: string | null;

  displayOrder: number;
  status: string;

  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export type moduleMasterInput = Optional<
  moduleMasterAttributes,
  | "moduleId"
  | "moduleRefId"
  | "description"
  | "displayOrder"
  | "status"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type moduleMasterOutput = Required<moduleMasterAttributes>;

class ModuleMaster
  extends Model<moduleMasterOutput, moduleMasterInput>
  implements moduleMasterAttributes
{
  declare moduleId: number;
  declare moduleRefId: string;

  declare courseId: number;

  declare moduleCode: string;
  declare moduleName: string;
  declare description: string | null;

  declare displayOrder: number;
  declare status: string;

  declare createdBy: number;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
  declare readonly deletedAt: Date | null;
}

ModuleMaster.init(
  {
    moduleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    moduleRefId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },

    courseId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    moduleCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    moduleName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "draft",
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
    tableName: "module_master",
    paranoid: true,
    timestamps: true,
  },
);

export default ModuleMaster;
