import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './HomePage.css';

const HomePage = ({ user, onLogout }) => {
  const features = [
    {
      icon: 'fas fa-bolt',
      title: 'Instant Results',
      description: 'Get immediate feedback and detailed analysis after each test'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Track Progress',
      description: 'Monitor your improvement with comprehensive history and analytics'
    },
    {
      icon: 'fas fa-trophy',
      title: 'Achievement System',
      description: 'Earn badges and rewards as you master logical reasoning'
    },
    {
      icon: 'fas fa-users',
      title: 'Community',
      description: 'Join discussions and learn from other logical thinkers'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Tests Taken' },
    { number: '95%', label: 'User Satisfaction' },
    { number: '500+', label: 'Practice Questions' },
    { number: '24/7', label: 'Available' }
  ];

  return (
    <div className="home">
      <Navbar user={user} onLogout={onLogout} />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Master
              <span className="gradient-text"> Logical Reasoning</span>
              <br />
              Like Never Before
            </h1>
            <p className="hero-description">
              Challenge your mind with our comprehensive logical reasoning tests. 
              Get instant results, track your progress, and join a community of 
              critical thinkers dedicated to mastering the art of logic.
            </p>
            <div className="hero-buttons">
              <button className="btn primary">
                <i className="fas fa-play"></i>
                Start Test Now
              </button>
              <button className="btn secondary">
                <i className="fas fa-chart-bar"></i>
                View Demo
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="brain-animation">
              <div className="brain-container">
                <i className="fas fa-brain main-brain"></i>
                <div className="orbiting-element orb-1">
                  <i className="fas fa-puzzle-piece"></i>
                </div>
                <div className="orbiting-element orb-2">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <div className="orbiting-element orb-3">
                  <i className="fas fa-chart-line"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose LogicMaster?</h2>
            <p>Experience the future of logical reasoning assessment</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-glow"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Challenge Your Mind?</h2>
            <p>Join thousands of users who are improving their logical reasoning skills daily</p>
            <button className="btn primary large">
              <i className="fas fa-rocket"></i>
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;