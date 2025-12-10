import { error, reponse } from "../model/response";
import { eq } from "drizzle-orm";
import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "../db/db";
import { users } from "../schema/user";
import { sendError, sendSuccess } from "../utils/responseBuilder";
require("dotenv").config();



const appRoute = Router();
// Replace with a secure secret in production
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          status: false,
          message: 'Invalid or expired token',
          data: JSON.stringify(null),
          error: { code: 403, details: 'Token verification failed' },
        });
      }
      // Attach user info to request if needed
      (req as any).user = user;
      next();
    });
  } else {
    return res.status(401).json({
      status: false,
      message: 'Authorization header missing',
      data: JSON.stringify(null),
      error: { code: 401, details: 'Bearer token required' },
    });
  }
};

appRoute.post('/verify-token', (req: Request, res: Response) => {
  const responseObj = new reponse();
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    responseObj.status = false;
    responseObj.message = 'Token missing';
    responseObj.data = '';
    responseObj.error = { code: 401, details: 'Authorization header missing' };

    return res.status(200).json(responseObj); 
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      responseObj.status = false;
      responseObj.message = 'Invalid or expired token';
      responseObj.data = '';
      responseObj.error = { code: 403, details: err.message };

      return res.status(200).json(responseObj);
    }

    responseObj.status = true;
    responseObj.message = 'Token is valid';
    responseObj.data = '';
    responseObj.error = new error();

    return res.status(200).json(responseObj);
  });
});

appRoute.post('/refresh-token', async (req: Request, res: Response) => {
  const responseObj = new reponse();
  const body = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
  const { refreshToken } = body;

  if (!refreshToken) {
    responseObj.status = false;
    responseObj.message = "Refresh token missing";
    responseObj.data = '';
    responseObj.error = { code: 400, details: "refreshToken is required" };

    return res.status(200).json(responseObj);
  }

  jwt.verify(refreshToken, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) {
      responseObj.status = false;
      responseObj.message = "Invalid or expired refresh token";
      responseObj.data = '';
      responseObj.error = { code: 403, details: err.message };

      return res.status(200).json(responseObj);
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { email: decoded.email, googleUserId: decoded.googleUserId },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    responseObj.status = true;
    responseObj.message = "Refresh token valid";
    responseObj.data = JSON.stringify({ 
      valid: true, 
      accessToken: newAccessToken 
    });
    responseObj.error = new error();

    return res.status(200).json(responseObj);
  });
});





appRoute.post("/login", async (req: Request, res: Response) => {
  try {
    console.log("Incoming Body:", req.body);

    // Parse request body
    const body =
      typeof req.body.data === "string"
        ? JSON.parse(req.body.data)
        : req.body.data;

    const {
      userName: username,
      email,
      photoUrl: profilePicture,
      id: googleUserId,
    } = body;

    // 🛑 Required fields check
    if (!email || !googleUserId || !username) {
      return res
        .status(400)
        .json(sendError("Validation Failed", 400, "username, email & google user id are required"));
    }

    // 🔐 Generate Tokens
    const accessToken = jwt.sign({ email, googleUserId }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign({ email, googleUserId }, JWT_SECRET, {
      expiresIn: "180d",
    });

    const password = ""; // Google user → no password required
    let user: any;

    // 🔍 Check if user exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing.length > 0) {
      // 🔁 Update existing user
      const updated = await db
        .update(users)
        .set({
          username,
          email,
          profilePicture,
          googleUserId,
          password,
        })
        .where(eq(users.email, email))
        .returning();

      user = updated[0];

      return res.status(200).json(
        sendSuccess(
          res,
          true,
          "User updated & logged in",
          { user, accessToken, refreshToken }
          
        )
      );
    } else {
      // ➕ Create new user
      const inserted = await db
        .insert(users)
        .values({
          username,
          email,
          profilePicture,
          password,
          googleUserId,
        })
        .returning();

      user = inserted[0];

      return res.status(200).json(
        sendSuccess(
          res,
          true,
          "User created & logged in successfully",
          { user, accessToken, refreshToken }
          
        )
      );
    }
  } catch (err: any) {
    console.error("Login Error:", err);

    return res
      .status(500)
      .json(sendError("Internal Server Error", 500, err.message));
  }
});

// GET /users
appRoute.post("/users", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);

    return res.status(200).json(
      sendSuccess(res, true, "Users fetched successfully", {
        users: allUsers,
      })
    );
  } catch (err: any) {
    console.error("Fetch Users Error:", err);
    return res
      .status(500)
      .json(sendError("Failed to fetch users", 500, err.message));
  }
});



export default appRoute;
