import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fseData } from '../data/fseData.js'
import PortfolioStats from '../components/fse/PortfolioStats'
import FilterBar from '../components/fse/FilterBar'
import MerchantTable from '../components/fse/MerchantTable'
import PortfolioMap from '../components/fse/PortfolioMap'
import TodaysPlan from '../components/fse/TodaysPlan'
import FSEInsights from '../components/fse/FSEInsights'

function FSE() {
  const [activeTab, setActiveTab] = useState('myportfolio')
  const [filters, setFilters] = useState({
    health: 'All',
    recommendedAction: 'All',
    lastTransaction: 'All',
    creditStatus: 'All',
    gmvTrend: 'All'
  })

  const filteredData = useMemo(() => {
    const priorityOrder = { P1: 1, P2: 2, P3: 3 }
    return fseData.filter(m => {
      if (filters.health !== 'All' && m.health !== filters.health.toUpperCase()) return false
      if (filters.recommendedAction !== 'All' && m.recommendedAction !== filters.recommendedAction) return false
      if (filters.lastTransaction === 'Today' && m.lastTransactionDays > 1) return false
      if (filters.lastTransaction === 'This Week' && m.lastTransactionDays > 7) return false
      if (filters.lastTransaction === '7+ Days Ago' && m.lastTransactionDays < 7) return false
      if (filters.creditStatus !== 'All' && m.creditStatus !== filters.creditStatus.toLowerCase()) return false
      if (filters.gmvTrend !== 'All') {
        if (filters.gmvTrend === 'Growing' && m.gmvChangePct <= 5) return false
        if (filters.gmvTrend === 'Stable' && (m.gmvChangePct < -5 || m.gmvChangePct > 5)) return false
        if (filters.gmvTrend === 'Declining' && m.gmvChangePct >= -5) return false
      }
      return true
    }).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }, [filters])

  const stats = useMemo(() => ({
    total: fseData.length,
    activeThisWeek: fseData.filter(m => m.lastTransactionDays <= 7).length,
    atRisk: fseData.filter(m => m.lastTransactionDays >= 7 || m.health === 'RED').length,
    creditUpsell: fseData.filter(m => m.creditStatus === 'eligible' && !m.hasReceivedCreditOffer).length,
    totalGMV: fseData.reduce((sum, m) => sum + m.gmvCurrent, 0)
  }), [])

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <header className="border-b border-white/10 bg-[#0d1f35] px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-[#00BAF2] hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold">FSE Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Vikram Singh</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400 text-sm">Mansarovar Zone</span>
            <span className="px-3 py-1 bg-[#00BAF2]/20 text-[#00BAF2] text-sm font-medium rounded-full border border-[#00BAF2]/30">Live Demo</span>
          </div>
        </div>
      </header>

      <nav className="flex gap-1 px-6 py-2 border-b border-white/10 bg-[#0d1f35]/50">
        {['My Portfolio', "Today's Plan"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '').replace("'", ''))} className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === tab.toLowerCase().replace(' ', '').replace("'", '') ? 'bg-[#00BAF2]/20 text-[#00BAF2]' : 'text-gray-400 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'myportfolio' && (
        <div className="p-6 space-y-4">
          <PortfolioStats stats={stats} />
          <FilterBar filters={filters} setFilters={setFilters} />
          <div className="flex gap-4" style={{ height: '500px' }}>
            <div className="w-3/5"><MerchantTable data={filteredData} /></div>
            <div className="w-2/5"><PortfolioMap data={filteredData} /></div>
          </div>
        </div>
      )}

      {activeTab === 'todaysplan' && (
        <TodaysPlan data={fseData} onFilterChange={setFilters} onTabChange={() => setActiveTab('myportfolio')} />
      )}
    </div>
  )
}

export default FSE
