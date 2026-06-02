import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { MilestoneModel } from "../../src/models/milestone.model";
import { ProjectModel } from "../../src/models/project.model";
import projectRoutes from "../../src/routes/project.routes";
import mongoose from "mongoose";

const app = express();
app.use(express.json());
app.use("/api/projects", projectRoutes);

const SECRET = "test-secret";

function createToken(userId: string): string {
	return jwt.sign({ userId }, SECRET, { expiresIn: "1h" });
}

describe("Milestone API", () => {
	let token: string;
	let projectId: string;
	const userId = "test-user-123";

	beforeEach(async () => {
		token = createToken(userId);
		const project = await ProjectModel.create({
			name: "Test Project",
			owner: userId,
		});
		projectId = (project._id as any).toString();
	});

	describe("POST /api/projects/:projectId/milestones", () => {
		it("should create a new milestone", async () => {
			const milestone = {
				title: "Sprint 1",
				description: "First sprint",
				startDate: "2026-01-01",
				dueDate: "2026-01-31",
			};

			const response = await request(app)
				.post(`/api/projects/${projectId}/milestones`)
				.set("Authorization", `Bearer ${token}`)
				.send(milestone)
				.expect(201);

			expect(response.body.data).toMatchObject({
				title: milestone.title,
				description: milestone.description,
				isCompleted: false,
			});
			expect(response.body.data._id).toBeDefined();
		});

		it("should require authentication", async () => {
			const milestone = {
				title: "Sprint 1",
			};

			await request(app)
				.post(`/api/projects/${projectId}/milestones`)
				.send(milestone)
				.expect(401);
		});

		it("should require project ownership", async () => {
			const otherUserToken = createToken("other-user-456");
			const milestone = {
				title: "Sprint 1",
			};

			const response = await request(app)
				.post(`/api/projects/${projectId}/milestones`)
				.set("Authorization", `Bearer ${otherUserToken}`)
				.send(milestone)
				.expect(403);

			expect(response.body.error).toBe("FORBIDDEN");
		});

		it("should validate required fields", async () => {
			const response = await request(app)
				.post(`/api/projects/${projectId}/milestones`)
				.set("Authorization", `Bearer ${token}`)
				.send({})
				.expect(400);

			expect(response.body.error).toBe("VALIDATION_ERROR");
		});

		it("should validate invalid projectId", async () => {
			const milestone = {
				title: "Sprint 1",
			};

			const response = await request(app)
				.post(`/api/projects/invalid-id/milestones`)
				.set("Authorization", `Bearer ${token}`)
				.send(milestone)
				.expect(400);

			expect(response.body.error).toBe("BAD_REQUEST");
		});

		it("should return 404 for non-existent project", async () => {
			const fakeId = new mongoose.Types.ObjectId().toString();
			const milestone = {
				title: "Sprint 1",
			};

			const response = await request(app)
				.post(`/api/projects/${fakeId}/milestones`)
				.set("Authorization", `Bearer ${token}`)
				.send(milestone)
				.expect(404);

			expect(response.body.error).toBe("PROJECT_NOT_FOUND");
		});
	});

	describe("GET /api/projects/:projectId/milestones", () => {
		beforeEach(async () => {
			await MilestoneModel.create([
				{
					title: "Milestone 1",
					projectId,
					isCompleted: true,
					dueDate: new Date("2026-01-31"),
				},
				{
					title: "Milestone 2",
					projectId,
					isCompleted: false,
					dueDate: new Date("2026-02-28"),
				},
				{
					title: "Milestone 3",
					projectId,
					isCompleted: false,
					dueDate: new Date("2026-03-31"),
				},
			]);
		});

		it("should list all milestones", async () => {
			const response = await request(app)
				.get(`/api/projects/${projectId}/milestones`)
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(response.body.data).toHaveLength(3);
		});

		it("should filter by isCompleted", async () => {
			const response = await request(app)
				.get(`/api/projects/${projectId}/milestones?isCompleted=false`)
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(response.body.data).toHaveLength(2);
			expect(response.body.data.every((m: any) => !m.isCompleted)).toBe(true);
		});

		it("should filter by date range", async () => {
			const response = await request(app)
				.get(`/api/projects/${projectId}/milestones?from=2026-02-01&to=2026-12-31`)
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(response.body.data).toHaveLength(2);
		});

		it("should require project read access for private projects", async () => {
			// Make project private
			await ProjectModel.findByIdAndUpdate(projectId, { visibility: "private" });

			const otherUserToken = createToken("other-user-456");
			const response = await request(app)
				.get(`/api/projects/${projectId}/milestones`)
				.set("Authorization", `Bearer ${otherUserToken}`)
				.expect(403);

			expect(response.body.error).toBe("FORBIDDEN");
		});

		it("should allow access to public projects", async () => {
			// Make project public
			await ProjectModel.findByIdAndUpdate(projectId, { visibility: "public" });

			const otherUserToken = createToken("other-user-456");
			const response = await request(app)
				.get(`/api/projects/${projectId}/milestones`)
				.set("Authorization", `Bearer ${otherUserToken}`)
				.expect(200);

			expect(response.body.data).toHaveLength(3);
		});
	});

	describe("PATCH /api/projects/:projectId/milestones/:milestoneId", () => {
		let milestoneId: string;

		beforeEach(async () => {
			const milestone = await MilestoneModel.create({
				title: "Original Title",
				projectId,
				isCompleted: false,
			});
			milestoneId = (milestone._id as any).toString();
		});

		it("should update milestone", async () => {
			const updates = {
				title: "Updated Title",
				isCompleted: true,
			};

			const response = await request(app)
				.patch(`/api/projects/${projectId}/milestones/${milestoneId}`)
				.set("Authorization", `Bearer ${token}`)
				.send(updates)
				.expect(200);

			expect(response.body.data.title).toBe("Updated Title");
			expect(response.body.data.isCompleted).toBe(true);
		});

		it("should require project ownership", async () => {
			const otherUserToken = createToken("other-user-456");
			const updates = { title: "Hacked" };

			const response = await request(app)
				.patch(`/api/projects/${projectId}/milestones/${milestoneId}`)
				.set("Authorization", `Bearer ${otherUserToken}`)
				.send(updates)
				.expect(403);

			expect(response.body.error).toBe("FORBIDDEN");
		});

		it("should return 404 for non-existent milestone", async () => {
			const fakeId = new mongoose.Types.ObjectId().toString();
			const updates = { title: "Updated" };

			const response = await request(app)
				.patch(`/api/projects/${projectId}/milestones/${fakeId}`)
				.set("Authorization", `Bearer ${token}`)
				.send(updates)
				.expect(404);

			expect(response.body.error).toBe("MILESTONE_NOT_FOUND");
		});
	});

	describe("DELETE /api/projects/:projectId/milestones/:milestoneId", () => {
		let milestoneId: string;

		beforeEach(async () => {
			const milestone = await MilestoneModel.create({
				title: "To Delete",
				projectId,
			});
			milestoneId = (milestone._id as any).toString();
		});

		it("should delete milestone", async () => {
			await request(app)
				.delete(`/api/projects/${projectId}/milestones/${milestoneId}`)
				.set("Authorization", `Bearer ${token}`)
				.expect(204);

			const deleted = await MilestoneModel.findById(milestoneId);
			expect(deleted).toBeNull();
		});

		it("should require project ownership", async () => {
			const otherUserToken = createToken("other-user-456");

			const response = await request(app)
				.delete(`/api/projects/${projectId}/milestones/${milestoneId}`)
				.set("Authorization", `Bearer ${otherUserToken}`)
				.expect(403);

			expect(response.body.error).toBe("FORBIDDEN");
		});

		it("should return 404 for non-existent milestone", async () => {
			const fakeId = new mongoose.Types.ObjectId().toString();

			const response = await request(app)
				.delete(`/api/projects/${projectId}/milestones/${fakeId}`)
				.set("Authorization", `Bearer ${token}`)
				.expect(404);

			expect(response.body.error).toBe("MILESTONE_NOT_FOUND");
		});
	});
});
