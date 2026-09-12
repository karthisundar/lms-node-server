import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";
import sequelizeConnection from "../config";

interface menuMasterAttributes {
  menuMasterId: number;
  menuName: string;
  menuPath: string;
  logoPath: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type menuMasterInput = Optional<menuMasterAttributes, "menuMasterId">;

export type menuMasterOutput = Required<menuMasterAttributes>;

class MenuMaster
  extends Model<menuMasterOutput, menuMasterAttributes>
  implements menuMasterAttributes
{
  declare menuMasterId: number;
  declare menuName: string;
  declare menuPath: string;
  declare logoPath: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date;
}

MenuMaster.init(
  {
    menuMasterId: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    menuName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    menuPath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logoPath: {
      type: DataTypes.STRING,
    },
    isActive: {
      type: DataTypes.TINYINT("1"),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
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
    tableName: "menu_master",
    paranoid: true,
  },
);

export default MenuMaster;
