import { model, Schema, Types } from "mongoose";

const SupportTicketSchema = new Schema(
  {
    supportTicketId: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    categoryId: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },

    ticketResponseId: {
      type: Types.ObjectId,
      ref: "TicketResponse",
    },

    ticketTitle: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    priorityId: {
      type: Types.ObjectId,
      ref: "TicketPriority",
      required: true,
    },

    statusId: {
      type: Types.ObjectId,
      ref: "TicketStatus",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SupportTicketModel = model(
  "SupportTicket",
  SupportTicketSchema
);
