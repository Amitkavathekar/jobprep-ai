import { model, Schema, Document } from "mongoose";

export interface IAtsRulesDictionary extends Document {
  dictionaryId: string;
  actionVerbs: string[];
  softSkills: string[];
  industryTerms: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IInterviewTypeCatalog extends Document {
  id: string;
  typeId: string;
  title: string;
  badge: string;
  icon: string;
  color: string;
  desc: string;
  questionsCount: string;
  createdAt: Date;
  updatedAt: Date;
}

const AtsRulesDictionarySchema = new Schema(
  {
    dictionaryId: {
      type: String,
      required: true,
      unique: true,
      default: "ats-rules-global",
    },
    actionVerbs: {
      type: [String],
      default: [],
    },
    softSkills: {
      type: [String],
      default: [],
    },
    industryTerms: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const InterviewTypeCatalogSchema = new Schema(
  {
    typeId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "⚡",
    },
    color: {
      type: String,
      default: "#ec4899",
    },
    desc: {
      type: String,
      default: "",
    },
    questionsCount: {
      type: String,
      default: "10 Questions",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        ret.id = ret.typeId || (ret._id ? ret._id.toString() : "");
        return ret;
      },
    },
  }
);

export const AtsRulesDictionaryModel = model<IAtsRulesDictionary>(
  "AtsRulesDictionary",
  AtsRulesDictionarySchema
);

export const InterviewTypeCatalogModel = model<IInterviewTypeCatalog>(
  "InterviewTypeCatalog",
  InterviewTypeCatalogSchema
);
