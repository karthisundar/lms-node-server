import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";
import sequelizeConnection from "../config";

interface menuItemsAttributes {
  menuItemsId: number;
  menuMasterId: number;
  menuPath: string;
  logoPath: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type menuItemInput = Optional<menuItemsAttributes, "menuItemsId">;

export type menuItemOutput = Required<menuItemsAttributes>;

class MenuItems
  extends Model<menuItemOutput, menuItemsAttributes>
  implements menuItemsAttributes
{
  declare menuItemsId: number;
  declare menuMasterId: number;
  declare menuPath: string;
  declare logoPath: string;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date;
}

MenuItems.init(
  {
    menuItemsId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    menuMasterId: {
      type: DataTypes.INTEGER,
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
    paranoid: true,
    sequelize: sequelizeConnection,
    tableName: "menu_items",
  },
);

export default MenuItems;
