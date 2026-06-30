import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { Award, BookOpen, Mic, Award as QuizIcon, ChevronRight } from 'lucide-react';

function Home({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiRequest('/courses');
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: 'radial-gradient(circle at center, rgba(255, 56, 96, 0.1) 0%, transparent 70%)',
        borderRadius: '20px',
        marginBottom: '60px'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.2 }}>
          Chinh phục <span style={{ background: 'linear-gradient(135deg, var(--accent-color), #ff7675)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tiếng Nhật</span> theo phong cách mới
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 30px' }}>
          Học từ vựng thông minh, luyện nói trực tiếp bằng giọng nói của bạn nhờ AI, làm đề thi thử và nhận sự trợ giúp trực tiếp từ các giảng viên Admin.
        </p>
        <div>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '12px 28px' }}>
              Vào học ngay <ChevronRight size={20} />
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '12px 28px' }}>
              Bắt đầu miễn phí <ChevronRight size={20} />
            </Link>
          )}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid-2" style={{ marginBottom: '80px', gap: '20px' }}>
        <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(255, 56, 96, 0.1)', padding: '15px', borderRadius: '12px', color: 'var(--accent-color)' }}>
            <Mic size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Luyện nói bằng AI Speech-to-Text</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Phát âm tiếng Nhật trực tiếp trên trình duyệt. Trình duyệt của bạn sẽ chuyển giọng nói thành văn bản để đối chiếu độ chính xác tức thì.
            </p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(0, 209, 178, 0.1)', padding: '15px', borderRadius: '12px', color: 'var(--accent-blue)' }}>
            <QuizIcon size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Luyện đề thi trắc nghiệm tính giờ</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Đánh giá thực lực tức thì với các bài thi trắc nghiệm được phân cấp theo chuẩn JLPT. Điểm số được chấm tự động bảo mật trên máy chủ.
            </p>
          </div>
        </div>
      </div>

      {/* Course List Section */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '15px', textAlign: 'center' }}>
          Các Khóa Học Hiện Có
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>
          Lựa chọn khóa học phù hợp với trình độ của bạn để bắt đầu hành trình.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải danh sách khóa học...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: 'var(--danger)', padding: '40px' }}>{error}</div>
        ) : (
          <div className="course-grid">
            {courses.map(course => (
              <div key={course.id} className="card course-card card-hover">
                <span className="course-badge">{course.level}</span>
                <img src={course.image_url || 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800'} alt={course.title} className="course-image" />
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-desc">{course.description}</p>
                  {user ? (
                    <Link to={`/courses/${course.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                      Chi tiết khóa học
                    </Link>
                  ) : (
                    <Link to="/login" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                      Đăng nhập để học
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
