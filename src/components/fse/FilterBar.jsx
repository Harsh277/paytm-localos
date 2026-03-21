function FilterBar({ filters, setFilters }) {
  return (
    <div className="flex gap-3 flex-wrap">
      <select value={filters.health} onChange={(e) => setFilters(f => ({ ...f, health: e.target.value }))} className="bg-[#0d1f35] border border-white/10 rounded-lg px-3 py-2 text-sm">
        <option value="All">Health: All</option>
        <option value="Green">Green</option>
        <option value="Amber">Amber</option>
        <option value="Red">Red</option>
      </select>
      <select value={filters.recommendedAction} onChange={(e) => setFilters(f => ({ ...f, recommendedAction: e.target.value }))} className="bg-[#0d1f35] border border-white/10 rounded-lg px-3 py-2 text-sm">
        <option value="All">Action: All</option>
        <option value="Visit">Visit</option>
        <option value="Upsell">Upsell</option>
        <option value="Retain">Retain</option>
        <option value="Onboard">Onboard</option>
      </select>
      <select value={filters.lastTransaction} onChange={(e) => setFilters(f => ({ ...f, lastTransaction: e.target.value }))} className="bg-[#0d1f35] border border-white/10 rounded-lg px-3 py-2 text-sm">
        <option value="All">Last Transaction: All</option>
        <option value="Today">Today</option>
        <option value="This Week">This Week</option>
        <option value="7+ Days Ago">7+ Days Ago</option>
      </select>
      <select value={filters.creditStatus} onChange={(e) => setFilters(f => ({ ...f, creditStatus: e.target.value }))} className="bg-[#0d1f35] border border-white/10 rounded-lg px-3 py-2 text-sm">
        <option value="All">Credit: All</option>
        <option value="Eligible">Eligible</option>
        <option value="Active">Active</option>
        <option value="Overdue">Overdue</option>
      </select>
      <select value={filters.gmvTrend} onChange={(e) => setFilters(f => ({ ...f, gmvTrend: e.target.value }))} className="bg-[#0d1f35] border border-white/10 rounded-lg px-3 py-2 text-sm">
        <option value="All">GMV Trend: All</option>
        <option value="Growing">Growing</option>
        <option value="Stable">Stable</option>
        <option value="Declining">Declining</option>
      </select>
    </div>
  )
}

export default FilterBar
