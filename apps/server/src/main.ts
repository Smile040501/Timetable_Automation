import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";

import { connectDB, corsOptions } from "./config";

import { credentials, errorHandler, rateLimitHandler } from "./middlewares";

import algorithmRoutes from "./routes/algorithm";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import courseRoutes from "./routes/course";
import roomRoutes from "./routes/room";
import slotRoutes from "./routes/slot";
import redisClient from "./utils/redisConnect";

const app = express();

// Connect to MongoDB
connectDB();

// Can define rate-limiting as a middleware differently for different requests
// Don't define it before serving static files
app.use(rateLimitHandler);

// Add security headers to response
app.use(helmet());

// Compress the response bodies
app.use(compression());

// Prevent MongoDB Operator Injection
app.use(mongoSanitize());

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
// app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

// middleware for cookies
app.use(cookieParser());

// Define app routes here
app.use("/api/algorithm", algorithmRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/slots", slotRoutes);

// Error handler
app.use(errorHandler);

const port = process.env.PORT || 3000;

// Start listening on the server when connected to mongodb
mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB!");
    app.listen(port, () => {
        console.log(`Listening at http://localhost:${port}`);
    });
});

process.on("SIGINT", async () => {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
    process.exit();
});
