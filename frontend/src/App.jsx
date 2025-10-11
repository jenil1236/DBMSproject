// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from 'react';
import AuthPage from "./pages/AuthPage";
import AdminLogin from "./pages/AdminLogin";
import Homepage from "./pages/Homepage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when app loads
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch('/api/auth/check', {
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={<Homepage user={user} onLogout={handleLogout} />}
          />
          <Route path="/test" element={<div>Test Page</div>} />
          <Route path="/history" element={<div>History Page</div>} />
          <Route path="/contact" element={<div>Contact Page</div>} />
          <Route 
            path="/login" 
            element={user ? <Homepage user={user} onLogout={handleLogout} /> : <AuthPage onLogin={handleLogin} />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Homepage user={user} onLogout={handleLogout} /> : <AuthPage onLogin={handleLogin} />} 
          />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;