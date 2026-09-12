import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";
import sequelizeConnection from "../config";

interface userTokenAttributes {
  user_token_id: number;
  user_id: number;
  token: string;
  is_reseller: boolean;
}

export type userTokenInput = Optional<userTokenAttributes, "user_token_id">;
export type userTokenOutput = Required<userTokenAttributes>;

class User_token
  extends Model<userTokenAttributes, userTokenInput>
  implements userTokenAttributes
{
  public user_token_id!: number;
  public user_id!: number;
  public token!: string;
  public is_reseller!: boolean;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;

  public readonly deletedAt!: Date;
}

User_token.init(
  {
    user_token_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING("4000"),
      allowNull: false,
    },
    is_reseller: {
      type: DataTypes.TINYINT("1"),
    },
  },
  {
    sequelize: sequelizeConnection,
    paranoid: true,
    tableName: "user_token",
  },
);

export default User_token;
