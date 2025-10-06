// routes/stats.js
import { Router } from "express";
import jwt from "jsonwebtoken";
const router = Router();

export default async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    next(e);
  }
}
