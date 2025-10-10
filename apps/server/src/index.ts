import express from "express";
import type { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the web app's build directory
app.use(express.static(path.join(__dirname, "../../web/dist")));

// API routes
app.get("/api/health", (req, res) => {
	console.log("Health check");
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Catch-all handler: send back web's index.html file for client-side routing
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, "../../web/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
