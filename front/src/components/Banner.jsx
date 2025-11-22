import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Banner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const trackRef = useRef(null);

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
            subtitle: 'PROPERTY CRIME',
            duration: 5000,
        },
        {
            image: '/assets/peakTime.jpg',
            title: 'PEAK DANGER TIME',
            subtitle: '10PM - 2AM',
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