import logger from "../utils/logger.js";
import { randomUUID } from "crypto";
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    const traceId = randomUUID();
    // Attach traceId to request for use in error handler
    req.id = traceId;
    // Log request
    logger.info({
        type: "request",
        traceId,
        method: req.method,
        url: req.url,
        userId: req.user?.userId,
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
