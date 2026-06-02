import Joi from "joi";

export const createConfigurationSchema = Joi.object({
	name: Joi.string().min(2).required(),
	description: Joi.string().optional().allow(""),
	baseUrl: Joi.string().uri().optional().allow(""),
	environmentVariables: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
	isActive: Joi.boolean().default(true),
});
