import "dotenv/config";
import app from "./app.js";
import pool from "./db.js";

const PORT = Number(process.env.PORT || 3000);
const HOST = "0.0.0.0";

async function startServer() {
  try {
    await pool.query("SELECT 1");

    const server = app.listen(PORT, HOST, () => {
      console.log(`Skalbart API running on port ${PORT}`);
      console.log(
        `Instance: ${process.env.INSTANCE_NAME || "api-1"}`
      );
    });

    const shutdown = () => {
      console.log("Shutting down server...");

      server.close(async () => {
        try {
          await pool.end();
          process.exit(0);
        } catch (error) {
          console.error("Error closing database pool:", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Failed to start the API:", error.message);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

startServer();