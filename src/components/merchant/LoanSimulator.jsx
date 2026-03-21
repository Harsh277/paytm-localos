import { useState, useMemo } from 'react'

export default function LoanSimulator() {
  const [loanAmount, setLoanAmount] = useState(75000)
  const [loanTenure, setLoanTenure] = useState(12)

  const calculations = useMemo(() => {
    const paytmMonthlyRate = 14 / 12 / 100
    const moneylenderMonthlyRate = 24 / 12 / 100
    const n = loanTenure

    const calculateEMI = (principal, monthlyRate) => {
      if (monthlyRate === 0) return principal / n
      const factor = Math.pow(1 + monthlyRate, n)
      return (principal * monthlyRate * factor) / (factor - 1)
    }

    const paytmEMI = calculateEMI(loanAmount, paytmMonthlyRate)
    const moneylenderEMI = calculateEMI(loanAmount, moneylenderMonthlyRate)

    const paytmTotal = paytmEMI * n
    const moneylenderTotal = moneylenderEMI * n
    const paytmInterest = paytmTotal - loanAmount
    const moneylenderInterest = moneylenderTotal - loanAmount
    const savings = moneylenderInterest - paytmInterest

    return {
      emi: Math.round(paytmEMI),
      dailyDeduction: Math.round(paytmEMI / 30),
      totalInterest: Math.round(paytmInterest),
      totalRepayment: Math.round(paytmTotal),
      moneylenderTotal: Math.round(moneylenderTotal),
      savings: Math.round(savings)
    }
  }, [loanAmount, loanTenure])

  const maxMoneylender = Math.max(calculations.moneylenderTotal, calculations.totalRepayment)

  return (
    <div className="bg-[#0d1f35] rounded-xl p-4 border border-white/10">
      <h3 className="font-medium mb-4">Loan Simulator</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 block mb-2">Loan Amount: ₹{loanAmount.toLocaleString()}</label>
          <input
            type="range"
            min="10000"
            max="100000"
            step="5000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00BAF2]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>₹10,000</span>
            <span>₹1,00,000</span>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-2">Tenure</label>
          <div className="flex gap-2">
            {[6, 12, 18, 24].map((months) => (
              <button
                key={months}
                onClick={() => setLoanTenure(months)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  loanTenure === months
                    ? 'bg-[#00BAF2]/20 text-[#00BAF2] border border-[#00BAF2]/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                }`}
              >
                {months} mo
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-400">Monthly EMI</p>
          <p className="text-xl font-semibold text-[#00BAF2]">₹{calculations.emi.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-400">Daily UPI Deduction</p>
          <p className="text-xl font-semibold">₹{calculations.dailyDeduction}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-400">Total Interest</p>
          <p className="text-xl font-semibold">₹{calculations.totalInterest.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-400">Total Repayment</p>
          <p className="text-xl font-semibold">₹{calculations.totalRepayment.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <p className="text-sm text-gray-400 mb-3">Interest Comparison</p>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Paytm (14%)</span>
              <span className="font-medium">₹{calculations.totalRepayment.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-[#00BAF2] rounded-full" style={{ width: `${(calculations.totalRepayment / maxMoneylender) * 100}%` }}></div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Moneylender (24%)</span>
              <span className="font-medium">₹{calculations.moneylenderTotal.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-gray-500 rounded-full" style={{ width: `${(calculations.moneylenderTotal / maxMoneylender) * 100}%` }}></div>
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-white/10">
          <span className="text-green-400 font-medium">You save ₹{calculations.savings.toLocaleString()}!</span>
        </div>
      </div>
    </div>
  )
}
