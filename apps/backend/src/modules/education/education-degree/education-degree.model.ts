import { Schema,Types,model } from "mongoose"

const EducationDegreeSchema = new Schema(
  {
    FieldOfStudyId: {
      type: Types.ObjectId,
      ref: "FieldOfStudyModel",
      required: true,
    },
    DegreeNameId: {
      type: Types.ObjectId,
      ref: "DegreeName",
      required: true,
    },
    Institution: {
      type: String,
      required: true,
      trim: true,
    },
    startYear: {
      type: Date,
      required: true,
    },
    endYear: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export const EducationDegree = model("EducationDegree", EducationDegreeSchema)
