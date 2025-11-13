import React from 'react';
import MenuBar from '../components/MenuBar';

const Contact = () => {
    return (
        <div className="contact-container">
        <MenuBar />
        <div className="contact-content">
            <h1>Contact Us</h1>
            <p>Contact 추가하기</p>
        </div>
        </div>
    );
};

export default Contact;