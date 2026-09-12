import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";
import sequelizeConnection from "../config";

interface roleMenuAcessAttributes {
  roleMenuAccessId: number;
  roleId: number;
  menuItemsId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type roleMenuAcessInput = Optional<
  roleMenuAcessAttributes,
  "roleMenuAccessId"
>;

export type roleMenuAcessOutput = Required<roleMenuAcessAttributes>;

class RoleMenuAccess
  extends Model<roleMenuAcessOutput, roleMenuAcessAttributes>
  implements roleMenuAcessAttributes
{
  roleMenuAccessId: number;
  roleId: number;
  menuItemsId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

RoleMenuAccess.init(
  {
    roleMenuAccessId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    menuItemsId: {
      type: DataTypes.INTEGER,
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
    paranoid: true,
    tableName: "role_menu_access",
  },
);

export default RoleMenuAccess;
