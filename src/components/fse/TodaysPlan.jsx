import { useMemo, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import FSEInsights from './FSEInsights'
import 'leaflet/dist/leaflet.css'

const ACCENT = '#00BAF2'

const createNumberedIcon = (num, color) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:2px solid #0a1628;display:flex;align-items:center;justify-content:center;color:#0a1628;font-size:12px;font-weight:bold;">${num}</div>`,
  iconSize: [28, 28], iconAnchor: [14, 14]
})

function TodaysPlan({ data, onFilterChange, onTabChange }) {
  const [selectedMerchant, setSelectedMerchant] = useState(null)
  const [visitedMerchants, setVisitedMerchants] = useState([])
  const [expandedCard, setExpandedCard] = useState(null)
  const [listFilter, setListFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Urgency')
  const mapRef = useRef(null)

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    setExpandedCard(null)
  }

  const toggleVisited = (id) => {
    setVisitedMerchants(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    )
  }

  const filterMerchants = (merchants) => {
    if (listFilter === 'All') return merchants
    const lowerFilter = listFilter.toLowerCase()
    return merchants.filter(m => {
      const reason = m.visitReason.toLowerCase()
      if (lowerFilter === 'churn risk') return reason.includes('churn')
      if (lowerFilter === 'credit upsel') return reason.includes('credit')
      if (lowerFilter === 'gmv decline') return reason.includes('gmv') || reason.includes('decline')
      return true
    })
  }

  const getTalkingPoints = (visitReason) => {
    const lower = visitReason.toLowerCase()
    if (lower.includes('churn')) {
      return ["Ask why transaction frequency dropped", "Demo latest LocalOS features", "Offer reactivation incentive"]
    }
    if (lower.includes('credit')) {
      return ["Explain Paytm loan terms vs moneylender", "Walk through loan simulator", "Collect KYC documents if interested"]
    }
    if (lower.includes('gmv') || lower.includes('decline')) {
      return ["Review recent sales patterns together", "Identify which products are slowing", "Discuss restocking strategy"]
    }
    return ["Discuss recent business performance", "Ask about any challenges", "Suggest improvements"]
  }

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  const p1Merchants = useMemo(() => data.filter(m => m.priority === 'P1').sort((a, b) => {
    if (a.health === 'RED' && b.health !== 'RED') return -1
    if (b.health === 'RED' && a.health !== 'RED') return 1
    return b.lastTransactionDays - a.lastTransactionDays
  }).slice(0, 5), [data])

  const p1WithDistance = useMemo(() => {
    const baseLat = 26.8635, baseLng = 75.7570
    return p1Merchants.map(m => ({ ...m, distance: Number(haversineDistance(baseLat, baseLng, m.lat, m.lng)).toFixed(1) }))
  }, [p1Merchants])

  const totalRouteDistance = useMemo(() => {
    if (p1WithDistance.length === 0) return 0
    let total = Number(p1WithDistance[0].distance)
    for (let i = 1; i < p1WithDistance.length; i++) total += haversineDistance(p1WithDistance[i-1].lat, p1WithDistance[i-1].lng, p1WithDistance[i].lat, p1WithDistance[i].lng)
    return Number(total).toFixed(1)
  }, [p1WithDistance])

  const routePositions = p1Merchants.map(m => [m.lat, m.lng])
  const gmvAtRiskBase = data.filter(m => m.health === 'RED').reduce((sum, m) => sum + m.gmvCurrent, 0)
  const visitedRedGMV = p1Merchants.filter(m => m.health === 'RED' && visitedMerchants.includes(m.id)).reduce((sum, m) => sum + m.gmvCurrent, 0)
  const gmvAtRisk = gmvAtRiskBase - visitedRedGMV
  const creditToDeploy = data.filter(m => m.creditStatus === 'eligible' && !m.hasReceivedCreditOffer).length * 50000

  const visitedCount = visitedMerchants.length
  const allVisited = visitedCount === 5

  const handleCardClick = (m, index) => {
    setSelectedMerchant(m.id)
    if (mapRef.current) {
      mapRef.current.setView([m.lat, m.lng], 15)
    }
  }

  const handleMarkerClick = (m, index) => {
    setSelectedMerchant(m.id)
    if (mapRef.current) {
      mapRef.current.setView([m.lat, m.lng], 15)
    }
  }

  const priorityBadge = (p) => <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${p === 'P1' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : p === 'P2' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>{p}</span>

  const getIcon = (health, index) => {
    const colors = { RED: '#ef4444', AMBER: '#f59e0b', GREEN: '#22c55e' }
    return createNumberedIcon(index + 1, colors[health] || '#22c55e')
  }

  const mapBounds = useMemo(() => {
    if (p1Merchants.length === 0) return null
    const lats = p1Merchants.map(m => m.lat)
    const lngs = p1Merchants.map(m => m.lng)
    return [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]]
  }, [p1Merchants])

  const filteredMerchants = useMemo(() => {
    const priorityOrder = { P1: 1, P2: 2, P3: 3 }
    let result = filterMerchants(p1WithDistance)
    if (sortBy === 'Urgency') {
      result = [...result].sort((a, b) => {
        const pa = priorityOrder[a.priority]
        const pb = priorityOrder[b.priority]
        if (pa !== pb) return pa - pb
        return b.lastTransactionDays - a.lastTransactionDays
      })
    } else if (sortBy === 'Distance') {
      result = [...result].sort((a, b) => Number(a.distance) - Number(b.distance))
    }
    return result
  }, [p1WithDistance, listFilter, sortBy])

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4" style={{ height: '400px' }}>
        <div className="w-2/5 bg-[#0d1f35] rounded-xl border border-white/10 overflow-auto">
          <div className="p-3">
            <div className="flex gap-2 mb-3">
              {['All', 'Churn Risk', 'Credit Upsell', 'GMV Decline'].map(filter => (
                <button key={filter} onClick={() => setListFilter(filter)} className={`px-3 py-1 text-xs rounded-full transition-all ${listFilter === filter ? 'bg-[#00BAF2] text-white' : 'border border-white/20 text-gray-400 hover:border-white/40'}`}>
                  {filter}
                </button>
              ))}
              <div className="flex-1" />
              <div className="flex gap-1">
                {['Urgency', 'Distance'].map(sort => (
                  <button key={sort} onClick={() => handleSortChange(sort)} className={`px-2 py-1 text-xs rounded transition-all ${sortBy === sort ? 'bg-[#00BAF2] text-white' : 'border border-white/20 text-gray-400 hover:border-white/40'}`}>
                    {sort}
                  </button>
                ))}
              </div>
            </div>
            <div className={`text-sm mb-3 ${allVisited ? 'text-green-400' : 'text-gray-400'}`}>
              {allVisited ? '✓ All visits complete' : visitedCount + ' / 5 visited today'}
            </div>
            {filteredMerchants.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No merchants in this category today</p>
            ) : (
              <div className="space-y-2">
                {filteredMerchants.map((m, i) => {
                  const isVisited = visitedMerchants.includes(m.id)
                  const isExpanded = expandedCard === m.id
                  const talkingPoints = getTalkingPoints(m.visitReason)
                  return (
                    <div key={m.id} onClick={() => { handleCardClick(m, i); setExpandedCard(isExpanded ? null : m.id) }} className={`p-3 rounded-lg border cursor-pointer transition-all relative ${selectedMerchant === m.id ? 'border-[#00BAF2] bg-[#00BAF2]/10' : 'border-white/10 hover:border-white/20'} ${isVisited ? 'opacity-60' : ''}`}>
                      <button onClick={(e) => { e.stopPropagation(); setExpandedCard(isExpanded ? null : m.id) }} className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center transition-transform duration-200">
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#00BAF2] text-[#0a1628] text-sm font-bold flex items-center justify-center">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${isVisited ? 'line-through text-gray-500' : ''}`}>{m.name}</span>
                            {priorityBadge(m.priority)}
                          </div>
                          <div className="text-xs text-gray-500">{m.shopType}</div>
                        </div>
                        <span className="text-xs text-[#00BAF2]">{m.distance} km</span>
                      </div>
                      <div className="mt-2 pl-9 text-xs text-gray-400">{m.visitReason}</div>
                      <div className="mt-1 pl-9 text-xs text-gray-500">{m.featuresInUse}</div>
                      <div className="mt-2 pl-9 flex items-center justify-end">
                        <button onClick={(e) => { e.stopPropagation(); toggleVisited(m.id) }} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                          {isVisited ? (
                            <>
                              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              <span className="text-green-400">Visited ✓</span>
                            </>
                          ) : (
                            <>
                              <span className="w-4 h-4 rounded-full border border-gray-500" />
                              <span>Mark Visited</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-48 mt-3' : 'max-h-0'}`}>
                        <div className="pl-9 pt-2 border-t border-white/10">
                          <p className="text-xs text-gray-500 mb-1">Last transaction: {m.lastTransactionDate}</p>
                          <p className="text-xs text-gray-500 mb-2">Features: {m.featuresInUse}</p>
                          <p className="text-xs text-[#00BAF2] mb-1">Talking points:</p>
                          <ul className="text-xs text-gray-400 space-y-0.5">
                            {talkingPoints.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-[#00BAF2]">•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="w-1/5 flex flex-col justify-center gap-3">
          <div className="flex-1 bg-[#0d1f35] rounded-xl p-4 border border-red-500/30 flex flex-col justify-center items-center text-center">
            <p className="text-sm text-gray-400 mb-1">GMV at Risk</p>
            <p className="text-2xl font-semibold text-red-400">₹{(gmvAtRisk/100000).toFixed(1)}L</p>
          </div>
          <div className="flex-1 bg-[#0d1f35] rounded-xl p-4 border border-[#00BAF2]/30 flex flex-col justify-center items-center text-center">
            <p className="text-sm text-gray-400 mb-1">Credit to Deploy</p>
            <p className="text-2xl font-semibold text-[#00BAF2]">₹{(creditToDeploy/100000).toFixed(1)}L</p>
          </div>
          <div className="flex-1 bg-[#0d1f35] rounded-xl p-4 border border-white/10 flex flex-col justify-center items-center text-center">
            <p className="text-sm text-gray-400 mb-1">Route Distance</p>
            <p className="text-2xl font-semibold">{totalRouteDistance} km</p>
          </div>
        </div>

        <div className="w-2/5 bg-[#0d1f35] rounded-xl border border-white/10 overflow-hidden">
          <MapContainer ref={mapRef} bounds={mapBounds} boundsOptions={{ padding: [30, 30] }} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {p1Merchants.map((m, i) => (<Marker key={m.id} position={[m.lat, m.lng]} icon={getIcon(m.health, i)} eventHandlers={{ click: () => handleMarkerClick(m, i) }}><Popup><div className="text-sm"><strong>{i + 1}. {m.name}</strong><br />{m.visitReason}</div></Popup></Marker>))}
            {routePositions.length > 1 && <Polyline positions={routePositions} color={ACCENT} weight={4} />}
          </MapContainer>
        </div>
      </div>

      <FSEInsights data={data} onFilterChange={onFilterChange} onTabChange={onTabChange} />
    </div>
  )
}

export default TodaysPlan
