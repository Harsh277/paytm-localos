import { useState, useMemo } from 'react'
import { sendMessage } from '../../services/geminiService.js'

const SUGGESTED_QUESTIONS = [
  "Who should I visit first today?",
  "Which merchants are about to churn?",
  "Where are my credit upsell opportunities?",
  "How is my portfolio performing this week?",
  "Which merchants have declining GMV?"
]

function FSEInsights({ data, onFilterChange, onTabChange }) {
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const insights = useMemo(() => {
    const churnRisk = data.filter(m => m.lastTransactionDays >= 7)
    const churnMetric = churnRisk.length
    const churnWorst = churnRisk.length > 0 ? churnRisk.reduce((max, m) => m.lastTransactionDays > max.lastTransactionDays ? m : max, churnRisk[0]) : null

    const creditUpsell = data.filter(m => m.creditStatus === 'eligible' && !m.hasReceivedCreditOffer)
    const creditMetric = creditUpsell.length
    const creditWorst = creditUpsell.length > 0 ? creditUpsell.reduce((max, m) => m.gmvCurrent > max.gmvCurrent ? m : max, creditUpsell[0]) : null

    const gmvDecline = data.filter(m => m.gmvChangePct < 0)
    const gmvMetric = gmvDecline.length
    const gmvWorst = gmvDecline.length > 0 ? gmvDecline.reduce((min, m) => m.gmvChangePct < min.gmvChangePct ? m : min, gmvDecline[0]) : null

    return [
      { type: 'churn', metric: churnMetric, worst: churnWorst, label: 'merchants at risk' },
      { type: 'credit', metric: creditMetric, worst: creditWorst, label: 'opportunities missed' },
      { type: 'gmv', metric: gmvMetric, worst: gmvWorst, label: 'merchants declining' }
    ]
  }, [data])

  const handleSendMessage = async (message = null) => {
    const userMessage = message || chatInput
    if (!userMessage.trim() || isLoading) return
    setChatInput('')
    setIsLoading(true)
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }])
    try {
      const response = await sendMessage(userMessage, chatMessages, data, 'You are a Paytm FSE Assistant for Vikram Singh. Portfolio has ' + data.length + ' merchants.')
      setChatMessages(prev => [...prev, { role: 'assistant', text: response }])
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Error. Please try again.' }])
    } finally { setIsLoading(false) }
  }

  const handleViewInPortfolio = (filterType) => {
    if (!onFilterChange || !onTabChange) return
    onTabChange()
    if (filterType === 'churn') {
      onFilterChange({ lastTransaction: '7+ Days Ago', health: 'All', recommendedAction: 'All', creditStatus: 'All' })
    } else if (filterType === 'credit') {
      onFilterChange({ creditStatus: 'Eligible', health: 'All', recommendedAction: 'All', lastTransaction: 'All' })
    } else if (filterType === 'gmv') {
      onFilterChange({ gmvTrend: 'Declining', health: 'All', creditStatus: 'All', lastTransaction: 'All', recommendedAction: 'All' })
    }
  }

  const getCardStyle = (type) => {
    if (type === 'churn') return { border: 'border-red-500/30', accent: '#ef4444' }
    if (type === 'credit') return { border: 'border-amber-500/30', accent: '#f59e0b' }
    return { border: 'border-[#00BAF2]/30', accent: '#00BAF2' }
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {insights.map((insight, i) => {
          const style = getCardStyle(insight.type)
          return (
            <div key={i} className={`bg-[#0d1f35] rounded-xl p-4 border ${style.border} flex flex-col justify-between`} style={{ minHeight: '140px' }}>
              <div>
                <p className="text-4xl font-bold" style={{ color: style.accent }}>{insight.metric}</p>
                <p className="text-sm text-gray-400 mt-1">{insight.label}</p>
                {insight.worst && (
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="text-gray-400">Most urgent: </span>
                    <span style={{ color: style.accent }}>{insight.worst.name}</span>
                  </p>
                )}
              </div>
              <div className="flex justify-end mt-3">
                <button onClick={() => handleViewInPortfolio(insight.type)} className="px-3 py-1.5 text-xs border border-white/20 rounded-lg hover:bg-white/5 transition-colors">
                  View in Portfolio
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="bg-[#0d1f35] rounded-xl border border-white/10">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-medium">AI Assistant</h3>
          <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full">FSE Portfolio Advisor</span>
        </div>
        <div className="h-48 p-4 overflow-y-auto space-y-3">
          {chatMessages.length === 0 && !isLoading && <p className="text-center text-gray-500 text-sm">Ask me about your portfolio...</p>}
          {chatMessages.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[70%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-[#00BAF2]/20 text-white' : 'bg-white/10 text-gray-300'}`}>{msg.text}</div></div>))}
          {isLoading && <div className="flex justify-start"><div className="bg-white/10 p-3 rounded-lg text-sm text-gray-300 animate-pulse">AI is thinking...</div></div>}
        </div>
        <div className="px-4 py-2 border-t border-white/10 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button key={i} onClick={() => handleSendMessage(q)} disabled={isLoading} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-full border border-white/10 transition-colors disabled:opacity-50">
              {q}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-white/10 flex gap-2">
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask about your portfolio..." disabled={isLoading} className="flex-1 bg-[#0a1628] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#00BAF2] disabled:opacity-50" />
          <button onClick={handleSendMessage} disabled={isLoading} className="px-4 py-2 bg-[#00BAF2] text-white rounded-lg text-sm font-medium hover:bg-[#00a3d9] disabled:opacity-50">Send</button>
        </div>
      </div>
    </>
  )
}

export default FSEInsights
