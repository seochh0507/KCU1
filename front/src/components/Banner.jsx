import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// const Banner = () => {
//     const [currentSlide, setCurrentSlide] = useState(0);
//     const [isTransitioning, setIsTransitioning] = useState(true);
//     const trackRef = useRef(null);
const Banner = ({ rawItems = [] }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const trackRef = useRef(null);

    // 🔹 최근 7일 기준 통계
    const [weekMostCommonType, setWeekMostCommonType] = useState('-');
    const [weekPeakTime, setWeekPeakTime] = useState('-');
    ////////////////////////////////////////////////////////////////////

    // ==== helpers: 날짜 / 시간대 / 주간 범위 ====
    const getIncidentDate = (item) => {
        if (item.url) {
            const m = item.url.match(/\/(\d{4}-\d{2}-\d{2})\//);
            if (m && m[1]) {
                const d = new Date(m[1] + 'T00:00:00');
                if (!Number.isNaN(d.getTime())) return d;
            }
        }

        if (item.incident_date) {
            const d = new Date(item.incident_date);
            if (!Number.isNaN(d.getTime())) return d;
        }

        return null;
    };

    const getTimeBucket = (dateObj) => {
        const h = dateObj.getHours();
        if (h >= 6 && h < 12) return 'MORNING';
        if (h >= 12 && h < 18) return 'AFTERNOON';
        if (h >= 18 && h < 22) return 'EVENING';
        return 'NIGHT';
    };

    const getWeekBounds = (centerDate) => {
        const end = new Date(centerDate);
        end.setHours(0, 0, 0, 0);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        return { start, end };
    };

    // ==== 최근 7일 기준 mostCommonType / peakTime 계산 ====
    useEffect(() => {
        if (!rawItems || rawItems.length === 0) {
            setWeekMostCommonType('-');
            setWeekPeakTime('-');
            return;
        }

        const today = new Date();
        const { start, end } = getWeekBounds(today);

        const inRange = rawItems.filter((item) => {
            const d = getIncidentDate(item);
            if (!d) return false;
            const day = new Date(d);
            day.setHours(0, 0, 0, 0);
            return day >= start && day <= end;
        });

        if (inRange.length === 0) {
            setWeekMostCommonType('-');
            setWeekPeakTime('-');
            return;
        }

        const typeCounts = {};
        const bucketCounts = { MORNING: 0, AFTERNOON: 0, EVENING: 0, NIGHT: 0 };

        inRange.forEach((item) => {
            const type = item.incident_type || 'Unknown';
            typeCounts[type] = (typeCounts[type] || 0) + 1;

            const d = getIncidentDate(item);
            if (!d) return;
            const bucket = getTimeBucket(d);
            bucketCounts[bucket] = (bucketCounts[bucket] || 0) + 1;
        });

        // // --- Most Common Type (동점이면 Multiple) ---
        // const typeEntries = Object.entries(typeCounts);
        // let maxTypeCount = 0;
        // typeEntries.forEach(([_, count]) => {
        //     if (count > maxTypeCount) maxTypeCount = count;
        // });

        // const topTypes = typeEntries
        //     .filter(([_, count]) => count === maxTypeCount)
        //     .map(([type]) => type);

        // if (topTypes.length === 1) {
        //     setWeekMostCommonType(topTypes[0]);
        // } else {
        //     setWeekMostCommonType('Multiple');
        // }

        // --- Most Common Type (배너용: 동점이면 알파벳 순 1개 선택) ---
        const typeEntries = Object.entries(typeCounts);

        if (typeEntries.length === 0) {
            setWeekMostCommonType('-');
        } else {
            // 1) 최댓값 찾기
            let maxTypeCount = Math.max(...typeEntries.map(([_, count]) => count));

            // 2) 최댓값인 타입들만 모으기 (공동 1등 리스트)
            const topTypes = typeEntries
                .filter(([_, count]) => count === maxTypeCount)
                .map(([type]) => type);

            // 3) 공동 1등 여러 개 → 알파벳 순 정렬 후 첫 번째만 선택
            const chosenType = topTypes.sort()[0];

            // 4) 배너에 선택된 단일 타입만 표시
            setWeekMostCommonType(chosenType);
        }
        /////////////////////////////////////////


        // --- Peak Time (동점이면 Multiple, 전부 0이면 '-') ---
        const bucketEntries = Object.entries(bucketCounts);
        let maxBucketCount = 0;
        bucketEntries.forEach(([_, count]) => {
            if (count > maxBucketCount) maxBucketCount = count;
        });

        if (maxBucketCount === 0) {
            setWeekPeakTime('-');
            return;
        }

        const topBuckets = bucketEntries
            .filter(([_, count]) => count === maxBucketCount)
            .map(([bucket]) => bucket);

        if (topBuckets.length === 1) {
            setWeekPeakTime(topBuckets[0]);
        } else {
            setWeekPeakTime('Multiple');
        }
    }, [rawItems]);


    ////////////////////////////////////////////////////////////////////

    const banners = [
        {
            image: '/assets/madison.png',
            title: 'CITY OF MADISON',
            subtitle: null,
            duration: 8000,
        },
        {
            image: '/assets/frequentCrime.jpg',
            title: 'MOST FREQUENT CRIME',
            subtitle: 'THEFT',
            duration: 5000,
        },
        {
            image: '/assets/commonType.jpg',
            title: 'MOST COMMON TYPE',
            subtitle:
                weekMostCommonType === '-'
                    ? 'NO DATA (LAST 7 DAYS)'
                    : weekMostCommonType.toUpperCase(),
            duration: 5000,
        },
        {
            image: '/assets/peakTime.jpg',
            title: 'PEAK DANGER TIME',
            subtitle:
                weekPeakTime === '-'
                    ? 'NO DATA (LAST 7 DAYS)'
                    : weekPeakTime.toUpperCase(),
            duration: 5000,
        },
    ];

    const slidesWithClone = [...banners, banners[0]];

    const goToNextSlide = useCallback(() => {
        setIsTransitioning(true);
        setCurrentSlide((prev) => prev + 1);
    }, []);

    const goToPrevSlide = () => {
        if (currentSlide === 0) {
            setIsTransitioning(false);
            setCurrentSlide(banners.length);
            setTimeout(() => {
                setIsTransitioning(true);
                setCurrentSlide(banners.length - 1);
            }, 50);
        } else {
            setIsTransitioning(true);
            setCurrentSlide((prev) => prev - 1);
        }
    };

    const goToSlide = (index) => {
        setIsTransitioning(true);
        setCurrentSlide(index);
    };

    useEffect(() => {
        if (currentSlide === banners.length) {
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentSlide(0);
            }, 800); 
            return () => clearTimeout(timer);
        }
    }, [currentSlide, banners.length]);

    useEffect(() => {
        if (!isTransitioning) {
            const timer = setTimeout(() => {
                setIsTransitioning(true);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isTransitioning]);

    useEffect(() => {
        const actualIndex = currentSlide >= banners.length ? 0 : currentSlide;
        const currentDuration = banners[actualIndex].duration;
        
        const timer = setTimeout(() => {
            goToNextSlide();
        }, currentDuration);

        return () => clearTimeout(timer);
    }, [currentSlide, banners, goToNextSlide]);

    const actualIndex = currentSlide >= banners.length ? 0 : currentSlide;

    return (
        <div className="banner-container">
            <div 
                ref={trackRef}
                className={`banner-track ${isTransitioning ? 'transitioning' : ''}`}
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slidesWithClone.map((banner, index) => (
                    <div key={index} className="banner-slide">
                        <img
                            src={banner.image}
                            alt={banner.title}
                            className="banner-image"
                        />
                        <div className="banner-overlay">
                            {banner.subtitle ? (
                                <>
                                    <h2 className="banner-title">{banner.title}</h2>
                                    <p className="banner-subtitle">{banner.subtitle}</p>
                                </>
                            ) : (
                                <h1 className="banner-title-main">{banner.title}</h1>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Arrow navigation */}
            <button 
                className="banner-arrow banner-arrow-left" 
                onClick={goToPrevSlide}
                aria-label="Previous slide"
            >
                <ChevronLeft size={32} />
            </button>
            <button 
                className="banner-arrow banner-arrow-right" 
                onClick={goToNextSlide}
                aria-label="Next slide"
            >
                <ChevronRight size={32} />
            </button>

            {/* Dot indicators */}
            <div className="banner-dots">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        className={`banner-dot ${index === actualIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Banner;