import mongoose, { Schema } from "mongoose";
const MilestoneSchema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    dueDate: { type: Date },
    isCompleted: { type: Boolean, default: false },
}, { timestamps: true });
// Index for performance
MilestoneSchema.index({ projectId: 1 });
MilestoneSchema.index({ dueDate: 1 });
MilestoneSchema.index({ isCompleted: 1 });
export const MilestoneModel = mongoose.model("Milestone", MilestoneSchema);
