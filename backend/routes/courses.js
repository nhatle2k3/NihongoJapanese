const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Lấy danh sách tất cả khóa học
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM courses ORDER BY level DESC, id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Đã xảy ra lỗi hệ thống khi lấy danh sách khóa học.' });
  }
});

// Lấy danh sách các khóa học mà học viên đã đăng ký
router.get('/enrolled', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, e.enrolled_at 
       FROM courses c 
       JOIN enrollments e ON c.id = e.course_id 
       WHERE e.user_id = $1 
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Đã xảy ra lỗi hệ thống.' });
  }
});

// Đăng ký khóa học
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;

  try {
    // Kiểm tra khóa học tồn tại
    const courseCheck = await db.query('SELECT id FROM courses WHERE id = $1', [courseId]);
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học này.' });
    }

    // Đăng ký khóa học (sử dụng ON CONFLICT để tránh lỗi nếu đã đăng ký rồi)
    await db.query(
      `INSERT INTO enrollments (user_id, course_id) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [userId, courseId]
    );

    res.json({ message: 'Đăng ký khóa học thành công.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Đã xảy ra lỗi hệ thống.' });
  }
});

// Xem chi tiết khóa học
router.get('/:id', async (req, res) => {
  const courseId = req.params.id;
  try {
    const result = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Đã xảy ra lỗi hệ thống.' });
  }
});

module.exports = router;
