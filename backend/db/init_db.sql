-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS qa_messages CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS test_questions CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS grammar_patterns CASCADE;
DROP TABLE IF EXISTS vocabulary CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Bảng Người dùng (Học viên & Admin)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'student', -- 'student' hoặc 'admin'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng Khóa học (N5, N4, N3, N2, N1)
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(10) NOT NULL, -- 'N5', 'N4', 'N3', 'N2', 'N1'
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng Đăng ký Khóa học
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_course UNIQUE(user_id, course_id)
);

-- Bảng Từ vựng
CREATE TABLE vocabulary (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    word VARCHAR(100) NOT NULL, -- vd: 食べる
    reading VARCHAR(100) NOT NULL, -- vd: たべる
    meaning TEXT NOT NULL, -- vd: Ăn
    example_sentence TEXT,
    example_meaning TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng Ngữ pháp (Mẫu câu)
CREATE TABLE grammar_patterns (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    pattern VARCHAR(255) NOT NULL, -- vd: 〜たい
    meaning TEXT NOT NULL, -- vd: Muốn làm gì đó
    explanation TEXT,
    example_sentence TEXT,
    example_meaning TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng Đề thi
CREATE TABLE tests (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    duration_minutes INT DEFAULT 15,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng Câu hỏi Đề thi
CREATE TABLE test_questions (
    id SERIAL PRIMARY KEY,
    test_id INT REFERENCES tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng Kết quả Đề thi
CREATE TABLE test_results (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    test_id INT REFERENCES tests(id) ON DELETE CASCADE,
    score INT NOT NULL,
    completed_at TIMESTAMP DEFAULT NOW()
);

-- Bảng Hỏi đáp (Q&A)
CREATE TABLE qa_messages (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE, -- Học viên hỏi
    question TEXT NOT NULL,
    answer TEXT, -- Admin trả lời
    answered_by INT REFERENCES users(id) ON DELETE SET NULL, -- Admin ID
    created_at TIMESTAMP DEFAULT NOW(),
    answered_at TIMESTAMP
);

-- Insert initial courses
INSERT INTO courses (title, description, level, image_url) VALUES
('Tiếng Nhật Sơ cấp N5', 'Khóa học dành cho người mới bắt đầu. Học bảng chữ cái Hiragana, Katakana, từ vựng và ngữ pháp căn bản nhất.', 'N5', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=60'),
('Tiếng Nhật Sơ cấp N4', 'Khóa học tiếp nối N5. Nâng cao vốn từ vựng, ngữ pháp để có thể giao tiếp cơ bản trong cuộc sống hàng ngày.', 'N4', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=60'),
('Tiếng Nhật Trung cấp N3', 'Khóa học trung cấp. Giúp bạn hiểu được các đoạn văn, hội thoại ở các tình huống thực tế hàng ngày với tốc độ gần tự nhiên.', 'N3', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=60');

-- Insert initial vocabulary for N5 (Course 1)
INSERT INTO vocabulary (course_id, word, reading, meaning, example_sentence, example_meaning) VALUES
(1, '先生', 'せんせい', 'Giáo viên, thầy cô', 'あの方は日本語の先生です。', 'Người đó là giáo viên tiếng Nhật.'),
(1, '学生', 'がくせい', 'Học sinh, sinh viên', '私はベトナムの学生です。', 'Tôi là học sinh Việt Nam.'),
(1, '食べる', 'たべる', 'Ăn', '朝ご飯にパンを食べます。', 'Tôi ăn bánh mì vào bữa sáng.'),
(1, '飲む', 'のむ', 'Uống', '水を飲みます。', 'Tôi uống nước.'),
(1, '日本語', 'にほんご', 'Tiếng Nhật', '日本語を勉強します。', 'Tôi học tiếng Nhật.'),
(1, '本', 'ほん', 'Sách', '図書館で本を読みます。', 'Tôi đọc sách ở thư viện.'),
(1, '行く', 'いく', 'Đi', '明日、学校へ行きます。', 'Ngày mai tôi đi đến trường.'),
(1, '友達', 'ともだち', 'Bạn bè', '友達と遊びます。', 'Tôi đi chơi với bạn bè.');

-- Insert initial grammar patterns for N5 (Course 1)
INSERT INTO grammar_patterns (course_id, pattern, meaning, explanation, example_sentence, example_meaning) VALUES
(1, '〜は〜です', 'Là...', 'Dùng để biểu thị chủ ngữ và vị ngữ chỉ quan hệ tương đương.', '私は学生です。', 'Tôi là học sinh.'),
(1, '〜を〜ます', 'Làm cái gì đó...', 'Dùng trợ từ 「を」 để chỉ đối tượng trực tiếp của hành động.', '水を飲みます。', 'Uống nước.'),
(1, '〜たいです', 'Muốn làm gì đó...', 'Bỏ ます thêm たいです để thể hiện ý muốn của người nói.', '日本へ行きたいです。', 'Tôi muốn đi Nhật.'),
(1, '〜てください', 'Hãy làm gì đó...', 'Thể て + ください dùng để đưa ra lời yêu cầu, đề nghị lịch sự.', 'ここに名前を書いてください。', 'Hãy viết tên vào đây.');

-- Insert a test for N5 (Course 1)
INSERT INTO tests (course_id, title, duration_minutes) VALUES
(1, 'Bài kiểm tra năng lực N5 - Từ vựng & Ngữ pháp', 10);

-- Insert questions for N5 test
INSERT INTO test_questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
(1, 'Từ "先生" có cách đọc là gì?', 'A. がくせい', 'B. せんせい', 'C. かいしゃいん', 'D. ぎんこういん', 'B'),
(1, 'Chọn trợ từ thích hợp: 「水をのみます」', 'A. が', 'B. に', 'C. を', 'D. へ', 'C'),
(1, 'Chia động từ "たべる" sang thể muốn ăn:', 'A. たべたいです', 'B. たべます', 'C. たべたい', 'D. たべました', 'A'),
(1, 'Ý nghĩa của câu 「ここに名前を書いてください」 là gì?', 'A. Hãy đọc tên ở đây.', 'B. Hãy viết tên ở đây.', 'C. Hãy điền tên vào đó.', 'D. Hãy ký tên vào đây.', 'B');
