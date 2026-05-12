import { Router } from "express";
import express from "express";
import { webhookController } from "./clerk.controller.js";
import { authRateLimiter } from "../../common/middleware/rate-limit.middleware.js";

const router = Router();

router.post("/webhook/clerk", authRateLimiter, express.raw({ type: "application/json" }), webhookController);

export default router;
