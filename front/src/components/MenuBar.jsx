import React from 'react';
import { Link } from 'react-router-dom';

const MenuBar = () => {
    return (
        <nav className="navbar">
        <div className="logo">
            <Link to="/">MadCrime</Link>
        </div>
        <div className="nav-links">
            <Link to="/about" className="nav-link">ABOUT</Link>
            <Link to="/contact" className="nav-link">CONTACT</Link>
        </div>
        </nav>
    );
};

export default MenuBar;