import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { BookOpen, User, LogOut, ShieldAlert, MessageCircleQuestion } from 'lucide-react';
import { getUserInfo, logout } from './utils/api';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(getUserInfo());

  useEffect(() => {
    // Keep user state in sync with localStorage
    const handleStorageChange = () => {
      setUser(getUserInfo());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <Link to="/" className="nav-brand">
            <BookOpen size={24} />
            <span>Nihongo Go</span>
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Trang chủ</Link>
            {user && (
              <>
                <Link to="/dashboard" className="nav-link">Học tập</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="nav-link" style={{ color: '#ffe08a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={16} /> Admin
                  </Link>
                )}
              </>
            )}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Chào, <strong>{user.username}</strong>
                </span>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  <LogOut size={14} /> Đăng xuất
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Bắt đầu học
              </Link>
            )}
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/courses/:id" element={user ? <CourseDetail user={user} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
