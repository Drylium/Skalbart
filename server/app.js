import express from "express";
import bookingRoutes from "./routes/bookings.js";

const app = express();

app.use(express.json({ limit: "100kb" }));

// API-startsida
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Skalbart Booking API",
  });
});

// Identifiera den körande instansen
app.get("/instance", (req, res) => {
  res.status(200).json({
    instance: process.env.INSTANCE_NAME || "api-1",
  });
});

// Bokningsendpoints
app.use("/bookings", bookingRoutes);

// Ogiltig JSON
app.use((err, req, res, next) => {
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      error: "Invalid JSON",
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      error: "Request body is too large",
    });
  }

  next(err);
});

// Endpoint som inte finns
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
  });
});

// Generell felhantering
app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: "Internal server error",
  });
});

export default app;