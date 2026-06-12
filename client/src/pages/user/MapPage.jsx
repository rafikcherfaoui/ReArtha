import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import api from '../../api/axios'

export default function MapPage() {
  const [centers, setCenters] = useState([])

  useEffect(() => {
    api.get('/centers').then((res) => setCenters(res.data))
  }, [])

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Collection centers</h1>
      <p style={{ marginBottom: '1rem' }}>Drop off your used diapers at any of these locations to earn points.</p>
      <MapContainer
        center={[36.7, 3.1]}  // centered on Algiers
        zoom={10}
        style={{ height: '500px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {centers.map((center) => (
          <Marker
            key={center._id}
            position={[center.coordinates.lat, center.coordinates.lng]}
          >
            <Popup>
              <strong>{center.name}</strong><br />
              {center.address}, {center.city}<br />
              <small>{center.hours}</small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}