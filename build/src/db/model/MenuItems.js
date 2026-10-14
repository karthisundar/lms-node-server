"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
const MenuMaster_1 = __importDefault(require("./MenuMaster"));
class MenuItems extends sequelize_1.Model {
}
MenuItems.init({
    menuItemsId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    menuMasterId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    menuPath: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    logoPath: {
        type: sequelize_1.DataTypes.STRING,
    },
    isActive: {
        type: sequelize_1.DataTypes.TINYINT("1"),
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
    },
    deletedAt: {
        type: sequelize_1.DataTypes.DATE,
    },
}, {
    paranoid: true,
    sequelize: config_1.default,
    tableName: "menu_items",
});
// MenuItems.belongsTo(MenuMaster, {
//   foreignKey: "menuMasterId",
//   targetKey: "menuMasterId",
//   as: "menuMaster",
// });
// MenuMaster.hasMany(MenuItems, {
//   foreignKey: "menuMasterId",
//   sourceKey: "menuMasterId",
//   as: "menuItems",
// });
MenuItems.hasMany(MenuMaster_1.default, {
    foreignKey: "menuMasterId",
    sourceKey: "menuMasterId",
    as: "menuMaster",
});
MenuMaster_1.default.hasMany(MenuItems, { foreignKey: "menuMasterId" });
exports.default = MenuItems;
//# sourceMappingURL=MenuItems.js.map