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
      required: false,
    },

    provider: {
      type: String,
      enum: ["local", "google", "linkedin"],
      default: "local",
    },

    providerId: {
      type: String,
      trim: true,
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

    degree: {
      type: String,
      trim: true,
    },

    field_of_study: {
      type: String,
      trim: true,
    },

    institution: {
      type: String,
      trim: true,
    },

    start_year: {
      type: Schema.Types.Mixed,
    },

    end_year: {
      type: Schema.Types.Mixed,
    },

    educationList: {
      type: [Schema.Types.Mixed],
      default: [],
    },

    profile_completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const UserModel = model("User", UserSchema);
