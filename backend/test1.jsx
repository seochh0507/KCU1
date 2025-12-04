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

    // 검색창
    const [initialSearchQuery, setInitialSearchQuery] = useState('');

    // 상단 숫자 애니메이션 관련 상태
    const [targetNumber, setTargetNumber] = useState(56);   // 기본값 56 (데이터 없을 때 fallback)
    const [displayNumber, setDisplayNumber] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const statsRef = useRef(null);

    // 백엔드에서 온 실제 데이터들을 들고 있을 state
    const [statsData, setStatsData] = useState(null);   // Dashboard용
    const [tableData, setTableData] = useState([]);     // FullData/테이블용 (필요 시)
    const [rawItems, setRawItems] = useState([]);       // Map 등에서 쓸 원본 리스트

    // ===== 1) incidents_front.json 한 번만 fetch하기 =====
    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch('/incidents_front.json');
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();

                // 안전하게 fallback 넣어두기
                const total = data.totalIncidents ?? 0;
                const stats = data.stats ?? {
                    incidentsToday: 0,
                    mostCommonType: '-',
                    peakTime: '-',
                };
                const table = data.table ?? [];
                const items = data.rawItems ?? [];

                setTargetNumber(total);
                setStatsData(stats);
                setTableData(table);
                setRawItems(items);
            } catch (err) {
                console.error('Failed to load incidents_front.json:', err);

                // 에러 시에도 최소한 기본값은 유지
                setTargetNumber(56);
                setStatsData({
                    incidentsToday: 0,
                    mostCommonType: '-',
                    peakTime: '-',
                });
                setTableData([]);
                setRawItems([]);
            }
        };

        loadData();
    }, []);

    // ===== 2) 스크롤되면 숫자 애니메이션 시작 (한 번만) =====
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
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
    }, [hasAnimated, targetNumber]);

    const startNumberAnimation = () => {
        setIsAnimating(true);
        setDisplayNumber(0);

        const duration = 2000; // 2초
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

    // ===== 3) 아래 Dashboard로 스크롤 =====
    const scrollToDashboard = () => {
        const dashboardSection = document.querySelector('.dashboard-section');
        if (dashboardSection) {
            dashboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // ===== 4) 상단 검색 → /fulldata 로 이동 =====
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

            {/* Banner + 상단 검색 */}
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

            {/* 숫자 애니메이션 섹션 */}
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

            {/* Dashboard: statsData를 props로 내려보냄 */}
            <Dashboard statsData={statsData} />

            {/* Map: rawItems(= incidents_front.json.rawItems)를 내려줌 */}
            <Map incidents={rawItems} />
        </div>
    );
};

export default Main;
