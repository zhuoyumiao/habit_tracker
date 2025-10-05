// routes/stats.js
import { Router } from "express";
import jwt from "jsonwebtoken";
const router = Router();

router.post(async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    next(e);
  }
});

export default router;
