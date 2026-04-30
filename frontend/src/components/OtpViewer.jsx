import { useState } from 'react'

const GENERATE_KEY_URL = 'https://quantum-secure-otp-generator.onrender.com/generate-key'

function OtpViewer() {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleInit = async () => {
    console.log('BUTTON CLICKED')
    setIsLoading(true)

    try {
      const response = await fetch(GENERATE_KEY_URL)

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log('API RESPONSE:', data)
      setResult(data)
    } catch (error) {
      console.error('Failed to initialize key:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-slate-900/50 border-2 border-cyan-500/30 rounded-3xl p-8 md:p-12 shadow-[0_0_40px_rgba(8,145,178,0.15)] backdrop-blur-xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
          <span className="text-cyan-400 text-2xl">⚡</span>
        </div>
        <p className="text-cyan-400 text-sm md:text-base uppercase tracking-[0.25em] font-black">Quick API Check</p>
      </div>
      
      <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8">
        Use this interactive module to verify the backend quantum key initialization endpoint.
      </p>

      <button
        onClick={handleInit}
        disabled={isLoading}
        className={`w-full px-8 py-5 rounded-2xl text-xl font-black tracking-wide transition-all ${
          isLoading
            ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-[length:200%_auto] hover:bg-right text-white shadow-[0_0_30px_rgba(8,145,178,0.5)] hover:shadow-[0_0_50px_rgba(8,145,178,0.7)] hover:-translate-y-1 border border-cyan-400/50'
        }`}
      >
        {isLoading ? 'INITIALIZING...' : 'INITIALIZE KEY'}
      </button>

      {result?.key && (
        <div className="mt-8 p-6 bg-black/40 rounded-xl border border-cyan-900/80 shadow-inner">
          <p className="text-sm md:text-base text-slate-400">
            <span className="text-cyan-500/70 uppercase tracking-widest text-xs font-bold block mb-3">Generated Key Preview</span>
            <span className="text-cyan-300 font-mono font-bold text-xl md:text-2xl break-all">{result.key.slice(0, 32)}...</span>
          </p>
        </div>
      )}
    </div>
  )
}

export default OtpViewer
