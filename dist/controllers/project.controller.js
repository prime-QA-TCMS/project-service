import { ProjectModel } from "../models/project.model.js";
import { ErrorCodes, ValidationError } from "../utils/errors.js";
import logger from "../utils/logger.js";
export const getProjects = async (req, res, next) => {
    try {
        // Use validated query if available, otherwise use req.query
        const query = req.validatedQuery || req.query;
        const { page = 1, pageSize = 20, owner, isActive, visibility, sort = "createdAt", order = "desc", } = query;
        // Build filter
        const filter = {};
        if (owner)
            filter.owner = owner;
        if (isActive !== undefined)
            filter.isActive = isActive === "true";
        if (visibility)
            filter.visibility = visibility;
        // Build sort
        const sortOrder = order === "asc" ? 1 : -1;
        const sortObj = { [sort]: sortOrder };
        // Calculate pagination
        const skip = (Number(page) - 1) * Number(pageSize);
        const limit = Number(pageSize);
        // Execute query
        const [projects, total] = await Promise.all([
            ProjectModel.find(filter).sort(sortObj).skip(skip).limit(limit),
            ProjectModel.countDocuments(filter),
        ]);
        logger.info({
            action: "LIST_PROJECTS",
            filter,
            page,
            pageSize,
            total,
            userId: req.user?.userId,
        });
        res.json({
            items: projects,
            page: Number(page),
            pageSize: Number(pageSize),
            total,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getProjectById = async (req, res, next) => {
    try {
        // Project is already attached by requireProjectReadAccess middleware
        const project = req.project;
        res.json(project);
    }
    catch (error) {
        next(error);
    }
};
export const createProject = async (req, res, next) => {
    try {
        const project = await ProjectModel.create(req.body);
        logger.info({
            action: "PROJECT_CREATED",
            projectId: project._id,
            projectKey: project.key,
            owner: project.owner,
            userId: req.user?.userId,
        });
        res.status(201).json(project);
    }
    catch (error) {
        next(error);
    }
};
export const updateProject = async (req, res, next) => {
    try {
        // Check if trying to update immutable fields
        if (req.body.key !== undefined) {
            throw new ValidationError("Project key cannot be modified", ErrorCodes.PROJECT_KEY_IMMUTABLE);
        }
        if (req.body.owner !== undefined) {
            throw new ValidationError("Project owner cannot be modified", ErrorCodes.PROJECT_OWNER_IMMUTABLE);
        }
        // Project is already attached and validated by requireProjectOwner middleware
        const project = req.project;
        // Update the project
        Object.assign(project, req.body);
        await project.save();
        logger.info({
            action: "PROJECT_UPDATED",
            projectId: project._id,
            changes: Object.keys(req.body),
            userId: req.user?.userId,
        });
        res.json(project);
    }
    catch (error) {
        next(error);
    }
};
export const deleteProject = async (req, res, next) => {
    try {
        // Project is already attached and validated by requireProjectOwner middleware
        const project = req.project;
        // Soft delete
        project.isActive = false;
        await project.save();
        logger.info({
            action: "PROJECT_DEACTIVATED",
            projectId: project._id,
            userId: req.user?.userId,
        });
        res.json({ message: "Project deactivated", project });
    }
    catch (error) {
        next(error);
    }
};
