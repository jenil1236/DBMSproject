// src/pages/NotFound.jsx
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="animation-container">
          <div className="floating-element element-4">404</div>
        </div>
        
        <h1 className="not-found-title">Page Not Found</h1>
        
        <p className="not-found-message">
          Oops! The page you're looking for seems to have wandered off into the digital void.
        </p>
        
        <div className="not-found-actions">
          <button 
            className="home-btn"
            onClick={() => navigate("/")}
          >
            <i className="fas fa-home"></i>
            Back to Home
          </button>
          
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left"></i>
            Go Back
          </button>
        </div>
        
        <div className="search-suggestion">
          <p>Try searching or check the URL for typos</p>
        </div>
      </div>
      
      <div className="background-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}></div>
        ))}
      </div>
    </div>
  );
}

export default NotFound;