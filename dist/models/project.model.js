import mongoose, { Schema } from "mongoose";
const ProjectSchema = new Schema({
    name: { type: String, required: true },
    key: { type: String, unique: true },
    description: { type: String },
    owner: { type: String, required: true },
    visibility: { type: String, enum: ["private", "public"], default: "private" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
// Indexes for performance
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ isActive: 1 });
ProjectSchema.index({ visibility: 1 });
ProjectSchema.index({ createdAt: -1 });
// ✅ Auto-generate "key" from name (e.g. "Project Management System" -> "PMS")
ProjectSchema.pre("save", async function (next) {
    try {
        // Only generate if no key was provided
        if (!this.key && this.name) {
            const words = this.name
                .split(" ")
                .filter((w) => w.trim().length > 0)
                .map((w) => w[0].toUpperCase());
            let baseKey = words.join("");
            // Ensure unique key (e.g., PMS, PMS1, PMS2)
            let uniqueKey = baseKey;
            let counter = 1;
            const existing = await mongoose.models.Project.findOne({ key: uniqueKey });
            while (existing) {
                uniqueKey = `${baseKey}${counter++}`;
                // eslint-disable-next-line no-await-in-loop
                if (!(await mongoose.models.Project.findOne({ key: uniqueKey })))
                    break;
            }
            this.key = uniqueKey;
        }
        next();
    }
    catch (err) {
        next(err);
    }
});
export const ProjectModel = mongoose.model("Project", ProjectSchema);
