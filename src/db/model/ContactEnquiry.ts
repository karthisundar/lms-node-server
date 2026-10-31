import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import sequelizeConnection from "../config";

export interface ContactEnquiryAttributes {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  source: string | null;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  email_status: "PENDING" | "SENT" | "FAILED";
  email_sent_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export type ContactEnquiryCreationAttributes = Optional<
  ContactEnquiryAttributes,
  | "id"
  | "phone"
  | "subject"
  | "source"
  | "status"
  | "email_status"
  | "email_sent_at"
  | "created_at"
  | "updated_at"
>;

export class ContactEnquiry
  extends Model<ContactEnquiryAttributes, ContactEnquiryCreationAttributes>
  implements ContactEnquiryAttributes
{
  declare id: number;
  declare name: string;
  declare email: string;
  declare phone: string | null;
  declare subject: string | null;
  declare message: string;
  declare source: string | null;
  declare status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  declare email_status: "PENDING" | "SENT" | "FAILED";
  declare email_sent_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date;
}

export function initContactEnquiry(sequelize: Sequelize = sequelizeConnection) {
  ContactEnquiry.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        validate: { isEmail: true },
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      source: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "NEW",
      },
      email_status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "PENDING",
      },
      email_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "contact_enquiries",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return ContactEnquiry;
}

initContactEnquiry(sequelizeConnection);

export default ContactEnquiry;
