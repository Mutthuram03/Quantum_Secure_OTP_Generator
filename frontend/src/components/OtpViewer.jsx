import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

function OtpViewer() {
  const [currentOtp, setCurrentOtp] = useState(null)
  const API_BASE_URL = 'http://localhost:5000'

  useEffect(() => {
    const fetchOtp = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/get-latest-otp`)
        if (res.data.otp) {
          setCurrentOtp(res.data.otp)
        }
      } catch (err) {
        console.error("Failed to fetch OTP", err)
      }
    }

    // Poll every 2 seconds
    const interval = setInterval(fetchOtp, 2000)
    fetchOtp()

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-white/5 text-center">
        <h2 className="text-xl font-bold text-cyan-400 mb-6 tracking-widest uppercase">Quantum Key Receiver</h2>
        <div className="bg-black/40 rounded-2xl p-8 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
          {currentOtp ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={currentOtp}
            >
              <div className="text-[10px] text-slate-500 mb-2 tracking-[0.3em] font-bold">LATEST GENERATED KEY</div>
              <div className="text-6xl font-mono text-white tracking-widest font-black">
                {currentOtp}
              </div>
            </motion.div>
          ) : (
            <div className="text-slate-600 italic animate-pulse">Waiting for quantum transmission...</div>
          )}
        </div>
        <p className="mt-6 text-slate-500 text-xs">
          This page represents a remote device receiving the quantum-generated OTP.
        </p>
      </div>
    </div>
  )
}

export default OtpViewer
