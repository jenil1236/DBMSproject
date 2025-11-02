import pool from '../config/db.js';

// 📘 Get all announcements
export const getAllAnnouncements = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements ORDER BY date DESC');
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ success: false, message: 'Error fetching announcements' });
  }
};

// 📗 Create announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { title, body, issued_by } = req.body;
    if (!title || !body || !issued_by)
      return res.status(400).json({ success: false, message: 'Missing required fields' });

    // Call the stored procedure to create announcement
    const [result] = await pool.execute(
      "CALL CreateAnnouncement(?, ?, ?, @announcement_id, @error_code, @error_message)",
      [title, body, issued_by]
    );

    // Get the output parameters
    const [outputs] = await pool.execute(
      "SELECT @announcement_id as announcement_id, @error_code as error_code, @error_message as error_message"
    );

    const { announcement_id, error_code, error_message } = outputs[0];

    // Check if there was an error
    if (error_code !== 0) {
      console.error(`Database error: ${error_code} - ${error_message}`);
      return res.status(500).json({ success: false, message: 'Server error while creating announcement' });
    }

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: { id: announcement_id, title, body, issued_by }
    });
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ success: false, message: 'Server error while creating announcement' });
  }
};

// ✏️ Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, issued_by } = req.body;

    const [result] = await pool.query(
      `SELECT UpdateAnnouncement(?, ?, ?, ?) as affectedRows`,
      [title, body, issued_by, id]
    );

    if (result[0].affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Announcement not found' });

    res.json({ success: true, message: 'Announcement updated successfully' });
  } catch (err) {
    console.error('Error updating announcement:', err);
    res.status(500).json({ success: false, message: 'Error updating announcement' });
  }
};

// ❌ Delete announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('SELECT DeleteAnnouncement(?) as affectedRows', [id]);

    if (result[0].affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Announcement not found' });

    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    res.status(500).json({ success: false, message: 'Error deleting announcement' });
  }
};
