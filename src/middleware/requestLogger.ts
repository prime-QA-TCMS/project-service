import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";
import { randomUUID } from "crypto";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	const start = Date.now();
	const traceId = randomUUID();

	// Attach traceId to request for use in error handler
	(req as any).id = traceId;

	// Log request
	logger.info({
		type: "request",
		traceId,
		method: req.method,
		url: req.url,
		userId: (req as any).user?.userId,
	});

	// Log response when finished
	res.on("finish", () => {
		const duration = Date.now() - start;
		logger.info({
			type: "response",
			traceId,
			method: req.method,
			url: req.url,
			statusCode: res.statusCode,
			duration: `${duration}ms`,
		});
	});

	next();
};
