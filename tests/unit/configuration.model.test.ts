import { ConfigurationModel } from "../../src/models/configuration.model";
import { ProjectModel } from "../../src/models/project.model";
import mongoose from "mongoose";

describe("Configuration Model", () => {
	let projectId: mongoose.Types.ObjectId;

	beforeEach(async () => {
		const project = await ProjectModel.create({
			name: "Test Project",
			owner: "user123",
		});
		projectId = project._id as mongoose.Types.ObjectId;
	});

	describe("Validation", () => {
		it("should require name field", async () => {
			await expect(
				ConfigurationModel.create({
					projectId,
				})
			).rejects.toThrow();
		});

		it("should require projectId field", async () => {
			await expect(
				ConfigurationModel.create({
					name: "Test Config",
				})
			).rejects.toThrow();
		});

		it("should default isActive to true", async () => {
			const config = await ConfigurationModel.create({
				name: "Test Config",
				projectId,
			});

			expect(config.isActive).toBe(true);
		});

		it("should accept optional fields", async () => {
			const config = await ConfigurationModel.create({
				name: "Production",
				projectId,
				description: "Production environment",
				baseUrl: "https://api.example.com",
				environmentVariables: { API_KEY: "secret", DEBUG: "false" },
			});

			expect(config.description).toBe("Production environment");
			expect(config.baseUrl).toBe("https://api.example.com");
			expect(config.environmentVariables?.get("API_KEY")).toBe("secret");
		});
	});

	describe("Environment Variables", () => {
		it("should store environment variables as Map", async () => {
			const config = await ConfigurationModel.create({
				name: "Test Config",
				projectId,
				environmentVariables: {
					VAR1: "value1",
					VAR2: "value2",
				},
			});

			expect(config.environmentVariables).toBeInstanceOf(Map);
			expect(config.environmentVariables?.size).toBe(2);
		});

		it("should handle empty environment variables", async () => {
			const config = await ConfigurationModel.create({
				name: "Test Config",
				projectId,
			});

			expect(config.environmentVariables).toBeUndefined();
		});
	});

	describe("Timestamps", () => {
		it("should set createdAt and updatedAt on creation", async () => {
			const config = await ConfigurationModel.create({
				name: "Test Config",
				projectId,
			});

			expect(config.createdAt).toBeInstanceOf(Date);
			expect(config.updatedAt).toBeInstanceOf(Date);
		});

		it("should update updatedAt on modification", async () => {
			const config = await ConfigurationModel.create({
				name: "Test Config",
				projectId,
			});

			const originalUpdatedAt = config.updatedAt;
			await new Promise(resolve => setTimeout(resolve, 10));

			config.isActive = false;
			await config.save();

			expect(config.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
		});
	});

	describe("Queries", () => {
		it("should filter configurations by projectId", async () => {
			await ConfigurationModel.create({
				name: "Config 1",
				projectId,
			});

			const otherProject = await ProjectModel.create({
				name: "Other Project",
				owner: "user456",
			});

			await ConfigurationModel.create({
				name: "Config 2",
				projectId: otherProject._id,
			});

			const configs = await ConfigurationModel.find({ projectId });
			expect(configs).toHaveLength(1);
			expect(configs[0].name).toBe("Config 1");
		});

		it("should filter by isActive status", async () => {
			await ConfigurationModel.create({
				name: "Active Config",
				projectId,
				isActive: true,
			});

			await ConfigurationModel.create({
				name: "Inactive Config",
				projectId,
				isActive: false,
			});

			const activeConfigs = await ConfigurationModel.find({ projectId, isActive: true });
			expect(activeConfigs).toHaveLength(1);
			expect(activeConfigs[0].name).toBe("Active Config");
		});
	});
});
