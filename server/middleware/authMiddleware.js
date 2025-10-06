import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded.userId, decoded.role
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    res.status(403).json({ msg: "Invalid or expired token" });
  }
};
