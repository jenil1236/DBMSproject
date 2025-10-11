import express from "express";
import passport from "passport";
import { registerUser, loginUser, login_fail, logoutUser, checkAuth } from "../controllers/Auth.js";

const router = express.Router();

router

    .post("/register", registerUser)

    // Local login
    .post("/login", loginUser)

    // Google OAuth
    .get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

    // In /routes/AuthRoutes.js - update Google callback
    .get("/google/callback",
        passport.authenticate("google", {
            failureRedirect: "http://localhost:5173/login?error=auth_failed"
        }),
        (req, res) => {
            // Successful authentication
            res.redirect("http://localhost:5173");
        }
    )
    // Login failure
    .get("/login-failure", login_fail)

    // Logout
    .get("/logout", logoutUser)

    // Add to /routes/AuthRoutes.js
    .get("/check", checkAuth);


export default router;