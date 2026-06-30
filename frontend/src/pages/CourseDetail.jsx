import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { BookOpen, Award, CheckCircle, Volume2, Mic, MicOff, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

function CourseDetail({ user }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [vocabulary, setVocabulary] = useState([]);
  const [grammar, setGrammar] = useState([]);
  const [tests, setTests] = useState([]);
  
  const [activeTab, setActiveTab] = useState('vocab'); // 'vocab', 'grammar', 'test'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Vocabulary Flashcard State
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechEvaluation, setSpeechEvaluation] = useState(''); // 'correct', 'almost', 'incorrect', ''
  const [recognition, setRecognition] = useState(null);

  // Quiz State
  const [activeTest, setActiveTest] = useState(null); // The test being taken
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: 'A' }
  const [testResult, setTestResult] = useState(null); // Result from server
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
    setupSpeechRecognition();
  }, [id]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const [courseData, vocabData, grammarData, testData] = await Promise.all([
        apiRequest(`/courses/${id}`),
        apiRequest(`/learn/courses/${id}/vocabulary`),
        apiRequest(`/learn/courses/${id}/grammar`),
        apiRequest(`/tests/courses/${id}`)
      ]);

      setCourse(courseData);
      setVocabulary(vocabData);
      setGrammar(grammarData);
      setTests(testData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Web Speech API Setup
  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'ja-JP';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        setSpeechTranscript('Đang nghe...');
        setSpeechEvaluation('');
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setSpeechTranscript('Lỗi nhận diện: ' + event.error);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        setSpeechTranscript(resultText);
        evaluateSpeech(resultText);
      };

      setRecognition(rec);
    }
  };

  const startListening = () => {
    if (!recognition) {
      alert('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói tiếng Nhật. Hãy sử dụng Google Chrome hoặc Microsoft Edge.');
      return;
    }
    try {
      recognition.start();
    } catch (e) {
      recognition.stop();
    }
  };

  const evaluateSpeech = (transcript) => {
    if (vocabulary.length === 0) return;
    const currentVocab = vocabulary[currentVocabIndex];
    
    // Clean strings for comparison (remove spaces, punctuation)
    const cleanWord = currentVocab.word.replace(/[\s\u3000、。]/g, '');
    const cleanReading = currentVocab.reading.replace(/[\s\u3000、。]/g, '');
    const cleanTranscript = transcript.replace(/[\s\u3000、。]/g, '');

    // Check if transcript matches Kanji or Hiragana reading
    if (cleanTranscript === cleanWord || cleanTranscript === cleanReading) {
      setSpeechEvaluation('correct');
    } else if (
      cleanWord.includes(cleanTranscript) || 
      cleanReading.includes(cleanTranscript) || 
      cleanTranscript.includes(cleanWord) || 
      cleanTranscript.includes(cleanReading)
    ) {
      setSpeechEvaluation('almost');
    } else {
      setSpeechEvaluation('incorrect');
    }
  };

  // Text-to-Speech (TTS)
  const speakJapanese = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Trình duyệt không hỗ trợ phát âm.');
    }
  };

  // Quiz Timer
  useEffect(() => {
    if (timeLeft > 0 && activeTest) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && activeTest && !testResult) {
      handleQuizSubmit();
    }
  }, [timeLeft, activeTest]);

  const startTest = async (test) => {
    try {
      const data = await apiRequest(`/tests/${test.id}`);
      setActiveTest(data);
      setSelectedAnswers({});
      setTestResult(null);
      setTimeLeft(test.duration_minutes * 60);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSelectAnswer = (questionId, option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: option,
    });
  };

  const handleQuizSubmit = async () => {
    if (!activeTest) return;

    try {
      const data = await apiRequest(`/tests/${activeTest.test.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: selectedAnswers }),
      });
      setTestResult(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const closeTest = () => {
    setActiveTest(null);
    setTestResult(null);
    // Refresh history / data
    fetchCourseDetails();
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Đang tải nội dung khóa học...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px', maxWidth: '600px', margin: '40px auto' }}>
        <AlertCircle size={40} style={{ color: 'var(--danger)', marginBottom: '15px' }} />
        <p>{error}</p>
        <Link to="/dashboard" className="btn btn-secondary" style={{ marginTop: '20px' }}>Quay lại</Link>
      </div>
    );
  }

  const currentVocab = vocabulary[currentVocabIndex];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Course Header */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
        <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '8px 12px' }}>
          <ArrowLeft size={16} /> Quay lại
        </Link>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color)', textTransform: 'uppercase' }}>
            Khóa học cấp độ {course.level}
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{course.title}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'vocab' ? 'active' : ''}`}
          onClick={() => { setActiveTab('vocab'); setIsFlipped(false); setSpeechTranscript(''); setSpeechEvaluation(''); }}
        >
          Từ vựng ({vocabulary.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'grammar' ? 'active' : ''}`}
          onClick={() => setActiveTab('grammar')}
        >
          Mẫu câu ({grammar.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'test' ? 'active' : ''}`}
          onClick={() => setActiveTab('test')}
        >
          Đề kiểm tra ({tests.length})
        </button>
      </div>

      {/* TAB: Vocabulary */}
      {activeTab === 'vocab' && (
        <div>
          {vocabulary.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Chưa có từ vựng nào trong khóa học này.
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setCurrentVocabIndex(prev => Math.max(0, prev - 1));
                    setIsFlipped(false);
                    setSpeechTranscript('');
                    setSpeechEvaluation('');
                  }}
                  disabled={currentVocabIndex === 0}
                >
                  <ArrowLeft size={16} /> Trước đó
                </button>
                <span>Từ {currentVocabIndex + 1} / {vocabulary.length}</span>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setCurrentVocabIndex(prev => Math.min(vocabulary.length - 1, prev + 1));
                    setIsFlipped(false);
                    setSpeechTranscript('');
                    setSpeechEvaluation('');
                  }}
                  disabled={currentVocabIndex === vocabulary.length - 1}
                >
                  Tiếp theo <ArrowRight size={16} />
                </button>
              </div>

              {/* Flashcard */}
              <div 
                className={`vocab-card-container ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="vocab-card-inner">
                  {/* Front */}
                  <div className="vocab-card-front">
                    <div className="vocab-japanese">{currentVocab.word}</div>
                    <div className="vocab-reading">【{currentVocab.reading}】</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '20px' }}>
                      (Click để xem ý nghĩa)
                    </div>
                  </div>
                  
                  {/* Back */}
                  <div className="vocab-card-back">
                    <div className="vocab-meaning">{currentVocab.meaning}</div>
                    {currentVocab.example_sentence && (
                      <div className="vocab-example" onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentVocab.example_sentence}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {currentVocab.example_meaning}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Speak Practice UI */}
              <div className="card" style={{ maxWidth: '600px', margin: '30px auto 0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, textAlign: 'center', marginBottom: '15px' }}>
                  Luyện phát âm với từ này
                </h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                  <button onClick={() => speakJapanese(currentVocab.word)} className="btn btn-secondary" title="Nghe phát âm chuẩn">
                    <Volume2 size={18} /> Nghe phát âm
                  </button>
                  <button 
                    onClick={startListening} 
                    className={`btn btn-primary ${isListening ? 'listening' : ''}`}
                    style={{ background: isListening ? 'var(--success)' : 'var(--accent-color)' }}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    {isListening ? 'Đang ghi âm...' : 'Bắt đầu nói'}
                  </button>
                </div>

                {speechTranscript && (
                  <div className="speech-result" style={{ margin: '0 auto' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Kết quả nhận diện giọng nói:</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '5px 0', color: 'var(--text-primary)' }}>
                      {speechTranscript}
                    </div>

                    {speechEvaluation === 'correct' && (
                      <div style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <CheckCircle size={16} /> Phát âm xuất sắc! 100% Chính xác.
                      </div>
                    )}
                    {speechEvaluation === 'almost' && (
                      <div style={{ color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <AlertCircle size={16} /> Gần đúng! Hãy thử phát âm to và rõ hơn.
                      </div>
                    )}
                    {speechEvaluation === 'incorrect' && (
                      <div style={{ color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <AlertCircle size={16} /> Chưa chính xác. Hãy nghe lại phát âm chuẩn và thử lại.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: Grammar */}
      {activeTab === 'grammar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {grammar.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Chưa có mẫu câu ngữ pháp nào trong khóa học này.
            </div>
          ) : (
            grammar.map(pattern => (
              <div key={pattern.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{pattern.pattern}</h3>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px' }}>
                    {pattern.meaning}
                  </span>
                </div>
                {pattern.explanation && (
                  <p style={{ color: 'var(--text-primary)', marginBottom: '15px', paddingLeft: '10px', borderLeft: '2px solid var(--accent-color)' }}>
                    {pattern.explanation}
                  </p>
                )}
                {pattern.example_sentence && (
                  <div style={{ background: 'rgba(0,0,0,0.15)', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'white' }}>{pattern.example_sentence}</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{pattern.example_meaning}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: Tests */}
      {activeTab === 'test' && (
        <div>
          {tests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Chưa có đề thi thử nào trong khóa học này.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {tests.map(test => (
                <div key={test.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{test.title}</h3>
                    <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '5px' }}>
                      <span>Thời gian: {test.duration_minutes} phút</span>
                    </div>
                  </div>
                  <button onClick={() => startTest(test)} className="btn btn-primary">
                    Bắt đầu thi
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quiz Modal Overlay */}
      {activeTest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 15, 22, 0.95)',
          zIndex: 2000,
          overflowY: 'auto',
          padding: '40px 20px'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', position: 'sticky', top: 0, background: '#0f0f16', padding: '15px 0', borderBottom: '1px solid var(--border-color)', zIndex: 10 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{activeTest.test.title}</h2>
                {!testResult && (
                  <div style={{ color: 'var(--accent-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    Thời gian còn lại: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
              <div>
                {testResult ? (
                  <button onClick={closeTest} className="btn btn-secondary">Đóng kết quả</button>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { if(confirm('Bạn có chắc chắn muốn hủy bài thi?')) closeTest(); }} className="btn btn-secondary">Hủy bỏ</button>
                    <button onClick={handleQuizSubmit} className="btn btn-primary">Nộp bài</button>
                  </div>
                )}
              </div>
            </div>

            {/* Test Results Display */}
            {testResult && (
              <div className="card" style={{ border: '2px solid var(--success)', background: 'rgba(72, 199, 142, 0.05)', marginBottom: '30px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--success)', fontWeight: 700, marginBottom: '10px' }}>Bài thi đã hoàn thành!</h3>
                <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
                  Điểm số: <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>{testResult.score}/100</span>
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Số câu trả lời đúng: {testResult.correctCount} / {testResult.totalQuestions} câu.
                </p>
              </div>
            )}

            {/* Question List */}
            <div>
              {activeTest.questions.map((q, index) => (
                <div key={q.id} className="quiz-question-card">
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '15px' }}>
                    Câu {index + 1}: {q.question_text}
                  </h4>
                  <div className="quiz-options">
                    <div 
                      className={`quiz-option ${selectedAnswers[q.id] === 'A' ? 'selected' : ''}`}
                      onClick={() => !testResult && handleSelectAnswer(q.id, 'A')}
                    >
                      <strong>A.</strong> {q.option_a}
                    </div>
                    <div 
                      className={`quiz-option ${selectedAnswers[q.id] === 'B' ? 'selected' : ''}`}
                      onClick={() => !testResult && handleSelectAnswer(q.id, 'B')}
                    >
                      <strong>B.</strong> {q.option_b}
                    </div>
                    <div 
                      className={`quiz-option ${selectedAnswers[q.id] === 'C' ? 'selected' : ''}`}
                      onClick={() => !testResult && handleSelectAnswer(q.id, 'C')}
                    >
                      <strong>C.</strong> {q.option_c}
                    </div>
                    <div 
                      className={`quiz-option ${selectedAnswers[q.id] === 'D' ? 'selected' : ''}`}
                      onClick={() => !testResult && handleSelectAnswer(q.id, 'D')}
                    >
                      <strong>D.</strong> {q.option_d}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetail;
