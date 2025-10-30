import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const adminLogin = async (req, res) => {
    const { adminUserName, password } = req.body;
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM admin WHERE adminUserName = ?",
            [adminUserName]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const admin = rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Create admin session (compatible with user sessions)
        req.login(admin, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Error creating session" });
            }
            
            // Login successful with session
            res.json({ 
                message: "Logged in successfully", 
                admin: { 
                    id: admin.id, 
                    adminUserName: admin.adminUserName,
                    role: 'admin'  // Add role for frontend differentiation
                } 
            });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error logging in" });
    }
}

// Add admin auth check
export const checkAdminAuth = (req, res) => {
    console.log('Admin auth check - isAuthenticated:', req.isAuthenticated());
    console.log('Admin auth check - user:', req.user);
    
    if (req.isAuthenticated() && req.user && req.user.adminUserName) { // Check if it's an admin
        res.json({ 
            admin: {
                id: req.user.id,
                adminUserName: req.user.adminUserName,
                role: 'admin'
            }
        });
    } else {
        res.status(401).json({ error: "Not authenticated as admin" });
    }
}

// Admin logout
export const adminLogout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: "Error logging out" });
        }
        res.json({ message: "Admin logged out successfully" });
    });
}