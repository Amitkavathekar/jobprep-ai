import { model, Schema, Document } from "mongoose";

export interface INotificationSetting extends Document {
  notificationId: string;
  category: "monetization" | "support" | "system" | "interview" | string;
  title: string;
  description: string;
  enabled: boolean;
  channel: "email" | "website";
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSettingSchema = new Schema(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["monetization", "support", "system", "interview"],
      default: "system",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    channel: {
      type: String,
      enum: ["email", "website"],
      default: "website",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        ret.id = ret.notificationId || (ret._id ? ret._id.toString() : "");
        return ret;
      },
    },
  }
);

export const NotificationSettingModel = model<INotificationSetting>(
  "NotificationSetting",
  NotificationSettingSchema
);
