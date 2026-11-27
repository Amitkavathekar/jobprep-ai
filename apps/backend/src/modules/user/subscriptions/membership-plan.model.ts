import { model, Schema, Types, Document } from "mongoose";

export interface IMembershipPlan extends Document {
  membershipPlanId: string;
  name: string;
  duration: string;
  durationMonths: number;
  sellingPrice: number;
  originalPrice: number;
  badge?: string;
  popular?: boolean;
  features: string[];
  mockLimitText?: string;
  atsLimitText?: string;
  mockLimit: number;
  atsLimit: number;
  aiCredits?: number;
  status: "Active" | "Draft" | "Archived";
  subscribersCount: number;
  membershipPlanNameId?: Types.ObjectId;
  badgeId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipPlanSchema = new Schema(
  {
    membershipPlanId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: String,
      default: "1 Month",
    },

    durationMonths: {
      type: Number,
      required: true,
      default: 1,
    },

    sellingPrice: {
      type: Number,
      required: true,
    },

    originalPrice: {
      type: Number,
      default: 0,
    },

    badge: {
      type: String,
      default: "",
    },

    popular: {
      type: Boolean,
      default: false,
    },

    features: {
      type: [String],
      default: [],
    },

    mockLimitText: {
      type: String,
      default: "",
    },

    atsLimitText: {
      type: String,
      default: "",
    },

    mockLimit: {
      type: Number,
      required: true,
      default: 10,
    },

    atsLimit: {
      type: Number,
      required: true,
      default: 25,
    },

    aiCredits: {
      type: Number,
      default: 50,
    },

    status: {
      type: String,
      enum: ["Active", "Draft", "Archived"],
      default: "Active",
    },

    subscribersCount: {
      type: Number,
      default: 0,
    },

    membershipPlanNameId: {
      type: Types.ObjectId,
      ref: "MembershipPlanName",
      required: false,
    },

    badgeId: {
      type: Types.ObjectId,
      ref: "Badge",
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        ret.id = ret.membershipPlanId || (ret._id ? ret._id.toString() : ret.id);
        return ret;
      },
    },
  }
);

export const MembershipPlanModel = model<IMembershipPlan>(
  "MembershipPlan",
  MembershipPlanSchema
);
