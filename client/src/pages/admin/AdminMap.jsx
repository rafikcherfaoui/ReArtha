import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import api from '../../api/axios'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

function ClickHandler({ onMapClick }) {
  useMapEvents({ click(e) { onMapClick(e.latlng) } })
  return null
}

export default function AdminMap() {
  const [centers, setCenters] = useState([])
  const [pending, setPending] = useState(null)
  const [form, setForm] = useState({ name: '', address: '', city: '', hours: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/centers').then((res) => setCenters(res.data))
  }, [])

  const handleMapClick = (latlng) => {
    setPending(latlng)
    setForm({ name: '', address: '', city: '', hours: 'Sat–Thu 08:00–17:00' })
    setError('')
  }

  const handleSave = async () => {
    if (!form.name || !form.city) {
      setError('Name and city are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await api.post('/admin/centers', {
        ...form,
        coordinates: { lat: pending.lat, lng: pending.lng },
      })
      setCenters([...centers, res.data])
      setPending(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this center?')) return
    await api.delete(`/admin/centers/${id}`)
    setCenters(centers.filter((c) => c._id !== id))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Page header */}
      <div>
        <h1>Collection map</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>
          Click anywhere on the map to place a new collection center.
        </p>
      </div>

      {/* Map + form side by side when a point is selected */}
      <div style={{ display: 'grid', gridTemplateColumns: pending ? '1fr 320px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Map */}
        <MapContainer
          center={[36.7, 3.1]}
          zoom={10}
          style={{
            height: 520,
            width: '100%',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--gray-200)',
            cursor: 'crosshair',
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onMapClick={handleMapClick} />

          {centers.map((center) => (
            <Marker key={center._id} position={[center.coordinates.lat, center.coordinates.lng]}>
              <Popup>
                <strong style={{ fontSize: 13 }}>{center.name}</strong><br />
                <span style={{ color: '#555', fontSize: 12 }}>{center.address}, {center.city}</span><br />
                <span style={{ color: '#888', fontSize: 11 }}>{center.hours}</span><br />
                <button
                  onClick={() => handleDelete(center._id)}
                  style={{
                    marginTop: 8, fontSize: 12, color: 'white',
                    background: 'var(--red-600)', border: '1px solid #ffffff',
                    borderRadius: 4, padding: '3px 10px', cursor: 'pointer', width: '100%',
                  }}
                >
                  Remove
                </button>
              </Popup>
            </Marker>
          ))}

          {pending && (
            <Marker position={[pending.lat, pending.lng]} />
          )}
        </MapContainer>

        {pending && (
          <Card style={{ padding: '1.5rem' }}>

            {/* Header */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ marginBottom: 4 }}>New center</h2>
              {/* Coordinates pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '3px 0px',
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--green-700)', letterSpacing: '0.03em' }}>
                  {pending.lat.toFixed(5)}, {pending.lng.toFixed(5)}
                </span>
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <Input
                label="Center name"
                placeholder="e.g. Bab Ezzouar Center"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Address"
                placeholder="Street or area"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <Input
                label="City"
                placeholder="e.g. Algiers"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <Input
                label="Opening hours"
                placeholder="Sat–Thu 08:00–17:00"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: '0.875rem',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--red-50)',
                borderLeft: '3px solid var(--red-600)',
                color: 'var(--red-600)',
                fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--gray-100)', margin: '1.25rem 0 1rem' }} />

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button onClick={handleSave} disabled={saving} fullWidth>
                {saving ? 'Saving…' : 'Save center'}
              </Button>
              <Button variant="secondary" onClick={() => setPending(null)} fullWidth>
                Cancel
              </Button>
            </div>

          </Card>
        )}
      </div>

    </div>
  )
}