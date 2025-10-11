import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <i className="fas fa-brain"></i>
              <span>LogicMaster</span>
            </div>
            <p className="footer-description">
              Master logical reasoning with our comprehensive test platform. 
              Enhance your critical thinking skills and track your progress.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-link">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" className="social-link">
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <div className="footer-links">
              <a href="/">Home</a>
              <a href="/test">Take Test</a>
              <a href="/history">History</a>
              <a href="/contact">Contact</a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Support</h3>
            <div className="footer-links">
              <a href="/help">Help Center</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/faq">FAQ</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <p>&copy; 2024 LogicMaster. All rights reserved. Crafted with 💙 for logical minds.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;