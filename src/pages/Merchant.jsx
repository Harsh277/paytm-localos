import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { rameshDailyData } from '../data/rameshData.js'
import { sendMessage } from '../services/geminiService.js'
import LoanSimulator from '../components/merchant/LoanSimulator'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, ReferenceLine, Cell } from 'recharts'

const BG = '#0a1628'
const ACCENT = '#00BAF2'
const GREY = '#334155'

function Merchant() {
  const [activeTab, setActiveTab] = useState('operations')
  const [chartView, setChartView] = useState('daily')
  const [selectedSKU, setSelectedSKU] = useState('parleg')
  const [cashFlowView, setCashFlowView] = useState('net')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loanAmount, setLoanAmount] = useState(75000)
  const [loanTenure, setLoanTenure] = useState(12)
  const [showModal, setShowModal] = useState(false)

  const loanSimulator = useMemo(() => {
    const paytmRate = 14 / 12 / 100
    const moneylenderRate = 24 / 12 / 100
    const n = loanTenure

    const calculateEMI = (principal, monthlyRate) => {
      if (monthlyRate === 0) return principal / n
      const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1)
      return emi
    }

    const paytmEMI = calculateEMI(loanAmount, paytmRate)
    const moneylenderEMI = calculateEMI(loanAmount, moneylenderRate)

    const paytmTotal = paytmEMI * n
    const moneylenderTotal = moneylenderEMI * n

    const paytmInterest = paytmTotal - loanAmount
    const moneylenderInterest = moneylenderTotal - loanAmount
    const interestSaved = moneylenderInterest - paytmInterest

    return {
      emi: Math.round(paytmEMI),
      dailyDeduction: Math.round(paytmEMI / 30),
      totalInterest: Math.round(paytmInterest),
      totalRepayment: Math.round(paytmTotal),
      moneylenderTotal: Math.round(moneylenderTotal),
      interestSaved: Math.round(interestSaved)
    }
  }, [loanAmount, loanTenure])

  const data = rameshDailyData
  const days = data.length

  const stats = useMemo(() => {
    const totalRevenue = data.reduce((sum, d) => sum + d.total_revenue, 0)
    const avgDaily = Math.round(totalRevenue / days)
    const bestDay = Math.max(...data.map(d => d.total_revenue))
    const bestDayData = data.find(d => d.total_revenue === bestDay)
    const totalUPI = data.reduce((sum, d) => sum + d.upi_revenue, 0)
    const upiPercent = Math.round((totalUPI / totalRevenue) * 100)
    return { totalRevenue, avgDaily, bestDay, bestDayDate: bestDayData?.date, upiPercent }
  }, [data])

  const skuStats = useMemo(() => {
    const result = {}
    data.forEach(day => {
      day.skus.forEach(sku => {
        if (!result[sku.sku_id]) {
          result[sku.sku_id] = {
            name: sku.name,
            totalUnits: 0,
            totalRevenue: 0,
            totalProfit: 0,
            dailySales: []
          }
        }
        result[sku.sku_id].totalUnits += sku.total_units_sold
        result[sku.sku_id].totalRevenue += sku.revenue
        result[sku.sku_id].totalProfit += sku.profit
        result[sku.sku_id].dailySales.push({ date: day.date, units: sku.total_units_sold })
      })
    })
    Object.keys(result).forEach(id => {
      result[id].margin = Math.round((result[id].totalProfit / result[id].totalRevenue) * 100)
    })
    return result
  }, [data])

  const chartData = useMemo(() => {
    if (chartView === 'daily') {
      return data.map(d => ({
        date: d.date.slice(5),
        upi: d.upi_revenue,
        cash: d.cash_revenue,
        isWeekend: d.is_weekend
      }))
    } else {
      const weeks = []
      for (let i = 0; i < data.length; i += 7) {
        const weekData = data.slice(i, i + 7)
        weeks.push({
          week: `W${Math.ceil((i + 1) / 7)}`,
          upi: weekData.reduce((sum, d) => sum + d.upi_revenue, 0),
          cash: weekData.reduce((sum, d) => sum + d.cash_revenue, 0)
        })
      }
      return weeks
    }
  }, [data, chartView])

  const stockData = useMemo(() => {
    const latest = data[data.length - 1]
    const sku = latest.skus.find(s => s.sku_id === selectedSKU)
    if (!sku) return []
    return [
      { period: 'Morning', sold: sku.morning_units_sold, remaining: sku.morning_opening_stock - sku.morning_units_sold },
      { period: 'Noon', sold: sku.noon_units_sold, remaining: sku.noon_opening_stock - sku.noon_units_sold },
      { period: 'Evening', sold: sku.evening_units_sold, remaining: Math.max(0, sku.evening_opening_stock - sku.evening_units_sold) }
    ]
  }, [data, selectedSKU])

  const cashFlowData = useMemo(() => {
    const result = data.map((d) => {
      const supplierPayments = d.supplier_payments.reduce((sum, p) => sum + p.amount, 0)
      const fixedExpenses = (d.fixed_expenses || []).reduce((sum, e) => sum + e.amount, 0)
      const miscExpenses = d.misc_expenses || 0
      const totalExpenses = miscExpenses + fixedExpenses + supplierPayments
      return { 
        date: d.date.slice(5), 
        revenue: d.total_revenue,
        misc_expenses: miscExpenses,
        fixed_expenses: fixedExpenses,
        supplier_payments: supplierPayments,
        total_expenses: totalExpenses,
        net_cash_flow: d.total_revenue - totalExpenses
      }
    })
    
    return { cashFlow: result }
  }, [data])

  const projectedRevenue = useMemo(() => {
    const avgDaily = stats.avgDaily
    const result = []
    for (let i = 1; i <= 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const projected = isWeekend ? avgDaily * 1.15 : avgDaily
      result.push({
        day: i,
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        revenue: Math.round(projected)
      })
    }
    return result
  }, [stats.avgDaily])

  const insights = useMemo(() => {
    // Card 1: Profit Leakage - total revenue minus all costs
    const totalRevenue = data.reduce((sum, d) => sum + d.total_revenue, 0)
    const totalSupplierPayments = data.reduce((sum, d) => sum + d.supplier_payments.reduce((s, p) => s + p.amount, 0), 0)
    const totalMiscExpenses = data.reduce((sum, d) => sum + (d.misc_expenses || 0), 0)
    const totalFixedExpenses = data.reduce((sum, d) => sum + (d.fixed_expenses || []).reduce((s, e) => s + e.amount, 0), 0)
    const totalCosts = totalSupplierPayments + totalMiscExpenses + totalFixedExpenses
    const netProfit = totalRevenue - totalCosts

    // Card 2: Evening Stockout - count days where Parle-G closing_stock === 0
    const eveningStockouts = data.filter(d => {
      const parle = d.skus.find(s => s.sku_id === 'parleg')
      return parle && parle.closing_stock === 0
    }).length

    // Card 3: Margin Erosion - Haldiram cost increase in Feb (Jan: 16, Feb: 19)
    const janDays = data.filter(d => d.date.startsWith('2026-01'))
    const febDays = data.filter(d => d.date.startsWith('2026-02'))
    const janHaldiramUnits = janDays.reduce((sum, d) => {
      const haldiram = d.skus.find(s => s.sku_id === 'haldiram')
      return sum + (haldiram ? haldiram.total_units_sold : 0)
    }, 0)
    const febHaldiramUnits = febDays.reduce((sum, d) => {
      const haldiram = d.skus.find(s => s.sku_id === 'haldiram')
      return sum + (haldiram ? haldiram.total_units_sold : 0)
    }, 0)
    const costIncrease = 19 - 16 // ₹3 per unit
    const marginErosionLoss = febHaldiramUnits * costIncrease

    // Card 4: Cash Crunch - lowest closing balance
    let balance = 25000
    let lowestBalance = balance
    let lowestBalanceDate = data[0].date
    data.forEach(d => {
      const dayPayment = d.supplier_payments.reduce((s, p) => s + p.amount, 0)
      const fixedExpenses = (d.fixed_expenses || []).reduce((s, e) => s + e.amount, 0)
      const miscExpenses = d.misc_expenses || 0
      balance = balance + d.total_revenue - dayPayment - miscExpenses - fixedExpenses
      if (balance < lowestBalance) {
        lowestBalance = balance
        lowestBalanceDate = d.date
      }
    })

    // Card 5: GST Overdue (static)
    const gstOverdue = { amount: 8800, months: 2, penaltyPerDay: 200 }

    return [
      { 
        emoji: '💸', 
        title: 'Profit Leakage', 
        finding: netProfit >= 0 
          ? `Net profit: ₹${netProfit.toLocaleString()} over 60 days` 
          : `Net loss: ₹${Math.abs(netProfit).toLocaleString()} over 60 days`
      },
      { 
        emoji: '📦', 
        title: 'Evening Stockout', 
        finding: `Parle-G stockout on ${eveningStockouts} of ${data.length} days — highest loss window`
      },
      { 
        emoji: '📉', 
        title: 'Margin Erosion', 
        finding: `Haldiram cost increased ₹3/unit in Feb — lost ₹${marginErosionLoss.toLocaleString()} in Feb`
      },
      { 
        emoji: '💰', 
        title: 'Cash Crunch', 
        finding: `Lowest balance: ₹${lowestBalance.toLocaleString()} on ${lowestBalanceDate}`
      },
      { 
        emoji: '🧾', 
        title: 'GST Overdue', 
        finding: `₹${gstOverdue.amount.toLocaleString()} in unfiled GST — penalties accumulating at ₹${gstOverdue.penaltyPerDay}/day`
      }
    ]
  }, [data])

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return
    const userMessage = chatInput
    setChatInput('')
    setIsLoading(true)
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }])

    try {
      const response = await sendMessage(userMessage, chatMessages, rameshDailyData)
      setChatMessages(prev => [...prev, { role: 'assistant', text: response }])
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChipClick = async (question) => {
    if (isLoading) return
    setIsLoading(true)
    setChatMessages(prev => [...prev, { role: 'user', text: question }])

    try {
      const response = await sendMessage(question, chatMessages, rameshDailyData)
      setChatMessages(prev => [...prev, { role: 'assistant', text: response }])
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const skuBadges = {
    parleg: { label: 'Stockout Risk', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    haldiram: { label: 'Margin Risk', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    surfexcel: { label: 'Dead Stock', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    maggi: { label: 'Fast Mover', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    coke: { label: 'Fast Mover', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
  }

  const renderSparkline = (data) => (
    <ResponsiveContainer width={80} height={30}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="units" stroke={ACCENT} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <header className="border-b border-white/10 bg-[#0d1f35] px-6 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-[#00BAF2] hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold">Sharma General Store</h1>
          </div>
          <span className="px-3 py-1 bg-[#00BAF2]/20 text-[#00BAF2] text-sm font-medium rounded-full border border-[#00BAF2]/30">
            Live Demo
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full">📍 Mansarovar, Jaipur</span>
          <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full">🏪 Kirana Store</span>
          <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full">📅 5 Years in Business</span>
          <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full">📱 Paytm Member Since 2022</span>
          <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full">💳 UPI Active</span>
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">⚠️ GST Overdue</span>
        </div>
      </header>

      <nav className="flex gap-1 px-6 py-2 border-b border-white/10 bg-[#0d1f35]/50">
        {['Operations', 'AI CFO', 'Credit Engine'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.toLowerCase().replace(' ', '')
                ? 'bg-[#00BAF2]/20 text-[#00BAF2]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'operations' && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#0d1f35] rounded-xl p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Total Revenue (60 days)</p>
              <p className="text-2xl font-semibold">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-[#0d1f35] rounded-xl p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Avg Daily Revenue</p>
              <p className="text-2xl font-semibold">₹{stats.avgDaily.toLocaleString()}</p>
            </div>
            <div className="bg-[#0d1f35] rounded-xl p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Best Day</p>
              <p className="text-2xl font-semibold">₹{stats.bestDay.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{stats.bestDayDate}</p>
            </div>
            <div className="bg-[#0d1f35] rounded-xl p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">UPI %</p>
              <p className="text-2xl font-semibold">{stats.upiPercent}%</p>
            </div>
          </div>

          <div className="bg-[#0d1f35] rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Revenue Trend</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartView('daily')}
                  className={`px-3 py-1 text-sm rounded ${chartView === 'daily' ? 'bg-[#00BAF2]/20 text-[#00BAF2]' : 'text-gray-400'}`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setChartView('weekly')}
                  className={`px-3 py-1 text-sm rounded ${chartView === 'weekly' ? 'bg-[#00BAF2]/20 text-[#00BAF2]' : 'text-gray-400'}`}
                >
                  Weekly
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey={chartView === 'daily' ? 'date' : 'week'} stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#0d1f35', border: '1px solid #1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend />
                <Bar dataKey="upi" name="UPI" fill={ACCENT} radius={[4, 4, 0, 0]} />
                <Bar dataKey="cash" name="Cash" fill={GREY} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#0d1f35] rounded-xl p-4 border border-white/10">
            <h3 className="font-medium mb-4">SKU Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="text-left py-3 px-2">SKU</th>
                    <th className="text-right py-3 px-2">Units Sold</th>
                    <th className="text-right py-3 px-2">Revenue</th>
                    <th className="text-right py-3 px-2">Margin %</th>
                    <th className="text-center py-3 px-2">60-Day Trend</th>
                    <th className="text-center py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(skuStats).map(([id, sku]) => (
                    <tr key={id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-2 font-medium">{sku.name}</td>
                      <td className="text-right py-3 px-2">{sku.totalUnits}</td>
                      <td className="text-right py-3 px-2">₹{sku.totalRevenue.toLocaleString()}</td>
                      <td className="text-right py-3 px-2">{sku.margin}%</td>
                      <td className="py-3 px-2">{renderSparkline(sku.dailySales)}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full border ${skuBadges[id]?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                          {skuBadges[id]?.label || 'OK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#0d1f35] rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Stock Levels by Time of Day</h3>
              <select
                value={selectedSKU}
                onChange={(e) => setSelectedSKU(e.target.value)}
                className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm"
              >
                {Object.keys(skuStats).map(id => (
                  <option key={id} value={id}>{skuStats[id].name}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ background: '#0d1f35', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="sold" name="Units Sold" fill={ACCENT} stackId="a" />
                <Bar dataKey="remaining" name="Remaining" fill="#1e3a5f" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#0d1f35] rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Daily Cash Flow</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCashFlowView('net')}
                  className={`px-3 py-1 text-sm rounded ${cashFlowView === 'net' ? 'bg-[#00BAF2]/20 text-[#00BAF2]' : 'text-gray-400 hover:text-white'}`}
                >
                  Net View
                </button>
                <button
                  onClick={() => setCashFlowView('breakdown')}
                  className={`px-3 py-1 text-sm rounded ${cashFlowView === 'breakdown' ? 'bg-[#00BAF2]/20 text-[#00BAF2]' : 'text-gray-400 hover:text-white'}`}
                >
                  Breakdown View
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cashFlowData.cashFlow} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ background: '#0d1f35', border: '1px solid #1e293b', borderRadius: '8px' }}
                  formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="5 5" strokeWidth={1} />
                {cashFlowView === 'net' ? (
                  <Bar 
                    dataKey="net_cash_flow" 
                    name="Net Cash Flow" 
                    radius={[4, 4, 0, 0]}
                  >
                    {cashFlowData.cashFlow.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.net_cash_flow >= 0 ? ACCENT : '#ef4444'} />
                    ))}
                  </Bar>
                ) : (
                  <>
                    <Bar dataKey="revenue" name="Revenue" fill={ACCENT} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="misc_expenses" name="Misc Expenses" fill="#64748b" stackId="expenses" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="fixed_expenses" name="Fixed Expenses" fill="#f59e0b" stackId="expenses" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="supplier_payments" name="Supplier Payments" fill="#ef4444" stackId="expenses" radius={[0, 0, 0, 0]} />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#0d1f35] rounded-xl p-4 border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">GST Filing Status</h3>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">OVERDUE</span>
                </div>
                <p className="text-sm text-gray-400">2 months unfiled • Outstanding ₹8,800</p>
                <p className="text-sm text-red-400">Penalty risk: ₹200/day</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'aicfo' && (
        <div className="p-6 space-y-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {['Why is my profit so low?', 'Should I restock Parle-G differently?', 'Am I ready for a loan?', 'What should I fix first?', 'How much am I losing on Haldiram?'].map((q, i) => (
              <button
                key={i}
                onClick={() => handleChipClick(q)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 hover:border-[#00BAF2]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {insights.map((insight, i) => (
              <div key={i} className="bg-[#0d1f35] rounded-xl p-4 border border-white/10 hover:border-[#00BAF2]/30 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{insight.emoji}</span>
                  <div>
                    <h4 className="font-medium mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-400">{insight.finding}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#0d1f35] rounded-xl border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-medium">AI CFO Assistant</h3>
              <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full">🌐 Supports Hindi, Marathi & English</span>
            </div>
            <div className="h-64 p-4 overflow-y-auto space-y-3">
              {chatMessages.length === 0 && !isLoading && (
                <p className="text-center text-gray-500 text-sm">Ask me anything about your business...</p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-[#00BAF2]/20 text-white' : 'bg-white/10 text-gray-300'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-3 rounded-lg text-sm text-gray-300 animate-pulse">
                    AI CFO is thinking...
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1 bg-[#0a1628] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#00BAF2] disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="px-4 py-2 bg-[#00BAF2] text-white rounded-lg text-sm font-medium hover:bg-[#00a3d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'creditengine' && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#0d1f35] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm text-gray-400 mb-4">Credit Score</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="#1e293b" strokeWidth="12" fill="none" />
                    <circle cx="80" cy="80" r="70" stroke={ACCENT} strokeWidth="12" fill="none" strokeDasharray={`${(742/900) * 440} 440`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-[#00BAF2]">742</span>
                    <span className="text-sm text-gray-400">/ 900</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-green-400 font-medium">Strong — Based on 12 months of UPI history</p>
              <div className="mt-4 flex justify-center">
                <span className="px-4 py-1.5 bg-[#00BAF2]/20 text-[#00BAF2] text-sm font-medium rounded-full border border-[#00BAF2]/30">
                  You are eligible for up to ₹75,000
                </span>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full mt-4 py-3 bg-[#00BAF2] text-white font-bold rounded-lg hover:bg-[#00a3d9] transition-colors"
              >
                Apply Now
              </button>

              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400 mb-3">Score Breakdown</p>
                <div className="space-y-2">
                  {[{ label: "UPI Transaction History", score: 95, status: "Excellent" }, { label: "Transaction Consistency", score: 88, status: "Good" }, { label: "Average Monthly GMV", score: 82, status: "Strong" }, { label: "Loan Repayment Record", score: 78, status: "Good" }, { label: "GST Compliance", score: 42, status: "At Risk" }].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400 w-28 shrink-0">{item.label}</span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.score >= 70 ? "bg-green-500" : "bg-amber-500"}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <span className={`w-16 text-right shrink-0 ${item.score >= 70 ? "text-green-400" : "text-amber-400"}`}>
                        {item.score}/100 — {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#0d1f35] rounded-xl p-6 border border-white/10">
              <LoanSimulator />
            </div>
          </div>

          <div className="bg-[#0d1f35] rounded-xl p-4 border border-white/10">
            <h3 className="font-medium mb-4">Current Loan</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Outstanding</p>
                <p className="text-xl font-semibold">₹45,000</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Monthly Interest</p>
                <p className="text-xl font-semibold">₹900</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Purpose</p>
                <p className="text-xl font-semibold">Shop renovation</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0d1f35] rounded-xl p-4 border border-white/10">
            <h3 className="font-medium mb-4">Cash Flow Projection (30 days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={projectedRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="revenue" stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0d1f35', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="revenue" stroke={ACCENT} strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="w-3 h-0.5 bg-red-500" />
              <span className="text-gray-400">20th: Upcoming supplier payment dip expected</span>
            </div>
          </div>

          <div className="bg-[#0d1f35] rounded-xl p-4 border border-white/10">
            <h3 className="font-medium mb-4">Auto-Repayment Preview</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Daily Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2 text-gray-300">Daily UPI Settlement (Avg)</td>
                  <td className="text-right text-green-400">+₹{Math.round(stats.avgDaily * stats.upiPercent / 100)}</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 text-gray-300">Daily EMI Deduction</td>
                  <td className="text-right text-red-400">-₹225</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Net Daily Payout</td>
                  <td className="text-right font-semibold text-[#00BAF2]">₹{Math.round(stats.avgDaily * stats.upiPercent / 100) - 225}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#0d1f35] rounded-xl p-6 border border-white/10 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Application Submitted!</h3>
              <p className="text-gray-300 mb-6">Your loan of ₹75,000 has been approved. Funds will be credited to your Paytm wallet within 24 hours. EMI auto-deduction begins next month.</p>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-[#00BAF2] text-white font-medium rounded-lg hover:bg-[#00a3d9] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Merchant
