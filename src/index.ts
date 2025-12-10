import express from "express";
import cors from "cors";
import appRoute from "./routes/auth";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("TypeScript Server is Running!!");
});

app.use("/api/auth", appRoute);
app.use("/analytics", analyticsRoute);
export const handler = app;



