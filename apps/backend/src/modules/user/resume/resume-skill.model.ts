import { model, Schema, Types } from "mongoose";

const ResumeSkillSchema = new Schema(
  {
    user_id: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    skill_name: {
      type: Types.ObjectId,
      ref: "Skill",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ResumeSkill = model("ResumeSkill", ResumeSkillSchema);
