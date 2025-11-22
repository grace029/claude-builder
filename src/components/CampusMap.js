import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CampusMap.css';

// Custom marker icons based on visit status
const createCustomIcon = (isVisited) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-pin ${isVisited ? 'visited' : 'unvisited'}">
            <span class="marker-emoji">${isVisited ? '✓' : '📍'}</span>
           </div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  });
};

function CampusMap({ locations, visitedLocations, onVisitLocation }) {
  // Princeton University coordinates (center of campus)
  const princetonCenter = [40.3487, -74.6593];

  return (
    <div className="map-container">
      <MapContainer
        center={princetonCenter}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location) => {
          const isVisited = visitedLocations.includes(location.id);
          return (
            <Marker
              key={location.id}
              position={location.coordinates}
              icon={createCustomIcon(isVisited)}
            >
              <Popup>
                <div className="map-popup">
                  <h3>{location.name}</h3>
                  <p className="popup-category">{location.category}</p>
                  <p className="popup-description">{location.description}</p>
                  <div className="popup-footer">
                    <span className="popup-tokens">🪙 {location.tokens} tokens</span>
                    {isVisited ? (
                      <span className="popup-visited">✓ Visited</span>
                    ) : (
                      <button
                        className="popup-visit-button"
                        onClick={() => onVisitLocation(location.id)}
                      >
                        Mark as Visited
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default CampusMap;
