import express, { Request, Response } from "express";
import serverless from "serverless-http";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*", // serverless functions require open CORS unless restricted manually
    methods: ["GET", "POST", "PUT"],
  })
);

// Your routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API running via Netlify Functions!" });
});

// Your auth routes
import appRoute from "../../src/routes/auth";
app.use("/auth", appRoute);

// ❌ DO NOT USE app.listen()
// Netlify handles the server automatically

export const handler = serverless(app);
