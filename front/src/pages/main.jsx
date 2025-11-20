// import React, { useState, useEffect } from 'react';
// import MenuBar from '../components/MenuBar';
// import Dashboard from '../components/Dashboard';

// const Main = () => {
//     const targetNumber = 56; // This will come from backend later
//     const [displayNumber, setDisplayNumber] = useState(0);
//     const [isAnimating, setIsAnimating] = useState(false);

//     useEffect(() => {
//         setIsAnimating(true);
        
//         // Animate number counting up
//         const duration = 2000; // 2 seconds
//         const steps = 60;
//         const increment = targetNumber / steps;
//         let current = 0;
        
//         const timer = setInterval(() => {
//         current += increment;
//         if (current >= targetNumber) {
//             setDisplayNumber(targetNumber);
//             setIsAnimating(false);
//             clearInterval(timer);
//         } else {
//             setDisplayNumber(Math.floor(current));
//         }
//         }, duration / steps);

//         return () => clearInterval(timer);
//     }, [targetNumber]);

//     const scrollToDashboard = () => {
//         const dashboardSection = document.querySelector('.dashboard-section');
//         if (dashboardSection) {
//         dashboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
//         }
//     };

//     return (
//         <div className="home-container">
//         <MenuBar />
//         <div className="content">
//             <h1 className="title">Total Incident Reports in the past week:</h1>
//             <div className="number-container">
//             <span className={`number ${isAnimating ? 'animating' : ''}`}>
//                 {displayNumber}
//             </span>
//             </div>
//             <div className="cta-container" onClick={scrollToDashboard} style={{ cursor: 'pointer' }}>
//             <span className="arrow">˅</span>
//             <p className="cta-text">Let's go look at the details!</p>
//             </div>
//         </div>
        
//         <Dashboard />
//         </div>
//     );
// };

// export default Main;

import React, { useState, useEffect } from 'react';
import MenuBar from '../components/MenuBar';
import Dashboard from '../components/Dashboard';
import Map from '../components/Map';

const Main = () => {
    const targetNumber = 56; // This will come from backend later
    const [displayNumber, setDisplayNumber] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setIsAnimating(true);
        
        // Animate number counting up
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

    const scrollToDashboard = () => {
        const dashboardSection = document.querySelector('.dashboard-section');
        if (dashboardSection) {
        dashboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="home-container">
        <MenuBar />
        <div className="content">
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