import React from 'react';
import MenuBar from '../components/MenuBar';
import { Mail, Github } from 'lucide-react';

const Contact = () => {
    return (
        <div className="contact-container">
            <MenuBar />
            <div className="contact-content">
                <h1 className="contact-title">Contact Us</h1>
                
                <div className="contact-grid">
                    {/* Email Section */}
                    <div className="contact-section">
                        <div className="contact-icon-wrapper">
                            <Mail size={48} className="contact-icon" />
                        </div>
                        <h2 className="contact-subtitle">Email</h2>
                        <div className="contact-links">
                            <a href="mailto:schae22@wisc.edu" className="contact-link">
                                schae22@wisc.edu
                            </a>
                            <a href="mailto:syoon97@wisc.edu" className="contact-link">
                                syoon97@wisc.edu
                            </a>
                            <a href="mailto:tkang55@wisc.edu" className="contact-link">
                                tkang55@wisc.edu
                            </a>
                        </div>
                    </div>

                    {/* GitHub Section */}
                    <div className="contact-section">
                        <div className="contact-icon-wrapper">
                            <Github size={48} className="contact-icon" />
                        </div>
                        <h2 className="contact-subtitle">Github</h2>
                        <div className="contact-links">
                            <a 
                                href="https://github.com/c1dev42" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="contact-link"
                            >
                                https://github.com/c1dev42
                            </a>
                            <a 
                                href="https://github.com/Seohyung03" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="contact-link"
                            >
                                https://github.com/Seohyung03
                            </a>
                            <a 
                                href="https://github.com/rkdxod211" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="contact-link"
                            >
                                https://github.com/rkdxod211
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;