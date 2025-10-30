// src/pages/AnnouncementsPage.jsx
import { useState, useEffect } from 'react';
import './AnnouncementsPage.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function AnnouncementsPage({ user, onLogout }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcement', {
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (data.success) {
        setAnnouncements(data.data);
      } else {
        setError('Failed to load announcements');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getPriorityIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('urgent') || lowerTitle.includes('important')) {
      return { icon: 'fas fa-exclamation-triangle', color: '#e74c3c' };
    } else if (lowerTitle.includes('update') || lowerTitle.includes('new')) {
      return { icon: 'fas fa-info-circle', color: '#3498db' };
    } else if (lowerTitle.includes('maintenance') || lowerTitle.includes('system')) {
      return { icon: 'fas fa-tools', color: '#f39c12' };
    } else {
      return { icon: 'fas fa-bullhorn', color: '#27ae60' };
    }
  };

  if (loading) {
    return (
      <div className="announcements-page">
        <Navbar user={user} onLogout={onLogout} />
        <div className="announcements-loading">
          <div className="loading-spinner"></div>
          <p>Loading Announcements...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
    <Navbar user={user} onLogout={onLogout} />
    <div className="announcements-page">
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

      {/* Announcements Content */}
      <div className="container">
        {announcements.length === 0 ? (
          <div className="no-announcements">
            <div className="no-announcements-icon">
              <i className="fas fa-inbox"></i>
            </div>
            <h3>No Announcements Yet</h3>
            <p>Check back later for important updates and news</p>
          </div>
        ) : (
          <div className="announcements-grid">
            {announcements.map((announcement) => {
              const datetime = formatDate(announcement.date);
              const priority = getPriorityIcon(announcement.title);
              
              return (
                <div 
                  key={announcement.id} 
                  className="announcement-card"
                >

                  {/* Card Content */}
                  <div className="announcement-content">
                    <h3 className="announcement-title">{announcement.title}</h3>
                    <div className="announcement-body">
                      <p>{announcement.body}</p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="announcement-footer">
                    <div className="issued-by">
                      <i className="fas fa-user-tie"></i>
                      <span>Issued by: {announcement.issued_by}</span>
                    </div>
                    <div className="announcement-actions">
                      <button className="action-btn share-btn" title="Share">
                        <i className="fas fa-share-alt"></i>
                      </button>
                      <button className="action-btn bookmark-btn" title="Bookmark">
                        <i className="fas fa-bookmark"></i>
                      </button>
                    </div>
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

export default AnnouncementsPage;