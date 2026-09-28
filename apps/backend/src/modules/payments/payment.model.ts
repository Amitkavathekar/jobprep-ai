import { Schema, model, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: Schema.Types.ObjectId;
  orderId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  plan: 'PRO' | 'ENTERPRISE';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    plan: {
      type: String,
      enum: ['PRO', 'ENTERPRISE'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentModel = model<IPayment>('Payment', paymentSchema);
