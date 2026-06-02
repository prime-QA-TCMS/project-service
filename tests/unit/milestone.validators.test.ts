import {
	createMilestoneSchema,
	listMilestonesSchema,
} from "../../src/validators/milestone.validators";

describe("Milestone Validators", () => {
	describe("createMilestoneSchema", () => {
		it("should validate valid milestone creation payload", () => {
			const payload = {
				title: "Sprint 1",
				description: "First sprint",
				startDate: "2026-01-01",
				dueDate: "2026-01-31",
			};

			const { error, value } = createMilestoneSchema.validate(payload);
			expect(error).toBeUndefined();
			expect(value.title).toBe(payload.title);
			expect(value.description).toBe(payload.description);
			expect(value.startDate).toBeInstanceOf(Date);
			expect(value.dueDate).toBeInstanceOf(Date);
		});

		it("should require title field", () => {
			const payload = {
				description: "Test",
			};

			const { error } = createMilestoneSchema.validate(payload);
			expect(error).toBeDefined();
			expect(error?.message).toContain("title");
		});

		it("should enforce minimum title length of 2", () => {
			const payload = {
				title: "A",
			};

			const { error } = createMilestoneSchema.validate(payload);
			expect(error).toBeDefined();
		});

		it("should default isCompleted to false", () => {
			const payload = {
				title: "Test Milestone",
			};

			const { value } = createMilestoneSchema.validate(payload);
			expect(value.isCompleted).toBe(false);
		});

		it("should accept valid ISO dates", () => {
			const payload = {
				title: "Test",
				startDate: "2026-01-01",
				dueDate: "2026-12-31",
			};

			const { error } = createMilestoneSchema.validate(payload);
			expect(error).toBeUndefined();
		});

		it("should reject startDate after dueDate", () => {
			const payload = {
				title: "Test",
				startDate: "2026-12-31",
				dueDate: "2026-01-01",
			};

			const { error } = createMilestoneSchema.validate(payload);
			expect(error).toBeDefined();
		});

		it("should accept equal startDate and dueDate", () => {
			const payload = {
				title: "Test",
				startDate: "2026-06-15",
				dueDate: "2026-06-15",
			};

			const { error } = createMilestoneSchema.validate(payload);
			expect(error).toBeUndefined();
		});
	});

	describe("listMilestonesSchema", () => {
		it("should validate empty query", () => {
			const { error } = listMilestonesSchema.validate({});
			expect(error).toBeUndefined();
		});

		it("should accept isCompleted filter", () => {
			const query = { isCompleted: true };
			const { error, value } = listMilestonesSchema.validate(query);
			expect(error).toBeUndefined();
			expect(value.isCompleted).toBe(true);
		});

		it("should accept date range filters", () => {
			const query = {
				from: "2026-01-01",
				to: "2026-12-31",
			};
			const { error, value } = listMilestonesSchema.validate(query);
			expect(error).toBeUndefined();
			expect(value.from).toBeDefined();
			expect(value.to).toBeDefined();
		});

		it("should accept from date only", () => {
			const query = { from: "2026-01-01" };
			const { error } = listMilestonesSchema.validate(query);
			expect(error).toBeUndefined();
		});

		it("should accept to date only", () => {
			const query = { to: "2026-12-31" };
			const { error } = listMilestonesSchema.validate(query);
			expect(error).toBeUndefined();
		});
	});
});
