import { model, Schema } from "mongoose";

const TicketStatusSchema = new Schema(
  {
    ticketStatusId: {
      type: String,
      required: true,
      unique: true,
    },

    ticketStatus: {
      type: String,
      required: true,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      trim: true,
    },
  }
);

export const TicketStatusModel = model(
  "TicketStatus",
  TicketStatusSchema
);
