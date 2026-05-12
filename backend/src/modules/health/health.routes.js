import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    database: {
      connected,
      state: ["disconnected", "connected", "connecting", "disconnecting"][
        mongoose.connection.readyState
      ],
    },
  });
});

export default router;
