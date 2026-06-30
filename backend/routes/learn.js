const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Middleware kiểm tra xem học viên đã đăng ký khóa học chưa (hoặc là admin)
async function checkEnrollment(req, res, next) {
  const courseId = req.params.courseId;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole === 'admin') {
    return next();
  }

  try {
    const result = await db.query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Bạn cần đăng ký khóa học này trước khi truy cập nội dung bài học.' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi kiểm tra thông tin đăng ký.' });
  }
}

// Lấy danh sách từ vựng của khóa học
router.get('/courses/:courseId/vocabulary', authenticateToken, checkEnrollment, async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const result = await db.query(
      'SELECT * FROM vocabulary WHERE course_id = $1 ORDER BY id ASC',
      [courseId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách từ vựng.' });
  }
});

// Lấy danh sách mẫu câu ngữ pháp của khóa học
router.get('/courses/:courseId/grammar', authenticateToken, checkEnrollment, async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const result = await db.query(
      'SELECT * FROM grammar_patterns WHERE course_id = $1 ORDER BY id ASC',
      [courseId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách mẫu câu.' });
  }
});

module.exports = router;
