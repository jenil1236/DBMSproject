import { useState } from "react";
import "./AuthPage.css";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const endpoint = isLogin ? "/api/login" : "/api/register";
      const body = isLogin 
        ? { username: formData.username, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      setMessage(data.message || data.error);
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
    setIsLogin(!isLogin);
    setMessage("");
    setFormData({ username: "", email: "", password: "" });
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
            {isLogin ? "Sign in" : "Create your account"}
          </h1>
          <p className="auth-subtitle">
            {isLogin ? "to continue to YourApp" : "to get started with YourApp"}
          </p>
        </div>

        {/* Google Sign In Button */}
        <button 
          className="google-btn"
          onClick={googleLogin}
          type="button"
        >
          <i className="fab fa-google"></i>
          <span>Sign {isLogin ? "in" : "up"} with Google</span>
        </button>

        {/* Divider */}
        <div className="divider">
          <span>or</span>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={handleInputChange}
                required={!isLogin}
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
              isLogin ? "Sign in" : "Create account"
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
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button" 
              className="toggle-form-btn"
              onClick={toggleForm}
            >
              {isLogin ? "Sign up" : "Sign in"}
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