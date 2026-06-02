import { AppError, ErrorCodes } from "../utils/errors.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";
export const errorHandler = (err, req, res, _next) => {
    const traceId = req.id || "no-trace-id";
    // Log the error
    logger.error({
        err,
        traceId,
        method: req.method,
        url: req.url,
        statusCode: err.statusCode || 500,
    });
    // Handle known AppError instances
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.errorCode,
            message: err.message,
            traceId,
        });
    }
    // Handle Mongoose validation errors
    if (err.name === "ValidationError" && err instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
            error: ErrorCodes.VALIDATION_ERROR,
            message: err.message,
            traceId,
        });
    }
    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === "CastError" && err instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            error: ErrorCodes.INVALID_OBJECT_ID,
            message: "Invalid ID format",
            traceId,
        });
    }
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0];
        return res.status(409).json({
            error: field === "key" ? ErrorCodes.PROJECT_KEY_CONFLICT : "DUPLICATE_KEY",
            message: `Duplicate value for field: ${field}`,
            traceId,
        });
    }
    // Handle unknown errors
    return res.status(500).json({
        error: ErrorCodes.INTERNAL_ERROR,
        message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
        traceId,
    });
};
