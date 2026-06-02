import Joi from "joi";

export const createProjectSchema = Joi.object({
	name: Joi.string().min(2).required(),
	key: Joi.string().optional(),
	description: Joi.string().optional().allow(""),
	owner: Joi.string().trim().min(1).required(),
	visibility: Joi.string().valid("private", "public").default("private"),
});

export const updateProjectSchema = Joi.object({
	name: Joi.string().min(2).optional(),
	description: Joi.string().optional().allow(""),
	visibility: Joi.string().valid("private", "public").optional(),
	// Explicitly forbid key and owner
	key: Joi.forbidden(),
	owner: Joi.forbidden(),
	isActive: Joi.forbidden(), // Only deletion endpoint should modify this
}).min(1); // At least one field must be present

export const listProjectsSchema = Joi.object({
	page: Joi.number().integer().min(1).default(1),
	pageSize: Joi.number().integer().min(1).max(100).default(20),
	owner: Joi.string().optional(),
	isActive: Joi.boolean().optional(),
	visibility: Joi.string().valid("private", "public").optional(),
	sort: Joi.string().valid("createdAt", "name", "updatedAt").default("createdAt"),
	order: Joi.string().valid("asc", "desc").default("desc"),
});
