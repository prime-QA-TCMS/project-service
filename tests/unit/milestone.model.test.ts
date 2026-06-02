import { MilestoneModel } from "../../src/models/milestone.model";
import { ProjectModel } from "../../src/models/project.model";
import mongoose from "mongoose";

describe("Milestone Model", () => {
	let projectId: mongoose.Types.ObjectId;

	beforeEach(async () => {
		const project = await ProjectModel.create({
			name: "Test Project",
			owner: "user123",
		});
		projectId = project._id as mongoose.Types.ObjectId;
	});

	describe("Validation", () => {
		it("should require title field", async () => {
			await expect(
				MilestoneModel.create({
					projectId,
				})
			).rejects.toThrow();
		});

		it("should require projectId field", async () => {
			await expect(
				MilestoneModel.create({
					title: "Test Milestone",
				})
			).rejects.toThrow();
		});

		it("should default isCompleted to false", async () => {
			const milestone = await MilestoneModel.create({
				title: "Test Milestone",
				projectId,
			});

			expect(milestone.isCompleted).toBe(false);
		});

		it("should accept optional dates", async () => {
			const milestone = await MilestoneModel.create({
				title: "Test Milestone",
				projectId,
				startDate: new Date("2026-01-01"),
				dueDate: new Date("2026-01-31"),
			});

			expect(milestone.startDate).toBeInstanceOf(Date);
			expect(milestone.dueDate).toBeInstanceOf(Date);
		});

		it("should accept optional description", async () => {
			const milestone = await MilestoneModel.create({
				title: "Test Milestone",
				projectId,
				description: "Test description",
			});

			expect(milestone.description).toBe("Test description");
		});
	});

	describe("Timestamps", () => {
		it("should set createdAt and updatedAt on creation", async () => {
			const milestone = await MilestoneModel.create({
				title: "Test Milestone",
				projectId,
			});

			expect(milestone.createdAt).toBeInstanceOf(Date);
			expect(milestone.updatedAt).toBeInstanceOf(Date);
		});

		it("should update updatedAt on modification", async () => {
			const milestone = await MilestoneModel.create({
				title: "Test Milestone",
				projectId,
			});

			const originalUpdatedAt = milestone.updatedAt;
			await new Promise(resolve => setTimeout(resolve, 10));

			milestone.isCompleted = true;
			await milestone.save();

			expect(milestone.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
		});
	});

	describe("Queries", () => {
		it("should filter milestones by projectId", async () => {
			await MilestoneModel.create({
				title: "Milestone 1",
				projectId,
			});

			const otherProject = await ProjectModel.create({
				name: "Other Project",
				owner: "user456",
			});

			await MilestoneModel.create({
				title: "Milestone 2",
				projectId: otherProject._id,
			});

			const milestones = await MilestoneModel.find({ projectId });
			expect(milestones).toHaveLength(1);
			expect(milestones[0].title).toBe("Milestone 1");
		});

		it("should filter by isCompleted status", async () => {
			await MilestoneModel.create({
				title: "Completed Milestone",
				projectId,
				isCompleted: true,
			});

			await MilestoneModel.create({
				title: "Pending Milestone",
				projectId,
				isCompleted: false,
			});

			const completed = await MilestoneModel.find({ projectId, isCompleted: true });
			expect(completed).toHaveLength(1);
			expect(completed[0].title).toBe("Completed Milestone");
		});
	});
});
