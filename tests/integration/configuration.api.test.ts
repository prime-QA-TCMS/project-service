import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { ConfigurationModel } from "../../src/models/configuration.model";
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

describe("Configuration API", () => {
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

	describe("POST /api/projects/:projectId/configurations", () => {
		it("should create a new configuration", async () => {
			const config = {
				name: "Production",
				description: "Production environment",
				baseUrl: "https://api.example.com",
				environmentVariables: {
					API_KEY: "secret123",
					DEBUG: "false",
				},
			};

			const response = await request(app)
				.post(`/api/projects/${projectId}/configurations`)
				.set("Authorization", `Bearer ${token}`)
				.send(config)
				.expect(201);

			expect(response.body.data).toMatchObject({
				name: config.name,
				description: config.description,
				baseUrl: config.baseUrl,
				isActive: true,
			});
			expect(response.body.data._id).toBeDefined();
		});

		it("should require authentication", async () => {
			const config = {
				name: "Test Config",
			};

			await request(app)
				.post(`/api/projects/${projectId}/configurations`)
				.send(config)
				.expect(401);
		});

		it("should require project ownership", async () => {
			const otherUserToken = createToken("other-user-456");
			const config = {
				name: "Test Config",
			};

			const response = await request(app)
				.post(`/api/projects/${projectId}/configurations`)
				.set("Authorization", `Bearer ${otherUserToken}`)
				.send(config)
				.expect(403);

			expect(response.body.error).toBe("FORBIDDEN");
		});

		it("should validate required fields", async () => {
			const response = await request(app)
				.post(`/api/projects/${projectId}/configurations`)
				.set("Authorization", `Bearer ${token}`)
				.send({})
				.expect(400);

			expect(response.body.error).toBe("VALIDATION_ERROR");
		});

		it("should return 404 for non-existent project", async () => {
			const fakeId = new mongoose.Types.ObjectId().toString();
			const config = {
				name: "Test Config",
			};

			const response = await request(app)
				.post(`/api/projects/${fakeId}/configurations`)
				.set("Authorization", `Bearer ${token}`)
				.send(config)
				.expect(404);

			expect(response.body.error).toBe("PROJECT_NOT_FOUND");
		});
	});

	describe("GET /api/projects/:projectId/configurations", () => {
		beforeEach(async () => {
			await ConfigurationModel.create([
				{
					name: "Development",
					projectId,
					isActive: true,
				},
				{
					name: "Staging",
					projectId,
					isActive: true,
				},
				{
					name: "Production",
					projectId,
					isActive: false,
				},
			]);
		});

		it("should list all configurations", async () => {
			const response = await request(app)
				.get(`/api/projects/${projectId}/configurations`)
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(response.body.data).toHaveLength(3);
		});

		it("should require project read access for private projects", async () => {
			// Make project private
			await ProjectModel.findByIdAndUpdate(projectId, { visibility: "private" });

			const otherUserToken = createToken("other-user-456");
			const response = await request(app)
				.get(`/api/projects/${projectId}/configurations`)
				.set("Authorization", `Bearer ${otherUserToken}`)
				.expect(403);

			expect(response.body.error).toBe("FORBIDDEN");
		});

		it("should allow access to public projects", async () => {
			// Make project public
			await ProjectModel.findByIdAndUpdate(projectId, { visibility: "public" });

			const otherUserToken = createToken("other-user-456");
			const response = await request(app)
				.get(`/api/projects/${projectId}/configurations`)
				.set("Authorization", `Bearer ${otherUserToken}`)
				.expect(200);

			expect(response.body.data).toHaveLength(3);
		});
	});

	describe("GET /api/projects/:projectId/configurations/:configId", () => {
		let configId: string;

		beforeEach(async () => {
			const config = await ConfigurationModel.create({
				name: "Test Config",
				projectId,
				baseUrl: "https://example.com",
			});
			configId = (config._id as any).toString();
		});

		it("should get configuration by ID", async () => {
			const response = await request(app)
				.get(`/api/projects/${projectId}/configurations/${configId}`)
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(response.body.data.name).toBe("Test Config");
			expect(response.body.data.baseUrl).toBe("https://example.com");
		});

		it("should return 404 for non-existent configuration", async () => {
			const fakeId = new mongoose.Types.ObjectId().toString();

			const response = await request(app)
				.get(`/api/projects/${projectId}/configurations/${fakeId}`)
				.set("Authorization", `Bearer ${token}`)
				.expect(404);

			expect(response.body.error).toBe("CONFIGURATION_NOT_FOUND");
		});

		it("should require read access for private projects", async () => {
			await ProjectModel.findByIdAndUpdate(projectId, { visibility: "private" });
			const otherUserToken = createToken("other-user-456");

			const response = await request(app)
				.get(`/api/projects/${projectId}/configurations/${configId}`)
				.set("Authorization", `Bearer ${otherUserToken}`)
				.expect(403);

			expect(response.body.error).toBe("FORBIDDEN");
		});
	});

	describe("PATCH /api/projects/:projectId/configurations/:configId", () => {
		let configId: string;

		beforeEach(async () => {
			const config = await ConfigurationModel.create({
				name: "Original Name",
				projectId,
				isActive: true,
			});
			configId = (config._id as any).toString();
		});

		it("should update configuration", async () => {
			const updates = {
				name: "Updated Name",
				isActive: false,
				baseUrl: "https://new-url.com",
			};

			const response = await request(app)
				.patch(`/api/projects/${projectId}/configurations/${configId}`)
				.set("Authorization", `Bearer ${token}`)
				.send(updates)
				.expect(200);

			expect(response.body.data.name).toBe("Updated Name");
			expect(response.body.data.isActive).toBe(false);
			expect(response.body.data.baseUrl).toBe("https://new-url.com");
		});

		it("should require project ownership", async () => {
			const otherUserToken = createToken("other-user-456");
			const updates = { name: "Hacked" };

			const response = await request(app)
				.patch(`/api/projects/${projectId}/configurations/${configId}`)
				.set("Authorization", `Bearer ${otherUserToken}`)
				.send(updates)
				.expect(403);

			expect(response.body.error).toBe("FORBIDDEN");
		});

		it("should return 404 for non-existent configuration", async () => {
			const fakeId = new mongoose.Types.ObjectId().toString();
			const updates = { name: "Updated" };

			const response = await request(app)
				.patch(`/api/projects/${projectId}/configurations/${fakeId}`)
				.set("Authorization", `Bearer ${token}`)
				.send(updates)
				.expect(404);

			expect(response.body.error).toBe("CONFIGURATION_NOT_FOUND");
		});
	});

	describe("DELETE /api/projects/:projectId/configurations/:configId", () => {
		let configId: string;

		beforeEach(async () => {
			const config = await ConfigurationModel.create({
				name: "To Delete",
				projectId,
			});
			configId = (config._id as any).toString();
		});

		it("should delete configuration", async () => {
			await request(app)
				.delete(`/api/projects/${projectId}/configurations/${configId}`)
				.set("Authorization", `Bearer ${token}`)
				.expect(204);

			const deleted = await ConfigurationModel.findById(configId);
			expect(deleted).toBeNull();
		});

		it("should require project ownership", async () => {
			const otherUserToken = createToken("other-user-456");

			const response = await request(app)
				.delete(`/api/projects/${projectId}/configurations/${configId}`)
				.set("Authorization", `Bearer ${otherUserToken}`)
				.expect(403);

			expect(response.body.error).toBe("FORBIDDEN");
		});

		it("should return 404 for non-existent configuration", async () => {
			const fakeId = new mongoose.Types.ObjectId().toString();

			const response = await request(app)
				.delete(`/api/projects/${projectId}/configurations/${fakeId}`)
				.set("Authorization", `Bearer ${token}`)
				.expect(404);

			expect(response.body.error).toBe("CONFIGURATION_NOT_FOUND");
		});
	});
});
