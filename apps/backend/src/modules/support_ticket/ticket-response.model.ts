import { model, Schema, Types } from "mongoose";

const TicketResponseSchema = new Schema(
  {
    ticketResponseId: {
      type: String,
      required: true,
      unique: true,
    },

    ticketStatusId: {
      type: Types.ObjectId,
      ref: "TicketStatus",
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TicketResponseModel = model(
  "TicketResponse",
  TicketResponseSchema
);
