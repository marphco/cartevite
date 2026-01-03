import jwt from "jsonwebtoken";

const COOKIE_NAME = "ynvio_token";

export default function requireAuth(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME];

    console.log("---- AUTH CHECK ----");
    console.log("PATH:", req.originalUrl);
    console.log("COOKIE PRESENT:", !!token);

    if (!token) {
      return res.status(401).json({ message: "Non autorizzato" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED USERID:", decoded.userId);

    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.log("AUTH ERROR:", err.message);
    return res.status(401).json({ message: "Non autorizzato" });
  }
}
