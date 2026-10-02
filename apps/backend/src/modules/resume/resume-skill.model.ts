import { model, Schema } from "mongoose";

const ResumeSkillSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    skill_name: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ResumeSkill = model("ResumeSkill", ResumeSkillSchema);
