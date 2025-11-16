import express, { Request, Response } from "express";
import cors from "cors";
import appRoute from "./routes/auth";

console.log("Loaded PORT:", process.env.PORT);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:4200"],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  })
);

// ✅ Use your auth routes
app.use("/api/auth", appRoute);

// ✅ Root test route
app.get("/", (req: Request, res: Response) => {
  res.send("TypeScript Server is Running!!");
});



// // ✅ Start the server
// app.listen(PORT, () => {
//   console.log(`🚀 Server is Running on port ${PORT}`);
// });
export default app;
