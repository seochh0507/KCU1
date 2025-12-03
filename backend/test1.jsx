// front/src/pages/main.jsx
// 1단계 – Main.jsx에서 incidents_front.json 한 번 fetch 해서 들고 있기

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import MenuBar from '../components/MenuBar';
import Banner from '../components/Banner';
import Dashboard from '../components/Dashboard';
import Map from '../components/Map';

const Main = () => {
    const navigate = useNavigate();

    // 🔹 검색창
    const [initialSearchQuery, setInitialSearchQuery] = useState('');

    // 🔹 백엔드에서 온 숫자/통계/테이블을 저장할 state
    const [targetNumber, setTargetNumber] = useState(0);      // totalIncidents
    const [statsData, setStatsData] = useState(null);         // { incidentsToday, mostCommonType, peakTime }
    const [tableData, setTableData] = useState([]);           // 나중에 FullData/필터에 쓸 수 있음

    // 🔹 숫자 애니메이션 관련 state
    const [displayNumber, setDisplayNumber] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const statsRef = useRef(null);

    // ======================================================
    // 1) incidents_front.json 한 번만 fetch 해서 state에 저장
    // ======================================================
    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch('/incidents_front.json');
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();

                // 백엔드에서 만들어준 구조 그대로 사용
                setTargetNumber(data.totalIncidents ?? 0);
                setStatsData(data.stats ?? null);
                setTableData(data.table ?? []);

                // 혹시 이미 화면에 보이는 상태였다면
                // 숫자 애니메이션을 다시 돌릴 수 있게 초기화
                setHasAnimated(false);
                setDisplayNumber(0);
            } catch (err) {
                console.error('Failed to load /incidents_front.json', err);
                // 실패해도 최소한 0으로 초기화
                setTargetNumber(0);
                setStatsData(null);
                setTableData([]);
            }
        };

        loadData();
    }, []); // 🔸 페이지 첫 로드 때 한 번만 실행

    // ======================================================
    // 2) IntersectionObserver: 스크롤로 stats 섹션 보이는지 체크
    // ======================================================
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

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => {
            if (statsRef.current) {
                observer.unobserve(statsRef.current);
            }
        };
    }, []);

    // ======================================================
    // 3) 숫자 애니메이션 함수 (totalIncidents 기준)
    // ======================================================
    const startNumberAnimation = (finalNumber) => {
        if (finalNumber <= 0) {
            setDisplayNumber(0);
            setIsAnimating(false);
            return;
        }

        setIsAnimating(true);
        setDisplayNumber(0);

        const duration = 2000; // 2초
        const steps = 60;
        const increment = finalNumber / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= finalNumber) {
                setDisplayNumber(finalNumber);
                setIsAnimating(false);
                clearInterval(timer);
            } else {
                setDisplayNumber(Math.floor(current));
            }
        }, duration / steps);
    };

    // ======================================================
    // 4) 섹션이 보이고, 아직 애니메이션 안 돌았고,
    //    targetNumber(=totalIncidents)가 준비되면 → 애니메이션 시작
    // ======================================================
    useEffect(() => {
        if (isVisible && !hasAnimated && targetNumber !== null) {
            startNumberAnimation(targetNumber);
            setHasAnimated(true);
        }
    }, [isVisible, hasAnimated, targetNumber]);

    // ======================================================
    // 5) 기타 기능들 (스크롤, 검색)
    // ======================================================
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

            {/* 🔹 이제 Dashboard에 statsData도 같이 내려보내기 (2단계에서 사용) */}
            <Dashboard statsData={statsData} />
            <Map />
        </div>
    );
};

export default Main;
