import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import appRoute from "../../src/routes/auth";

const app = express();

app.use(cors());
app.use(express.json());

// Mount your auth routes
app.use("/api/auth", appRoute);

app.get("/", (req, res) => {
  res.send("Netlify Express API is running!");
});

export const handler = serverless(app);
