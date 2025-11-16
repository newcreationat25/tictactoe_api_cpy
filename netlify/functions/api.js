"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("../../src/routes/auth"));
require("dotenv").config();
const app = (0, express_1.default)();
// CORS
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/auth", auth_1.default);
app.get("/", (req, res) => {
    res.send("Netlify Express API running!");
});
// Wrap Express into Netlify function
exports.handler = (0, serverless_http_1.default)(app);
