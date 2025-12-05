import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ statsData, rawItems = [] }) => {
    const navigate = useNavigate();
    const [selectedButton, setSelectedButton] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const dashboardRef = useRef(null);
    const calendarRef = useRef(null);
    const [hasIncidentsSelectedDate, setHasIncidentsSelectedDate] = useState(false);

    // ⬇️ 선택한 날짜 기준으로 대시보드에 보여줄 값들
    const [incidentsToday, setIncidentsToday] = useState(0);
    const [mostCommonType, setMostCommonType] = useState('-');
    const [peakTime, setPeakTime] = useState('-');

    // ✅ rawItems에서 계산된 값이 우선, 없으면 기존 statsData를 fallback으로 사용
    const safeStats = {
        incidentsToday: incidentsToday ?? statsData?.incidentsToday ?? 0,
        mostCommonType: mostCommonType ?? statsData?.mostCommonType ?? '-',
        peakTime: peakTime ?? statsData?.peakTime ?? '-',
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


    // 선택된 날짜를 YYYY-MM-DD 문자열로 변환
    const toYMD = (date) => {
        if (!date) return '';
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    
    // // ✅ 날짜가 바뀌거나 rawItems가 바뀌면, 그 날짜 기준으로 다시 계산
    // useEffect(() => {
    //     if (!rawItems || rawItems.length === 0) {
    //         setIncidentsToday(0);
    //         setMostCommonType('-');
    //         setPeakTime('-');
    //         return;
    //     }

    //     const filtered = rawItems.filter((item) => {
    //         const d = getIncidentDate(item);
    //         if (!d) return false;

    //         // ✅ 그래프와 똑같이 "로컬 날짜" 기준으로 비교
    //         const incidentYMD = toYMD(d);
    //         const selectedYMD = toYMD(selectedDate);


    //         return incidentYMD === selectedYMD;
    //     });

    //     // 1) Incidents Today
    //     setIncidentsToday(filtered.length);
    //     setHasIncidentsSelectedDate(filtered.length > 0);

    //     if (filtered.length === 0) {
    //         setMostCommonType('-');
    //         setPeakTime('-');
    //         return;
    //     }

    //     // 2) Most Common Type
    //     const typeCounts = {};
    //     // 3) Peak Time (시간대별 카운트)
    //     const bucketCounts = { MORNING: 0, AFTERNOON: 0, EVENING: 0, NIGHT: 0 };

    //     filtered.forEach((item) => {
    //         const type = item.incident_type || 'Unknown';
    //         typeCounts[type] = (typeCounts[type] || 0) + 1;

    //         const d = getIncidentDate(item);
    //         if (!d) return;           // 날짜 없으면 그냥 건너뛰기
            
    //         const bucket = getTimeBucket(d);
    //         bucketCounts[bucket] += 1;
    //     });

    //     // 2-1) 최빈 타입 찾기 (가장 많이 나온 1개만 선택)
    //     let topType = '-';
    //     let maxTypeCount = 0;

    //     Object.entries(typeCounts).forEach(([type, count]) => {
    //         if (count > maxTypeCount) {
    //             maxTypeCount = count;
    //             topType = type;
    //         }
    //     });

    //     setMostCommonType(topType);


    //     // 3-1) 최빈 시간대 찾기
    //     let topBucket = '-';
    //     let maxBucketCount = 0;
    //     Object.entries(bucketCounts).forEach(([bucket, count]) => {
    //         if (count > maxBucketCount) {
    //             maxBucketCount = count;
    //             topBucket = bucket;
    //         }
    //     });
    //     setPeakTime(topBucket);
    // }, [selectedDate, rawItems]);
    // ✅ 날짜가 바뀌거나 rawItems가 바뀌면, "그 날"의 incident 개수만 다시 계산
    useEffect(() => {
        if (!rawItems || rawItems.length === 0) {
            setIncidentsToday(0);
            setHasIncidentsSelectedDate(false);
            return;
        }

        const selectedYMD = toYMD(selectedDate);

        const dayItems = rawItems.filter((item) => {
            const d = getIncidentDate(item);
            if (!d) return false;
            const incidentYMD = toYMD(d);
            return incidentYMD === selectedYMD;
        });

        setIncidentsToday(dayItems.length);
        setHasIncidentsSelectedDate(dayItems.length > 0);
    }, [selectedDate, rawItems]);


    const handleButtonClick = (buttonName) => {
        setShowCalendar(false);  // 캘린더 닫기

        setSelectedButton((prev) => (
            prev === buttonName ? null : buttonName
        ));
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
        
        // 빈 칸 (첫째 날 이전)
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
        // 실제 날짜들
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

    // incident 한 건에서 "그 날"을 구하는 헬퍼 (URL 날짜를 최우선으로 사용)
    const getIncidentDate = (item) => {
        // 1) URL에 /YYYY-MM-DD/ 형식이 있으면 그걸 최우선 사용
        if (item.url) {
            const m = item.url.match(/\/(\d{4}-\d{2}-\d{2})\//);
            if (m && m[1]) {
                const d = new Date(m[1] + 'T00:00:00');
                if (!Number.isNaN(d.getTime())) return d;
            }
        }

        // 2) 그게 안 되면 incident_date(ISO 문자열)를 사용
        if (item.incident_date) {
            const d = new Date(item.incident_date);
            if (!Number.isNaN(d.getTime())) return d;
        }

        // 3) 둘 다 실패하면 null
        return null;
    };
    
    const getTimeBucket = (dateObj) => {
        const h = dateObj.getHours();
        if (h >= 6 && h < 12) return 'MORNING';
        if (h >= 12 && h < 18) return 'AFTERNOON';
        if (h >= 18 && h < 22) return 'EVENING';
        return 'NIGHT'; // 나머지는 NIGHT
    };

    const getWeekBounds = (centerDate) => {
        const end = new Date(centerDate);
        end.setHours(0, 0, 0, 0);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        return { start, end };
    };

    ///////////////////////////////////////////////////
    useEffect(() => {
    if (!rawItems || rawItems.length === 0) {
        setMostCommonType('-');
        setPeakTime('-');
        return;
    }

    const { start, end } = getWeekBounds(selectedDate);

    // 7일 범위 안에 있는 사건들만 모으기
    const inRange = rawItems.filter((item) => {
        const d = getIncidentDate(item);
        if (!d) return false;
        const day = new Date(d);
        day.setHours(0, 0, 0, 0);
        return day >= start && day <= end;
    });

    if (inRange.length === 0) {
        setMostCommonType('-');
        setPeakTime('-');
        return;
    }

    // --- 1) 타입별 카운트 ---
    const typeCounts = {};
    inRange.forEach((item) => {
        const type = item.incident_type || 'Unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const typeEntries = Object.entries(typeCounts);

    // 최댓값 구하기
    let maxTypeCount = 0;
    typeEntries.forEach(([_, count]) => {
        if (count > maxTypeCount) {
            maxTypeCount = count;
        }
    });

    // 최댓값을 가진 타입들만 모으기
    const topTypes = typeEntries
        .filter(([_, count]) => count === maxTypeCount)
        .map(([type]) => type);

    if (topTypes.length === 1) {
        setMostCommonType(topTypes[0]);
    } else if (topTypes.length > 1) {
        setMostCommonType('Multiple');
    } else {
        setMostCommonType('-');
    }

    // --- 2) 시간대별 카운트 ---
    const buckets = { MORNING: 0, AFTERNOON: 0, EVENING: 0, NIGHT: 0 };

    inRange.forEach((item) => {
        const d = getIncidentDate(item);
        if (!d) return;
        const bucket = getTimeBucket(d);
        buckets[bucket] = (buckets[bucket] || 0) + 1;
    });

    const bucketEntries = Object.entries(buckets);

    let maxBucketCount = 0;
    bucketEntries.forEach(([_, count]) => {
        if (count > maxBucketCount) {
            maxBucketCount = count;
        }
    });

    const topBuckets = bucketEntries
        .filter(([_, count]) => count === maxBucketCount && count > 0)
        .map(([bucket]) => bucket);

    if (topBuckets.length === 1) {
        setPeakTime(topBuckets[0]);
    } else if (topBuckets.length > 1) {
        setPeakTime('Multiple');
    } else {
        // 7일 동안 아예 사건이 없었던 경우
        setPeakTime('-');
    }
}, [selectedDate, rawItems]);
    ///////////////////////////////////////////////////

    const buildChartData = () => {
        if (!rawItems || rawItems.length === 0 || !selectedButton) return [];

        const { start, end } = getWeekBounds(selectedDate);

        // 7일 범위 안에 있는 데이터만 필터
        const inRange = rawItems.filter((item) => {
            const d = getIncidentDate(item);
            if (!d) return false;
            const day = new Date(d);
            day.setHours(0, 0, 0, 0);
            return day >= start && day <= end;
        });

        if (inRange.length === 0) return [];

        // ① 날짜별 Incidents
        if (selectedButton === 'incidents') {
            const countsByYmd = {};
            inRange.forEach((item) => {
                const d = getIncidentDate(item);
                const ymd = toYMD(d);
                countsByYmd[ymd] = (countsByYmd[ymd] || 0) + 1;
            });

            const data = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                const ymd = toYMD(d);
                data.push({
                    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    count: countsByYmd[ymd] || 0,
                });
            }
            return data;
        }

        // ② 타입별 (7일치 합산)
        if (selectedButton === 'type') {
            if (inRange.length === 0) return [];

            const typeCounts = {};
            inRange.forEach((item) => {
                const type = item.incident_type || 'Unknown';
                typeCounts[type] = (typeCounts[type] || 0) + 1;
            });

            return Object.entries(typeCounts).map(([type, count]) => ({
                label: type,
                count,
            }));
        }

        // ③ 시간대별 (7일치 합산)
        if (selectedButton === 'time') {
            if (inRange.length === 0) return [];

            const buckets = { MORNING: 0, AFTERNOON: 0, EVENING: 0, NIGHT: 0 };

            inRange.forEach((item) => {
                const d = getIncidentDate(item);
                if (!d) return;
                const bucket = getTimeBucket(d);
                buckets[bucket] = (buckets[bucket] || 0) + 1;
            });

            const total = Object.values(buckets).reduce((a, b) => a + b, 0);
            if (total === 0) return [];

            const order = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];
            return order.map((b) => ({
                label: b,
                count: buckets[b] || 0,
            }));
        }


        return [];
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
    const chartData = buildChartData();

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
                                className="stat-box"
                                onClick={() => handleButtonClick('incidents')}
                            >
                                <div className="stat-title">Incidents Today</div>
                                <div className="stat-value">{safeStats.incidentsToday}</div>
                            </button>

                            <button
                                className="stat-box"
                                onClick={() => handleButtonClick('type')}
                            >
                                <div className="stat-title">Most Common Type</div>
                                <div className="stat-value">{safeStats.mostCommonType}</div>
                            </button>

                            <button
                                className="stat-box"
                                onClick={() => handleButtonClick('time')}
                            >
                                <div className="stat-title">Peak Time</div>
                                <div className="stat-value">{safeStats.peakTime}</div>
                            </button>
                        </div>

                        <button
                            className="full-dataset-link"
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
                        <div className="chart-content">
                            <div className="chart-header">
                            <h2 className="chart-title">
                                {selectedButton === 'incidents' && 'Number of Reported Incidents per Day'}
                                {selectedButton === 'type' && 'Number of Reported Incidents per Type'}
                                {selectedButton === 'time' && 'Number of Reported Incidents per Time of Day'}
                            </h2>

                            <button
                                className="calendar-toggle-button"
                                onClick={() => setShowCalendar(!showCalendar)}
                            >
                                <Calendar size={24} />
                            </button>
                            </div>

                            {showCalendar && <CalendarComponent />}

                            {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" />
                                </BarChart>
                            </ResponsiveContainer>
                            ) : (
                            <div className="chart-placeholder">
                                <p>No data in this 7-day range.</p>
                                <p className="chart-date-info">
                                Data from {dateRange.start} to {dateRange.end}
                                </p>
                            </div>
                            )}
                        </div>
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
                            className="full-dataset-link-small"
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
