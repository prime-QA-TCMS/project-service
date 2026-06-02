import { MilestoneModel } from "../models/milestone.model.js";
import logger from "../utils/logger.js";
export const getMilestones = async (req, res, next) => {
    try {
        // Project is already validated by requireProjectReadAccess middleware
        const { projectId } = req.params;
        // Use validated query if available, otherwise use req.query
        const query = req.validatedQuery || req.query;
        const { isCompleted, from, to } = query;
        // Build filter
        const filter = { projectId };
        if (isCompleted !== undefined)
            filter.isCompleted = isCompleted === "true";
        if (from || to) {
            filter.dueDate = {};
            if (from)
                filter.dueDate.$gte = new Date(from);
            if (to)
                filter.dueDate.$lte = new Date(to);
        }
        // Fetch milestones sorted by dueDate ascending, then createdAt descending
        const milestones = await MilestoneModel.find(filter).sort({ dueDate: 1, createdAt: -1 });
        res.json({ data: milestones });
    }
    catch (error) {
        next(error);
    }
};
export const createMilestone = async (req, res, next) => {
    try {
        // Project is already validated by requireProjectOwner middleware
        const { projectId } = req.params;
        const milestone = await MilestoneModel.create({
            ...req.body,
            projectId,
        });
        logger.info({
            action: "MILESTONE_CREATED",
            milestoneId: milestone._id,
            projectId,
            userId: req.user?.userId,
        });
        res.status(201).json({ data: milestone });
    }
    catch (error) {
        next(error);
    }
};
export const updateMilestone = async (req, res, next) => {
    try {
        // Project is already validated by requireProjectOwner middleware
        const { projectId, milestoneId } = req.params;
        const milestone = await MilestoneModel.findOne({
            _id: milestoneId,
            projectId,
        });
        if (!milestone) {
            return res.status(404).json({
                error: "MILESTONE_NOT_FOUND",
                message: "Milestone not found",
            });
        }
        Object.assign(milestone, req.body);
        await milestone.save();
        logger.info({
            action: "MILESTONE_UPDATED",
            milestoneId,
            projectId,
            userId: req.user?.userId,
        });
        res.json({ data: milestone });
    }
    catch (error) {
        next(error);
    }
};
export const deleteMilestone = async (req, res, next) => {
    try {
        // Project is already validated by requireProjectOwner middleware
        const { projectId, milestoneId } = req.params;
        const milestone = await MilestoneModel.findOneAndDelete({
            _id: milestoneId,
            projectId,
        });
        if (!milestone) {
            return res.status(404).json({
                error: "MILESTONE_NOT_FOUND",
                message: "Milestone not found",
            });
        }
        logger.info({
            action: "MILESTONE_DELETED",
            milestoneId,
            projectId,
            userId: req.user?.userId,
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
