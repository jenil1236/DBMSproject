import express from "express";
import { adminLogin, checkAdminAuth, adminLogout } from "../controllers/Admin.js";

const router = express.Router();

router
    .post("/login", adminLogin)
    .get("/check", checkAdminAuth)  // Add auth check endpoint
    .get("/logout", adminLogout);   // Add logout endpoint

export default router;