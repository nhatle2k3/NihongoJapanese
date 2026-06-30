const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Lấy danh sách bài kiểm tra của khóa học
router.get('/courses/:courseId', authenticateToken, async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const result = await db.query(
      'SELECT * FROM tests WHERE course_id = $1 ORDER BY id ASC',
      [courseId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách bài kiểm tra.' });
  }
});

// Lấy chi tiết câu hỏi của một bài kiểm tra (ẩn đáp án đúng khi gửi về client)
router.get('/:id', authenticateToken, async (req, res) => {
  const testId = req.params.id;
  try {
    // Lấy thông tin bài test
    const testResult = await db.query('SELECT * FROM tests WHERE id = $1', [testId]);
    if (testResult.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bài kiểm tra.' });
    }

    // Lấy danh sách câu hỏi (chỉ lấy câu hỏi và các lựa chọn, ẩn đi correct_option để chống gian lận)
    const questionsResult = await db.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d 
       FROM test_questions 
       WHERE test_id = $1 
       ORDER BY id ASC`,
      [testId]
    );

    res.json({
      test: testResult.rows[0],
      questions: questionsResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi lấy chi tiết bài kiểm tra.' });
  }
});

// Nộp bài kiểm tra và tính điểm
router.post('/:id/submit', authenticateToken, async (req, res) => {
  const testId = req.params.id;
  const userId = req.user.id;
  const { answers } = req.body; // Dạng { "questionId1": "A", "questionId2": "B" }

  if (!answers) {
    return res.status(400).json({ error: 'Dữ liệu bài làm không hợp lệ.' });
  }

  try {
    // Lấy đáp án đúng từ DB
    const questionsResult = await db.query(
      'SELECT id, correct_option FROM test_questions WHERE test_id = $1',
      [testId]
    );

    if (questionsResult.rows.length === 0) {
      return res.status(400).json({ error: 'Bài kiểm tra không có câu hỏi nào.' });
    }

    let correctCount = 0;
    const totalQuestions = questionsResult.rows.length;

    // So sánh đáp án
    questionsResult.rows.forEach(q => {
      const userAnswer = answers[q.id];
      if (userAnswer && userAnswer.toUpperCase() === q.correct_option.toUpperCase()) {
        correctCount++;
      }
    });

    // Tính điểm trên hệ số 100
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Lưu kết quả vào DB
    await db.query(
      'INSERT INTO test_results (user_id, test_id, score) VALUES ($1, $2, $3)',
      [userId, testId, score]
    );

    res.json({
      score,
      correctCount,
      totalQuestions,
      message: `Bạn đạt ${correctCount}/${totalQuestions} câu. Điểm số: ${score}/100.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi chấm điểm.' });
  }
});

// Lấy lịch sử làm bài kiểm tra của học viên
router.get('/history/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.id, r.score, r.completed_at, t.title AS test_title, c.title AS course_title
       FROM test_results r
       JOIN tests t ON r.test_id = t.id
       JOIN courses c ON t.course_id = c.id
       WHERE r.user_id = $1
       ORDER BY r.completed_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi lấy lịch sử làm bài.' });
  }
});

module.exports = router;
