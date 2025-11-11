// middleware/isAdmin.js
export default function isAdmin(req, res, next) {
  try {
    // assuming req.user is set by your auth middleware
    if (req.user?.role === "admin") return next();
    return res.status(403).json({ error: "Admin only" });
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
