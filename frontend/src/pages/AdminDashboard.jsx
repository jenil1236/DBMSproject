// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard({ admin, onLogout }) {
  const [announcements, setAnnouncements] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [testDetails, setTestDetails] = useState(null);
  const [showTestDetails, setShowTestDetails] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [testForm, setTestForm] = useState({
    testName: '',
    startTime: '',
    duration: 0,
    numberOfQues: 0,
    eachQuesMarks: 0
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    body: '',
    issued_by: ''
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch announcements
      const announcementsRes = await fetch('/api/announcement', {
        credentials: 'include'
      });
      const announcementsData = await announcementsRes.json();
      if (announcementsData.success) {
        setAnnouncements(announcementsData.data);
      }

      // Fetch tests
      const testsRes = await fetch('/api/admin/test', {
        credentials: 'include'
      });
      const testsData = await testsRes.json();
      if (testsData.success) {
        setTests(testsData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Test form handlers
  const handleTestInputChange = (e) => {
    const { name, value } = e.target;
    setTestForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAnnouncementInputChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const url = editingTest ? `/api/admin/test/${editingTest.id}` : '/api/admin/test/new';
      const method = editingTest ? 'PUT' : 'POST';

      const requestBody = {
        ...testForm,
      };

      // Include questions data for updates
      if (editingTest && testDetails?.questions) {
        requestBody.questions = testDetails.questions;
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      const data = await res.json();

      if (data.success) {
        await fetchData(); // Refresh data
        closeTestForm();
      } else {
        alert(data.message || 'Error saving test');
      }
    } catch (error) {
      console.error('Error saving test:', error);
      alert('Error saving test');
    } finally {
      setFormLoading(false);
    }
  };

  const handleQuestionAnswerChange = (questionId, newAnswer) => {
    if (testDetails?.questions) {
      const updatedQuestions = testDetails.questions.map(q => 
        q.id === questionId ? { ...q, answer: newAnswer } : q
      );
      setTestDetails({
        ...testDetails,
        questions: updatedQuestions
      });
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const url = editingAnnouncement ? `/api/announcement/${editingAnnouncement.id}` : '/api/announcement/new';
      const method = editingAnnouncement ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(announcementForm)
      });

      const data = await res.json();

      if (data.success) {
        await fetchData(); // Refresh data
        closeAnnouncementForm();
      } else {
        alert(data.message || 'Error saving announcement');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Error saving announcement');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTest = async (testId, startTime) => {
    // Check if test has started
    const now = new Date();
    const testStartTime = new Date(startTime);
    
    if (now >= testStartTime) {
      alert('Cannot delete test after it has started');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this test?')) return;

    try {
      const res = await fetch(`/api/admin/test/${testId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await res.json();

      if (data.success) {
        await fetchData(); // Refresh data
      } else {
        alert(data.message || 'Error deleting test');
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Error deleting test');
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const res = await fetch(`/api/announcement/${announcementId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await res.json();

      if (data.success) {
        await fetchData(); // Refresh data
      } else {
        alert(data.message || 'Error deleting announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Error deleting announcement');
    }
  };

  const openTestForm = async (test = null) => {
    if (test) {
      // Check if test has started
      const now = new Date();
      const testStartTime = new Date(test.startTime);
      
      if (now >= testStartTime) {
        alert('Cannot edit test after it has started');
        return;
      }

      setEditingTest(test);
      
      // Fetch test details with questions
      try {
        const res = await fetch(`/api/admin/test/${test.id}/details`, {
          credentials: 'include'
        });
        const data = await res.json();
        
        if (data.success) {
          setTestDetails(data.data);
          setTestForm({
            testName: test.testName,
            startTime: test.startTime.slice(0, 16), // Format for datetime-local
            duration: test.duration,
            numberOfQues: test.numberOfQues,
            eachQuesMarks: test.eachQuesMarks
          });
        }
      } catch (error) {
        console.error('Error fetching test details:', error);
      }
    } else {
      setEditingTest(null);
      setTestDetails(null);
      setTestForm({
        testName: '',
        startTime: '',
        duration: 0,
        numberOfQues: 0,
        eachQuesMarks: 0
      });
    }
    setShowTestForm(true);
  };

  const openAnnouncementForm = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setAnnouncementForm({
        title: announcement.title,
        body: announcement.body,
        issued_by: announcement.issued_by
      });
    } else {
      setEditingAnnouncement(null);
      setAnnouncementForm({
        title: '',
        body: '',
        issued_by: ''
      });
    }
    setShowAnnouncementForm(true);
  };

  const closeTestForm = () => {
    setShowTestForm(false);
    setEditingTest(null);
    setTestDetails(null);
    setTestForm({
      testName: '',
      startTime: '',
      duration: 0,
      numberOfQues: 0,
      eachQuesMarks: 0
    });
  };

  const closeAnnouncementForm = () => {
    setShowAnnouncementForm(false);
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: '',
      body: '',
      issued_by: ''
    });
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', {
        method: 'GET',
        credentials: 'include'
      });

      if (res.ok) {
        onLogout();
        navigate('/admin/login');
      } else {
        console.error('Logout failed');
        onLogout();
        navigate('/admin/login');
      }
    } catch (err) {
      console.error('Logout error:', err);
      onLogout();
      navigate('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-dashboard-loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-dashboard-header">
        <div className="admin-dashboard-header-content">
          <div className="admin-dashboard-header-left">
            <div className="admin-dashboard-logo">
              <i className="fas fa-shield-alt"></i>
              <span>Admin Dashboard</span>
            </div>
          </div>
          <div className="admin-dashboard-header-right">
            <div className="admin-dashboard-info">
              <i className="fas fa-user-tie"></i>
              <span>Welcome, {admin?.adminUserName}</span>
            </div>
            <button className="admin-dashboard-logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-dashboard-content">
        {/* Announcements Section */}
        <section className="admin-dashboard-section">
          <div className="admin-dashboard-section-header">
            <h2 className="admin-dashboard-section-title">
              <i className="fas fa-bullhorn"></i>
              Announcements
            </h2>
            <button 
              className="admin-dashboard-btn-primary" 
              onClick={() => openAnnouncementForm()}
            >
              <i className="fas fa-plus"></i>
              New Announcement
            </button>
          </div>

          <div className="admin-dashboard-announcements-grid">
            {announcements.map(announcement => (
              <div key={announcement.id} className="admin-dashboard-announcement-card">
                <div className="admin-dashboard-announcement-header">
                  <h3 className="admin-dashboard-announcement-title">{announcement.title}</h3>
                  <span className="admin-dashboard-announcement-date">
                    Date: {new Date(announcement.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="admin-dashboard-announcement-body">
                  <p>{announcement.body}</p>
                </div>
                <div className="admin-dashboard-announcement-footer">
                  <span className="admin-dashboard-issued-by">Issued By: {announcement.issued_by}</span>
                  <div className="admin-dashboard-announcement-actions">
                    <button 
                      className="admin-dashboard-btn-warning admin-dashboard-btn-sm"
                      onClick={() => openAnnouncementForm(announcement)}
                    >
                      <i className="fas fa-edit"></i>
                      Edit
                    </button>
                    <button 
                      className="admin-dashboard-btn-danger admin-dashboard-btn-sm"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tests Section */}
        <section className="admin-dashboard-section">
          <div className="admin-dashboard-section-header">
            <h2 className="admin-dashboard-section-title">
              <i className="fas fa-file-alt"></i>
              Tests
            </h2>
            <button 
              className="admin-dashboard-btn-primary" 
              onClick={() => openTestForm()}
            >
              <i className="fas fa-plus"></i>
              New Test
            </button>
          </div>

          <div className="admin-dashboard-tests-grid">
            {tests.map(test => {
              const dateObj = new Date(test.startTime);
              const date = dateObj.toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              });
              const time = dateObj.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
              }).toLowerCase();

              return (
                <div key={test.id} className="admin-dashboard-test-card">
                  <div className="admin-dashboard-test-header">
                    <h3 className="admin-dashboard-test-name">{test.testName}</h3>
                  </div>
                  <div className="admin-dashboard-test-details">
                    <div className="admin-dashboard-test-info">
                      <i className="fas fa-calendar"></i>
                      <span>Scheduled: {date}</span>
                    </div>
                    <div className="admin-dashboard-test-info">
                      <i className="fas fa-clock"></i>
                      <span>Time: {time}</span>
                    </div>
                    <div className="admin-dashboard-test-info">
                      <i className="fas fa-question-circle"></i>
                      <span>Questions: {test.numberOfQues}</span>
                    </div>
                    <div className="admin-dashboard-test-info">
                      <i className="fas fa-star"></i>
                      <span>Total Marks: {test.numberOfQues*test.eachQuesMarks}</span>
                    </div>
                  </div>
                  <div className="admin-dashboard-test-actions">
                    {(() => {
                      const now = new Date();
                      const testStartTime = new Date(test.startTime);
                      const canModify = now < testStartTime;
                      
                      return (
                        <>
                          <button 
                            className={`admin-dashboard-btn-warning ${!canModify ? 'disabled' : ''}`}
                            onClick={() => openTestForm(test)}
                            disabled={!canModify}
                            title={!canModify ? 'Cannot edit test after it has started' : 'Edit test'}
                          >
                            <i className="fas fa-edit"></i>
                            Edit
                          </button>
                          <button 
                            className={`admin-dashboard-btn-danger ${!canModify ? 'disabled' : ''}`}
                            onClick={() => handleDeleteTest(test.id, test.startTime)}
                            disabled={!canModify}
                            title={!canModify ? 'Cannot delete test after it has started' : 'Delete test'}
                          >
                            <i className="fas fa-trash"></i>
                            Delete
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Test Form Modal */}
      {showTestForm && (
        <div className="admin-dashboard-modal-overlay">
          <div className="admin-dashboard-modal admin-dashboard-modal-large">
            <div className="admin-dashboard-modal-header">
              <h3>{editingTest ? 'Edit Test' : 'Create New Test'}</h3>
              <button 
                className="admin-dashboard-modal-close"
                onClick={closeTestForm}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleTestSubmit} className="admin-dashboard-form">
              <div className="admin-dashboard-form-row">
                <div className="admin-dashboard-form-group">
                  <label>Test Name</label>
                  <input
                    type="text"
                    name="testName"
                    value={testForm.testName}
                    onChange={handleTestInputChange}
                    required
                  />
                </div>
                <div className="admin-dashboard-form-group">
                  <label>Start Time</label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={testForm.startTime}
                    onChange={handleTestInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="admin-dashboard-form-row">
                <div className="admin-dashboard-form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={testForm.duration}
                    onChange={handleTestInputChange}
                    min="1"
                    required
                  />
                </div>
                <div className="admin-dashboard-form-group">
                  <label>Number of Questions</label>
                  <input
                    type="number"
                    name="numberOfQues"
                    value={testForm.numberOfQues}
                    onChange={handleTestInputChange}
                    min="1"
                    required
                    disabled={editingTest} // Can't change number of questions when editing
                  />
                </div>
                <div className="admin-dashboard-form-group">
                  <label>Marks per Question</label>
                  <input
                    type="number"
                    name="eachQuesMarks"
                    value={testForm.eachQuesMarks}
                    onChange={handleTestInputChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Questions Section - Only show when editing */}
              {editingTest && testDetails?.questions && (
                <div className="admin-dashboard-questions-section">
                  <h4 className="admin-dashboard-questions-title">
                    <i className="fas fa-question-circle"></i>
                    Test Questions (You can only update answers)
                  </h4>
                  <div className="admin-dashboard-questions-list">
                    {testDetails.questions.map((question, index) => (
                      <div key={question.id} className="admin-dashboard-question-card">
                        <div className="admin-dashboard-question-header">
                          <span className="admin-dashboard-question-number">Q{index + 1}</span>
                        </div>
                        <div className="admin-dashboard-question-content">
                          <p className="admin-dashboard-question-text">{question.question}</p>
                          <div className="admin-dashboard-options-grid">
                            <div className="admin-dashboard-option">A) {question.option1}</div>
                            <div className="admin-dashboard-option">B) {question.option2}</div>
                            <div className="admin-dashboard-option">C) {question.option3}</div>
                            <div className="admin-dashboard-option">D) {question.option4}</div>
                          </div>
                          <div className="admin-dashboard-answer-section">
                            <label>Correct Answer:</label>
                            <select 
                              value={question.answer} 
                              onChange={(e) => handleQuestionAnswerChange(question.id, e.target.value)}
                              className="admin-dashboard-answer-select"
                            >
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="admin-dashboard-form-actions">
                <button
                  type="button"
                  className="admin-dashboard-btn-secondary"
                  onClick={closeTestForm}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-dashboard-btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <div className="admin-dashboard-btn-spinner"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {editingTest ? 'Update Test' : 'Create Test'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Form Modal */}
      {showAnnouncementForm && (
        <div className="admin-dashboard-modal-overlay">
          <div className="admin-dashboard-modal">
            <div className="admin-dashboard-modal-header">
              <h3>{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</h3>
              <button 
                className="admin-dashboard-modal-close"
                onClick={closeAnnouncementForm}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAnnouncementSubmit} className="admin-dashboard-form">
              <div className="admin-dashboard-form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={announcementForm.title}
                  onChange={handleAnnouncementInputChange}
                  required
                />
              </div>
              <div className="admin-dashboard-form-group">
                <label>Body</label>
                <textarea
                  name="body"
                  value={announcementForm.body}
                  onChange={handleAnnouncementInputChange}
                  rows="4"
                  required
                />
              </div>
              <div className="admin-dashboard-form-group">
                <label>Issued By</label>
                <input
                  type="text"
                  name="issued_by"
                  value={announcementForm.issued_by}
                  onChange={handleAnnouncementInputChange}
                  required
                />
              </div>
              <div className="admin-dashboard-form-actions">
                <button
                  type="button"
                  className="admin-dashboard-btn-secondary"
                  onClick={closeAnnouncementForm}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-dashboard-btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <div className="admin-dashboard-btn-spinner"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;