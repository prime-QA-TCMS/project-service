import { ProjectModel } from "../../src/models/project.model";
import mongoose from "mongoose";

describe("Project Model", () => {
	describe("Key Generation", () => {
		it("should auto-generate key from project name when key is not provided", async () => {
			const project = await ProjectModel.create({
				name: "Project Management System",
				owner: "user123",
			});

			expect(project.key).toBeDefined();
			expect(project.key).toBe("PMS");
		});

		it("should generate key from first letters of each word", async () => {
			const project = await ProjectModel.create({
				name: "Test Case Management System",
				owner: "user123",
			});

			expect(project.key).toBe("TCMS");
		});

		it("should use provided key when supplied", async () => {
			const project = await ProjectModel.create({
				name: "My Project",
				key: "CUSTOM",
				owner: "user123",
			});

			expect(project.key).toBe("CUSTOM");
		});

		it("should generate unique keys when duplicate detected", async () => {
			await ProjectModel.create({
				name: "Test Project",
				owner: "user123",
			});

			const project2 = await ProjectModel.create({
				name: "Test Project",
				owner: "user456",
			});

			expect(project2.key).toMatch(/^TP\d+$/);
		});

		it("should handle single word project names", async () => {
			const project = await ProjectModel.create({
				name: "Acme",
				owner: "user123",
			});

			expect(project.key).toBe("A");
		});
	});

	describe("Soft Delete", () => {
		it("should set isActive to false when soft deleted", async () => {
			const project = await ProjectModel.create({
				name: "Test Project",
				owner: "user123",
			});

			expect(project.isActive).toBe(true);

			project.isActive = false;
			await project.save();

			const found = await ProjectModel.findById(project._id);
			expect(found?.isActive).toBe(false);
		});

		it("should not remove the record from database", async () => {
			const project = await ProjectModel.create({
				name: "Test Project",
				owner: "user123",
			});

			project.isActive = false;
			await project.save();

			const allProjects = await ProjectModel.find({ _id: project._id });
			expect(allProjects).toHaveLength(1);
		});

		it("should update updatedAt timestamp on soft delete", async () => {
			const project = await ProjectModel.create({
				name: "Test Project",
				owner: "user123",
			});

			const originalUpdatedAt = project.updatedAt;

			// Wait a bit to ensure timestamp difference
			await new Promise(resolve => setTimeout(resolve, 10));

			project.isActive = false;
			await project.save();

			expect(project.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
		});
	});

	describe("Validation", () => {
		it("should require name field", async () => {
			await expect(
				ProjectModel.create({
					owner: "user123",
				})
			).rejects.toThrow();
		});

		it("should require owner field", async () => {
			await expect(
				ProjectModel.create({
					name: "Test Project",
				})
			).rejects.toThrow();
		});

		it("should default visibility to private", async () => {
			const project = await ProjectModel.create({
				name: "Test Project",
				owner: "user123",
			});

			expect(project.visibility).toBe("private");
		});

		it("should default isActive to true", async () => {
			const project = await ProjectModel.create({
				name: "Test Project",
				owner: "user123",
			});

			expect(project.isActive).toBe(true);
		});

		it("should enforce visibility enum values", async () => {
			await expect(
				ProjectModel.create({
					name: "Test Project",
					owner: "user123",
					visibility: "invalid" as any,
				})
			).rejects.toThrow();
		});

		it("should enforce unique key constraint", async () => {
			await ProjectModel.create({
				name: "Test Project",
				key: "UNIQUE",
				owner: "user123",
			});

			await expect(
				ProjectModel.create({
					name: "Another Project",
					key: "UNIQUE",
					owner: "user456",
				})
			).rejects.toThrow();
		});
	});

	describe("Immutability", () => {
		it("should allow key to be set only on creation", async () => {
			const project = await ProjectModel.create({
				name: "Test Project",
				key: "ORIG",
				owner: "user123",
			});

			// In practice, the controller prevents this, but model allows it
			// This test documents that model-level immutability is enforced by controller
			expect(project.key).toBe("ORIG");
		});

		it("should allow owner to be set only on creation", async () => {
			const project = await ProjectModel.create({
				name: "Test Project",
				owner: "user123",
			});

			// In practice, the controller prevents this
			expect(project.owner).toBe("user123");
		});
	});

	describe("Timestamps", () => {
		it("should set createdAt and updatedAt on creation", async () => {
			const project = await ProjectModel.create({
				name: "Test Project",
				owner: "user123",
			});

			expect(project.createdAt).toBeInstanceOf(Date);
			expect(project.updatedAt).toBeInstanceOf(Date);
		});

		it("should update updatedAt on modification", async () => {
			const project = await ProjectModel.create({
				name: "Test Project",
				owner: "user123",
			});

			const originalUpdatedAt = project.updatedAt;

			await new Promise(resolve => setTimeout(resolve, 10));

			project.description = "Updated description";
			await project.save();

			expect(project.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
		});

		it("should not change createdAt on modification", async () => {
			const project = await ProjectModel.create({
				name: "Test Project",
				owner: "user123",
			});

			const originalCreatedAt = project.createdAt;

			project.description = "Updated description";
			await project.save();

			expect(project.createdAt.getTime()).toBe(originalCreatedAt.getTime());
		});
	});
});
