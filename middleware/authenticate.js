// middleware/authenticate.js
import jwt from "jsonwebtoken";

export default function authenticate(req, res, next) {
  try {
    // Allow public auth routes
    if (req.path.startsWith("/auth")) return next();

    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
