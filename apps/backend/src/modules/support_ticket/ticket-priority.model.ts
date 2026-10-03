import { model, Schema } from "mongoose";

const TicketPrioritySchema = new Schema(
  {
    ticketPriorityId: {
      type: String,
      required: true,
      unique: true,
    },

    priority: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Urgent"],
      trim: true,
    },
  }
);

export const TicketPriorityModel = model(
  "TicketPriority",
  TicketPrioritySchema
);
