import { useState } from "react";
import "./AuthPage.css";
import { useLocation, useNavigate } from "react-router-dom";

function AuthPage({ onLogin }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if it's login or signup based on route
  const isLoginPage = location.pathname === "/login";
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ----------------- Handlers -----------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // In AuthPage.jsx - update the response handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const endpoint = isLoginPage ? "/api/auth/login" : "/api/auth/register";
      const body = isLoginPage
        ? { username: formData.username, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Success!");
        if (onLogin && data.user) {
          onLogin(data.user);
        }
        // Redirect to home page
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        // Show error message from backend
        setMessage(data.error || "Authentication failed");
      }
    } catch (err) {
      setMessage("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const toggleForm = () => {
    // Navigate to the other auth page instead of toggling state
    if (isLoginPage) {
      navigate("/signup");
    } else {
      navigate("/login");
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="logo">
            <div className="logo-circle"></div>
            <span>YourApp</span>
          </div>
          <h1 className="auth-title">
            {isLoginPage ? "Sign in" : "Create your account"}
          </h1>
          <p className="auth-subtitle">
            {isLoginPage ? "to continue to YourApp" : "to get started with YourApp"}
          </p>
        </div>

        {/* Google Sign In Button */}
        <button
          className="google-btn"
          onClick={googleLogin}
          type="button"
        >
          <i className="fab fa-google"></i>
          <span>Sign {isLoginPage ? "in" : "up"} with Google</span>
        </button>

        {/* Divider */}
        <div className="divider">
          <span>or</span>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLoginPage && (
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={handleInputChange}
                required={!isLoginPage}
                className="auth-input"
              />
              <label className="auth-label">Email</label>
              <i className="fas fa-envelope input-icon"></i>
            </div>
          )}

          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder=" "
              value={formData.username}
              onChange={handleInputChange}
              required
              className="auth-input"
            />
            <label className="auth-label">Username</label>
            <i className="fas fa-user input-icon"></i>
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder=" "
              value={formData.password}
              onChange={handleInputChange}
              required
              className="auth-input"
            />
            <label className="auth-label">Password</label>
            <i className="fas fa-lock input-icon"></i>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              isLoginPage ? "Sign in" : "Create account"
            )}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className={`message ${message.includes("Error") ? "error" : "success"}`}>
            {message}
          </div>
        )}

        {/* Footer */}
        <div className="auth-footer">
          <p>
            {isLoginPage ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="toggle-form-btn"
              onClick={toggleForm}
            >
              {isLoginPage ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>

      {/* Background Animation */}
      <div className="background-animation">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
    </div>
  );
}

export default AuthPage;