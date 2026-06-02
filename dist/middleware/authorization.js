import { ProjectModel } from "../models/project.model.js";
import { NotFoundError, ForbiddenError, ErrorCodes } from "../utils/errors.js";
/**
 * Middleware to check project ownership
 * Usage: Add after authenticate middleware to ensure only owner can modify
 */
export const requireProjectOwner = async (req, res, next) => {
    try {
        const projectId = req.params.id || req.params.projectId;
        const userId = req.user?.userId;
        if (!userId) {
            throw new ForbiddenError("User not authenticated", ErrorCodes.PROJECT_ACCESS_DENIED);
        }
        const project = await ProjectModel.findById(projectId);
        if (!project) {
            throw new NotFoundError("Project not found", ErrorCodes.PROJECT_NOT_FOUND);
        }
        if (!project.isActive) {
            throw new ForbiddenError("Project is inactive", ErrorCodes.PROJECT_INACTIVE);
        }
        if (project.owner !== userId) {
            throw new ForbiddenError("You do not have permission to modify this project", ErrorCodes.PROJECT_ACCESS_DENIED);
        }
        // Attach project to request for use in controller
        req.project = project;
        next();
    }
    catch (error) {
        next(error);
    }
};
/**
 * Middleware to check project read access based on visibility
 * - Private projects: only owner can read
 * - Public projects: any authenticated user can read
 */
export const requireProjectReadAccess = async (req, res, next) => {
    try {
        const projectId = req.params.id || req.params.projectId;
        const userId = req.user?.userId;
        if (!userId) {
            throw new ForbiddenError("User not authenticated", ErrorCodes.PROJECT_ACCESS_DENIED);
        }
        const project = await ProjectModel.findById(projectId);
        if (!project) {
            throw new NotFoundError("Project not found", ErrorCodes.PROJECT_NOT_FOUND);
        }
        if (!project.isActive) {
            throw new NotFoundError("Project not found", ErrorCodes.PROJECT_NOT_FOUND);
        }
        // Check visibility rules
        if (project.visibility === "private" && project.owner !== userId) {
            throw new ForbiddenError("You do not have permission to access this project", ErrorCodes.PROJECT_ACCESS_DENIED);
        }
        // Attach project to request for use in controller
        req.project = project;
        next();
    }
    catch (error) {
        next(error);
    }
};
