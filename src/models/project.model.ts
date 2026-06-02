import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  key: string;
  description?: string;
  owner: string; // userId from User Service
  visibility: "private" | "public";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    key: { type: String, unique: true },
    description: { type: String },
    owner: { type: String, required: true },
    visibility: { type: String, enum: ["private", "public"], default: "private" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for performance
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ isActive: 1 });
ProjectSchema.index({ visibility: 1 });
ProjectSchema.index({ createdAt: -1 });

// ✅ Auto-generate "key" from name (e.g. "Project Management System" -> "PMS")
ProjectSchema.pre<IProject>("save", async function (next) {
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
        if (!(await mongoose.models.Project.findOne({ key: uniqueKey }))) break;
      }

      this.key = uniqueKey;
    }

    next();
  } catch (err) {
    next(err as any);
  }
});

export const ProjectModel = mongoose.model<IProject>("Project", ProjectSchema);
