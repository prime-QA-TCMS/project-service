import type { Request, Response, NextFunction } from "express";

export const authenticate = jest.fn((req: Request, res: Response, next: NextFunction) => {
	// Mock authentication - extract userId from Authorization header
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "UNAUTHORIZED", message: "No token provided" });
	}

	const token = authHeader.substring(7);

	if (token === "invalid-token") {
		return res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid token" });
	}

	// Mock decode token (in real impl, it would use jsonwebtoken.verify)
	try {
		const jwt = require("jsonwebtoken");
		const decoded = jwt.verify(token, "test-secret");
		(req as any).user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid token" });
	}
});
