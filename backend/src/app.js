import express from "express";
import cors from "cors";
import healthRoutes from "./modules/health/health.routes.js";
import clerkWebhookRouter from "./modules/webhooks/clerk.route.js";
import pollRoutes from "./modules/polls/poll.route.js";
import { clerkMiddleware } from "@clerk/express";
import { globalRateLimiter } from "./common/middleware/rate-limit.middleware.js";
import { globalErrorHandler } from "./common/middleware/global-error.middleware.js";
import helmet from "helmet";

function createApp() {
    const app = express();

    app.use(healthRoutes);
    app.use(cors({
        origin: ["https://my-polra.vercel.app"],
        credentials: true,
    }));
    app.use(helmet());
    app.disable("x-powered-by");
    app.use(clerkWebhookRouter);
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true, limit: "1mb" }));
    app.set('trust proxy', 1);
    app.use(clerkMiddleware());
    
    app.use(globalRateLimiter);
    app.use(pollRoutes);

    app.use(globalErrorHandler);

    return app;
}

export default createApp;
