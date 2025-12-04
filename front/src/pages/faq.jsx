// import React from 'react';
// import MenuBar from '../components/MenuBar';

// const FAQ = () => {
//     return (
//         <div className="faq-container">
//         <MenuBar />
//         <div className="faq-content">
//             <h1>Frequently Asked Questions</h1>
//             <p></p>
//         </div>
//         </div>
//     );
// };

// export default FAQ;

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import MenuBar from '../components/MenuBar';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqData = [
        {
            question: "WHERE DOES THE DATA COME FROM?",
            answer: "답"
        },
        {
            question: "HOW OFTEN IS THE DATA UPDATED?",
            answer: "답"
        },
        {
            question: "CAN I SEARCH FOR SPECIFIC INCIDENTS?",
            answer: "답"
        },
        {
            question: "QUESTION",
            answer: "답"
        },
        {
            question: "QUESTION",
            answer: "답"
        },
        {
            question: "QUESTION",
            answer: "답"
        },
        {
            question: "QUESTION",
            answer: "답"
        },
        {
            question: "QUESTION",
            answer: "답"
        },
        {
            question: "QUESTION",
            answer: "답"
        },
        {
            question: "QUESTION",
            answer: "답"
        },
    ];

    const toggleQuestion = (index) => {
        if (openIndex === index) {
            setOpenIndex(null);
        } else {
            setOpenIndex(index);
        }
    };

    return (
        <div className="faq-container">
            <MenuBar />
            <div className="faq-content">
                <h1>Frequently Asked Questions</h1>
                <div className="faq-list">
                    {faqData.map((item, index) => (
                        <div key={index} className="faq-item">
                            <button 
                                className={`faq-question ${openIndex === index ? 'active' : ''}`}
                                onClick={() => toggleQuestion(index)}
                            >
                                <span>{item.question}</span>
                                {openIndex === index ? (
                                    <Minus size={20} className="faq-icon" />
                                ) : (
                                    <Plus size={20} className="faq-icon" />
                                )}
                            </button>
                            <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                                <p>{item.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQ;