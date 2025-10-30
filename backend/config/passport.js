// config/passport.js
import dotenv from "dotenv";
dotenv.config();
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import pool from "./db.js";

// 🔹 Local strategy
export default function setupPassport(passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const [rows] = await pool.query("SELECT * FROM user WHERE username = ?", [username]);
        const user = rows[0];
        if (!user) return done(null, false, { message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: "Wrong password" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // 🔹 Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value || null;
          const username = profile.displayName;

          const [rows] = await pool.query("SELECT * FROM user WHERE google_id = ?", [googleId]);
          let user = rows[0];

          if (!user) {
            const [result] = await pool.query(
              "INSERT INTO user (username, email, google_id) VALUES (?, ?, ?)",
              [username, email, googleId]
            );
            user = { id: result.insertId, username, email, google_id: googleId };
          }

          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );

  // 🔹 Serialize / Deserialize
  passport.serializeUser((user, done) => done(null, user.id));

  // In config/passport.js - update deserializeUser
  passport.deserializeUser(async (id, done) => {
    try {
      // First try to find in user table
      const [userRows] = await pool.query("SELECT * FROM user WHERE id = ?", [id]);
      if (userRows.length > 0) {
        return done(null, userRows[0]);
      }

      // If not found in user table, try admin table
      const [adminRows] = await pool.query("SELECT * FROM admin WHERE id = ?", [id]);
      if (adminRows.length > 0) {
        return done(null, adminRows[0]);
      }

      // User not found
      done(null, false);
    } catch (err) {
      done(err);
    }
  });
}
