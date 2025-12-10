import express from "express";
import cors from "cors";
import appRoute from "./routes/auth";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", appRoute);
app.use("/analytics", analyticsRoute);

app.get("/", (req, res) => {
  res.send("TypeScript Server is Running!!");
});


export const handler = app;




