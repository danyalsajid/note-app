import express from "express";
import type { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3001;

// Health check
app.get("/api/health", (req, res) => {
	console.log("Health check");
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
