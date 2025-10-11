import express from "express";
const router = express.Router();

import isAuthenticated from "../middlewares/isAuthenticated.js";
import { checkSubmit } from "../middlewares.js";
import { getSubmission, postSubmission } from "../controllers/Submission.js";

router.get("/:id", isAuthenticated, getSubmission)

.post("/:id", isAuthenticated, checkSubmit, postSubmission);

export default router;