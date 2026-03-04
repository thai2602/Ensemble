import jwt from "jsonwebtoken";
import User from "../models/Users.js";

export const isAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, tokenFromHeader] = header.split(" ");
    let token = scheme === "Bearer" ? tokenFromHeader : null;

    if (!token && req.cookies?.token) token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "No token provided" });
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "Server misconfigured" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // { _id, email, role, ... }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, tokenFromHeader] = header.split(" ");
    const token = scheme === "Bearer" ? tokenFromHeader : (req.cookies?.token || null);

    if (token && process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    }
  } catch {}
  next();
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
