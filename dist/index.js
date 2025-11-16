"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
console.log("Loaded PORT:", process.env.PORT);
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ["http://localhost:4200"],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
}));
// ✅ Use your auth routes
app.use("/api/auth", auth_1.default);
// ✅ Root test route
app.get("/", (req, res) => {
    res.send("TypeScript Server is Running!!");
});
// ✅ Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is Running on port ${PORT}`);
});
