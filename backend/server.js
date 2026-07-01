const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const learnRoutes = require('./routes/learn');
const testRoutes = require('./routes/tests');
const qaRoutes = require('./routes/qa');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://nihongojapanese-frontend.onrender.com"
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/learn', learnRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/qa', qaRoutes);
app.use('/api/admin', adminRoutes);

// Health check / Root route
app.get('/', (req, res) => {
  res.json({ message: 'Chào mừng bạn đến với API của Nihongo Go - Website học tiếng Nhật!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Đã xảy ra lỗi hệ thống cục bộ.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
