// src/pages/TestsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TestsPage.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function TestsPage({ user,onLogout }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingTest, setStartingTest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/test', {
        credentials: 'include'
      });
      
      const data = await res.json();
      console.log(data);
      if (data.success) {
        setTests(data.data);
      } else {
        setError('Please login first');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId) => {
    if (!user) {
      setError('Please login to attempt tests');
      navigate('/login');
      return;
    }

    setStartingTest(testId);
    
    try {
      const res = await fetch('/api/tests/give', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          testId: testId
        })
      });

      const data = await res.json();
      
      if (data.success) {
        // Redirect to test interface
        navigate(`/test/${testId}`);
      } else {
        setError(data.message || 'Cannot start test');
      }
    } catch (err) {
      setError('Error starting test');
    } finally {
      setStartingTest(null);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      full: date.toLocaleString()
    };
  };

  const getStatusBadge = (test) => {
    const now = new Date();
    const startTime = new Date(test.startTime);
    const endTime = new Date(startTime.getTime() + test.duration * 60000);

    if (now < startTime) {
      return {
        type: 'upcoming',
        label: 'Upcoming',
        color: '#f39c12',
        icon: 'fas fa-clock'
      };
    } else if (now >= startTime && now <= endTime) {
      return {
        type: 'active',
        label: 'Active',
        color: '#27ae60',
        icon: 'fas fa-play-circle'
      };
    } else {
      return {
        type: 'completed',
        label: 'Completed',
        color: '#7f8c8d',
        icon: 'fas fa-check-circle'
      };
    }
  };

  const getTimeUntilStart = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = start - now;
    
    if (diffMs <= 0) return null;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `Starts in ${days}d ${hours}h`;
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
    return `Starts in ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="tests-loading">
        <div className="loading-spinner"></div>
        <p>Loading Tests...</p>
      </div>
    );
  }

  return (
    <>
    <Navbar user={user} onLogout={onLogout} />
    <div className="tests-page">
      {/* Header */}
      <div className="tests-header">
        <div className="container">
          <h1 className="tests-title">
            <i className="fas fa-file-alt"></i>
            Available Tests
          </h1>
          <p className="tests-subtitle">
            Challenge your skills with our comprehensive test series
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="container">
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
            <button 
              className="error-close"
              onClick={() => setError('')}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Tests Grid */}
      <div className="container">
        {tests.length === 0 ? (
          <div className="no-tests">
            <i className="fas fa-inbox"></i>
            <h3>No Tests Available</h3>
            <p>Check back later for new tests</p>
          </div>
        ) : (
          <div className="tests-grid">
            {tests.map((test) => {
              const datetime = formatDateTime(test.startTime);
              const status = getStatusBadge(test);
              const timeUntilStart = getTimeUntilStart(test.startTime);
              
              return (
                <div 
                  key={test.id} 
                  className={`test-card test-card-${status.type}`}
                >
                  {/* Status Badge */}
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: status.color }}
                  >
                    <i className={status.icon}></i>
                    {status.label}
                  </div>

                  {/* Test Header */}
                  <div className="test-header">
                    <h3 className="test-name">{test.testName}</h3>
                    {timeUntilStart && (
                      <div className="countdown">
                        <i className="fas fa-hourglass-start"></i>
                        {timeUntilStart}
                      </div>
                    )}
                  </div>

                  {/* Test Details */}
                  <div className="test-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <i className="fas fa-calendar-alt"></i>
                        <div className="detail-content">
                          <span className="detail-label">Date</span>
                          <span className="detail-value">{datetime.date}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-clock"></i>
                        <div className="detail-content">
                          <span className="detail-label">Time</span>
                          <span className="detail-value">{datetime.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <i className="fas fa-stopwatch"></i>
                        <div className="detail-content">
                          <span className="detail-label">Duration</span>
                          <span className="detail-value">{test.duration} mins</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-list-ol"></i>
                        <div className="detail-content">
                          <span className="detail-label">Questions</span>
                          <span className="detail-value">{test.numberOfQues}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <i className="fas fa-star"></i>
                        <div className="detail-content">
                          <span className="detail-label">Marks per Question</span>
                          <span className="detail-value">+{test.eachQuesMarks}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-trophy"></i>
                        <div className="detail-content">
                          <span className="detail-label">Total Marks</span>
                          <span className="detail-value">{test.totalMarks}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="test-actions">
                    <button
                      className={`start-btn start-btn-${status.type}`}
                      onClick={() => handleStartTest(test.id)}
                      disabled={status.type === 'completed' || startingTest === test.id}
                    >
                      {startingTest === test.id ? (
                        <>
                          <div className="btn-spinner"></div>
                          Starting...
                        </>
                      ) : (
                        <>
                          <i className={`fas ${
                            status.type === 'upcoming' ? 'fa-clock' : 
                            status.type === 'active' ? 'fa-play' : 
                            'fa-eye'
                          }`}></i>
                          {status.type === 'upcoming' ? 'Coming Soon' : 
                           status.type === 'active' ? 'Start Test' : 
                           'View Results'}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Card Glow Effect */}
                  <div className="card-glow"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
    </>
  );
}

export default TestsPage;