import express from "express";
import type { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3001;

app.get("/health", (req: Request, res: Response) => {
  console.log("Health check");
    res.json({ message: "Hello Express!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
