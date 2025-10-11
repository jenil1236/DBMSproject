// export const allAnnouncements = async (req, res) => {
//     let allAnnouncements = await Announcement.find({});
//     allAnnouncements.reverse();
//     res.render("user/announcement.ejs", { allAnnouncements, page: "announcement" });
// }

// export const newAnnouncementForm = (req, res) => {
//     res.render("announcementForm.ejs");
// }

// export const createAnnouncement = async (req, res) => {
//     let announcement = req.body;
//     let now = new Date();
//     let date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
//     newAnnouncement = new Announcement({ ...announcement, date });
//     await newAnnouncement.save();
//     res.redirect("/dashboard");
// }

// export const deleteAnnouncement = async (req, res) => {
//     let { id } = req.params;
//     await Announcement.findByIdAndDelete(id);
//     res.redirect("/dashboard");
// }

// export const editAnnouncementForm = async (req, res) => {
//     let { id } = req.params;
//     let announcement = await Announcement.findById(id);
//     res.render("announcementEditForm.ejs", { id, announcement });
// }

// export const updateAnnouncement = async (req, res) => {
//     let { id } = req.params;
//     let announcement = await Announcement.findById(id);
//     await Announcement.findByIdAndUpdate(id, { ...req.body })
//     res.redirect("/dashboard");
// }