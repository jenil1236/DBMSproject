import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import './History.css';

const History = ({user, onLogout}) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTest, setExpandedTest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        setHistory(data.history);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleViewSubmission = (testId) => {
    navigate(`/submission/${testId}`);
  };

  const toggleExpand = (resultId) => {
    if (expandedTest === resultId) {
      setExpandedTest(null);
    } else {
      setExpandedTest(resultId);
    }
  };

  const calculatePercentage = (score, totalMarks) => {
    return ((score / totalMarks) * 100).toFixed(1);
  };

  const getScoreColor = (score, totalMarks) => {
    const percentage = (score / totalMarks) * 100;
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 50) return '#ff9800';
    return '#f44336';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1: return '#4caf50'; // Correct - Green
      case 0: return '#f44336'; // Incorrect - Red
      default: return '#ff9800'; // Not Attempted - Orange
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1: return 'Correct';
      case 0: return 'Incorrect';
      default: return 'Not Attempted';
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="history-page">
        <Navbar user={user} onLogout={onLogout}/>
        <div className="history-container" style={{marginTop: '80px'}}>
          <div className="loading-spinner">
            {/* <div className="spinner"></div> */}
            {/* <p>Loading your test history...</p> */}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page">
        <Navbar user={user} onLogout={onLogout}/>
        <div className="history-container" >
          <div className="error-message">
            <h2>Error Loading History</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="history-page">
      <Navbar user={user} onLogout={onLogout}/>
      <div className="history-container" >
        <header className="history-header">
          <h1>Test History</h1>
          <p>Review your previous test attempts and submissions</p>
        </header>

        {history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>No Test History Found</h2>
            <p>You haven't taken any tests yet. Start your learning journey today!</p>
            <button className="primary-btn">Take a Test</button>
          </div>
        ) : (
          <div className="history-list">
            {history.map((test) => (
              <div 
                key={test.resultId} 
                className={`history-card ${expandedTest === test.resultId ? 'expanded' : ''}`}
              >
                <div className="card-header">
                  <div className="test-info">
                    <h3 className="test-name">{test.testName}</h3>
                    <p className="test-date">Taken on: {formatDate(test.startTime)}</p>
                  </div>
                  <div className="score-info">
                    <div 
                      className="score-circle"
                      style={{ 
                        '--score-color': getScoreColor(test.score, test.totalMarks),
                        '--score-percentage': `${calculatePercentage(test.score, test.totalMarks)}%`
                      }}
                    >
                      <span className="score-text">
                        {test.score}/{test.totalMarks}
                      </span>
                      <span className="score-percentage">
                        {calculatePercentage(test.score, test.totalMarks)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="view-submission-btn"
                    onClick={() => handleViewSubmission(test.testId)} 
                  >
                    View Submission
                  </button>
                  <button 
                    className="toggle-details-btn"
                    onClick={() => toggleExpand(test.resultId)}
                  >
                    {expandedTest === test.resultId ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>

                {expandedTest === test.resultId && (
                  <div className="card-details">
                    <h4>Question Submissions</h4>
                    <div className="submissions-list">
                      {test.submissions.map((submission, index) => (
                        <div key={submission.questionId} className="submission-item">
                          <div className="question-header">
                            <span className="question-number">Q{index + 1}</span>
                            {/* <span 
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(submission.status) }}
                            >
                              {getStatusText(submission.status)}
                            </span> */}
                          </div>
                          <p className="question-text">{submission.question}</p>
                          {submission.selected && (
                            <div className="selected-answer">
                              <strong>Your Answer:</strong> {submission.selected}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default History;