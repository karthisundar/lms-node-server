import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";
import sequelizeConnection from "../config";
import UserRole from "./UserRole";

interface userRoleMappingAttribute {
  userRoleMappingId: number;
  role_id: string;
  user_id: number;
  status: number;
  // tblRoleId:number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  createdBy?: number;
  updatedBy?: number;
  deletedBy?: number;
}

export type userRoleMappingInput = Optional<
  userRoleMappingAttribute,
  "userRoleMappingId"
>;

export type userRoleMappingOutput = Required<userRoleMappingAttribute>;

class UserRoleMapping
  extends Model<userRoleMappingAttribute, userRoleMappingInput>
  implements userRoleMappingAttribute
{
  public userRoleMappingId!: number;
  // public tblRoleId!: number;
  public role_id!: string;
  public user_id!: number;
  public status!: number;
  public createdBy!: number;
  public updatedBy!: number;
  public deletedBy!: number;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date;
}

UserRoleMapping.init(
  {
    userRoleMappingId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // tblRoleId:{
    //     type:DataTypes.INTEGER
    // }
  },
  {
    sequelize: sequelizeConnection,
    paranoid: true,
    tableName: "user_role_mapping",
  },
);

// UserRoleMapping.hasMany(UserRole, { foreignKey: "role_id", sourceKey: "role_id", as: "rolemaster" })
// UserRole.hasMany(UserRoleMapping, { foreignKey: "role_id" })

// UserRoleMapping.hasMany(tblRole,{foreignKey:"roleId",sourceKey:"functionalRoleId",as:'tblRole'})
// tblRole.hasMany(UserRoleMapping,{foreignKey:"roleId"})

// UserRoleMapping.hasMany(Role,{foreignKey:"roleId",sourceKey:"tblRoleId",as:"tblRole"})
// Role.belongsTo(UserRoleMapping,{foreignKey:"tblRoleId"})

// UserRoleMapping.hasOne(Role,{foreignKey:"roleId",sourceKey:"roleId",as:"logintblrole"})
// Role.hasMany(UserRoleMapping,{foreignKey:"roleId"})

// Role.hasOne(UserRoleMapping,{foreignKey:"tblRoleId",sourceKey:"roleId",as:"userRoleMaping"})
// UserRoleMapping.belongsToMany(Role,{through:"roleId"})

UserRoleMapping.hasMany(UserRole, {
  foreignKey: "role_id",
  sourceKey: "role_id",
  as: "userRole",
});
UserRole.hasMany(UserRoleMapping, { foreignKey: "role_id" });

// UserRole.hasMany(UserRoleMapping, { foreignKey: "role_id", sourceKey: "role_id", as: "roleUsers" })
// UserRoleMapping.hasMany(UserRole, { foreignKey: "role_id" })

export default UserRoleMapping;
