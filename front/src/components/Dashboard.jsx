import React, { useState, useEffect, useRef } from 'react';

const Dashboard = () => {
    const [selectedButton, setSelectedButton] = useState(null);
    const [showFullDataset, setShowFullDataset] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const dashboardRef = useRef(null);
    
    const [statsData, setStatsData] = useState({
        incidentsToday: 2,
        mostCommonType: 'THEFT',
        peakTime: 'EVENING'
    });
    const [tableData, setTableData] = useState([
        { id: 1, date: '2025-11-13', type: 'THEFT', time: '18:30', location: 'location1' },
        { id: 2, date: '2025-11-13', type: 'TRAFFIC', time: '14:20', location: 'location2' },
        { id: 3, date: '2025-11-12', type: 'PROPERTY', time: '22:15', location: 'location3' },
        { id: 4, date: '2025-11-12', type: 'VIOLENT', time: '19:45', location: 'loaction4' },
        { id: 5, date: '2025-11-11', type: 'THEFT', time: '16:30', location: 'location5' },
    ]);

    useEffect(() => {
        const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
            setIsVisible(true);
            } else {
            setIsVisible(false);
            }
        },
        { threshold: 0.3 }
        );

        if (dashboardRef.current) {
        observer.observe(dashboardRef.current);
        }

        return () => {
        if (dashboardRef.current) {
            observer.unobserve(dashboardRef.current);
        }
        };
    }, []);

    const handleButtonClick = (buttonName) => {
        if (selectedButton === buttonName) {
        setSelectedButton(null);
        } else {
        setSelectedButton(buttonName);
        setShowFullDataset(false);
        }
    };

    const handleFullDatasetClick = () => {
        if (showFullDataset) {
        setShowFullDataset(false);
        } else {
        setShowFullDataset(true);
        setSelectedButton(null);
        }
    };

    return (
        <div className={`dashboard-section ${isVisible ? 'visible' : ''}`} ref={dashboardRef}>
        <div className="dashboard-left">
            <div className="stats-container">
            <button
                className={`stat-box ${selectedButton === 'incidents' ? 'active' : ''}`}
                onClick={() => handleButtonClick('incidents')}
            >
                <div className="stat-title">Incidents Today</div>
                <div className="stat-value">{statsData.incidentsToday}</div>
            </button>

            <button
                className={`stat-box ${selectedButton === 'type' ? 'active' : ''}`}
                onClick={() => handleButtonClick('type')}
            >
                <div className="stat-title">Most Common Type</div>
                <div className="stat-value">{statsData.mostCommonType}</div>
            </button>

            <button
                className={`stat-box ${selectedButton === 'time' ? 'active' : ''}`}
                onClick={() => handleButtonClick('time')}
            >
                <div className="stat-title">Peak Time</div>
                <div className="stat-value">{statsData.peakTime}</div>
            </button>
            </div>

            <button
            className={`full-dataset-link ${showFullDataset ? 'active' : ''}`}
            onClick={handleFullDatasetClick}
            >
            Full Dataset
            </button>
        </div>

        <div className="chart-container">
            {!showFullDataset && selectedButton === 'incidents' && (
            <div className="chart-content">
                <h2 className="chart-title">Number of Reported Incidents per Day</h2>
                <div className="chart-placeholder">
                <p>Bar chart</p>
                </div>
            </div>
            )}

            {!showFullDataset && selectedButton === 'type' && (
            <div className="chart-content">
                <h2 className="chart-title">Number of Reported Incidents per Type</h2>
                <div className="chart-placeholder">
                <p>Bar chart</p>
                </div>
            </div>
            )}

            {!showFullDataset && selectedButton === 'time' && (
            <div className="chart-content">
                <h2 className="chart-title">Number of Reported Incidents per Time</h2>
                <div className="chart-placeholder">
                <p>Bar chart</p>
                </div>
            </div>
            )}

            {showFullDataset && (
            <div className="table-content">
                <h2 className="chart-title">Full Dataset</h2>
                <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Time</th>
                        <th>Location</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tableData.map((row) => (
                        <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.date}</td>
                        <td>{row.type}</td>
                        <td>{row.time}</td>
                        <td>{row.location}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
            )}
        </div>
        </div>
    );
};

export default Dashboard;