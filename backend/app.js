// app.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import passport from "passport";
import bcrypt from "bcryptjs";
import cors from "cors";

import setupPassport from "./config/passport.js";
import pool from "./config/db.js";
import isAuthenticated from "./middleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://localhost:5173", // your React/Vite frontend
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  }
}));

app.use(passport.initialize());
app.use(passport.session());
setupPassport(passport);

// ----------------- Routes -----------------

// Register
app.post("/api/register", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed]
    );
    res.send({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error registering user" });
  }
});

// Local login
app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).send({ error: "Invalid credentials" });
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.send({ message: "Logged in successfully", user });
    });
  })(req, res, next);
});

// Google OAuth
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failure" }),
  (req, res) => {
    // redirect to frontend
    res.redirect("http://localhost:5173");
  }
);

// Login failure
app.get("/api/login-failure", (req, res) => {
  res.status(401).send({ error: "Login failed" });
});

// Logout
app.get("/api/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.send({ message: "Logged out successfully" });
  });
});

app.post("/api/admin/login", async (req, res) => {
    const { adminUserName, password } = req.body;
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM admin WHERE adminUserName = ?",
            [adminUserName]
        );

        if (rows.length === 0) {
            return res.status(401).send({ error: "Invalid username or password" });
        }

        const admin = rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).send({ error: "Invalid username or password" });
        }

        // Login successful
        res.send({ message: "Logged in successfully", admin: { id: admin.id, adminUserName: admin.adminUserName } });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Error logging in" });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
