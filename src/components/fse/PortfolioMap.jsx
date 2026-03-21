import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const ACCENT = '#00BAF2'

const createIcon = (color) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid #0a1628;display:flex;align-items:center;justify-content:center;color:#0a1628;font-size:10px;font-weight:bold;">•</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
})

const greenIcon = createIcon('#22c55e')
const amberIcon = createIcon('#f59e0b')
const redIcon = createIcon('#ef4444')

function PortfolioMap({ data }) {
  const [selectedMerchant, setSelectedMerchant] = useState(null)
  const routePositions = data.map(m => [m.lat, m.lng])

  const getIcon = (health) => {
    if (health === 'RED') return redIcon
    if (health === 'AMBER') return amberIcon
    return greenIcon
  }

  const MapUpdater = ({ center }) => {
    const map = useMap()
    useEffect(() => { if (center) map.flyTo(center, 15) }, [center, map])
    return null
  }

  return (
    <div className="bg-[#0d1f35] rounded-xl border border-white/10 overflow-hidden h-full">
      <MapContainer center={[26.8635, 75.7570]} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OSM" />
        <MapUpdater center={selectedMerchant ? [selectedMerchant.lat, selectedMerchant.lng] : null} />
        {data.map(m => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={getIcon(m.health)} eventHandlers={{ click: () => setSelectedMerchant(m) }}>
            <Popup><div className="text-sm text-gray-800"><strong>{m.name}</strong><br />{m.health}<br />{m.visitReason}</div></Popup>
          </Marker>
        ))}
        {routePositions.length > 1 && <Polyline positions={routePositions} color={ACCENT} weight={3} opacity={0.7} />}
      </MapContainer>
    </div>
  )
}

export default PortfolioMap
