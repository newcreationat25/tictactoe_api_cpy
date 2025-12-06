import { error, reponse } from "../model/response";
import { eq } from "drizzle-orm";
import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "../db/db";
import { users } from "../schema/user";
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


// POST /generate-token
// appRoute.post('/authenticate', async (req: Request, res: Response) => {
//   const responseObj = new reponse();

//   try {
//     console.log("Incoming Body:", req.body);

//     const body = req.body.data || req.body;
//     const { email, id } = typeof body === 'string' ? JSON.parse(body) : body;
//     console.log("Incoming Body:", email, "id:", id);

//     if (!email || !id) {
//       const errObj = new error();
//       errObj.code = 400;
//       errObj.details = 'Email and userId are required';

//       responseObj.status = false;
//       responseObj.message = 'Validation failed';
//       responseObj.data = null as any;
//       responseObj.error = errObj;

//       return res.status(400).json(responseObj);
//     }

//     const token = jwt.sign({ email, id }, JWT_SECRET, { expiresIn: '1h' });

//     responseObj.status = true;
//     responseObj.message = 'Token generated successfully';
//     responseObj.data = JSON.stringify({ token }); // ✅ Not stringified!
//     responseObj.error = new error();
//     console.log("responseObj : ", responseObj);
//     return res.status(200).json(responseObj);
//   } catch (err: any) {
//     console.error("Authenticate Error:", err);

//     const errObj = new error();
//     errObj.code = 500;
//     errObj.details = err.message || 'Internal Server Error';

//     responseObj.status = false;
//     responseObj.message = 'Internal Server Error';
//     responseObj.data = null as any;
//     responseObj.error = errObj;

//     return res.status(500).json(responseObj);
//   }
// });



appRoute.post('/login', async (req: Request, res: Response) => {
  const responseObj = new reponse();

  try {
    console.log("Incoming Body:", req.body);

    const body = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;

    const { userName: username, email, photoUrl: profilePicture, id: googleUserId } = body;

    if (!email || !googleUserId || !username) {
      const errObj = new error();
      errObj.code = 400;
      errObj.details = "username, email & google user id are required";

      responseObj.status = false;
      responseObj.message = "Validation Failed";
      responseObj.data = null;
      responseObj.error = errObj;

      return res.status(400).json(responseObj);
    }

    // 🔐 Generate Access + Refresh Tokens
    const accessToken = jwt.sign(
      { email, googleUserId },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { email, googleUserId },
      JWT_SECRET,
      { expiresIn: "180d" }
    );

    // Store refreshToken in DB OR Redis (recommended)
    // For now storing directly in DB user table (simple)
    const password = ""; // Google users don't have password

    let user: any;
    const existing = await db.select().from(users).where(eq(users.email, email));

    if (existing.length > 0) {
      // update user
      const updated = await db
        .update(users)
        .set({
          username,
          email,
          profilePicture,
          googleUserId,
          password
         // refreshToken, // save refresh
        })
        .where(eq(users.email, email))
        .returning();

      user = updated[0];

      responseObj.message = "User updated & logged in";
    } else {
      // insert new user
      const inserted = await db
        .insert(users)
        .values({
          username,
          email,
          profilePicture,
          password,
          googleUserId
        })
        .returning();

      user = inserted[0];

      responseObj.message = "User created & logged in successfully";
    }

    // Construct response object
    responseObj.status = true;
    responseObj.data = JSON.stringify({
      user,
      accessToken,
      refreshToken,
    });
    responseObj.error = new error();

    return res.status(200).json(responseObj);
  } catch (err: any) {
    console.log("Error:", err);

    const errObj = new error();
    errObj.code = 500;
    errObj.details = err.message;

    responseObj.status = false;
    responseObj.message = "Internal Server Error";
    responseObj.data = null;
    responseObj.error = errObj;

    return res.status(500).json(responseObj);
  }
});



export default appRoute;
