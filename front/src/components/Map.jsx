import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Shield } from 'lucide-react';
import incidentsData from '../data/incidents.json';

const Map = () => {
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [incidentData, setIncidentData] = useState([]);
    const mapRef = useRef(null);
    const googleMapRef = useRef(null);
    const markersRef = useRef([]);

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

    // Load incident data from imported JSON
    useEffect(() => {
        setIncidentData(incidentsData);
    }, []);

    // Initialize Google Maps
    useEffect(() => {
        const initMap = () => {
            if (!window.google || !mapRef.current) return;

            // Create map centered on Madison, WI
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 43.0731, lng: -89.4012 },
                zoom: 13,
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }]
                    }
                ]
            });

            googleMapRef.current = map;

            // Add police station markers
            policeStations.forEach(station => {
                const marker = new window.google.maps.Marker({
                    position: { lat: station.lat, lng: station.lng },
                    map: map,
                    title: station.name,
                    icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#2563eb',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                    }
                });

                const infoWindow = new window.google.maps.InfoWindow({
                    content: `
                        <div style="font-family: 'Expletus Sans', sans-serif; padding: 8px;">
                            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${station.name}</h3>
                            <p style="margin: 0; font-size: 12px; color: #666;">${station.address}</p>
                        </div>
                    `
                });

                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });
            });

            // Geocode and add incident markers
            geocodeAndAddMarkers(map);
        };

        // Load Google Maps script
        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC0hEJv6-M1Dko5IwpCbzx5ACnxaI82Jac&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.head.appendChild(script);
        } else {
            initMap();
        }

        return () => {
            // Cleanup markers
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];
        };
    }, [incidentData]);

    // Geocode addresses and add markers
    const geocodeAndAddMarkers = async (map) => {
        if (!window.google || !incidentData.length) return;

        const geocoder = new window.google.maps.Geocoder();
        
        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        for (const incident of incidentData) {
            try {
                // If incident already has lat/lng from backend, use it directly
                if (incident.lat && incident.lng) {
                    const marker = new window.google.maps.Marker({
                        position: { lat: incident.lat, lng: incident.lng },
                        map: map,
                        title: `${incident.type} - ${incident.caseNumber}`,
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 12,
                            fillColor: '#dc2626',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 2
                        },
                        animation: window.google.maps.Animation.DROP
                    });

                    marker.addListener('click', () => {
                        setSelectedIncident(incident);
                    });

                    markersRef.current.push(marker);
                } else {
                    // If no lat/lng, geocode the address
                    const result = await geocodeAddress(geocoder, incident.location);
                    
                    if (result) {
                        const marker = new window.google.maps.Marker({
                            position: result,
                            map: map,
                            title: `${incident.type} - ${incident.caseNumber}`,
                            icon: {
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: 12,
                                fillColor: '#dc2626',
                                fillOpacity: 1,
                                strokeColor: '#ffffff',
                                strokeWeight: 2
                            },
                            animation: window.google.maps.Animation.DROP
                        });

                        marker.addListener('click', () => {
                            setSelectedIncident(incident);
                        });

                        markersRef.current.push(marker);
                    }
                }
            } catch (error) {
                console.error(`Error processing incident: ${incident.location}`, error);
            }
        }
    };

    // Geocode a single address
    const geocodeAddress = (geocoder, address) => {
        return new Promise((resolve, reject) => {
            geocoder.geocode({ address: address }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    resolve({
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    });
                } else {
                    reject(new Error(`Geocoding failed: ${status}`));
                }
            });
        });
    };

    const closePopup = () => {
        setSelectedIncident(null);
    };

    return (
        <div className="map-section">
            <div 
                className="map-container" 
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
            >
                {/* Google Maps will render here */}
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