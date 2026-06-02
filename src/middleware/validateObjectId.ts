import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ValidationError, ErrorCodes } from "../utils/errors.js";

export const validateObjectId = (paramNames: string | string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const params = Array.isArray(paramNames) ? paramNames : [paramNames];

			for (const paramName of params) {
				const value = req.params[paramName];
				if (value && !mongoose.Types.ObjectId.isValid(value)) {
					throw new ValidationError(
						`Invalid ${paramName} format`,
						ErrorCodes.INVALID_OBJECT_ID
					);
				}
			}

			next();
		} catch (error) {
			next(error);
		}
	};
};
