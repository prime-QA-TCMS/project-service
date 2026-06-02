import mongoose, { Schema } from "mongoose";
const ConfigurationSchema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    description: { type: String },
    baseUrl: { type: String },
    environmentVariables: { type: Map, of: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
// Index for performance
ConfigurationSchema.index({ projectId: 1 });
export const ConfigurationModel = mongoose.model("Configuration", ConfigurationSchema);
