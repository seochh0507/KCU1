import React, { useState, useEffect } from 'react';
import MenuBar from '../components/MenuBar';

const Main = () => {
    const targetNumber = 56; 
    const [displayNumber, setDisplayNumber] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setIsAnimating(true);
        
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

        return () => clearInterval(timer);
    }, [targetNumber]);

    return (
        <div className="home-container">
        <MenuBar />
        <div className="content">
            <h1 className="title">Total Incident Reports in the past week:</h1>
            <div className="number-container">
            <span className={`number ${isAnimating ? 'animating' : 'glow'}`}>
                {displayNumber}
            </span>
            </div>
            <div className="cta-container">
            <span className="arrow">˅</span>
            <p className="cta-text">Let's go look at the details!</p>
            </div>
        </div>
        </div>
    );
};

export default Main;