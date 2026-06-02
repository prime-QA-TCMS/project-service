import type { Request, Response, NextFunction } from "express";
import { ConfigurationModel } from "../models/configuration.model.js";
import logger from "../utils/logger.js";
import type { AuthRequest } from "../middleware/authorization.js";

export const getConfigurations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Project is already validated by requireProjectReadAccess middleware
    const { projectId } = req.params;

    const configs = await ConfigurationModel.find({ projectId });
    res.json({ data: configs });
  } catch (error) {
    next(error);
  }
};

export const createConfiguration = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Project is already validated by requireProjectOwner middleware
    const { projectId } = req.params;

    const config = await ConfigurationModel.create({
      ...req.body,
      projectId,
    });

    logger.info({
      action: "CONFIGURATION_CREATED",
      configId: config._id,
      projectId,
      userId: req.user?.userId,
    });

    res.status(201).json({ data: config });
  } catch (error) {
    next(error);
  }
};

export const getConfigurationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Project is already validated by requireProjectReadAccess middleware
    const { projectId, configId } = req.params;

    const config = await ConfigurationModel.findOne({
      _id: configId,
      projectId,
    });

    if (!config) {
      return res.status(404).json({
        error: "CONFIGURATION_NOT_FOUND",
        message: "Configuration not found",
      });
    }

    res.json({ data: config });
  } catch (error) {
    next(error);
  }
};

export const updateConfiguration = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Project is already validated by requireProjectOwner middleware
    const { projectId, configId } = req.params;

    const config = await ConfigurationModel.findOne({
      _id: configId,
      projectId,
    });

    if (!config) {
      return res.status(404).json({
        error: "CONFIGURATION_NOT_FOUND",
        message: "Configuration not found",
      });
    }

    Object.assign(config, req.body);
    await config.save();

    logger.info({
      action: "CONFIGURATION_UPDATED",
      configId,
      projectId,
      userId: req.user?.userId,
    });

    res.json({ data: config });
  } catch (error) {
    next(error);
  }
};

export const deleteConfiguration = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Project is already validated by requireProjectOwner middleware
    const { projectId, configId } = req.params;

    const config = await ConfigurationModel.findOneAndDelete({
      _id: configId,
      projectId,
    });

    if (!config) {
      return res.status(404).json({
        error: "CONFIGURATION_NOT_FOUND",
        message: "Configuration not found",
      });
    }

    logger.info({
      action: "CONFIGURATION_DELETED",
      configId,
      projectId,
      userId: req.user?.userId,
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
