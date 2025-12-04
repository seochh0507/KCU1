import React from 'react';
import MenuBar from '../components/MenuBar';

const About = () => {
    return (
        <div className="about-container">
            <MenuBar />
            <div className="about-content">
                <h1>About MadCrime</h1>
                
                <p>
                    MadCrime is a data-driven platform dedicated to visualizing and understanding crime activity in Madison, Wisconsin. 
                    Using publicly available incident reports collected from the City of Madison website, we transform raw information into 
                    clear, accessible insights that help residents stay informed and aware of what's happening in their community.
                </p>
                
                <p>Our website allows users to:</p>
                
                <ul className="about-features">
                    <li>Explore recent and historical crime reports</li>
                    <li>Search incidents by keywords, time, category, and location</li>
                    <li>View crime data plotted on an interactive city map</li>
                    <li>See trends and statistical breakdowns through charts and analytics</li>
                </ul>
                
                <p>
                    Our goal is to make public safety information more transparent and easy to navigate. Whether you're a resident, 
                    researcher, student, or simply curious about local crime patterns, MadCrime provides a centralized space to explore real-time 
                    data and gain a clearer picture of our city.
                </p>
                
                <p>Madison is our home—and staying informed is one of the best ways to keep it safe.</p>
            </div>
        </div>
    );
};

export default About;