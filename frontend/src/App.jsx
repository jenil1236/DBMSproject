// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from 'react';
import AuthPage from "./pages/AuthPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Homepage from "./pages/Homepage";
import NotFound from "./pages/NotFound";
import TestsPage from "./pages/TestsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user or admin is already logged in when app loads
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check user auth
        const userRes = await fetch('/api/auth/check', {
          credentials: 'include'
        });

        if (userRes.ok) {
          const data = await userRes.json();
          setUser(data.user);
        } else {
          // Check admin auth
          const adminRes = await fetch('/api/admin/check', {
            credentials: 'include'
          });

          if (adminRes.ok) {
            const adminData = await adminRes.json();
            setAdmin(adminData.admin);
          }
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

  const handleAdminLogin = (adminData) => {
    setAdmin(adminData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleAdminLogout = () => {
    setAdmin(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage user={user} onLogout={handleLogout} />} />
          <Route
            path="/test"
            element={<TestsPage user={user} onLogout={handleLogout}/>}
          />
          <Route
            path="/announcements"
            element={<AnnouncementsPage user={user} onLogout={handleLogout}/>}
          />
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
          <Route
            path="/admin/login"
            element={admin ? <AdminDashboard admin={admin} onLogout={handleAdminLogout} /> : <AdminLogin onLogin={handleAdminLogin} />}
          />
          <Route
            path="/admin/dashboard"
            element={admin ? <AdminDashboard admin={admin} onLogout={handleAdminLogout} /> : <AdminLogin onLogin={handleAdminLogin} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;