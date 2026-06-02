import {
	createProjectSchema,
	updateProjectSchema,
	listProjectsSchema,
} from "../../src/validators/project.validators";

describe("Project Validators", () => {
	describe("createProjectSchema", () => {
		it("should validate valid project creation payload", () => {
			const payload = {
				name: "Test Project",
				owner: "user123",
				description: "A test project",
				visibility: "private",
			};

			const { error, value } = createProjectSchema.validate(payload);
			expect(error).toBeUndefined();
			expect(value).toMatchObject(payload);
		});

		it("should require name field", () => {
			const payload = {
				owner: "user123",
			};

			const { error } = createProjectSchema.validate(payload);
			expect(error).toBeDefined();
			expect(error?.message).toContain("name");
		});

		it("should require owner field", () => {
			const payload = {
				name: "Test Project",
			};

			const { error } = createProjectSchema.validate(payload);
			expect(error).toBeDefined();
			expect(error?.message).toContain("owner");
		});

		it("should enforce minimum name length of 2", () => {
			const payload = {
				name: "A",
				owner: "user123",
			};

			const { error } = createProjectSchema.validate(payload);
			expect(error).toBeDefined();
		});

		it("should enforce non-empty owner after trim", () => {
			const payload = {
				name: "Test Project",
				owner: "   ",
			};

			const { error } = createProjectSchema.validate(payload);
			expect(error).toBeDefined();
		});

		it("should default visibility to private", () => {
			const payload = {
				name: "Test Project",
				owner: "user123",
			};

			const { value } = createProjectSchema.validate(payload);
			expect(value.visibility).toBe("private");
		});

		it("should accept public visibility", () => {
			const payload = {
				name: "Test Project",
				owner: "user123",
				visibility: "public",
			};

			const { error, value } = createProjectSchema.validate(payload);
			expect(error).toBeUndefined();
			expect(value.visibility).toBe("public");
		});

		it("should reject invalid visibility values", () => {
			const payload = {
				name: "Test Project",
				owner: "user123",
				visibility: "invalid",
			};

			const { error } = createProjectSchema.validate(payload);
			expect(error).toBeDefined();
		});

		it("should allow optional key field", () => {
			const payload = {
				name: "Test Project",
				owner: "user123",
				key: "CUSTOM",
			};

			const { error, value } = createProjectSchema.validate(payload);
			expect(error).toBeUndefined();
			expect(value.key).toBe("CUSTOM");
		});

		it("should allow empty description", () => {
			const payload = {
				name: "Test Project",
				owner: "user123",
				description: "",
			};

			const { error } = createProjectSchema.validate(payload);
			expect(error).toBeUndefined();
		});
	});

	describe("updateProjectSchema", () => {
		it("should validate valid update payload", () => {
			const payload = {
				name: "Updated Name",
				description: "Updated description",
			};

			const { error } = updateProjectSchema.validate(payload);
			expect(error).toBeUndefined();
		});

		it("should forbid key updates", () => {
			const payload = {
				name: "Updated Name",
				key: "NEWKEY",
			};

			const { error } = updateProjectSchema.validate(payload);
			expect(error).toBeDefined();
			expect(error?.message).toContain("key");
		});

		it("should forbid owner updates", () => {
			const payload = {
				name: "Updated Name",
				owner: "newowner",
			};

			const { error } = updateProjectSchema.validate(payload);
			expect(error).toBeDefined();
			expect(error?.message).toContain("owner");
		});

		it("should forbid isActive updates", () => {
			const payload = {
				name: "Updated Name",
				isActive: false,
			};

			const { error } = updateProjectSchema.validate(payload);
			expect(error).toBeDefined();
			expect(error?.message).toContain("isActive");
		});

		it("should require at least one field", () => {
			const payload = {};

			const { error } = updateProjectSchema.validate(payload);
			expect(error).toBeDefined();
		});

		it("should allow name update only", () => {
			const payload = {
				name: "Updated Name",
			};

			const { error, value } = updateProjectSchema.validate(payload);
			expect(error).toBeUndefined();
			expect(value.name).toBe("Updated Name");
		});

		it("should allow visibility update", () => {
			const payload = {
				visibility: "public",
			};

			const { error, value } = updateProjectSchema.validate(payload);
			expect(error).toBeUndefined();
			expect(value.visibility).toBe("public");
		});

		it("should enforce minimum name length if provided", () => {
			const payload = {
				name: "A",
			};

			const { error } = updateProjectSchema.validate(payload);
			expect(error).toBeDefined();
		});
	});

	describe("listProjectsSchema", () => {
		it("should validate with default values", () => {
			const { error, value } = listProjectsSchema.validate({});
			expect(error).toBeUndefined();
			expect(value.page).toBe(1);
			expect(value.pageSize).toBe(20);
			expect(value.sort).toBe("createdAt");
			expect(value.order).toBe("desc");
		});

		it("should accept custom page and pageSize", () => {
			const query = { page: 2, pageSize: 50 };
			const { error, value } = listProjectsSchema.validate(query);
			expect(error).toBeUndefined();
			expect(value.page).toBe(2);
			expect(value.pageSize).toBe(50);
		});

		it("should enforce maximum pageSize of 100", () => {
			const query = { pageSize: 200 };
			const { error } = listProjectsSchema.validate(query);
			expect(error).toBeDefined();
		});

		it("should enforce minimum page of 1", () => {
			const query = { page: 0 };
			const { error } = listProjectsSchema.validate(query);
			expect(error).toBeDefined();
		});

		it("should accept valid filters", () => {
			const query = {
				owner: "user123",
				isActive: true,
				visibility: "private",
			};
			const { error, value } = listProjectsSchema.validate(query);
			expect(error).toBeUndefined();
			expect(value.owner).toBe("user123");
			expect(value.isActive).toBe(true);
			expect(value.visibility).toBe("private");
		});

		it("should accept valid sort fields", () => {
			const validSorts = ["createdAt", "name", "updatedAt"];

			for (const sort of validSorts) {
				const { error, value } = listProjectsSchema.validate({ sort });
				expect(error).toBeUndefined();
				expect(value.sort).toBe(sort);
			}
		});

		it("should reject invalid sort fields", () => {
			const { error } = listProjectsSchema.validate({ sort: "invalid" });
			expect(error).toBeDefined();
		});

		it("should accept valid order values", () => {
			const { error: errorAsc } = listProjectsSchema.validate({ order: "asc" });
			const { error: errorDesc } = listProjectsSchema.validate({ order: "desc" });

			expect(errorAsc).toBeUndefined();
			expect(errorDesc).toBeUndefined();
		});

		it("should reject invalid order values", () => {
			const { error } = listProjectsSchema.validate({ order: "invalid" });
			expect(error).toBeDefined();
		});
	});
});
