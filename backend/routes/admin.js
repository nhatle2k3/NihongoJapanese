const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Tất cả các route trong file này đều yêu cầu quyền Admin
router.use(authenticateToken, requireAdmin);

// 1. Quản lý học viên (Lấy danh sách người dùng)
router.get('/users', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi lấy danh sách học viên.' });
  }
});

// 2. Quản lý khóa học - Thêm khóa học mới
router.post('/courses', async (req, res) => {
  const { title, description, level, image_url } = req.body;
  if (!title || !level) {
    return res.status(400).json({ error: 'Tên khóa học và cấp độ không được để trống.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO courses (title, description, level, image_url) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [title, description, level, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi thêm khóa học.' });
  }
});

// Cập nhật khóa học
router.put('/courses/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, level, image_url } = req.body;

  try {
    const result = await db.query(
      `UPDATE courses 
       SET title = $1, description = $2, level = $3, image_url = $4 
       WHERE id = $5 
       RETURNING *`,
      [title, description, level, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi cập nhật khóa học.' });
  }
});

// Xóa khóa học
router.delete('/courses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học.' });
    }
    res.json({ message: 'Xóa khóa học thành công.', course: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi xóa khóa học.' });
  }
});

// 3. Quản lý Từ vựng - Thêm từ vựng mới vào khóa học
router.post('/courses/:courseId/vocabulary', async (req, res) => {
  const { courseId } = req.params;
  const { word, reading, meaning, example_sentence, example_meaning } = req.body;

  if (!word || !reading || !meaning) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ Từ, Cách đọc và Ý nghĩa.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO vocabulary (course_id, word, reading, meaning, example_sentence, example_meaning) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [courseId, word, reading, meaning, example_sentence, example_meaning]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi thêm từ vựng.' });
  }
});

// Xóa từ vựng
router.delete('/vocabulary/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM vocabulary WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy từ vựng.' });
    }
    res.json({ message: 'Xóa từ vựng thành công.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi xóa từ vựng.' });
  }
});

// 4. Quản lý Ngữ pháp - Thêm mẫu câu mới vào khóa học
router.post('/courses/:courseId/grammar', async (req, res) => {
  const { courseId } = req.params;
  const { pattern, meaning, explanation, example_sentence, example_meaning } = req.body;

  if (!pattern || !meaning) {
    return res.status(400).json({ error: 'Vui lòng nhập cấu trúc ngữ pháp và ý nghĩa.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO grammar_patterns (course_id, pattern, meaning, explanation, example_sentence, example_meaning) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [courseId, pattern, meaning, explanation, example_sentence, example_meaning]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi thêm ngữ pháp.' });
  }
});

// Xóa mẫu câu ngữ pháp
router.delete('/grammar/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM grammar_patterns WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy mẫu câu.' });
    }
    res.json({ message: 'Xóa mẫu câu thành công.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi xóa mẫu câu.' });
  }
});

// 5. Quản lý đề thi - Thêm đề thi mới
router.post('/courses/:courseId/tests', async (req, res) => {
  const { courseId } = req.params;
  const { title, duration_minutes } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Tên đề thi không được để trống.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO tests (course_id, title, duration_minutes) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [courseId, title, duration_minutes || 15]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi tạo đề thi.' });
  }
});

// Import đề thi và câu hỏi hàng loạt từ JSON
router.post('/courses/:courseId/tests/import', async (req, res) => {
  const { courseId } = req.params;
  const { title, duration_minutes, questions } = req.body;

  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ. Đề thi phải có tiêu đề và ít nhất 1 câu hỏi.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Tạo đề thi mới
    const testResult = await client.query(
      `INSERT INTO tests (course_id, title, duration_minutes) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [courseId, title, duration_minutes || 15]
    );
    const testId = testResult.rows[0].id;

    // 2. Thêm các câu hỏi của đề thi đó
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_option) {
        throw new Error(`Câu hỏi số ${i + 1} thiếu thông tin bắt buộc (nội dung, 4 đáp án hoặc đáp án đúng).`);
      }

      await client.query(
        `INSERT INTO test_questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [testId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option.toUpperCase()]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({
      message: `Nhập đề thi thành công! Đã tạo đề thi "${title}" với ${questions.length} câu hỏi.`,
      test: testResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: error.message || 'Lỗi hệ thống khi nhập đề thi từ file.' });
  } finally {
    client.release();
  }
});


// Thêm câu hỏi vào đề thi
router.post('/tests/:testId/questions', async (req, res) => {
  const { testId } = req.params;
  const { question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;

  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ nội dung câu hỏi, 4 phương án và đáp án đúng.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO test_questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [testId, question_text, option_a, option_b, option_c, option_d, correct_option.toUpperCase()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi thêm câu hỏi.' });
  }
});

// Xóa đề thi
router.delete('/tests/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM tests WHERE id = $1', [id]);
    res.json({ message: 'Xóa đề thi thành công.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi xóa đề thi.' });
  }
});

// Lấy danh sách câu hỏi đầy đủ (gồm cả đáp án đúng) cho Admin
router.get('/tests/:testId/questions', async (req, res) => {
  const { testId } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM test_questions WHERE test_id = $1 ORDER BY id ASC',
      [testId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi lấy danh sách câu hỏi.' });
  }
});

// Xóa một câu hỏi khỏi đề thi
router.delete('/questions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM test_questions WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy câu hỏi.' });
    }
    res.json({ message: 'Xóa câu hỏi thành công.', question: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi xóa câu hỏi.' });
  }
});


// 6. Trả lời câu hỏi Q&A từ học viên
router.post('/qa/:id/answer', async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;
  const adminId = req.user.id;

  if (!answer || answer.trim() === '') {
    return res.status(400).json({ error: 'Nội dung câu trả lời không được để trống.' });
  }

  try {
    const result = await db.query(
      `UPDATE qa_messages 
       SET answer = $1, answered_by = $2, answered_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [answer, adminId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy câu hỏi này.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi hệ thống khi gửi câu trả lời.' });
  }
});

module.exports = router;
