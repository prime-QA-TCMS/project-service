import express from "express";
import { authenticate } from "prime-qa-api-common";
import { getConfigurations, createConfiguration, getConfigurationById, updateConfiguration, deleteConfiguration } from "../controllers/configuration.controller.js";
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from "../controllers/milestone.controller.js";
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from "../controllers/project.controller.js";
import { validate } from "../middleware/validation.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { requireProjectOwner, requireProjectReadAccess } from "../middleware/authorization.js";
import { createProjectSchema, updateProjectSchema, listProjectsSchema, } from "../validators/project.validators.js";
import { createMilestoneSchema, listMilestonesSchema } from "../validators/milestone.validators.js";
import { createConfigurationSchema } from "../validators/configuration.validators.js";
const router = express.Router();
// Projects
router.get("/", authenticate, (req, res, next) => {
    const { error, value } = listProjectsSchema.validate(req.query);
    if (error) {
        // Don't try to assign to readonly query, just let controller handle defaults
        next();
    }
    else {
        // Create a new object with validated values
        req.validatedQuery = value;
        next();
    }
}, getProjects);
router.get("/:id", authenticate, validateObjectId("id"), requireProjectReadAccess, getProjectById);
router.post("/", authenticate, validate(createProjectSchema), createProject);
router.put("/:id", authenticate, validateObjectId("id"), validate(updateProjectSchema), requireProjectOwner, updateProject);
router.delete("/:id", authenticate, validateObjectId("id"), requireProjectOwner, deleteProject);
// Configurations
router.get("/:projectId/configurations", authenticate, validateObjectId("projectId"), requireProjectReadAccess, getConfigurations);
router.post("/:projectId/configurations", authenticate, validateObjectId("projectId"), validate(createConfigurationSchema), requireProjectOwner, createConfiguration);
// Milestones
router.get("/:projectId/milestones", authenticate, validateObjectId("projectId"), (req, res, next) => {
    const { error, value } = listMilestonesSchema.validate(req.query);
    if (error) {
        // Don't try to assign to readonly query
        next();
    }
    else {
        // Create a new object with validated values
        req.validatedQuery = value;
        next();
    }
}, requireProjectReadAccess, getMilestones);
router.post("/:projectId/milestones", authenticate, validateObjectId("projectId"), validate(createMilestoneSchema), requireProjectOwner, createMilestone);
router.patch("/:projectId/milestones/:milestoneId", authenticate, validateObjectId("projectId"), validateObjectId("milestoneId"), requireProjectOwner, updateMilestone);
router.delete("/:projectId/milestones/:milestoneId", authenticate, validateObjectId("projectId"), validateObjectId("milestoneId"), requireProjectOwner, deleteMilestone);
// Configuration routes
router.get("/:projectId/configurations", authenticate, validateObjectId("projectId"), requireProjectReadAccess, getConfigurations);
router.post("/:projectId/configurations", authenticate, validateObjectId("projectId"), validate(createConfigurationSchema), requireProjectOwner, createConfiguration);
router.get("/:projectId/configurations/:configId", authenticate, validateObjectId("projectId"), validateObjectId("configId"), requireProjectReadAccess, getConfigurationById);
router.patch("/:projectId/configurations/:configId", authenticate, validateObjectId("projectId"), validateObjectId("configId"), requireProjectOwner, updateConfiguration);
router.delete("/:projectId/configurations/:configId", authenticate, validateObjectId("projectId"), validateObjectId("configId"), requireProjectOwner, deleteConfiguration);
export default router;
