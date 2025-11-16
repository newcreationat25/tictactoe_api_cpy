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

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
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
appRoute.post('/authenticate', async (req: Request, res: Response) => {
  const responseObj = new reponse();

  try {
    console.log("Incoming Body:", req.body);

    const body = req.body.data || req.body;
    const { email, id } = typeof body === 'string' ? JSON.parse(body) : body;
    console.log("Incoming Body:", email, "id:", id);

    if (!email || !id) {
      const errObj = new error();
      errObj.code = 400;
      errObj.details = 'Email and userId are required';

      responseObj.status = false;
      responseObj.message = 'Validation failed';
      responseObj.data = null as any;
      responseObj.error = errObj;

      return res.status(400).json(responseObj);
    }

    const token = jwt.sign({ email, id }, JWT_SECRET, { expiresIn: '1h' });

    responseObj.status = true;
    responseObj.message = 'Token generated successfully';
    responseObj.data = JSON.stringify({ token }); // ✅ Not stringified!
    responseObj.error = new error();
    console.log("responseObj : ", responseObj);
    return res.status(200).json(responseObj);
  } catch (err: any) {
    console.error("Authenticate Error:", err);

    const errObj = new error();
    errObj.code = 500;
    errObj.details = err.message || 'Internal Server Error';

    responseObj.status = false;
    responseObj.message = 'Internal Server Error';
    responseObj.data = null as any;
    responseObj.error = errObj;

    return res.status(500).json(responseObj);
  }
});



appRoute.post('/login', authenticateJWT, async (req: Request, res: Response) => {
  const responseObj = new reponse();

  try {
    const bodyData = typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body.data;
    const { userName: username, email, photoUrl: profilePicture, id: googleUserId } = bodyData;


    const password = ''; // placeholder for Google users

    if (!username || !email || !googleUserId) {
      const errObj = new error();
      errObj.code = 400;
      errObj.details = 'All fields are required';

      responseObj.status = false;
      responseObj.message = 'Validation failed';
      responseObj.data = JSON.stringify(null);
      responseObj.error = errObj;

      res.status(400).json(responseObj);
      return;
    }

    const existing = await db.select().from(users).where(eq(users.email, email));

    if (existing.length > 0) {
      await db
        .update(users)
        .set({ username, email, profilePicture, password, googleUserId })
        .where(eq(users.email, email));

      responseObj.status = true;
      responseObj.message = 'User already exists and was updated';
      responseObj.data = JSON.stringify({ email });
      responseObj.error = new error(); // or provide a meaningful error object if needed

      res.status(200).json(responseObj);
      return;
    }

    const inserted = await db
      .insert(users)
      .values({ username, email, profilePicture, password, googleUserId })
      .returning({ userKey: users.userKey }); // assuming `id` is your PK

    responseObj.status = true;
    responseObj.message = 'User created successfully';
    responseObj.data = JSON.stringify({ userKey: inserted[0].userKey });
    responseObj.error = new error(); // or provide a meaningful error object if needed

    res.status(200).json(responseObj);
    return;
  } catch (err: any) {
    console.error(err);

    const errObj = new error();
    errObj.code = 500;
    errObj.details = err.message || 'Internal Server Error';

    responseObj.status = false;
    responseObj.message = 'Internal Server Error';
    responseObj.data = JSON.stringify(null);
    responseObj.error = errObj;

    res.status(500).json(responseObj);
    return;
  }
});


export default appRoute;
