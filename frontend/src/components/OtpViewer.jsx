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
    <div className="bg-black/30 border border-cyan-900/60 rounded-xl p-5">
      <p className="text-cyan-300 text-xs uppercase tracking-[0.2em] font-bold mb-3">Quick API Check</p>
      <p className="text-slate-300 text-sm leading-relaxed mb-4">
        Use this button to verify the backend key initialization endpoint.
      </p>

      <button
        onClick={handleInit}
        disabled={isLoading}
        className={`w-full px-6 py-3 rounded-lg font-bold transition-all ${
          isLoading
            ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/50'
        }`}
      >
        {isLoading ? 'Initializing...' : 'Initialize Key'}
      </button>

      {result?.key && (
        <p className="mt-4 text-xs text-slate-300 break-all">
          Key Preview: <span className="text-cyan-400 font-bold">{result.key.slice(0, 16)}...</span>
        </p>
      )}
    </div>
  )
}

export default OtpViewer
