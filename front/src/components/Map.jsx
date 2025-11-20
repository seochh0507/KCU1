import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Shield } from 'lucide-react';

const Map = () => {
    const [selectedIncident, setSelectedIncident] = useState(null);
    const mapRef = useRef(null);

    const incidentData = [
        {
        id: 1,
        caseNumber: '123123123',
        type: 'Homicide',
        location: 'location1',
        dateTime: '2025-11-15 14:30',
        caseId: 'asdlkfjkas',
        arrested: 'No',
        link: 'https://example.com/case1',
        lat: 43.0731,
        lng: -89.4012
        },
        {
        id: 2,
        caseNumber: '3423423234',
        type: 'Theft',
        location: 'location2',
        dateTime: '2025-11-16 18:45',
        caseId: 'adfasdf',
        arrested: 'Yes',
        link: 'https://example.com/case2',
        lat: 43.0747,
        lng: -89.3845
        }
    ];

    // Police stations data
    const policeStations = [
        {
        id: 1,
        name: 'Madison Police Department - Central District',
        address: '211 S Carroll St, Madison, WI 53703',
        lat: 43.0722,
        lng: -89.3843
        },
        {
        id: 2,
        name: 'Madison Police Department - North District',
        address: '1554 Northport Dr, Madison, WI 53704',
        lat: 43.1258,
        lng: -89.3542
        }
    ];

    useEffect(() => {
        // Google Maps API
        console.log('Map component mounted - Google Maps API will be integrated');
    }, []);

    const handlePinpointClick = (incident) => {
        setSelectedIncident(incident);
    };

    const closePopup = () => {
        setSelectedIncident(null);
    };

    return (
        <div className="map-section">
        <div className="map-container" ref={mapRef}>
            {/* Google Maps will render here */}
            <div className="map-placeholder">
            <p>Google Maps</p>
            
            {/* Placeholder pinpoints for visualization */}
            <div className="placeholder-pins">
                <div 
                className="placeholder-pin incident-pin" 
                style={{ top: '30%', left: '40%' }}
                onClick={() => handlePinpointClick(incidentData[0])}
                title="Click to see details"
                >
                <AlertCircle size={32} color="#dc2626" strokeWidth={2.5} />
                </div>
                <div 
                className="placeholder-pin incident-pin" 
                style={{ top: '50%', left: '60%' }}
                onClick={() => handlePinpointClick(incidentData[1])}
                title="Click to see details"
                >
                <AlertCircle size={32} color="#dc2626" strokeWidth={2.5} />
                </div>
                <div 
                className="placeholder-pin police-pin" 
                style={{ top: '35%', left: '30%' }}
                title="Police Station"
                >
                <Shield size={32} color="#2563eb" strokeWidth={2.5} fill="#2563eb" />
                </div>
                <div 
                className="placeholder-pin police-pin" 
                style={{ top: '20%', left: '50%' }}
                title="Police Station"
                >
                <Shield size={32} color="#2563eb" strokeWidth={2.5} fill="#2563eb" />
                </div>
            </div>
            </div>

            <div className="map-instruction">
            Click on the pinpoints to check the details!
            </div>
        </div>

        {/* Incident Detail Popup */}
        {selectedIncident && (
            <div className="incident-popup">
            <button className="popup-close" onClick={closePopup}>×</button>
            <h3>{selectedIncident.type} - Case #{selectedIncident.caseNumber}</h3>
            
            <div className="popup-details">
                <div className="detail-row">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{selectedIncident.location}</span>
                </div>
                
                <div className="detail-row">
                <span className="detail-label">Date / Time:</span>
                <span className="detail-value">{selectedIncident.dateTime}</span>
                </div>
                
                <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{selectedIncident.type}</span>
                </div>
                
                <div className="detail-row">
                <span className="detail-label">Case ID:</span>
                <span className="detail-value">{selectedIncident.caseId}</span>
                </div>
                
                <div className="detail-row">
                <span className="detail-label">Arrested?:</span>
                <span className="detail-value">{selectedIncident.arrested}</span>
                </div>
                
                <a 
                href={selectedIncident.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="view-report-link"
                >
                View Full Report →
                </a>
            </div>
            </div>
        )}
        </div>
    );
};

export default Map;