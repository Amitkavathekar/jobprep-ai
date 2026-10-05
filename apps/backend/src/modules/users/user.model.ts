import { model, Schema, Types } from "mongoose";

const UserSchema = new Schema({
    educationDegreeId: {
      type: Types.ObjectId,
      ref: "EducationDegree",
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    portfolioUrl: {
      type: String,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    professionalTitle: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
    },

    avatarUrl: {
      type: String,
      trim: true,
    },

    phoneNo: {
      type: String,
      trim: true,
    },

    github: {
      type: String,
      trim: true,
    },

    linkedin: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model("User", UserSchema);
