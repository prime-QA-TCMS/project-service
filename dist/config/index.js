import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "../utils/logger.js";
dotenv.config();
export const config = {
    port: process.env.PORT || 8082,
    jwtSecret: process.env.JWT_SECRET || "dev_secret",
    mongoUri: process.env.MONGO_URI ||
        "mongodb+srv://kegzpeach:hlHe8HN2m8TgOB1F@tangomanagement.ngouqxc.mongodb.net/tcms_project",
};
export const connectDb = async () => {
    try {
        await mongoose.connect(config.mongoUri, { retryWrites: true, w: "majority" });
        logger.info("✅ MongoDB connected");
    }
    catch (err) {
        logger.error({ err }, "❌ MongoDB connection failed");
        process.exit(1);
    }
};
