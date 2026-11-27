import { model, Schema, Document } from "mongoose";

export interface IRolePermission extends Document {
  id?: string;
  roleId: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RolePermissionSchema = new Schema(
  {
    roleId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    usersCount: {
      type: Number,
      default: 0,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        ret.id = ret.roleId || (ret._id ? ret._id.toString() : "");
        return ret;
      },
    },
  }
);

export const RolePermissionModel = model<IRolePermission>(
  "RolePermission",
  RolePermissionSchema
);
