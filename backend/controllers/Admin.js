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
}