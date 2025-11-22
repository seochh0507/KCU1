import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import MenuBar from '../components/MenuBar';
import Banner from '../components/Banner';
import Dashboard from '../components/Dashboard';
import Map from '../components/Map';

const Main = () => {
    const navigate = useNavigate();
    const [initialSearchQuery, setInitialSearchQuery] = useState('');
    const targetNumber = 56; // This will come from backend later
    const [displayNumber, setDisplayNumber] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const statsRef = useRef(null);

    // Intersection Observer for scroll-triggered animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Only trigger number animation once
                    if (!hasAnimated) {
                        startNumberAnimation();
                        setHasAnimated(true);
                    }
                } else {
                    setIsVisible(false);
                }
            },
            { threshold: 0.3 }
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => {
            if (statsRef.current) {
                observer.unobserve(statsRef.current);
            }
        };
    }, [hasAnimated]);

    const startNumberAnimation = () => {
        setIsAnimating(true);
        setDisplayNumber(0);
        
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = targetNumber / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetNumber) {
                setDisplayNumber(targetNumber);
                setIsAnimating(false);
                clearInterval(timer);
            } else {
                setDisplayNumber(Math.floor(current));
            }
        }, duration / steps);
    };

    const scrollToDashboard = () => {
        const dashboardSection = document.querySelector('.dashboard-section');
        if (dashboardSection) {
            dashboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleInitialSearch = () => {
        if (initialSearchQuery.trim()) {
            navigate(`/fulldata?search=${encodeURIComponent(initialSearchQuery)}`);
        }
    };

    const handleInitialKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleInitialSearch();
        }
    };

    return (
        <div className="home-container">
            <MenuBar />
            
            {/* Initial Section with Banner Carousel */}
            <div className="initial-section">
                <Banner />
                <div className="initial-search-container">
                    <div className="initial-search-box">
                        <Search size={20} className="initial-search-icon" />
                        <input
                            type="text"
                            placeholder="SEARCH"
                            value={initialSearchQuery}
                            onChange={(e) => setInitialSearchQuery(e.target.value)}
                            onKeyPress={handleInitialKeyPress}
                            className="initial-search-input"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Section with scroll animation */}
            <div className={`content stats-section ${isVisible ? 'visible' : ''}`} ref={statsRef}>
                <h1 className="title">Total Incident Reports in the past week:</h1>
                <div className="number-container">
                    <span className={`number ${isAnimating ? 'animating' : ''}`}>
                        {displayNumber}
                    </span>
                </div>
                <div className="cta-container" onClick={scrollToDashboard} style={{ cursor: 'pointer' }}>
                    <span className="arrow">˅</span>
                    <p className="cta-text">Let's go look at the details!</p>
                </div>
            </div>

            <Dashboard />
            <Map />
        </div>
    );
};

export default Main;