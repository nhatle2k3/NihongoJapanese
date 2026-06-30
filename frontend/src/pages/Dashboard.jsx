import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { BookOpen, Calendar, HelpCircle, MessageSquare, Award, Clock, Send } from 'lucide-react';

function Dashboard({ user }) {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [qaMessages, setQaMessages] = useState([]);
  const [testHistory, setTestHistory] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  
  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'qa', 'history'
  const [loading, setLoading] = useState(true);
  const [qaLoading, setQaLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch courses, enrolled courses, QA, and history in parallel
      const [allCoursesData, enrolledData, qaData, historyData] = await Promise.all([
        apiRequest('/courses'),
        apiRequest('/courses/enrolled'),
        apiRequest('/qa'),
        apiRequest('/tests/history/me')
      ]);

      setAllCourses(allCoursesData);
      setEnrolledCourses(enrolledData);
      setQaMessages(qaData);
      setTestHistory(historyData);
    } catch (err) {
      setError('Không thể tải thông tin bảng điều khiển.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await apiRequest(`/courses/${courseId}/enroll`, { method: 'POST' });
      // Refresh data
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setQaLoading(true);
    try {
      const data = await apiRequest('/qa', {
        method: 'POST',
        body: JSON.stringify({ question: newQuestion }),
      });
      setQaMessages([data, ...qaMessages]);
      setNewQuestion('');
    } catch (err) {
      alert(err.message);
    } finally {
      setQaLoading(false);
    }
  };

  // Filter out courses that the user has already enrolled in
  const unenrolledCourses = allCourses.filter(
    course => !enrolledCourses.some(enrolled => enrolled.id === course.id)
  );

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Đang tải dữ liệu học tập...</div>;
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '10px' }}>Bảng Điều Khiển Học Viên</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Chào mừng trở lại! Hãy tiếp tục con đường học tập của bạn.</p>

      {/* Tabs */}
      <div className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Khóa học của tôi
        </button>
        <button 
          className={`tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
          onClick={() => setActiveTab('qa')}
        >
          Hỏi đáp Admin ({qaMessages.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Lịch sử làm bài
        </button>
      </div>

      {/* Tab: Courses */}
      {activeTab === 'courses' && (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '20px' }}>Khóa học đang học</h2>
          {enrolledCourses.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', marginBottom: '40px' }}>
              <BookOpen size={40} style={{ marginBottom: '15px', color: 'var(--text-muted)' }} />
              <p>Bạn chưa đăng ký khóa học nào. Hãy chọn một khóa học bên dưới để bắt đầu!</p>
            </div>
          ) : (
            <div className="course-grid" style={{ marginBottom: '50px' }}>
              {enrolledCourses.map(course => (
                <div key={course.id} className="card course-card card-hover">
                  <span className="course-badge">{course.level}</span>
                  <img src={course.image_url || 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800'} alt={course.title} className="course-image" />
                  <div className="course-content">
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-desc">{course.description}</p>
                    <Link to={`/courses/${course.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                      Vào học tiếp
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {unenrolledCourses.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '20px' }}>Khóa học gợi ý cho bạn</h2>
              <div className="course-grid">
                {unenrolledCourses.map(course => (
                  <div key={course.id} className="card course-card card-hover">
                    <span className="course-badge">{course.level}</span>
                    <img src={course.image_url || 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800'} alt={course.title} className="course-image" />
                    <div className="course-content">
                      <h3 className="course-title">{course.title}</h3>
                      <p className="course-desc">{course.description}</p>
                      <button 
                        onClick={() => handleEnroll(course.id)} 
                        className="btn btn-secondary" 
                        style={{ width: '100%', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                      >
                        Đăng ký học
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: QA */}
      {activeTab === 'qa' && (
        <div className="grid-2">
          {/* Send Question Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={20} className="text-accent" /> Đặt câu hỏi cho Admin
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Gặp khó khăn khi học từ vựng hoặc ngữ pháp? Gửi câu hỏi của bạn tại đây, các quản trị viên sẽ giải đáp nhanh nhất có thể.
            </p>
            <form onSubmit={handleSendQuestion}>
              <div className="form-group">
                <textarea 
                  className="form-input" 
                  rows="4"
                  placeholder="Nhập nội dung câu hỏi (Ví dụ: Sự khác biệt giữa は và が là gì?...)"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={qaLoading}>
                <Send size={16} /> {qaLoading ? 'Đang gửi...' : 'Gửi câu hỏi'}
              </button>
            </form>
          </div>

          {/* QA Thread List */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} /> Lịch sử Hỏi đáp của bạn
            </h3>
            <div className="qa-container">
              {qaMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                  Bạn chưa gửi câu hỏi nào.
                </div>
              ) : (
                qaMessages.map(msg => (
                  <div key={msg.id} className="qa-item">
                    <div className="qa-question">
                      <div><strong>Hỏi:</strong> {msg.question}</div>
                      <div className="qa-time">{new Date(msg.created_at).toLocaleString('vi-VN')}</div>
                    </div>
                    {msg.answer ? (
                      <div className="qa-answer">
                        <div><strong>Đáp (Admin {msg.admin_name}):</strong> {msg.answer}</div>
                        <div className="qa-time">{new Date(msg.answered_at).toLocaleString('vi-VN')}</div>
                      </div>
                    ) : (
                      <div style={{ alignSelf: 'flex-end', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        Đang chờ phản hồi từ Admin...
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <div className="card">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={24} style={{ color: 'var(--accent-blue)' }} /> Kết quả thi cử đã tham gia
          </h2>
          {testHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Bạn chưa làm bài kiểm tra nào. Hãy tham gia thi thử trong các khóa học!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Đề thi</th>
                    <th>Khóa học</th>
                    <th>Điểm số</th>
                    <th>Đánh giá</th>
                    <th>Thời gian hoàn thành</th>
                  </tr>
                </thead>
                <tbody>
                  {testHistory.map(result => (
                    <tr key={result.id}>
                      <td style={{ fontWeight: 600 }}>{result.test_title}</td>
                      <td>{result.course_title}</td>
                      <td style={{ color: result.score >= 50 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                        {result.score}/100
                      </td>
                      <td>
                        <span style={{
                          background: result.score >= 50 ? 'rgba(72, 199, 142, 0.15)' : 'rgba(241, 70, 104, 0.15)',
                          color: result.score >= 50 ? 'var(--success)' : 'var(--danger)',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                          {result.score >= 80 ? 'Xuất sắc' : result.score >= 50 ? 'Đạt' : 'Chưa đạt'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {new Date(result.completed_at).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
