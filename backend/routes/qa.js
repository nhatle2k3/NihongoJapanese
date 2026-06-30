const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Lấy danh sách câu hỏi hỏi đáp
// Học viên chỉ thấy câu hỏi của chính mình. Admin thấy tất cả câu hỏi.
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let queryText = '';
    let queryParams = [];

    if (userRole === 'admin') {
      queryText = `
        SELECT q.*, u.username AS student_name, a.username AS admin_name
        FROM qa_messages q
        JOIN users u ON q.user_id = u.id
        LEFT JOIN users a ON q.answered_by = a.id
        ORDER BY q.created_at DESC
      `;
    } else {
      queryText = `
        SELECT q.*, u.username AS student_name, a.username AS admin_name
        FROM qa_messages q
        JOIN users u ON q.user_id = u.id
        LEFT JOIN users a ON q.answered_by = a.id
        WHERE q.user_id = $1
        ORDER BY q.created_at DESC
      `;
      queryParams = [userId];
    }

    const result = await db.query(queryText, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách hỏi đáp.' });
  }
});

// Học viên gửi câu hỏi mới
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { question } = req.body;

  if (!question || question.trim() === '') {
    return res.status(400).json({ error: 'Nội dung câu hỏi không được để trống.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO qa_messages (user_id, question) 
       VALUES ($1, $2) 
       RETURNING *`,
      [userId, question]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi gửi câu hỏi.' });
  }
});

module.exports = router;
