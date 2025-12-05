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
            answer: "WE USE PUBLIC CRIME AND INCIDENT REPORT DATA SOURCED FROM THE CITY OF MADISON WEBSITE."
        },
        {
            question: "HOW OFTEN IS THE DATA UPDATED?",
            answer: "THE DATASET IS AUTOMATICALLY UPDATED EVERY DAY."
        },
        {
            question: "CAN I SEARCH FOR SPECIFIC INCIDENTS?",
            answer: "YES, YOU CAN USE THE SEARCH BOX ON THE MAIN PAGE, OR CLICK \"FULL DATA\" TO ACCESS THE SEARCH PAGE."
        },
        {
            question: "HOW WAS THE DATA PREPROCESSED?",
            answer: "WE CLEAN DUPLICATE ENTRIES, STANDARDIZE DATES AND TIMES, GROUP INCIDENTS INTO A FEW MAIN TYPES, AND CONVERT LOCATIONS TO APPROXIMATE MAP COORDINATES FOR MAPPING."
        },
        {
            question: "WHAT TIME RANGE DOES THIS SITE SHOW?",
            answer: "THE DASHBOARD AND MAP FOCUS ON INCIDENTS REPORTED IN THE PAST WEEK."
        },
        {
            question: "DOES THE MAP SHOW EXACT ADDRESSES?",
            answer: "NO. LOCATIONS ARE SHOWN AT THE BLOCK OR NEIGHBORHOOD LEVEL, NOT AT SPECIFIC HOUSE NUMBERS OR NAMES."
        },
        {
            question: "CAN I USE THIS SITE FOR EMERGENCIES?",
            answer: "NO. IF YOU ARE IN DANGER OR NEED HELP, CALL 911 OR YOUR LOCAL EMERGENCY NUMBER IMMEDIATELY."
        },
        {
            question: "WHY DO SOME AREAS HAVE FEWER MARKERS?",
            answer: "FEWER MARKERS CAN MEAN FEWER REPORTED INCIDENTS, MISSING LOCATION INFORMATION, OR INCIDENTS OUTSIDE THE MADISON AREA."
        },
        {
            question: "DO YOU STORE ANY PERSONAL INFORMATION?",
            answer: "NO. THIS SITE DOES NOT COLLECT NAMES, ADDRESSES, OR PERSONAL IDENTIFIERS FROM USERS OR FROM THE INCIDENT REPORTS."
        },
        {
            question: "IS MADCRIME AN OFFICIAL CITY WEBSITE?",
            answer: "NO. MADCRIME IS A STUDENT PROJECT BUILT FOR EDUCATIONAL PURPOSES AND IS NOT AFFILIATED WITH THE CITY OF MADISON OR THE MADISON POLICE DEPARTMENT."
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