import bcrypt from "bcryptjs";
import passport from "passport";
import pool from "../config/db.js";

export const registerUser = async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);
        
        // Insert new user
        const [result] = await pool.execute(
            "INSERT INTO user (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashed]
        );

        // Get the newly created user
        const [users] = await pool.execute(
            "SELECT id, username, email FROM user WHERE id = ?",
            [result.insertId]
        );
        
        const newUser = users[0];
        
        // Auto-login the user after registration
        req.login(newUser, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ error: "Error logging in after registration" });
            }
            res.send({ 
                message: "User registered successfully", 
                user: {
                    id: newUser.id,
                    name: newUser.username,
                    username: newUser.username,
                    email: newUser.email
                }
            });
        });
        
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).send({ error: "Username or email already exists" });
        }
        res.status(500).send({ error: "Error registering user" });
    }
}

// In /controllers/Auth.js - loginUser function
export const loginUser = (req, res, next) => {
    passport.authenticate("local", (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(401).send({ error: "Invalid credentials" });
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.send({ 
                message: "Logged in successfully", 
                user: {
                    id: user.id,
                    name: user.username,  // Frontend expects 'name'
                    username: user.username,
                    email: user.email
                }
            });
        });
    })(req, res, next);
}

export const login_fail = (req, res) => {
    res.status(401).send({ error: "Login failed" });
}

export const logoutUser = (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.send({ message: "Logged out successfully" });
    });
}

// Add to /controllers/Auth.js
export const checkAuth = (req, res) => {
    if (req.isAuthenticated()) {
        console.log("checkAuth")
        console.log(req.user);
        res.send({ 
            user: {
                id: req.user.id,
                name: req.user.username,
                username: req.user.username,
                email: req.user.email
            }
        });
    } else {
        console.log("unauthorised of checkAuth");
        res.status(401).send({ error: "Not authenticated" });
    }
}

