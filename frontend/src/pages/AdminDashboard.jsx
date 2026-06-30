import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { Plus, Trash2, Edit2, CheckCircle, HelpCircle, Users, BookOpen, FileText, MessageSquare, AlertCircle } from 'lucide-react';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [qaMessages, setQaMessages] = useState([]);
  const [tests, setTests] = useState([]);

  // Active Admin Sub-tab
  const [activeSubTab, setActiveSubTab] = useState('courses'); // 'courses', 'content', 'users', 'qa'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Course Form State
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseLevel, setCourseLevel] = useState('N5');
  const [courseImage, setCourseImage] = useState('');
  const [editingCourseId, setEditingCourseId] = useState(null);

  // Content Addition State (Linked to a selected course)
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // Vocabulary Form State
  const [vocabWord, setVocabWord] = useState('');
  const [vocabReading, setVocabReading] = useState('');
  const [vocabMeaning, setVocabMeaning] = useState('');
  const [vocabExample, setVocabExample] = useState('');
  const [vocabExampleMeaning, setVocabExampleMeaning] = useState('');

  // Grammar Form State
  const [grammarPattern, setGrammarPattern] = useState('');
  const [grammarMeaning, setGrammarMeaning] = useState('');
  const [grammarExplanation, setGrammarExplanation] = useState('');
  const [grammarExample, setGrammarExample] = useState('');
  const [grammarExampleMeaning, setGrammarExampleMeaning] = useState('');

  // Test Form State
  const [testTitle, setTestTitle] = useState('');
  const [testDuration, setTestDuration] = useState(15);

  // Test Question Form State
  const [selectedTestId, setSelectedTestId] = useState('');
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState('A');

  // QA Reply State
  const [replyTexts, setReplyTexts] = useState({}); // { [qaId]: 'reply text' }

  // Test Input Mode & File Import State
  const [testInputMode, setTestInputMode] = useState('manual'); // 'manual' or 'file'
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  // View Test Questions State (Admin)
  const [selectedViewTestId, setSelectedViewTestId] = useState(null);
  const [viewQuestions, setViewQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Fetch tests whenever selected course changes in the content tab
  useEffect(() => {
    if (selectedCourseId) {
      fetchTestsForCourse(selectedCourseId);
    } else {
      setTests([]);
    }
  }, [selectedCourseId]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersData, coursesData, qaData] = await Promise.all([
        apiRequest('/admin/users'),
        apiRequest('/courses'),
        apiRequest('/qa')
      ]);

      setUsers(usersData);
      setCourses(coursesData);
      setQaMessages(qaData);
      if (coursesData.length > 0) {
        setSelectedCourseId(coursesData[0].id.toString());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestsForCourse = async (courseId) => {
    try {
      const testsData = await apiRequest(`/tests/courses/${courseId}`);
      setTests(testsData);
      if (testsData.length > 0) {
        setSelectedTestId(testsData[0].id.toString());
      } else {
        setSelectedTestId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Manage Courses
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    const payload = {
      title: courseTitle,
      description: courseDesc,
      level: courseLevel,
      image_url: courseImage
    };

    try {
      if (editingCourseId) {
        // Edit
        await apiRequest(`/admin/courses/${editingCourseId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        alert('Cập nhật khóa học thành công!');
      } else {
        // Create
        await apiRequest('/admin/courses', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        alert('Tạo khóa học mới thành công!');
      }
      // Reset
      setCourseTitle('');
      setCourseDesc('');
      setCourseLevel('N5');
      setCourseImage('');
      setEditingCourseId(null);
      
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditCourseClick = (course) => {
    setEditingCourseId(course.id);
    setCourseTitle(course.title);
    setCourseDesc(course.description || '');
    setCourseLevel(course.level);
    setCourseImage(course.image_url || '');
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này? Tất cả các bài học liên quan sẽ bị xóa!')) return;

    try {
      await apiRequest(`/admin/courses/${courseId}`, { method: 'DELETE' });
      alert('Xóa khóa học thành công!');
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  // 2. Manage Vocabulary
  const handleAddVocab = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return alert('Vui lòng chọn một khóa học.');

    const payload = {
      word: vocabWord,
      reading: vocabReading,
      meaning: vocabMeaning,
      example_sentence: vocabExample,
      example_meaning: vocabExampleMeaning
    };

    try {
      await apiRequest(`/admin/courses/${selectedCourseId}/vocabulary`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      alert('Thêm từ vựng thành công!');
      // Reset form
      setVocabWord('');
      setVocabReading('');
      setVocabMeaning('');
      setVocabExample('');
      setVocabExampleMeaning('');
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Manage Grammar
  const handleAddGrammar = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return alert('Vui lòng chọn một khóa học.');

    const payload = {
      pattern: grammarPattern,
      meaning: grammarMeaning,
      explanation: grammarExplanation,
      example_sentence: grammarExample,
      example_meaning: grammarExampleMeaning
    };

    try {
      await apiRequest(`/admin/courses/${selectedCourseId}/grammar`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      alert('Thêm mẫu câu thành công!');
      setGrammarPattern('');
      setGrammarMeaning('');
      setGrammarExplanation('');
      setGrammarExample('');
      setGrammarExampleMeaning('');
    } catch (err) {
      alert(err.message);
    }
  };

  // 4. Manage Test
  const handleAddTest = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return alert('Vui lòng chọn một khóa học.');

    try {
      const data = await apiRequest(`/admin/courses/${selectedCourseId}/tests`, {
        method: 'POST',
        body: JSON.stringify({ title: testTitle, duration_minutes: testDuration })
      });
      alert('Tạo đề thi mới thành công!');
      setTestTitle('');
      // Refresh test list in dropdown
      fetchTestsForCourse(selectedCourseId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImportTest = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return alert('Vui lòng chọn một khóa học.');
    if (!importFile) return alert('Vui lòng chọn file JSON cần tải lên.');

    setImportLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        
        // Validation
        if (!jsonData.title || !jsonData.questions || !Array.isArray(jsonData.questions) || jsonData.questions.length === 0) {
          throw new Error('Cấu trúc file JSON không hợp lệ. File phải chứa "title", "duration_minutes" và mảng "questions" có ít nhất 1 câu hỏi.');
        }

        const data = await apiRequest(`/admin/courses/${selectedCourseId}/tests/import`, {
          method: 'POST',
          body: JSON.stringify(jsonData)
        });

        alert(data.message || 'Import đề thi thành công!');
        setImportFile(null);
        // Clear file input
        document.getElementById('import-file-input').value = '';
        // Refresh test list
        fetchTestsForCourse(selectedCourseId);
      } catch (err) {
        alert('Lỗi khi import đề thi: ' + err.message);
      } finally {
        setImportLoading(false);
      }
    };
    reader.onerror = () => {
      alert('Không thể đọc file.');
      setImportLoading(false);
    };
    reader.readAsText(importFile);
  };

  const downloadSampleJson = () => {
    const sample = {
      title: "Đề kiểm tra N5 - Từ vựng & Ngữ pháp nâng cao",
      duration_minutes: 15,
      questions: [
        {
          question_text: "Từ 「飲む」 có cách đọc là gì?",
          option_a: "のむ",
          option_b: "たべる",
          option_c: "いく",
          option_d: "くる",
          correct_option: "A"
        },
        {
          question_text: "Điền trợ từ phù hợp: 「水を___ trauma」",
          option_a: "へ",
          option_b: "を",
          option_c: "が",
          option_d: "に",
          correct_option: "B"
        }
      ]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sample, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "mau_de_thi.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleViewTestQuestions = async (testId) => {
    setLoadingQuestions(true);
    try {
      const data = await apiRequest(`/admin/tests/${testId}/questions`);
      setViewQuestions(data);
      setSelectedViewTestId(testId);
    } catch (err) {
      alert('Không thể lấy danh sách câu hỏi: ' + err.message);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đề thi này? Tất cả câu hỏi liên quan sẽ bị xóa!')) return;
    try {
      await apiRequest(`/admin/tests/${testId}`, { method: 'DELETE' });
      alert('Xóa đề thi thành công!');
      fetchTestsForCourse(selectedCourseId);
      if (selectedViewTestId === testId) {
        setSelectedViewTestId(null);
        setViewQuestions([]);
      }
    } catch (err) {
      alert('Lỗi khi xóa đề thi: ' + err.message);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi đề thi?')) return;
    try {
      await apiRequest(`/admin/questions/${qId}`, { method: 'DELETE' });
      alert('Xóa câu hỏi thành công!');
      if (selectedViewTestId) {
        handleViewTestQuestions(selectedViewTestId);
      }
    } catch (err) {
      alert('Lỗi khi xóa câu hỏi: ' + err.message);
    }
  };

  // 5. Manage Test Questions
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedTestId) return alert('Vui lòng tạo hoặc chọn một đề thi.');

    const payload = {
      question_text: qText,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_option: correctOpt
    };

    try {
      await apiRequest(`/admin/tests/${selectedTestId}/questions`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      alert('Thêm câu hỏi thành công!');
      setQText('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setCorrectOpt('A');
    } catch (err) {
      alert(err.message);
    }
  };

  // 6. Reply to QA
  const handleSendReply = async (qaId) => {
    const replyText = replyTexts[qaId];
    if (!replyText || !replyText.trim()) return alert('Nội dung trả lời không được để trống.');

    try {
      await apiRequest(`/admin/qa/${qaId}/answer`, {
        method: 'POST',
        body: JSON.stringify({ answer: replyText })
      });
      alert('Gửi phản hồi thành công!');
      setReplyTexts({ ...replyTexts, [qaId]: '' });
      fetchAdminData(); // Refresh QA list
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReplyTextChange = (qaId, text) => {
    setReplyTexts({
      ...replyTexts,
      [qaId]: text
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Đang tải bảng điều khiển Admin...</div>;
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        Trang Quản Trị Hệ Thống
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Quản lý người dùng, khóa học, thêm bài học và giải đáp thắc mắc học viên.</p>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--danger)', background: 'rgba(241, 70, 104, 0.1)', color: 'var(--danger)', padding: '15px', marginBottom: '30px' }}>
          {error}
        </div>
      )}

      {/* Admin Tabs */}
      <div className="tabs-header">
        <button className={`tab-btn ${activeSubTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveSubTab('courses')}>
          <BookOpen size={16} /> Quản lý Khóa học
        </button>
        <button className={`tab-btn ${activeSubTab === 'content' ? 'active' : ''}`} onClick={() => setActiveSubTab('content')}>
          <FileText size={16} /> Thêm bài học mới
        </button>
        <button className={`tab-btn ${activeSubTab === 'import-test' ? 'active' : ''}`} onClick={() => setActiveSubTab('import-test')}>
          <FileText size={16} /> Nhập đề thi bằng file (JSON)
        </button>
        <button className={`tab-btn ${activeSubTab === 'users' ? 'active' : ''}`} onClick={() => setActiveSubTab('users')}>
          <Users size={16} /> Quản lý Học viên
        </button>
        <button className={`tab-btn ${activeSubTab === 'qa' ? 'active' : ''}`} onClick={() => setActiveSubTab('qa')}>
          <MessageSquare size={16} /> Hỏi đáp học viên ({qaMessages.filter(m => !m.answer).length} chưa trả lời)
        </button>
      </div>

      {/* SUB-TAB: Courses */}
      {activeSubTab === 'courses' && (
        <div className="grid-2">
          {/* Create/Edit Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px' }}>
              {editingCourseId ? 'Cập nhật khóa học' : 'Thêm khóa học mới'}
            </h3>
            <form onSubmit={handleSaveCourse}>
              <div className="form-group">
                <label className="form-label">Tên khóa học</label>
                <input type="text" className="form-input" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả khóa học</label>
                <textarea className="form-input" rows="3" value={courseDesc} onChange={e => setCourseDesc(e.target.value)} />
              </div>
              <div className="grid-2" style={{ gap: '15px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Cấp độ</label>
                  <select className="form-input" value={courseLevel} onChange={e => setCourseLevel(e.target.value)}>
                    <option value="N5">N5</option>
                    <option value="N4">N4</option>
                    <option value="N3">N3</option>
                    <option value="N2">N2</option>
                    <option value="N1">N1</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Ảnh bìa (URL)</label>
                  <input type="text" className="form-input" placeholder="https://..." value={courseImage} onChange={e => setCourseImage(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingCourseId ? 'Cập nhật' : 'Tạo khóa học'}
                </button>
                {editingCourseId && (
                  <button type="button" className="btn btn-secondary" onClick={() => {
                    setEditingCourseId(null);
                    setCourseTitle('');
                    setCourseDesc('');
                    setCourseImage('');
                  }}>
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Course List */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px' }}>Danh sách khóa học hiện tại</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {courses.map(course => (
                <div key={course.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <strong>{course.title}</strong> <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>({course.level})</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => handleEditCourseClick(course)}>
                      <Edit2 size={14} />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDeleteCourse(course.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: Content (Lessons, Vocab, Grammar, Test Questions) */}
      {activeSubTab === 'content' && (
        <div>
          {/* Select Course First */}
          <div className="card" style={{ marginBottom: '30px' }}>
            <label className="form-label" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Chọn khóa học để thêm học liệu:</label>
            <select className="form-input" style={{ fontSize: '1.1rem' }} value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title} ({c.level})</option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            {/* Form: Add Vocabulary */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '15px' }}>Thêm Từ Vựng Mới</h3>
              <form onSubmit={handleAddVocab}>
                <div className="grid-2" style={{ gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Từ (Chữ Hán/Hiragana)</label>
                    <input type="text" className="form-input" placeholder="vd: 食べる" value={vocabWord} onChange={e => setVocabWord(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cách đọc (Furigana)</label>
                    <input type="text" className="form-input" placeholder="vd: たべる" value={vocabReading} onChange={e => setVocabReading(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Ý nghĩa (Tiếng Việt)</label>
                  <input type="text" className="form-input" placeholder="vd: Ăn" value={vocabMeaning} onChange={e => setVocabMeaning(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Câu ví dụ (Tiếng Nhật)</label>
                  <input type="text" className="form-input" placeholder="vd: 朝ご飯を食べます。" value={vocabExample} onChange={e => setVocabExample(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ý nghĩa câu ví dụ</label>
                  <input type="text" className="form-input" placeholder="vd: Tôi ăn bữa sáng." value={vocabExampleMeaning} onChange={e => setVocabExampleMeaning(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Plus size={16} /> Thêm từ vựng
                </button>
              </form>
            </div>

            {/* Form: Add Grammar */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '15px' }}>Thêm Ngữ Pháp / Mẫu Câu</h3>
              <form onSubmit={handleAddGrammar}>
                <div className="form-group">
                  <label className="form-label">Mẫu câu (Pattern)</label>
                  <input type="text" className="form-input" placeholder="vd: 〜たい" value={grammarPattern} onChange={e => setGrammarPattern(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ý nghĩa</label>
                  <input type="text" className="form-input" placeholder="vd: Muốn làm gì đó..." value={grammarMeaning} onChange={e => setGrammarMeaning(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Giải thích chi tiết</label>
                  <textarea className="form-input" rows="2" placeholder="Giải thích cách dùng..." value={grammarExplanation} onChange={e => setGrammarExplanation(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Câu ví dụ (Tiếng Nhật)</label>
                  <input type="text" className="form-input" placeholder="vd: 水を飲みたいです。" value={grammarExample} onChange={e => setGrammarExample(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ý nghĩa câu ví dụ</label>
                  <input type="text" className="form-input" placeholder="vd: Tôi muốn uống nước." value={grammarExampleMeaning} onChange={e => setGrammarExampleMeaning(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Plus size={16} /> Thêm ngữ pháp
                </button>
              </form>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: '30px' }}>
            {/* Form: Add Test */}
            <div className="card" style={{ height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '15px' }}>Tạo Đề Thi Mới</h3>
              
              {/* Test Input Mode Selector */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                  type="button" 
                  className={`btn ${testInputMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.85rem', flex: 1 }}
                  onClick={() => setTestInputMode('manual')}
                >
                  Nhập thủ công
                </button>
                <button 
                  type="button" 
                  className={`btn ${testInputMode === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.85rem', flex: 1 }}
                  onClick={() => setTestInputMode('file')}
                >
                  Tải file JSON
                </button>
              </div>

              {testInputMode === 'manual' ? (
                <form onSubmit={handleAddTest}>
                  <div className="form-group">
                    <label className="form-label">Tên đề thi</label>
                    <input type="text" className="form-input" placeholder="vd: Đề kiểm tra từ vựng số 1" value={testTitle} onChange={e => setTestTitle(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thời gian làm bài (Phút)</label>
                    <input type="number" className="form-input" value={testDuration} onChange={e => setTestDuration(parseInt(e.target.value) || 15)} required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <Plus size={16} /> Tạo đề thi
                  </button>
                </form>
              ) : (
                <form onSubmit={handleImportTest}>
                  <div className="form-group">
                    <label className="form-label">Chọn file JSON đề thi</label>
                    <input 
                      id="import-file-input"
                      type="file" 
                      accept=".json" 
                      className="form-input" 
                      onChange={handleFileChange}
                      required 
                    />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px', lineHeight: '1.4' }}>
                    Tải lên tệp tin JSON chứa tiêu đề đề thi, thời gian làm bài và danh sách câu hỏi.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ flex: 1, fontSize: '0.85rem' }} 
                      onClick={downloadSampleJson}
                    >
                      Tải file JSON mẫu
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ flex: 1, fontSize: '0.85rem' }}
                      disabled={importLoading}
                    >
                      {importLoading ? 'Đang xử lý...' : 'Tải lên & Nhập đề'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Form: Add Test Questions */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '15px' }}>Thêm Câu Hỏi Trắc Nghiệm</h3>
              {tests.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                  Chưa có đề thi nào. Hãy tạo một đề thi trước!
                </div>
              ) : (
                <form onSubmit={handleAddQuestion}>
                  <div className="form-group">
                    <label className="form-label">Chọn Đề thi</label>
                    <select className="form-input" value={selectedTestId} onChange={e => setSelectedTestId(e.target.value)}>
                      {tests.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nội dung câu hỏi</label>
                    <input type="text" className="form-input" placeholder="Câu hỏi là..." value={qText} onChange={e => setQText(e.target.value)} required />
                  </div>
                  <div className="grid-2" style={{ gap: '10px', marginBottom: '15px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Lựa chọn A</label>
                      <input type="text" className="form-input" value={optA} onChange={e => setOptA(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Lựa chọn B</label>
                      <input type="text" className="form-input" value={optB} onChange={e => setOptB(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Lựa chọn C</label>
                      <input type="text" className="form-input" value={optC} onChange={e => setOptC(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Lựa chọn D</label>
                      <input type="text" className="form-input" value={optD} onChange={e => setOptD(e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đáp án đúng</label>
                    <select className="form-input" value={correctOpt} onChange={e => setCorrectOpt(e.target.value)}>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <Plus size={16} /> Thêm câu hỏi
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: Users */}
      {activeSubTab === 'users' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px' }}>Danh sách học viên đăng ký</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên người dùng</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span style={{
                        background: u.role === 'admin' ? 'rgba(255, 56, 96, 0.15)' : 'rgba(255,255,255,0.05)',
                        color: u.role === 'admin' ? 'var(--accent-color)' : 'var(--text-secondary)',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        {u.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: Import Test from JSON */}
      {activeSubTab === 'import-test' && (
        <div className="grid-2" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          {/* Card 1: Upload Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} style={{ color: 'var(--accent-color)' }} /> Nhập Đề Thi Từ File JSON
            </h3>
            
            <form onSubmit={handleImportTest}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>1. Chọn khóa học</label>
                <select className="form-input" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.level})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>2. Chọn file JSON đề thi</label>
                <input 
                  id="import-file-input"
                  type="file" 
                  accept=".json" 
                  className="form-input" 
                  onChange={handleFileChange}
                  required 
                  style={{ padding: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '12px' }} 
                  onClick={downloadSampleJson}
                >
                  Tải file JSON mẫu
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '12px' }}
                  disabled={importLoading}
                >
                  {importLoading ? 'Đang nhập đề...' : 'Nhập Đề Thi'}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Instruction & Format */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '15px' }}>Hướng dẫn & Định dạng File</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '15px', lineHeight: '1.5' }}>
              Chuẩn bị một tệp tin có đuôi mở rộng <code>.json</code> với định dạng như bên dưới. Hệ thống sẽ tự động tạo đề thi mới và thêm toàn bộ câu hỏi vào hệ thống trong một giao dịch cơ sở dữ liệu duy nhất.
            </p>
            <pre style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              overflowX: 'auto',
              fontSize: '0.85rem',
              color: '#f8f8f2',
              fontFamily: 'monospace',
              lineHeight: '1.4'
            }}>
{`{
  "title": "Đề thi thử N5 - Từ vựng & Ngữ pháp",
  "duration_minutes": 15,
  "questions": [
    {
      "question_text": "Từ 「食べる」 đọc là gì?",
      "option_a": "のむ",
      "option_b": "たべる",
      "option_c": "いく",
      "option_d": "くる",
      "correct_option": "B"
    },
    {
      "question_text": "Điền trợ từ: 「日本___行きます」",
      "option_a": "へ",
      "option_b": "を",
      "option_c": "が",
      "option_d": "と",
      "correct_option": "A"
    }
  ]
}`}
            </pre>
          </div>

          {/* Danh sách đề thi hiện có của khóa học */}
          <div className="card" style={{ gridColumn: 'span 2', marginTop: '30px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Danh sách Đề thi Hiện tại ({tests.length})
            </h3>
            {tests.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                Khóa học này chưa có đề thi nào. Hãy tạo mới hoặc import bằng file JSON!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {tests.map(test => (
                  <div key={test.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', background: 'rgba(255, 255, 255, 0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{test.title}</strong>
                        <span style={{ marginLeft: '15px', color: 'var(--accent-blue)', fontSize: '0.9rem', fontWeight: 500 }}>
                          Thời gian: {test.duration_minutes} phút
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          onClick={() => selectedViewTestId === test.id ? setSelectedViewTestId(null) : handleViewTestQuestions(test.id)}
                        >
                          {selectedViewTestId === test.id ? 'Thu gọn' : 'Xem câu hỏi'}
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          onClick={() => handleDeleteTest(test.id)}
                        >
                          Xóa đề
                        </button>
                      </div>
                    </div>

                    {/* Hiển thị chi tiết câu hỏi */}
                    {selectedViewTestId === test.id && (
                      <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                        {loadingQuestions ? (
                          <div style={{ color: 'var(--text-muted)' }}>Đang tải câu hỏi...</div>
                        ) : viewQuestions.length === 0 ? (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '10px' }}>
                            Đề thi này chưa có câu hỏi nào.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {viewQuestions.map((q, idx) => (
                              <div key={q.id} style={{ background: 'rgba(0,0,0,0.15)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--accent-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px', marginBottom: '12px' }}>
                                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                    Câu {idx + 1}: {q.question_text}
                                  </span>
                                  <button 
                                    className="btn btn-danger" 
                                    style={{ padding: '3px 8px', fontSize: '0.75rem', height: 'fit-content' }}
                                    onClick={() => handleDeleteQuestion(q.id)}
                                  >
                                    Xóa câu hỏi
                                  </button>
                                </div>
                                <div className="grid-2" style={{ gap: '10px', fontSize: '0.9rem' }}>
                                  <div style={{ 
                                    padding: '6px 10px', 
                                    borderRadius: '4px',
                                    background: q.correct_option === 'A' ? 'rgba(0, 209, 178, 0.1)' : 'transparent',
                                    border: q.correct_option === 'A' ? '1px solid var(--accent-blue)' : '1px solid transparent',
                                    color: q.correct_option === 'A' ? 'var(--accent-blue)' : 'var(--text-secondary)'
                                  }}>
                                    A. {q.option_a} {q.correct_option === 'A' && '✓'}
                                  </div>
                                  <div style={{ 
                                    padding: '6px 10px', 
                                    borderRadius: '4px',
                                    background: q.correct_option === 'B' ? 'rgba(0, 209, 178, 0.1)' : 'transparent',
                                    border: q.correct_option === 'B' ? '1px solid var(--accent-blue)' : '1px solid transparent',
                                    color: q.correct_option === 'B' ? 'var(--accent-blue)' : 'var(--text-secondary)'
                                  }}>
                                    B. {q.option_b} {q.correct_option === 'B' && '✓'}
                                  </div>
                                  <div style={{ 
                                    padding: '6px 10px', 
                                    borderRadius: '4px',
                                    background: q.correct_option === 'C' ? 'rgba(0, 209, 178, 0.1)' : 'transparent',
                                    border: q.correct_option === 'C' ? '1px solid var(--accent-blue)' : '1px solid transparent',
                                    color: q.correct_option === 'C' ? 'var(--accent-blue)' : 'var(--text-secondary)'
                                  }}>
                                    C. {q.option_c} {q.correct_option === 'C' && '✓'}
                                  </div>
                                  <div style={{ 
                                    padding: '6px 10px', 
                                    borderRadius: '4px',
                                    background: q.correct_option === 'D' ? 'rgba(0, 209, 178, 0.1)' : 'transparent',
                                    border: q.correct_option === 'D' ? '1px solid var(--accent-blue)' : '1px solid transparent',
                                    color: q.correct_option === 'D' ? 'var(--accent-blue)' : 'var(--text-secondary)'
                                  }}>
                                    D. {q.option_d} {q.correct_option === 'D' && '✓'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB: QA (Inbox) */}
      {activeSubTab === 'qa' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px' }}>Hộp thư thắc mắc của học viên</h3>
          {qaMessages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
              Hiện không có câu hỏi nào từ học viên.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {qaMessages.map(msg => (
                <div key={msg.id} className="qa-item" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    <span>Học viên: <strong>{msg.student_name}</strong></span>
                    <span>{new Date(msg.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255, 56, 96, 0.05)', borderRadius: '8px', borderLeft: '3px solid var(--accent-color)', marginBottom: '10px' }}>
                    <strong>Câu hỏi:</strong> {msg.question}
                  </div>

                  {msg.answer ? (
                    <div style={{ padding: '12px', background: 'rgba(0, 209, 178, 0.05)', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)', fontSize: '0.95rem' }}>
                      <strong>Đã trả lời bởi {msg.admin_name}:</strong> {msg.answer}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Trả lời vào: {new Date(msg.answered_at).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '10px' }}>
                      <div className="form-group" style={{ marginBottom: '10px' }}>
                        <textarea
                          className="form-input"
                          rows="2"
                          placeholder="Nhập nội dung phản hồi cho học viên..."
                          value={replyTexts[msg.id] || ''}
                          onChange={e => handleReplyTextChange(msg.id, e.target.value)}
                        />
                      </div>
                      <button onClick={() => handleSendReply(msg.id)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        Gửi phản hồi
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
