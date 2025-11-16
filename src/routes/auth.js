"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const response_1 = require("../model/response");
const drizzle_orm_1 = require("drizzle-orm");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db/db"));
const user_1 = require("../schema/user");
require("dotenv").config();
const appRoute = (0, express_1.Router)();
// Replace with a secure secret in production
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({
                    status: false,
                    message: 'Invalid or expired token',
                    data: JSON.stringify(null),
                    error: { code: 403, details: 'Token verification failed' },
                });
            }
            // Attach user info to request if needed
            req.user = user;
            next();
        });
    }
    else {
        return res.status(401).json({
            status: false,
            message: 'Authorization header missing',
            data: JSON.stringify(null),
            error: { code: 401, details: 'Bearer token required' },
        });
    }
};
exports.authenticateJWT = authenticateJWT;
appRoute.post('/verify-token', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: false,
            message: 'Token missing',
            data: JSON.stringify(null),
            error: { code: 401, details: 'Authorization header missing' },
        });
    }
    const token = authHeader.split(' ')[1];
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                status: false,
                message: 'Invalid or expired token',
                data: JSON.stringify(null),
                error: { code: 403, details: err.message },
            });
        }
        console.log("token decoded:", decoded);
        return res.status(200).json({
            status: true,
            message: 'Token is valid',
            data: JSON.stringify(decoded),
            error: {},
        });
    });
});
// POST /generate-token
appRoute.post('/authenticate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const responseObj = new response_1.reponse();
    try {
        console.log("Incoming Body:", req.body);
        const body = req.body.data || req.body;
        const { email, id } = typeof body === 'string' ? JSON.parse(body) : body;
        console.log("Incoming Body:", email, "id:", id);
        if (!email || !id) {
            const errObj = new response_1.error();
            errObj.code = 400;
            errObj.details = 'Email and userId are required';
            responseObj.status = false;
            responseObj.message = 'Validation failed';
            responseObj.data = null;
            responseObj.error = errObj;
            return res.status(400).json(responseObj);
        }
        const token = jsonwebtoken_1.default.sign({ email, id }, JWT_SECRET, { expiresIn: '1h' });
        responseObj.status = true;
        responseObj.message = 'Token generated successfully';
        responseObj.data = JSON.stringify({ token }); // ✅ Not stringified!
        responseObj.error = new response_1.error();
        console.log("responseObj : ", responseObj);
        return res.status(200).json(responseObj);
    }
    catch (err) {
        console.error("Authenticate Error:", err);
        const errObj = new response_1.error();
        errObj.code = 500;
        errObj.details = err.message || 'Internal Server Error';
        responseObj.status = false;
        responseObj.message = 'Internal Server Error';
        responseObj.data = null;
        responseObj.error = errObj;
        return res.status(500).json(responseObj);
    }
}));
appRoute.post('/login', exports.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const responseObj = new response_1.reponse();
    try {
        const bodyData = typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body.data;
        const { userName: username, email, photoUrl: profilePicture, id: googleUserId } = bodyData;
        const password = ''; // placeholder for Google users
        if (!username || !email || !googleUserId) {
            const errObj = new response_1.error();
            errObj.code = 400;
            errObj.details = 'All fields are required';
            responseObj.status = false;
            responseObj.message = 'Validation failed';
            responseObj.data = JSON.stringify(null);
            responseObj.error = errObj;
            res.status(400).json(responseObj);
            return;
        }
        const existing = yield db_1.default.select().from(user_1.users).where((0, drizzle_orm_1.eq)(user_1.users.email, email));
        if (existing.length > 0) {
            yield db_1.default
                .update(user_1.users)
                .set({ username, email, profilePicture, password, googleUserId })
                .where((0, drizzle_orm_1.eq)(user_1.users.email, email));
            responseObj.status = true;
            responseObj.message = 'User already exists and was updated';
            responseObj.data = JSON.stringify({ email });
            responseObj.error = new response_1.error(); // or provide a meaningful error object if needed
            res.status(200).json(responseObj);
            return;
        }
        const inserted = yield db_1.default
            .insert(user_1.users)
            .values({ username, email, profilePicture, password, googleUserId })
            .returning({ userKey: user_1.users.userKey }); // assuming `id` is your PK
        responseObj.status = true;
        responseObj.message = 'User created successfully';
        responseObj.data = JSON.stringify({ userKey: inserted[0].userKey });
        responseObj.error = new response_1.error(); // or provide a meaningful error object if needed
        res.status(200).json(responseObj);
        return;
    }
    catch (err) {
        console.error(err);
        const errObj = new response_1.error();
        errObj.code = 500;
        errObj.details = err.message || 'Internal Server Error';
        responseObj.status = false;
        responseObj.message = 'Internal Server Error';
        responseObj.data = JSON.stringify(null);
        responseObj.error = errObj;
        res.status(500).json(responseObj);
        return;
    }
}));
exports.default = appRoute;
