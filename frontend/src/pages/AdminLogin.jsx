import { useState } from "react";
import "./AdminLogin.css";

function AdminLogin() {
  const [formData, setFormData] = useState({
    adminUserName: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          adminUserName: formData.adminUserName,
          password: formData.password
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage(data.message);
        // Redirect or handle successful login here
        console.log("Admin logged in:", data.admin);
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      setMessage("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        {/* Header */}
        <div className="admin-login-header">
          <div className="admin-logo">
            <div className="admin-logo-shield">
              <i className="fas fa-shield-alt"></i>
            </div>
            <span>Admin Portal</span>
          </div>
          <h1 className="admin-login-title">Admin Sign in</h1>
          <p className="admin-login-subtitle">Access the administration dashboard</p>
        </div>

        {/* Form */}
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="adminUserName"
              placeholder=" "
              value={formData.adminUserName}
              onChange={handleInputChange}
              required
              className="admin-input"
            />
            <label className="admin-label">Admin Username</label>
            <i className="fas fa-user-cog input-icon"></i>
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder=" "
              value={formData.password}
              onChange={handleInputChange}
              required
              className="admin-input"
            />
            <label className="admin-label">Password</label>
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
            className="admin-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Sign in as Admin
              </>
            )}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className={`admin-message ${message.includes("Invalid") || message.includes("Error") ? "error" : "success"}`}>
            <i className={`fas ${message.includes("Invalid") || message.includes("Error") ? "fa-exclamation-circle" : "fa-check-circle"}`}></i>
            {message}
          </div>
        )}

        {/* Security Notice */}
        <div className="security-notice">
          <i className="fas fa-info-circle"></i>
          <span>Restricted access. For authorized personnel only.</span>
        </div>
      </div>

      {/* Background Animation */}
      <div className="admin-background-animation">
        <div className="admin-shield admin-shield-1"></div>
        <div className="admin-shield admin-shield-2"></div>
        <div className="admin-shield admin-shield-3"></div>
      </div>
    </div>
  );
}

export default AdminLogin;