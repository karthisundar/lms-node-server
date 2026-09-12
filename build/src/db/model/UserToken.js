"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class User_token extends sequelize_1.Model {
    user_token_id;
    user_id;
    token;
    is_reseller;
    createdAt;
    updatedAt;
    deletedAt;
}
User_token.init({
    user_token_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        allowNull: false,
        autoIncrement: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    token: {
        type: sequelize_1.DataTypes.STRING("4000"),
        allowNull: false,
    },
    is_reseller: {
        type: sequelize_1.DataTypes.TINYINT("1"),
    },
}, {
    sequelize: config_1.default,
    paranoid: true,
    tableName: "user_token",
});
exports.default = User_token;
//# sourceMappingURL=UserToken.js.map