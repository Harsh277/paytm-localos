const ACCENT_BLUE = '#00BAF2'
const ACCENT_GREEN = '#22c55e'
const ACCENT_RED = '#ef4444'
const ACCENT_AMBER = '#f59e0b'
const PROGRESS_BG = '#1e3a5f'

function ProgressCard({ value, target, title, color, label, prefix = '', suffix = '' }) {
  const percentage = Math.min((value / target) * 100, 100)

  return (
    <div className="bg-[#0d1f35] rounded-xl p-5 border border-white/10 flex flex-col justify-between" style={{ height: '160px', borderTopWidth: '3px', borderTopColor: color }}>
      <p className="text-xs text-gray-400">{title}</p>
      <p className="text-4xl font-bold" style={{ color: color }}>{prefix}{value}{suffix}</p>
      <div>
        <div className="w-full h-1 rounded-full" style={{ backgroundColor: PROGRESS_BG }}>
          <div className="h-1 rounded-full" style={{ width: percentage + '%', backgroundColor: color }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  )
}

function AtRiskCard({ value, target, title, color, label }) {
  return (
    <div className="bg-[#0d1f35] rounded-xl p-5 border border-white/10 flex flex-col justify-between" style={{ height: '160px', borderTopWidth: '3px', borderTopColor: color }}>
      <p className="text-xs text-gray-400">{title}</p>
      <p className="text-4xl font-bold" style={{ color: color }}>{value}</p>
      <div>
        <div className="w-full h-1 rounded-full" style={{ backgroundColor: PROGRESS_BG }}>
          <div className="h-1 rounded-full" style={{ width: '100%', backgroundColor: color }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  )
}

function CreditUpsellCard({ opportunities, converted, weeklyTarget, title, color, label }) {
  const percentage = Math.min((converted / weeklyTarget) * 100, 100)

  return (
    <div className="bg-[#0d1f35] rounded-xl p-5 border border-white/10 flex flex-col justify-between" style={{ height: '160px', borderTopWidth: '3px', borderTopColor: color }}>
      <p className="text-xs text-gray-400">{title}</p>
      <p className="text-4xl font-bold" style={{ color: color }}>{opportunities}</p>
      <div>
        <div className="w-full h-1 rounded-full" style={{ backgroundColor: PROGRESS_BG }}>
          <div className="h-1 rounded-full" style={{ width: percentage + '%', backgroundColor: color }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  )
}

function PortfolioStats({ stats }) {
  const gmvValue = (stats.totalGMV/100000).toFixed(1)
  return (
    <div className="grid grid-cols-5 gap-4">
      <ProgressCard value={stats.total} target={60} title="Total Merchants" color="#ffffff" label={stats.total + ' / 60 target'} />
      <ProgressCard value={stats.activeThisWeek} target={42} title="Active This Week" color={ACCENT_GREEN} label={stats.activeThisWeek + ' / 42 target'} />
      <AtRiskCard value={stats.atRisk} target={5} title="At Risk" color={ACCENT_RED} label="target: below 5" />
      <CreditUpsellCard opportunities={stats.creditUpsell} converted={0} weeklyTarget={8} title="Credit Upsell" color={ACCENT_AMBER} label="0 / 8 converted this week" />
      <ProgressCard value={gmvValue} target={50} title="Portfolio GMV" color="#ffffff" label={'₹' + gmvValue + 'L / ₹50L target'} prefix="₹" suffix="L" />
    </div>
  )
}

export default PortfolioStats
