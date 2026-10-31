"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactEnquiry = void 0;
exports.initContactEnquiry = initContactEnquiry;
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class ContactEnquiry extends sequelize_1.Model {
}
exports.ContactEnquiry = ContactEnquiry;
function initContactEnquiry(sequelize = config_1.default) {
    ContactEnquiry.init({
        id: {
            type: sequelize_1.DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING(150),
            allowNull: false,
        },
        email: {
            type: sequelize_1.DataTypes.STRING(254),
            allowNull: false,
            validate: { isEmail: true },
        },
        phone: {
            type: sequelize_1.DataTypes.STRING(30),
            allowNull: true,
        },
        subject: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
        },
        message: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        source: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
        },
        status: {
            type: sequelize_1.DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "NEW",
        },
        email_status: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "PENDING",
        },
        email_sent_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
    }, {
        sequelize,
        tableName: "contact_enquiries",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    });
    return ContactEnquiry;
}
initContactEnquiry(config_1.default);
exports.default = ContactEnquiry;
//# sourceMappingURL=ContactEnquiry.js.map