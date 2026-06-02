import { createConfigurationSchema } from "../../src/validators/configuration.validators";

describe("Configuration Validators", () => {
	describe("createConfigurationSchema", () => {
		it("should validate valid configuration creation payload", () => {
			const payload = {
				name: "Production",
				description: "Production environment",
				baseUrl: "https://api.example.com",
				environmentVariables: {
					API_KEY: "secret123",
					DEBUG: "false",
				},
			};

			const { error, value } = createConfigurationSchema.validate(payload);
			expect(error).toBeUndefined();
			expect(value).toMatchObject(payload);
		});

		it("should require name field", () => {
			const payload = {
				description: "Test",
			};

			const { error } = createConfigurationSchema.validate(payload);
			expect(error).toBeDefined();
			expect(error?.message).toContain("name");
		});

		it("should enforce minimum name length of 2", () => {
			const payload = {
				name: "A",
			};

			const { error } = createConfigurationSchema.validate(payload);
			expect(error).toBeDefined();
		});

		it("should accept optional description", () => {
			const payload = {
				name: "Test Config",
				description: "Test description",
			};

			const { error } = createConfigurationSchema.validate(payload);
			expect(error).toBeUndefined();
		});

		it("should accept optional baseUrl", () => {
			const payload = {
				name: "Test Config",
				baseUrl: "https://example.com",
			};

			const { error } = createConfigurationSchema.validate(payload);
			expect(error).toBeUndefined();
		});

		it("should validate baseUrl as URI", () => {
			const payload = {
				name: "Test Config",
				baseUrl: "not-a-url",
			};

			const { error } = createConfigurationSchema.validate(payload);
			expect(error).toBeDefined();
			expect(error?.message).toContain("uri");
		});

		it("should accept environment variables object", () => {
			const payload = {
				name: "Test Config",
				environmentVariables: {
					VAR1: "value1",
					VAR2: "value2",
				},
			};

			const { error, value } = createConfigurationSchema.validate(payload);
			expect(error).toBeUndefined();
			expect(value.environmentVariables).toMatchObject({
				VAR1: "value1",
				VAR2: "value2",
			});
		});

		it("should reject non-object environment variables", () => {
			const payload = {
				name: "Test Config",
				environmentVariables: "not an object",
			};

			const { error } = createConfigurationSchema.validate(payload);
			expect(error).toBeDefined();
		});

		it("should accept isActive boolean", () => {
			const payload = {
				name: "Test Config",
				isActive: false,
			};

			const { error, value } = createConfigurationSchema.validate(payload);
			expect(error).toBeUndefined();
			expect(value.isActive).toBe(false);
		});

		it("should reject non-boolean isActive", () => {
			const payload = {
				name: "Test Config",
				isActive: "yes",
			};

			const { error } = createConfigurationSchema.validate(payload);
			expect(error).toBeDefined();
		});
	});
});
