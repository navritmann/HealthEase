import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // normalize
    req.user = {
      id: decoded.userId || decoded.id,
      userId: decoded.userId || decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
};

export const adminCheck = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ msg: "Admin access only" });
  next();
};

// ✅ NEW: doctor-only guard
export const doctorCheck = (req, res, next) => {
  if (req.user?.role !== "doctor") {
    return res.status(403).json({ msg: "Doctor access only" });
  }
  next();
};
