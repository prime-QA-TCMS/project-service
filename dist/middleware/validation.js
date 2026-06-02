import { ValidationError } from "../utils/errors.js";
export const validate = (schema) => {
    return (req, res, next) => {
        try {
            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const message = error.details.map((d) => d.message).join(", ");
                throw new ValidationError(message);
            }
            req.body = value;
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
