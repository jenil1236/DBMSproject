import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // In Navbar.jsx - update logout function
    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'GET',  // Change from POST to GET
                credentials: 'include'
            });

            if (res.ok) {
                onLogout();
                // Optional: redirect to home after logout
                window.location.href = '/';
            } else {
                console.error('Logout failed');
                onLogout(); // Still clear frontend state
            }
        } catch (err) {
            console.error('Logout error:', err);
            onLogout();
        }
    };
    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                {/* Logo */}
                <Link to="/" className="nav-logo">
                    <div className="logo-icon">
                        <i className="fas fa-brain"></i>
                    </div>
                    <span>LogicMaster</span>
                </Link>

                {/* Navigation Links */}
                <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <i className="fas fa-home"></i>
                        Home
                    </Link>
                    <Link
                        to="/test"
                        className={`nav-link ${location.pathname === '/test' ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <i className="fas fa-puzzle-piece"></i>
                        Test
                    </Link>
                    <Link
                        to="/history"
                        className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <i className="fas fa-history"></i>
                        History
                    </Link>
                    <Link
                        to="/contact"
                        className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <i className="fas fa-envelope"></i>
                        Contact Us
                    </Link>
                </div>

                {/* Auth Section */}
                <div className="nav-auth">
                    {user ? (
                        <div className="user-section">
                            <span className="welcome-text">
                                <i className="fas fa-user-circle"></i>
                                Welcome, {user?.name || user?.username || 'User'}
                            </span>
                            <button className="logout-btn" onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt"></i>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="login-btn">
                                <i className="fas fa-sign-in-alt"></i>
                                Login
                            </Link>
                            <Link to="/signup" className="signup-btn">
                                <i className="fas fa-user-plus"></i>
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div
                    className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;