import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './SubmissionPage.css';

const Submission = ({ user, onLogout }) => {
  const [submissionData, setSubmissionData] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { testId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissionData = async () => {
      try {
        if (!testId) {
          throw new Error('No test ID provided');
        }

        console.log('Fetching submission for testId:', testId);

        const response = await fetch(`/api/submission/${testId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch submission data. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        setSubmissionData(data.submissions);
        setTestInfo(data.test);
      } catch (err) {
        console.error('Error in fetchSubmissionData:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionData();
  }, [testId]);

  const calculateScore = () => {
  if (!submissionData || !testInfo) return 0;
  return submissionData.filter(sub => sub.status === 1).length * testInfo.eachQuesMarks;
};

  const getStatusColor = (status) => {
    switch (status) {
      case 1: return '#4caf50';
      case 0: return '#f44336';
      default: return '#ff9800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1: return 'Correct';
      case 0: return 'Incorrect';
      default: return 'Not Attempted';
    }
  };

  const getOptionLabel = (optionKey) => {
    switch (optionKey) {
      case 'A': return 'option1';
      case 'B': return 'option2';
      case 'C': return 'option3';
      case 'D': return 'option4';
      default: return '';
    }
  };

  const getSelectedOptionText = (submission) => {
    if (!submission.selected) return 'Not Attempted';
    
    const optionField = getOptionLabel(submission.selected);
    return submission[optionField] || `Option ${submission.selected}`;
  };

  const getCorrectOptionText = (submission) => {
    const optionField = getOptionLabel(submission.answer);
    return submission[optionField] || `Option ${submission.answer}`;
  };

  const handleBackToHistory = () => {
    navigate('/history');
  };

  if (loading) {
    return (
      <div className="submission-page">
        <Navbar user={user} onLogout={onLogout} />
        <div className="submission-container" style={{ marginTop: '80px' }}>
          <div className="loading-spinner">
            {/* <div className="spinner"></div>
            <p>Loading submission details...</p> */}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="submission-page">
        <Navbar user={user} onLogout={onLogout} />
        <div className="submission-container" style={{ marginTop: '80px' }}>
          <div className="error-message">
            <h2>Error Loading Submission</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={handleBackToHistory} className="back-btn">
                Back to History
              </button>
              <button onClick={() => window.location.reload()} className="retry-btn">
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="submission-page">
      <Navbar user={user} onLogout={onLogout} />
      <div className="submission-container" style={{ marginTop: '80px' }}>
        <header className="submission-header">
          <button onClick={handleBackToHistory} className="back-button">
            ← Back to History
          </button>
          <div className="sub-header-content">
            <h1>Test Submission Details</h1>
            {testInfo && (
              <div className="test-summary">
                <h2>{testInfo.testName}</h2>
                <div className="test-stats">
                  <div className="stat">
                    <span className="stat-label">Total Questions:</span>
                    <span className="stat-value">{submissionData?.length || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Score:</span>
                    <span className="stat-value score">
                      {calculateScore()} / {testInfo.numberOfQues*testInfo.eachQuesMarks}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Percentage:</span>
                    <span className="stat-value percentage">
                      {((calculateScore() / (testInfo.numberOfQues*testInfo.eachQuesMarks)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="submissions-list">
          {submissionData?.map((submission, index) => (
            <div key={index} className="submission-card">
              <div className="question-header">
                <div className="question-meta">
                  <span className="question-number">Question {index + 1}</span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(submission.status) }}
                  >
                    {getStatusText(submission.status)}
                  </span>
                </div>
              </div>
              
              <div className="question-content">
                <p className="question-text">{submission.question}</p>
                
                {/* Display all options */}
                <div className="options-section">
                  <h4>Options:</h4>
                  <div className="options-grid">
                    <div className={`option ${submission.answer === 'A' ? 'correct-option' : ''} ${submission.selected === 'A' ? 'selected-option' : ''}`}>
                      <span className="option-label">A:</span>
                      <span className="option-text">{submission.option1}</span>
                    </div>
                    <div className={`option ${submission.answer === 'B' ? 'correct-option' : ''} ${submission.selected === 'B' ? 'selected-option' : ''}`}>
                      <span className="option-label">B:</span>
                      <span className="option-text">{submission.option2}</span>
                    </div>
                    <div className={`option ${submission.answer === 'C' ? 'correct-option' : ''} ${submission.selected === 'C' ? 'selected-option' : ''}`}>
                      <span className="option-label">C:</span>
                      <span className="option-text">{submission.option3}</span>
                    </div>
                    <div className={`option ${submission.answer === 'D' ? 'correct-option' : ''} ${submission.selected === 'D' ? 'selected-option' : ''}`}>
                      <span className="option-label">D:</span>
                      <span className="option-text">{submission.option4}</span>
                    </div>
                  </div>
                </div>
                
                <div className="answers-section">
                  <div className="answer-row">
                    <span className="answer-label">Your Answer:</span>
                    <span className={`answer-value ${submission.status === 1 ? 'correct' : 'incorrect'}`}>
                      {getSelectedOptionText(submission)}
                    </span>
                  </div>
                  
                  {submission.status === 0 && (
                    <div className="answer-row">
                      <span className="answer-label">Correct Answer:</span>
                      <span className="answer-value correct">{getCorrectOptionText(submission)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {submissionData?.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>No Submission Data Found</h2>
            <p>There are no submissions available for this test.</p>
            <button onClick={handleBackToHistory} className="back-btn">
              Back to History
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Submission;