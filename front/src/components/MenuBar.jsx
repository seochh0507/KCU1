import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MenuBar = () => {
    const navigate = useNavigate();

    const handleLogoClick = (e) => {
        e.preventDefault();
        navigate('/');
        setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 0);
    };

    return (
        <nav className="navbar">
        <div className="logo">
            <Link to="/" onClick={handleLogoClick}>MadCrime</Link>
        </div>
        <div className="nav-links">
            <Link to="/about" className="nav-link">ABOUT</Link>
            <Link to="/contact" className="nav-link">CONTACT</Link>
        </div>
        </nav>
    );
};

export default MenuBar;