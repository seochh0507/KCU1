// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// const Dashboard = () => {
//     const navigate = useNavigate();
//     const [selectedButton, setSelectedButton] = useState(null);
//     const [isVisible, setIsVisible] = useState(false);
//     const [showCalendar, setShowCalendar] = useState(false);
//     const [selectedDate, setSelectedDate] = useState(new Date());
//     const [currentMonth, setCurrentMonth] = useState(new Date());
//     const dashboardRef = useRef(null);
//     const calendarRef = useRef(null);
    
//     // This will be replaced with actual data from backend
//     const [statsData, setStatsData] = useState({
//         incidentsToday: 2,
//         mostCommonType: 'THEFT',
//         peakTime: 'EVENING'
//     });

//     // Format date for display
//     const formatDate = (date) => {
//         return date.toLocaleDateString('en-US', { 
//             year: 'numeric', 
//             month: 'long', 
//             day: 'numeric' 
//         });
//     };

//     // Get the date range (7 days before selected date)
//     const getDateRange = (endDate) => {
//         const start = new Date(endDate);
//         start.setDate(start.getDate() - 6);
//         return {
//             start: formatDate(start),
//             end: formatDate(endDate)
//         };
//     };

//     useEffect(() => {
//         const observer = new IntersectionObserver(
//             ([entry]) => {
//                 if (entry.isIntersecting) {
//                     setIsVisible(true);
//                 } else {
//                     setIsVisible(false);
//                 }
//             },
//             { threshold: 0.3 }
//         );

//         if (dashboardRef.current) {
//             observer.observe(dashboardRef.current);
//         }

//         return () => {
//             if (dashboardRef.current) {
//                 observer.unobserve(dashboardRef.current);
//             }
//         };
//     }, []);

//     // Close calendar when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (calendarRef.current && !calendarRef.current.contains(event.target)) {
//                 setShowCalendar(false);
//             }
//         };

//         if (showCalendar) {
//             document.addEventListener('mousedown', handleClickOutside);
//         }

//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [showCalendar]);

//     // Update stats when date changes (this will fetch from backend)
//     useEffect(() => {
//         // TODO: Fetch data from backend for the selected date range
//         console.log('Fetching data for:', getDateRange(selectedDate));
//         // setStatsData(...); // Update with backend data
//     }, [selectedDate]);

//     const handleButtonClick = (buttonName) => {
//         if (selectedButton === buttonName) {
//             setSelectedButton(null);
//         } else {
//             setSelectedButton(buttonName);
//         }
//     };

//     const handleFullDatasetClick = () => {
//         navigate('/fulldata');
//     };

//     const handleDateSelect = (date) => {
//         setSelectedDate(date);
//         setShowCalendar(false);
//     };

//     // Calendar helper functions
//     const getDaysInMonth = (date) => {
//         const year = date.getFullYear();
//         const month = date.getMonth();
//         const firstDay = new Date(year, month, 1);
//         const lastDay = new Date(year, month + 1, 0);
//         const daysInMonth = lastDay.getDate();
//         const startingDayOfWeek = firstDay.getDay();

//         const days = [];
        
//         // Add empty slots for days before the first day of month
//         for (let i = 0; i < startingDayOfWeek; i++) {
//             days.push(null);
//         }
        
//         // Add all days of the month
//         for (let day = 1; day <= daysInMonth; day++) {
//             days.push(new Date(year, month, day));
//         }
        
//         return days;
//     };

//     const isSameDay = (date1, date2) => {
//         if (!date1 || !date2) return false;
//         return date1.getDate() === date2.getDate() &&
//                date1.getMonth() === date2.getMonth() &&
//                date1.getFullYear() === date2.getFullYear();
//     };

//     const isToday = (date) => {
//         if (!date) return false;
//         return isSameDay(date, new Date());
//     };

//     const isFutureDate = (date) => {
//         if (!date) return false;
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         return date > today;
//     };

//     const goToPreviousMonth = () => {
//         setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
//     };

//     const goToNextMonth = () => {
//         const today = new Date();
//         const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
//         if (nextMonth <= today) {
//             setCurrentMonth(nextMonth);
//         }
//     };

//     const canGoToNextMonth = () => {
//         const today = new Date();
//         const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
//         return nextMonth <= today;
//     };

//     const hasContent = selectedButton !== null;
//     const dateRange = getDateRange(selectedDate);

//     const CalendarComponent = () => (
//         <div className="calendar-component" ref={calendarRef}>
//             <div className="calendar-header">
//                 <button onClick={goToPreviousMonth} className="calendar-nav-button">
//                     <ChevronLeft size={20} />
//                 </button>
//                 <span className="calendar-month">
//                     {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
//                 </span>
//                 <button 
//                     onClick={goToNextMonth} 
//                     className="calendar-nav-button"
//                     disabled={!canGoToNextMonth()}
//                 >
//                     <ChevronRight size={20} />
//                 </button>
//             </div>
//             <div className="calendar-grid">
//                 <div className="calendar-weekdays">
//                     {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
//                         <div key={day} className="calendar-weekday">{day}</div>
//                     ))}
//                 </div>
//                 <div className="calendar-days">
//                     {getDaysInMonth(currentMonth).map((date, index) => (
//                         <button
//                             key={index}
//                             className={`calendar-day ${!date ? 'empty' : ''} ${isSameDay(date, selectedDate) ? 'selected' : ''} ${isToday(date) ? 'today' : ''} ${isFutureDate(date) ? 'disabled' : ''}`}
//                             onClick={() => date && !isFutureDate(date) && handleDateSelect(date)}
//                             disabled={!date || isFutureDate(date)}
//                         >
//                             {date ? date.getDate() : ''}
//                         </button>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );

//     return (
//         <div className={`dashboard-section ${isVisible ? 'visible' : ''} ${hasContent ? 'has-content' : ''}`} ref={dashboardRef}>
//             {!hasContent && (
//                 <>
//                     <div className="dashboard-left">
//                         <div className="stats-container">
//                             <button
//                                 className={`stat-box`}
//                                 onClick={() => handleButtonClick('incidents')}
//                             >
//                                 <div className="stat-title">Incidents Today</div>
//                                 <div className="stat-value">{statsData.incidentsToday}</div>
//                             </button>

//                             <button
//                                 className={`stat-box`}
//                                 onClick={() => handleButtonClick('type')}
//                             >
//                                 <div className="stat-title">Most Common Type</div>
//                                 <div className="stat-value">{statsData.mostCommonType}</div>
//                             </button>

//                             <button
//                                 className={`stat-box`}
//                                 onClick={() => handleButtonClick('time')}
//                             >
//                                 <div className="stat-title">Peak Time</div>
//                                 <div className="stat-value">{statsData.peakTime}</div>
//                             </button>
//                         </div>

//                         <button
//                             className={`full-dataset-link`}
//                             onClick={handleFullDatasetClick}
//                         >
//                             Full Dataset
//                         </button>
//                     </div>
//                     <div className="chart-container">
//                         <CalendarComponent />
//                     </div>
//                 </>
//             )}

//             {hasContent && (
//                 <div className="dashboard-centered">
//                     <div className="chart-container-centered">
//                         {selectedButton === 'incidents' && (
//                             <div className="chart-content">
//                                 <div className="chart-header">
//                                     <h2 className="chart-title">Number of Reported Incidents per Day</h2>
//                                     <button className="calendar-toggle-button" onClick={() => setShowCalendar(!showCalendar)}>
//                                         <Calendar size={24} />
//                                     </button>
//                                 </div>
//                                 {showCalendar && <CalendarComponent />}
//                                 <div className="chart-placeholder">
//                                     <p>Bar chart</p>
//                                     <p className="chart-date-info">Data from {dateRange.start} to {dateRange.end}</p>
//                                 </div>
//                             </div>
//                         )}

//                         {selectedButton === 'type' && (
//                             <div className="chart-content">
//                                 <div className="chart-header">
//                                     <h2 className="chart-title">Number of Reported Incidents per Type</h2>
//                                     <button className="calendar-toggle-button" onClick={() => setShowCalendar(!showCalendar)}>
//                                         <Calendar size={24} />
//                                     </button>
//                                 </div>
//                                 {showCalendar && <CalendarComponent />}
//                                 <div className="chart-placeholder">
//                                     <p>Bar chart</p>
//                                     <p className="chart-date-info">Data from {dateRange.start} to {dateRange.end}</p>
//                                 </div>
//                             </div>
//                         )}

//                         {selectedButton === 'time' && (
//                             <div className="chart-content">
//                                 <div className="chart-header">
//                                     <h2 className="chart-title">Number of Reported Incidents per Time</h2>
//                                     <button className="calendar-toggle-button" onClick={() => setShowCalendar(!showCalendar)}>
//                                         <Calendar size={24} />
//                                     </button>
//                                 </div>
//                                 {showCalendar && <CalendarComponent />}
//                                 <div className="chart-placeholder">
//                                     <p>Bar chart</p>
//                                     <p className="chart-date-info">Data from {dateRange.start} to {dateRange.end}</p>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     <div className="dashboard-bottom">
//                         <div className="stats-container-small">
//                             <button
//                                 className={`stat-box-small ${selectedButton === 'incidents' ? 'active' : ''}`}
//                                 onClick={() => handleButtonClick('incidents')}
//                             >
//                                 <div className="stat-title-small">Incidents Today</div>
//                                 <div className="stat-value-small">{statsData.incidentsToday}</div>
//                             </button>

//                             <button
//                                 className={`stat-box-small ${selectedButton === 'type' ? 'active' : ''}`}
//                                 onClick={() => handleButtonClick('type')}
//                             >
//                                 <div className="stat-title-small">Most Common Type</div>
//                                 <div className="stat-value-small">{statsData.mostCommonType}</div>
//                             </button>

//                             <button
//                                 className={`stat-box-small ${selectedButton === 'time' ? 'active' : ''}`}
//                                 onClick={() => handleButtonClick('time')}
//                             >
//                                 <div className="stat-title-small">Peak Time</div>
//                                 <div className="stat-value-small">{statsData.peakTime}</div>
//                             </button>
//                         </div>

//                         <button
//                             className={`full-dataset-link-small`}
//                             onClick={handleFullDatasetClick}
//                         >
//                             Full Dataset
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Dashboard;

// front/src/components/Dashboard.jsx
// 2단계 – Dashboard가 props로 오는 statsData 쓰도록 바꾸기

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const Dashboard = ({ statsData }) => {
    const navigate = useNavigate();
    const [selectedButton, setSelectedButton] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const dashboardRef = useRef(null);
    const calendarRef = useRef(null);

    // 🔹 props로 받은 statsData가 없을 때를 위한 기본값
    const safeStats = statsData || {
        incidentsToday: 0,
        mostCommonType: '-',
        peakTime: '-',
    };

    // Format date for display
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Get the date range (7 days before selected date)
    const getDateRange = (endDate) => {
        const start = new Date(endDate);
        start.setDate(start.getDate() - 6);
        return {
            start: formatDate(start),
            end: formatDate(endDate)
        };
    };

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

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };

        if (showCalendar) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCalendar]);

    // 🔹 선택 날짜 변경 시 백엔드에서 데이터를 가져올 수 있는 자리 (지금은 콘솔만)
    useEffect(() => {
        console.log('Dashboard date range:', getDateRange(selectedDate));
        // 나중에 날짜별 통계를 따로 뽑고 싶으면 여기서 fetch + state 추가
    }, [selectedDate]);

    const handleButtonClick = (buttonName) => {
        if (selectedButton === buttonName) {
            setSelectedButton(null);
        } else {
            setSelectedButton(buttonName);
        }
    };

    const handleFullDatasetClick = () => {
        navigate('/fulldata');
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setShowCalendar(false);
    };

    // Calendar helper functions
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        // Add empty slots for days before the first day of month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        
        return days;
    };

    const isSameDay = (date1, date2) => {
        if (!date1 || !date2) return false;
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    };

    const isToday = (date) => {
        if (!date) return false;
        return isSameDay(date, new Date());
    };

    const isFutureDate = (date) => {
        if (!date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date > today;
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const goToNextMonth = () => {
        const today = new Date();
        const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
        if (nextMonth <= today) {
            setCurrentMonth(nextMonth);
        }
    };

    const canGoToNextMonth = () => {
        const today = new Date();
        const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
        return nextMonth <= today;
    };

    const hasContent = selectedButton !== null;
    const dateRange = getDateRange(selectedDate);

    const CalendarComponent = () => (
        <div className="calendar-component" ref={calendarRef}>
            <div className="calendar-header">
                <button onClick={goToPreviousMonth} className="calendar-nav-button">
                    <ChevronLeft size={20} />
                </button>
                <span className="calendar-month">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button 
                    onClick={goToNextMonth} 
                    className="calendar-nav-button"
                    disabled={!canGoToNextMonth()}
                >
                    <ChevronRight size={20} />
                </button>
            </div>
            <div className="calendar-grid">
                <div className="calendar-weekdays">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="calendar-weekday">{day}</div>
                    ))}
                </div>
                <div className="calendar-days">
                    {getDaysInMonth(currentMonth).map((date, index) => (
                        <button
                            key={index}
                            className={`calendar-day ${!date ? 'empty' : ''} ${isSameDay(date, selectedDate) ? 'selected' : ''} ${isToday(date) ? 'today' : ''} ${isFutureDate(date) ? 'disabled' : ''}`}
                            onClick={() => date && !isFutureDate(date) && handleDateSelect(date)}
                            disabled={!date || isFutureDate(date)}
                        >
                            {date ? date.getDate() : ''}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className={`dashboard-section ${isVisible ? 'visible' : ''} ${hasContent ? 'has-content' : ''}`} ref={dashboardRef}>
            {!hasContent && (
                <>
                    <div className="dashboard-left">
                        <div className="stats-container">
                            <button
                                className={`stat-box`}
                                onClick={() => handleButtonClick('incidents')}
                            >
                                <div className="stat-title">Incidents Today</div>
                                <div className="stat-value">{safeStats.incidentsToday}</div>
                            </button>

                            <button
                                className={`stat-box`}
                                onClick={() => handleButtonClick('type')}
                            >
                                <div className="stat-title">Most Common Type</div>
                                <div className="stat-value">{safeStats.mostCommonType}</div>
                            </button>

                            <button
                                className={`stat-box`}
                                onClick={() => handleButtonClick('time')}
                            >
                                <div className="stat-title">Peak Time</div>
                                <div className="stat-value">{safeStats.peakTime}</div>
                            </button>
                        </div>

                        <button
                            className={`full-dataset-link`}
                            onClick={handleFullDatasetClick}
                        >
                            Full Dataset
                        </button>
                    </div>
                    <div className="chart-container">
                        <CalendarComponent />
                    </div>
                </>
            )}

            {hasContent && (
                <div className="dashboard-centered">
                    <div className="chart-container-centered">
                        {selectedButton === 'incidents' && (
                            <div className="chart-content">
                                <div className="chart-header">
                                    <h2 className="chart-title">Number of Reported Incidents per Day</h2>
                                    <button className="calendar-toggle-button" onClick={() => setShowCalendar(!showCalendar)}>
                                        <Calendar size={24} />
                                    </button>
                                </div>
                                {showCalendar && <CalendarComponent />}
                                <div className="chart-placeholder">
                                    <p>Bar chart</p>
                                    <p className="chart-date-info">Data from {dateRange.start} to {dateRange.end}</p>
                                </div>
                            </div>
                        )}

                        {selectedButton === 'type' && (
                            <div className="chart-content">
                                <div className="chart-header">
                                    <h2 className="chart-title">Number of Reported Incidents per Type</h2>
                                    <button className="calendar-toggle-button" onClick={() => setShowCalendar(!showCalendar)}>
                                        <Calendar size={24} />
                                    </button>
                                </div>
                                {showCalendar && <CalendarComponent />}
                                <div className="chart-placeholder">
                                    <p>Bar chart</p>
                                    <p className="chart-date-info">Data from {dateRange.start} to {dateRange.end}</p>
                                </div>
                            </div>
                        )}

                        {selectedButton === 'time' && (
                            <div className="chart-content">
                                <div className="chart-header">
                                    <h2 className="chart-title">Number of Reported Incidents per Time</h2>
                                    <button className="calendar-toggle-button" onClick={() => setShowCalendar(!showCalendar)}>
                                        <Calendar size={24} />
                                    </button>
                                </div>
                                {showCalendar && <CalendarComponent />}
                                <div className="chart-placeholder">
                                    <p>Bar chart</p>
                                    <p className="chart-date-info">Data from {dateRange.start} to {dateRange.end}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="dashboard-bottom">
                        <div className="stats-container-small">
                            <button
                                className={`stat-box-small ${selectedButton === 'incidents' ? 'active' : ''}`}
                                onClick={() => handleButtonClick('incidents')}
                            >
                                <div className="stat-title-small">Incidents Today</div>
                                <div className="stat-value-small">{safeStats.incidentsToday}</div>
                            </button>

                            <button
                                className={`stat-box-small ${selectedButton === 'type' ? 'active' : ''}`}
                                onClick={() => handleButtonClick('type')}
                            >
                                <div className="stat-title-small">Most Common Type</div>
                                <div className="stat-value-small">{safeStats.mostCommonType}</div>
                            </button>

                            <button
                                className={`stat-box-small ${selectedButton === 'time' ? 'active' : ''}`}
                                onClick={() => handleButtonClick('time')}
                            >
                                <div className="stat-title-small">Peak Time</div>
                                <div className="stat-value-small">{safeStats.peakTime}</div>
                            </button>
                        </div>

                        <button
                            className={`full-dataset-link-small`}
                            onClick={handleFullDatasetClick}
                        >
                            Full Dataset
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;