"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactEnquiryEmailLog = void 0;
exports.initContactEnquiryEmailLog = initContactEnquiryEmailLog;
const sequelize_1 = require("sequelize");
const config_1 = __importDefault(require("../config"));
class ContactEnquiryEmailLog extends sequelize_1.Model {
}
exports.ContactEnquiryEmailLog = ContactEnquiryEmailLog;
function initContactEnquiryEmailLog(sequelize = config_1.default) {
    ContactEnquiryEmailLog.init({
        id: {
            type: sequelize_1.DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        enquiry_id: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: true,
        },
        recipient_email: {
            type: sequelize_1.DataTypes.STRING(254),
            allowNull: false,
        },
        email_type: {
            type: sequelize_1.DataTypes.STRING(60),
            allowNull: false,
            defaultValue: "ADMIN_ENQUIRY_NOTIFICATION",
        },
        attempt_number: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        status: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "PENDING",
        },
        subject: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
        },
        provider_message_id: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
        },
        error_message: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        attempted_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
        },
        sent_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
    }, {
        sequelize,
        tableName: "contact_enquiry_email_logs",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    });
    return ContactEnquiryEmailLog;
}
initContactEnquiryEmailLog(config_1.default);
exports.default = ContactEnquiryEmailLog;
//# sourceMappingURL=ContactEnquiryEmailLog.js.map