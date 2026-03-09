import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const COOKIE_NAME = "cartevite_token";

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const cookieOptions = {
  httpOnly: true,
  secure: false, // ✅ DEV HTTP
  sameSite: "lax", // ✅ DEV cross-port ok su localhost
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email e password obbligatorie" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Email già registrata" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
    });

    const token = createToken(user._id);

    res.cookie(COOKIE_NAME, token, cookieOptions);

    res.status(201).json({
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Errore server" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email e password obbligatorie" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Credenziali non valide" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Credenziali non valide" });
    }

    const token = createToken(user._id);
    res.cookie(COOKIE_NAME, token, cookieOptions);

    res.json({
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Errore server" });
  }
});

// --- GOOGLE SSO LOGIN ---
router.post("/google", async (req, res) => {
  try {
    console.log("GOOGLE LOGIN PAYLOAD:", req.body);
    
    // Supporto ibrido: react-oauth può inviare oggetti diversi in base al flow
    const access_token = req.body.access_token || req.body.credential || req.body.token || (req.body.code ? req.body.code : null);

    if (!access_token) {
      return res.status(400).json({ message: "Token Google mancante nel payload", details: req.body });
    }

    // Richiesta a Google userInfo API usando l'access token
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google verify info Error:", errorText);
      return res.status(401).json({ message: "Token Google non valido o scaduto" });
    }
    
    const payload = await response.json();
    const { email, sub: googleId } = payload; // sub is the unique user ID from Google

    if (!email) {
      return res.status(400).json({ message: "Email non fornita da Google" });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new SSO user
      user = await User.create({
        email: email.toLowerCase(),
        authProvider: "google",
        googleId: googleId,
        // passwordHash is omitted naturally since missing
      });
    } else {
      // Optional: Update existing user to link google accounts if they registered locally first
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google"; // Upgrade to Google provider or keep mixed
        await user.save();
      }
    }

    // Sign proprietary JWT like usual
    const token = createToken(user._id);
    res.cookie(COOKIE_NAME, token, cookieOptions);

    res.json({
      user: { id: user._id, email: user.email },
    });

  } catch (err) {
    console.error("GOOGLE SSO ERROR:", err);
    res.status(500).json({ message: "Errore autenticazione Google SSO" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.json({ message: "Logout ok" });
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "Non loggato" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("_id email");
    if (!user) return res.status(401).json({ message: "Non loggato" });

    res.json({ user });
  } catch {
    res.status(401).json({ message: "Non loggato" });
  }
});

export default router;
