export class AppError extends Error {
    constructor(message, statusCode, errorCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class ValidationError extends AppError {
    constructor(message, errorCode = "VALIDATION_ERROR") {
        super(message, 400, errorCode);
    }
}
export class NotFoundError extends AppError {
    constructor(message, errorCode = "NOT_FOUND") {
        super(message, 404, errorCode);
    }
}
export class ConflictError extends AppError {
    constructor(message, errorCode = "CONFLICT") {
        super(message, 409, errorCode);
    }
}
export class UnauthorizedError extends AppError {
    constructor(message, errorCode = "UNAUTHORIZED") {
        super(message, 401, errorCode);
    }
}
export class ForbiddenError extends AppError {
    constructor(message, errorCode = "FORBIDDEN") {
        super(message, 403, errorCode);
    }
}
// Specific error codes for Project Service
export const ErrorCodes = {
    // Projects
    PROJECT_NOT_FOUND: "PROJECT_NOT_FOUND",
    PROJECT_KEY_CONFLICT: "PROJECT_KEY_CONFLICT",
    PROJECT_KEY_IMMUTABLE: "PROJECT_KEY_IMMUTABLE",
    PROJECT_OWNER_IMMUTABLE: "PROJECT_OWNER_IMMUTABLE",
    PROJECT_INACTIVE: "PROJECT_INACTIVE",
    PROJECT_ACCESS_DENIED: "PROJECT_ACCESS_DENIED",
    // Milestones
    MILESTONE_NOT_FOUND: "MILESTONE_NOT_FOUND",
    MILESTONE_INVALID_DATES: "MILESTONE_INVALID_DATES",
    // Configurations
    CONFIGURATION_NOT_FOUND: "CONFIGURATION_NOT_FOUND",
    // Validation
    VALIDATION_ERROR: "VALIDATION_ERROR",
    INVALID_OBJECT_ID: "INVALID_OBJECT_ID",
    // Generic
    INTERNAL_ERROR: "INTERNAL_ERROR",
};
