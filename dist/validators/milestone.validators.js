import Joi from "joi";
export const createMilestoneSchema = Joi.object({
    title: Joi.string().min(2).required(),
    description: Joi.string().optional().allow(""),
    startDate: Joi.date().iso().optional(),
    dueDate: Joi.date().iso().optional(),
    isCompleted: Joi.boolean().default(false),
}).custom((value, helpers) => {
    // Validate that startDate <= dueDate if both are present
    if (value.startDate && value.dueDate) {
        if (new Date(value.startDate) > new Date(value.dueDate)) {
            return helpers.error("any.custom", {
                message: "startDate must be before or equal to dueDate",
            });
        }
    }
    return value;
});
export const listMilestonesSchema = Joi.object({
    isCompleted: Joi.boolean().optional(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().optional(),
});
