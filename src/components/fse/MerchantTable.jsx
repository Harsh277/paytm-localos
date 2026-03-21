import { useState } from 'react'

function MerchantTable({ data }) {
  const [expandedRow, setExpandedRow] = useState(null)

  const healthDot = (health) => (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${health === 'RED' ? 'bg-red-500' : health === 'AMBER' ? 'bg-amber-500' : 'bg-green-500'}`} />
  )

  const creditBadge = (status) => {
    const styles = { eligible: 'bg-blue-500/20 text-blue-400 border-blue-500/30', active: 'bg-green-500/20 text-green-400 border-green-500/30', overdue: 'bg-red-500/20 text-red-400 border-red-500/30', none: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
    return <span className={`px-2 py-0.5 text-xs rounded-full border ${styles[status] || styles.none}`}>{status}</span>
  }

  const priorityBadge = (p) => (
    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${p === 'P1' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : p === 'P2' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>{p}</span>
  )

  return (
    <div className="bg-[#0d1f35] rounded-xl border border-white/10 overflow-hidden h-full">
      <div className="overflow-auto h-full">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#0d1f35] z-10">
            <tr className="text-gray-400 border-b border-white/10">
              <th className="text-left py-3 px-3">Merchant</th>
              <th className="text-center py-3 px-2">Health</th>
              <th className="text-center py-3 px-2">Last Trans.</th>
              <th className="text-center py-3 px-2">GMV</th>
              <th className="text-center py-3 px-2">Credit</th>
              <th className="text-center py-3 px-2">Action</th>
              <th className="text-center py-3 px-2">Priority</th>
            </tr>
          </thead>
          <tbody>
            {data.map(m => (
              <><tr key={m.id} onClick={() => setExpandedRow(expandedRow === m.id ? null : m.id)} className="border-b border-white/5 hover:bg-white/5 cursor-pointer">
                <td className="py-3 px-3"><div className="font-medium">{m.name}</div><div className="text-xs text-gray-500">{m.shopType}</div></td>
                <td className="text-center py-3 px-2">{healthDot(m.health)}</td>
                <td className="text-center py-3 px-2 text-gray-400">{m.lastTransactionDays}d</td>
                <td className="text-center py-3 px-2"><span className={m.gmvChangePct >= 0 ? 'text-green-400' : 'text-red-400'}>{m.gmvChangePct >= 0 ? '↑' : '↓'} {Math.abs(m.gmvChangePct)}%</span></td>
                <td className="text-center py-3 px-2">{creditBadge(m.creditStatus)}</td>
                <td className="text-center py-3 px-2"><span className="px-2 py-0.5 bg-white/5 text-xs rounded-full">{m.recommendedAction}</span></td>
                <td className="text-center py-3 px-2">{priorityBadge(m.priority)}</td>
              </tr>
              {expandedRow === m.id && (<tr className="bg-[#0a1628]"><td colSpan={7} className="p-4"><div className="grid grid-cols-3 gap-4 text-sm"><div><span className="text-gray-500">Location:</span><p className="text-gray-300">{m.location}</p></div><div><span className="text-gray-500">Features:</span><p className="text-gray-300">{m.featuresInUse}</p></div><div><span className="text-gray-500">Visit Reason:</span><p className="text-gray-300">{m.visitReason}</p></div></div></td></tr>)}</>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MerchantTable
