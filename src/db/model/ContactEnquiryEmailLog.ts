import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import sequelizeConnection from "../config";

export interface ContactEnquiryEmailLogAttributes {
  id: number;
  enquiry_id: number | null;
  recipient_email: string;
  email_type: string;
  attempt_number: number;
  status: "PENDING" | "SENT" | "FAILED";
  subject: string;
  provider_message_id: string | null;
  error_message: string | null;
  attempted_at: Date;
  sent_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export type ContactEnquiryEmailLogCreationAttributes = Optional<
  ContactEnquiryEmailLogAttributes,
  | "id"
  | "enquiry_id"
  | "email_type"
  | "attempt_number"
  | "status"
  | "provider_message_id"
  | "error_message"
  | "attempted_at"
  | "sent_at"
  | "created_at"
  | "updated_at"
>;

export class ContactEnquiryEmailLog
  extends Model<
    ContactEnquiryEmailLogAttributes,
    ContactEnquiryEmailLogCreationAttributes
  >
  implements ContactEnquiryEmailLogAttributes
{
  declare id: number;
  declare enquiry_id: number | null;
  declare recipient_email: string;
  declare email_type: string;
  declare attempt_number: number;
  declare status: "PENDING" | "SENT" | "FAILED";
  declare subject: string;
  declare provider_message_id: string | null;
  declare error_message: string | null;
  declare attempted_at: Date;
  declare sent_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date;
}

export function initContactEnquiryEmailLog(sequelize: Sequelize = sequelizeConnection) {
  ContactEnquiryEmailLog.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      enquiry_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      recipient_email: {
        type: DataTypes.STRING(254),
        allowNull: false,
      },
      email_type: {
        type: DataTypes.STRING(60),
        allowNull: false,
        defaultValue: "ADMIN_ENQUIRY_NOTIFICATION",
      },
      attempt_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "PENDING",
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      provider_message_id: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      attempted_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "contact_enquiry_email_logs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return ContactEnquiryEmailLog;
}

initContactEnquiryEmailLog(sequelizeConnection);

export default ContactEnquiryEmailLog;
