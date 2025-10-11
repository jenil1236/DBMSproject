import express from "express";
const router = express.Router();

import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares.js";
import Announcement from "../models/Announcement.js";

import { allAnnouncements, newAnnouncementForm, createAnnouncement, deleteAnnouncement, editAnnouncementForm, updateAnnouncement } from "../controllers/Announcements.js";

router.get("/", isAuthenticated, allAnnouncements);

router.get("/new", isAdmin, newAnnouncementForm);

//Create Announcement
router.post("/new", isAdmin, createAnnouncement)

//Delete Announcement
router.delete("/:id", isAdmin, deleteAnnouncement);

//Show Announcement Edit Form
router.get("/:id", isAdmin, editAnnouncementForm);

//Update Announcement
router.put("/:id", isAdmin, updateAnnouncement);

export default router;