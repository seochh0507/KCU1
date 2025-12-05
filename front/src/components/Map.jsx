// front/src/components/Map.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

const Map = ({ incidents = [] }) => {
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [incidentData, setIncidentData] = useState([]);
    const [isMapReady, setIsMapReady] = useState(false);
    const mapRef = useRef(null);
    const googleMapRef = useRef(null);
    const markersRef = useRef([]);

    // 경찰서 고정 데이터
    const policeStations = [
        {
            id: 1,
            name: 'Madison Police Department - Central District',
            address: '211 S Carroll St, Madison, WI 53703',
            lat: 43.0722,
            lng: -89.3843,
        },
        {
            id: 2,
            name: 'Madison Police Department - North District',
            address: '1554 Northport Dr, Madison, WI 53704',
            lat: 43.1258,
            lng: -89.3542,
        },
    ];

    // 🔴 사건 마커 아이콘 (빨간 핀)
    const createIncidentIcon = () => {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 24 32">
                <path d="M12 0C7.03 0 3 4.03 3 9c0 5.25 9 19 9 19s9-13.75 9-19c0-4.97-4.03-9-9-9z"
                      fill="#dc2626"
                      stroke="#ffffff"
                      stroke-width="1.5"/>
                <circle cx="12" cy="9" r="3" fill="#ffffff"/>
            </svg>
        `;
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    };

    // incidents → 내부 가공
    useEffect(() => {
        if (!incidents || incidents.length === 0) return;

        const mapped = incidents.map((item) => {
            let formattedDateTime = item.incident_date_text || '';

            if (item.incident_date) {
                try {
                    const d = new Date(item.incident_date);
                    formattedDateTime = d.toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                } catch {}
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
                lat: item.lat,
                lng: item.lng,
            };
        });

        setIncidentData(mapped);
    }, [incidents]);

    // 주소 → 좌표 변환 (지오코딩)
    const geocodeAddress = useCallback((geocoder, address) => {
        return new Promise((resolve) => {
            let searchAddress = (address || '').trim();

            if (searchAddress && !searchAddress.toLowerCase().includes('madison')) {
                searchAddress = `${searchAddress}, Madison, WI`;
            }

            geocoder.geocode(
                {
                    address: searchAddress,
                    bounds: new window.google.maps.LatLngBounds(
                        new window.google.maps.LatLng(43.0, -89.5),
                        new window.google.maps.LatLng(43.15, -89.3)
                    ),
                },
                (results, status) => {
                    if (status === 'OK' && results[0]) {
                        resolve({
                            lat: results[0].geometry.location.lat(),
                            lng: results[0].geometry.location.lng(),
                        });
                    } else {
                        resolve(null);
                    }
                }
            );
        });
    }, []);

    // 🔴 사건들 마커 찍기
    const geocodeAndAddMarkers = useCallback(
        async (map) => {
            if (!window.google || !incidentData.length) return;

            const geocoder = new window.google.maps.Geocoder();

            // 기존 마커 제거
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current = [];

            for (let i = 0; i < incidentData.length; i++) {
                const incident = incidentData[i];

                if (!incident.location) continue;

                try {
                    let position;

                    if (incident.lat && incident.lng) {
                        position = { lat: incident.lat, lng: incident.lng };
                    } else {
                        position = await geocodeAddress(geocoder, incident.location);
                        await new Promise((r) => setTimeout(r, 80));
                    }

                    if (!position) continue;

                    const marker = new window.google.maps.Marker({
                        position,
                        map: map,
                        title: `${incident.type} - ${incident.caseNumber || ''}`,
                        icon: {
                            url: createIncidentIcon(),
                            scaledSize: new window.google.maps.Size(32, 40),
                            anchor: new window.google.maps.Point(16, 40),
                        },
                    });

                    marker.addListener('click', () => {
                        setSelectedIncident(incident);
                    });

                    markersRef.current.push(marker);
                } catch {}
            }
        },
        [incidentData, geocodeAddress]
    );

    // 🔵 구글 맵 초기화
    useEffect(() => {
        const initMap = () => {
            if (!window.google || !mapRef.current) return;

            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 43.0731, lng: -89.4012 },
                zoom: 12,
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }],
                    },
                ],
            });

            googleMapRef.current = map;

            // 🔵 경찰서 마커
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
                        strokeWeight: 2,
                    },
                });

                const infoWindow = new window.google.maps.InfoWindow({
                    content: `
                        <div style="font-family: 'Expletus Sans', sans-serif; padding: 8px;">
                            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${station.name}</h3>
                            <p style="margin: 0; font-size: 12px; color: #666;">${station.address}</p>
                        </div>
                    `,
                });

                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });
            });

            setIsMapReady(true);
        };

        // 스크립트 로딩
        if (!window.google) {
            const script = document.createElement('script');
            script.src =
                'https://maps.googleapis.com/maps/api/js?key=AIzaSyC0hEJv6-M1Dko5IwpCbzx5ACnxaI82Jac&libraries=places';
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            script.onerror = () => {};
            document.head.appendChild(script);
        } else {
            initMap();
        }

        return () => {
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current = [];
        };
    }, []);

    // 지도 + 데이터 준비되면 사건 마커 찍기
    useEffect(() => {
        if (isMapReady && googleMapRef.current && incidentData.length > 0) {
            geocodeAndAddMarkers(googleMapRef.current);
        }
    }, [isMapReady, incidentData, geocodeAndAddMarkers]);

    const closePopup = () => {
        setSelectedIncident(null);
    };

    return (
        <div className="map-section">
            <div
                className="map-container"
                ref={mapRef}
                style={{
                    width: '100%',
                    height: '600px',
                    minHeight: '400px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                }}
            ></div>

            {selectedIncident && (
                <div className="incident-popup">
                    <button className="popup-close" onClick={closePopup}>
                        ×
                    </button>
                    <h3>
                        {selectedIncident.type}{' '}
                        {selectedIncident.caseNumber &&
                            `- Case #${selectedIncident.caseNumber}`}
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

