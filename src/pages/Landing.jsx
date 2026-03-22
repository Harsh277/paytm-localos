import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,186,242,0.08)_0%,_transparent_50%)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00BAF2]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00BAF2]/3 rounded-full blur-3xl" />

      <header className="absolute top-6 right-6 flex items-center gap-4 text-lg text-white font-medium">
        <span>Built by Harsh Singh | IIM Indore</span>
        <a
          href="https://www.linkedin.com/in/singh-harsh277/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00BAF2] hover:text-white transition-colors cursor-pointer relative z-50"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative z-10">
        <div className="text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00BAF2]/10 border border-[#00BAF2]/20 text-[#00BAF2] text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00BAF2] animate-pulse" />
            Paytm Project AI
          </div>
          
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-white">
            Paytm LocalOS
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-2xl mx-auto leading-relaxed">
          12 million kirana stores.<br />
          Zero financial visibility.<br />
          One platform to change that.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-stretch sm:items-center">
            <button
              onClick={() => navigate('/merchant')}
              className="group relative bg-white/5 border border-white/10 rounded-2xl p-10 hover:-translate-y-2 transition-all duration-300 hover:border-[#00BAF2]/60 hover:shadow-[0_20px_60px_rgba(0,186,242,0.2)] cursor-pointer"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#00BAF2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col items-center gap-5 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#00BAF2]/10 flex items-center justify-center group-hover:bg-[#00BAF2]/20 group-hover:scale-110 transition-all duration-300">
                  <svg className="w-8 h-8 text-[#00BAF2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <span className="text-xl font-semibold block mb-2 text-white">I'm a Merchant</span>
                  <span className="text-base text-gray-400">Manage operations, understand profit, access credit</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/fse')}
              className="group relative bg-white/5 border border-white/10 rounded-2xl p-10 hover:-translate-y-2 transition-all duration-300 hover:border-[#00BAF2]/60 hover:shadow-[0_20px_60px_rgba(0,186,242,0.2)] cursor-pointer"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#00BAF2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col items-center gap-5 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#00BAF2]/10 flex items-center justify-center group-hover:bg-[#00BAF2]/20 group-hover:scale-110 transition-all duration-300">
                  <svg className="w-8 h-8 text-[#00BAF2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <span className="text-xl font-semibold block mb-2 text-white">I'm an FSE Agent</span>
                  <span className="text-base text-gray-400">Manage your merchant portfolio, plan your day</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-base text-[#94a3b8]">
        Case Competition Entry · Business Problem Statement
      </div>
    </div>
  )
}

export default Landing
