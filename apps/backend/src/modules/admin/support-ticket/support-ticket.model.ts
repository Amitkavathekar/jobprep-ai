import { model, Schema, Document } from "mongoose";

export interface ISupportTicket extends Document {
  id?: string;
  supportTicketId: string;
  userId?: any;
  userName?: string;
  userEmail?: string;
  category: string;
  subject: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  responses?: Array<{
    responder: string;
    message: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema(
  {
    supportTicketId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.Mixed,
    },
    userName: {
      type: String,
      default: "Candidate",
    },
    userEmail: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Technical",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    responses: [
      {
        responder: String,
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        ret.id = ret.supportTicketId || (ret._id ? ret._id.toString() : "");
        return ret;
      },
    },
  }
);

export const SupportTicketModel = model<ISupportTicket>(
  "SupportTicket",
  SupportTicketSchema
);
