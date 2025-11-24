'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Location {
  id: string
  name: string
  icon: string
  lat: number
  lng: number
  points: number
}

interface VisitedLocation {
  id: string
  photo: string
  timestamp: string
}

interface CampusMapProps {
  locations: Location[]
  visitedLocations: Map<string, VisitedLocation>
  onSelectLocation: (location: Location) => void
}

// Custom marker icons
const createCustomIcon = (icon: string, isVisited: boolean, photo?: string) => {
  const bgColor = isVisited ? '#C19A17' : '#E77500'
  const size = 44

  if (isVisited && photo) {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid ${bgColor};
          background-image: url(${photo});
          background-size: cover;
          background-position: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          cursor: pointer;
        "></div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    })
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${bgColor};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: pointer;
        ${!isVisited ? 'animation: pulse 2s infinite;' : ''}
      ">${isVisited ? '✓' : icon}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Component to fit bounds
function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap()

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, locations])

  return null
}

export default function CampusMap({ locations, visitedLocations, onSelectLocation }: CampusMapProps) {
  // Princeton campus center
  const center: [number, number] = [40.3431, -74.6551]

  return (
    <MapContainer
      center={center}
      zoom={16}
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds locations={locations} />
      {locations.map((location) => {
        const visitData = visitedLocations.get(location.id)
        const isVisited = !!visitData

        return (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={createCustomIcon(location.icon, isVisited, visitData?.photo)}
            eventHandlers={{
              click: () => onSelectLocation(location),
            }}
          />
        )
      })}
    </MapContainer>
  )
}
