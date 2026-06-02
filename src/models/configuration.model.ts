import mongoose, { Schema, Document, Types } from "mongoose";

export interface IConfiguration extends Document {
  projectId: Types.ObjectId;
  name: string;
  description?: string;
  baseUrl?: string;
  environmentVariables?: Map<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConfigurationSchema = new Schema<IConfiguration>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    description: { type: String },
    baseUrl: { type: String },
    environmentVariables: { type: Map, of: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for performance
ConfigurationSchema.index({ projectId: 1 });

export const ConfigurationModel = mongoose.model<IConfiguration>(
  "Configuration",
  ConfigurationSchema
);
