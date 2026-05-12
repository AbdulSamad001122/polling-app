import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import connectDb from "./src/common/config/dbConnect.js";
import createApp from "./src/app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = Number(process.env.PORT) || 3000;

import http from "http";
import { initSocket } from "./src/common/config/socket.js";

async function start() {
  await connectDb();
  const app = createApp();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`Server listening on http://127.0.0.1:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
