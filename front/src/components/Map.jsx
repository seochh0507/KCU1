import React, { useState, useEffect, useRef } from 'react';

const Map = () => {
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [incidentData, setIncidentData] = useState([]);
    const mapRef = useRef(null);
    const googleMapRef = useRef(null);
    const markersRef = useRef([]);

    // Police stations data (고정 데이터)
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

    // ✅ 1) incidents_front.json에서 rawItems 불러오기
    useEffect(() => {
        const loadIncidents = async () => {
            try {
                const res = await fetch('/incidents_front.json');
                const data = await res.json();

                // backend/incidents_backend.py 에서 만든 구조:
                // { totalIncidents, stats, table, rawItems }
                const rawItems = data.rawItems || [];

                const mapped = rawItems.map((item) => {
                    // incident_date → 보기좋게 포맷
                    let formattedDateTime = item.incident_date_text || '';
                    if (item.incident_date) {
                        try {
                            const d = new Date(item.incident_date);
                            formattedDateTime = d.toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                        } catch {
                            // 실패하면 그냥 incident_date_text 사용
                        }
                    }

                    return {
                        id: item.case_id || item.title || Math.random().toString(36),
                        caseNumber: item.case_id || '',
                        type: item.incident_type || 'N/A',
                        location: item.location || '',
                        dateTime: formattedDateTime,
                        caseId: item.case_id || '',
                        arrested: item.arrested || 'Unknown',
                        link: item.url || '',
                        // 나중에 백엔드에서 lat/lng 지원하면 그대로 사용 가능
                        lat: item.lat,
                        lng: item.lng
                    };
                });

                setIncidentData(mapped);
            } catch (err) {
                console.error('Failed to load incidents_front.json for Map:', err);
            }
        };

        loadIncidents();
    }, []);

    // ✅ 2) incidentData가 준비되면 Google Maps 초기화 + 마커 찍기
    useEffect(() => {
        const initMap = () => {
            if (!window.google || !mapRef.current) return;

            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 43.0731, lng: -89.4012 }, // Madison 중심
                zoom: 12,
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }]
                    }
                ]
            });

            googleMapRef.current = map;

            // 경찰서 마커 찍기
            policeStations.forEach((station) => {
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

            // 사건 데이터 마커 찍기
            geocodeAndAddMarkers(map);
        };

        // Google Maps 스크립트 로드
        if (!window.google) {
            const script = document.createElement('script');
            script.src =
                'https://maps.googleapis.com/maps/api/js?key=AIzaSyC0hEJv6-M1Dko5IwpCbzx5ACnxaI82Jac&libraries=places';
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.head.appendChild(script);
        } else {
            initMap();
        }

        // cleanup: 기존 마커 제거
        return () => {
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current = [];
        };
    }, [incidentData]); // incidentData가 바뀌면 다시 그림

    // ✅ 3) 주소 geocoding + 사건 마커 찍기
    const geocodeAndAddMarkers = async (map) => {
        if (!window.google || !incidentData.length) return;

        const geocoder = new window.google.maps.Geocoder();

        // 기존 마커 제거
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        for (const incident of incidentData) {
            if (!incident.location) continue;

            try {
                let position;

                // 나중에 백엔드에서 lat/lng 넣어주면 바로 사용
                if (incident.lat && incident.lng) {
                    position = { lat: incident.lat, lng: incident.lng };
                } else {
                    // 지금은 주소 기반 geocoding
                    position = await geocodeAddress(geocoder, incident.location);
                }

                if (!position) continue;

                const marker = new window.google.maps.Marker({
                    position,
                    map: map,
                    title: `${incident.type} - ${incident.caseNumber || ''}`,
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
            } catch (error) {
                console.error(`Error processing incident for map: ${incident.location}`, error);
            }
        }
    };

    // ✅ 4) 주소 하나 geocoding
    const geocodeAddress = (geocoder, address) => {
        return new Promise((resolve, reject) => {
            geocoder.geocode({ address: address }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    resolve({
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    });
                } else {
                    console.warn('Geocoding failed:', status, address);
                    resolve(null); // 실패해도 전체는 멈추지 않도록
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
                    <button className="popup-close" onClick={closePopup}>
                        ×
                    </button>
                    <h3>
                        {selectedIncident.type}{' '}
                        {selectedIncident.caseNumber && `- Case #${selectedIncident.caseNumber}`}
                    </h3>

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
                            <span className="detail-value">
                                {selectedIncident.caseId || selectedIncident.caseNumber || 'N/A'}
                            </span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Arrested?:</span>
                            <span className="detail-value">{selectedIncident.arrested}</span>
                        </div>

                        {selectedIncident.link && (
                            <a
                                href={selectedIncident.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="view-report-link"
                            >
                                View Full Report →
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Map;
