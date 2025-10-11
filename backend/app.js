// app.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import passport from "passport";
// import bcrypt from "bcryptjs";
import cors from "cors";

import setupPassport from "./config/passport.js";
// import pool from "./config/db.js";
// import isAuthenticated from "./middleware.js";

import authRoutes from "./routes/AuthRoutes.js";
import adminRoutes from "./routes/AdminRoutes.js";
import submissionRoutes from "./routes/SubmissionRoutes.js";
import testRoutes from "./routes/TestRoutes.js";
import announcementRoutes from "./routes/AnnouncementRoutes.js";
import otherRoutes from "./routes/OtherRoutes.js";

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
app.use("/api", otherRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/submission", submissionRoutes);
app.use("/api/test", testRoutes);
app.use("/api/announcement", announcementRoutes);

// app.get("/leaderboard", isAdmin, async (req, res) => {
//     try {
//         const users = await User.find({})
//             .populate({
//                 path: "submissions.test_id",   // populate test details
//                 model: "Test",
//                 select: "testName branch totalMarks" // limit fields if needed
//             })
//             .lean(); // faster read-only objects

//         res.status(200).json(users);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// app.get("/stats", isAdmin, async (req, res) => {
//   try {
//     const now = new Date();

//     // Count users
//     const totalUsers = await User.countDocuments();

//     // Fetch all tests once for efficiency
//     const tests = await Test.find({}, "startTime endTime");

//     // Calculate counts
//     let activeTests = 0;
//     let completedTests = 0;
//     let upcomingTests = 0;

//     tests.forEach(test => {
//       const start = new Date(test.startTime);
//       const end = new Date(test.endTime);

//       if (start <= now && end >= now) {
//         activeTests++;
//       } else if (end < now) {
//         completedTests++;
//       } else if (start > now) {
//         upcomingTests++;
//       }
//     });

//     res.status(200).json({
//       success: true,
//       totalUsers,
//       activeTests,
//       completedTests,
//       upcomingTests
//     });
//   } catch (err) {
//     console.error("Error fetching stats:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// Error Handler
app.use((err, req, res, next) => {
    let { status = 500, message = "Sorry! Some error occurred." } = err;
    err.status = status;
    err.message = message;
    res.status(status).render("error", { err });
});
//.......

// Page not found error as middleware
app.use((req, res) => {
    res.status(404).send("Page not found")
});


// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
