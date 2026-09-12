import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";
import sequelizeConnection from "../config";
import UserRoleMapping from "./UserMaping";

interface userAttributes {
  user_id: number;
  name: string;
  user_ref_id: string;
  email: string;
  phone_number: string;
  password: string;
  is_active: Boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  createdBy: number;
  updatedBy: number;
  deletedBy: number;
}

export type UserInput = Optional<userAttributes, "user_id">;

export type UserOuput = Required<userAttributes>;

class User extends Model<userAttributes, UserInput> implements userAttributes {
  declare user_id: number;
  declare user_ref_id: string;
  declare name: string;
  declare email: string;
  declare password: string;
  declare is_active: Boolean;

  declare is_password_changed: boolean;
  declare phone_number: string;
  declare createdBy: number;
  declare updatedBy: number;
  declare deletedBy: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date;
}
User.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_ref_id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
    },
    phone_number: {
      type: DataTypes.STRING,
    },
    is_active: {
      type: DataTypes.TINYINT("1"),
      defaultValue: true,
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
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    paranoid: true,
    tableName: "user",
  },
);

User.hasMany(UserRoleMapping, {
  foreignKey: "user_id",
  sourceKey: "user_id",
  as: "userRoleMap",
});
UserRoleMapping.hasMany(User, { foreignKey: "user_id" });

// UserRoleMapping.hasMany(User, {
//   foreignKey: "user_id",
//   sourceKey: "user_id",
//   as: "mapUser",
// });
// User.hasMany(UserRoleMapping, { foreignKey: "user_id" });

// User.hasMany(UserPolicy,{foreignKey:"user_id",as:"userPolicyData",sourceKey:"user_id"})
// UserPolicy.hasMany(User,{foreignKey:"user_id"})

export default User;
