import { DataTypes, Model, ModelStatic, Optional, Sequelize } from 'sequelize';
import sequelizeConnection from '../config';


interface RoleUserAttribute {
    id: number,
    role_id: number,
    role_name: string
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    createdBy?: number;
    updatedBy?: number;
    deletedBy?: number;
}


export type UserRolesInput = Optional<RoleUserAttribute, 'id'>

export type UserRolesOutput = Required<RoleUserAttribute>


class UserRole extends Model<RoleUserAttribute, UserRolesInput> implements RoleUserAttribute {

    public id!: number;
    public role_id!: number;
    public role_name!: string;

    public createdBy!: number;
    public updatedBy!: number;
    public deletedBy!: number;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;
    public readonly deletedAt: Date;
}

UserRole.init({

    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    role_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    deletedBy: {
        type: DataTypes.INTEGER,
        allowNull: true

    }
}, {
    sequelize: sequelizeConnection,
    paranoid: true,
    tableName: "user_role"
});

// UserRole.hasMany(RolePolicy, { foreignKey: "role_id", as: "userRolePolicy", sourceKey: "role_id" })
// RolePolicy.hasMany(UserRole, { foreignKey: "role_id" })

export default UserRole;
