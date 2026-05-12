import { Webhook } from "svix";
import ApiError from "../../common/utils/api-error.js";
import ApiResponse from "../../common/utils/api.response.js";
import { clerkWebhookService } from "./clerk.service.js";

export const webhookController = async (req, res) => {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET ?? process.env.CLERK_WEBHOOK_SECRET;

  console.log("Signing secret status:", signingSecret ? "Configured" : "MISSING");
  if (!signingSecret) {
    const err = ApiError.internalServerError(
      "Clerk webhook signing secret is not configured"
    );
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  if (!Buffer.isBuffer(req.body)) {
    const err = ApiError.badRequest(
      "Expected raw JSON body for webhook verification"
    );
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  try {
    console.log("Processing webhook...");
    const wh = new Webhook(signingSecret);
    const event = wh.verify(req.body, req.headers);
    console.log("Webhook verified, type:", event.type);
    await clerkWebhookService(event);
    return ApiResponse.ok(res, "Webhook processed", { received: true });

  } catch (err) {
    console.error("Webhook error:", err.message);
    const apiErr = ApiError.unauthorized("Invalid webhook signature");
    return res.status(apiErr.statusCode).json({ success: false, message: apiErr.message });
  }
};
