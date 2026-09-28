import { Schema, model, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: Schema.Types.ObjectId;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  startDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  usage: {
    atsScansUsed: number;
    mockInterviewsUsed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ['FREE', 'PRO', 'ENTERPRISE'],
      default: 'FREE',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
      default: 'ACTIVE',
    },
    usage: {
      atsScansUsed: { type: Number, default: 0 },
      mockInterviewsUsed: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const SubscriptionModel = model<ISubscription>('Subscription', subscriptionSchema);
