import { model, Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  id?: string;
  transactionId: string;
  paymentId?: any;
  gatewayTransactionId?: string;
  statusId?: any;
  status?: string;
  planName?: string;
  userName?: string;
  userEmail?: string;
  gatewayName?: string;
  refundId?: any;
  amount: number;
  reason?: string;
  attemptNumber?: number;
  failureReason?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: Schema.Types.Mixed,
    },
    gatewayTransactionId: {
      type: String,
      trim: true,
    },
    statusId: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ["Success", "Pending", "Failed", "Refunded"],
      default: "Success",
    },
    planName: {
      type: String,
      default: "Membership Plan",
    },
    userName: {
      type: String,
      default: "Candidate",
    },
    userEmail: {
      type: String,
      default: "",
    },
    gatewayName: {
      type: String,
      default: "Razorpay",
    },
    refundId: {
      type: Schema.Types.Mixed,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    failureReason: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        ret.id = ret.transactionId || (ret._id ? ret._id.toString() : "");
        return ret;
      },
    },
  }
);

export const TransactionModel = model<ITransaction>(
  "Transaction",
  TransactionSchema
);
