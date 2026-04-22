import { useState, useEffect } from "react"
import axios from "axios"
import QuantumGenerationAnimation from "./components/QuantumGenerationAnimation"
import { motion, AnimatePresence } from "framer-motion"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import OtpViewer from "./components/OtpViewer"

function MainApp() {
  const [userOtp, setUserOtp] = useState("")
  const [binary, setBinary] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isKeyGenerated, setIsKeyGenerated] = useState(false)

  const API_BASE_URL = "http://localhost:5000"
  const ANIMATION_DURATION_MS = 3400

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const generateOtp = async () => {
    if (loading || isAnimating || timeLeft > 0) return

    setLoading(true)
    setIsAnimating(true)
    setMessage("")
    setBinary("")
    setUserOtp("")
    setIsKeyGenerated(false)

    try {
      const otpRequest = axios.post(`${API_BASE_URL}/generate-otp`, { phone })
      const animationDelay = new Promise((resolve) => {
        setTimeout(resolve, ANIMATION_DURATION_MS)
      })

      const [res] = await Promise.all([otpRequest, animationDelay])

      setBinary(res.data.binary)
      setTimeLeft(60)
      setIsKeyGenerated(true)
      setMessage("QUANTUM KEY ESTABLISHED")
    } catch (err) {
      setMessage("UNABLE TO ESTABLISH QUANTUM LINK.")
      console.error(err)
    } finally {
      setLoading(false)
      setIsAnimating(false)
    }
  }

  const verifyOtp = async () => {
    if (!userOtp) return
    setLoading(true)
    try {
      const res = await axios.post(`${API_BASE_URL}/verify-otp`, { otp: userOtp })
      const status = res.data.status
      if (status === "success") {
        setMessage("AUTHENTICATION SUCCESSFUL: Quantum state verified.")
        setIsKeyGenerated(false)
        setTimeLeft(0)
      } else {
        setMessage(res.data.message || "DECOHERENCE DETECTED: Invalid key.")
      }
    } catch (err) {
      setMessage("SYSTEM ERROR: Verification pipeline failed.")
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-4 font-sans selection:bg-cyan-500/30">
      <div className="absolute top-4 right-4 z-20">
        <Link to="/viewer" target="_blank" className="text-[10px] text-cyan-500/50 hover:text-cyan-400 border border-cyan-500/20 px-4 py-2 rounded-full transition-all">
          OPEN KEY RECEIVER ?
        </Link>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(15,23,42,0)_0%,_#020617_100%)] pointer-events-none" />
      
      {/* HUD Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center relative z-10"
      >
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-[0.3em] mb-4 uppercase">
          Portal Gateway
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 mb-2">
          Quantum<span className="text-cyan-400">OTP</span>
        </h1>
      </motion.div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/5 relative overflow-hidden group">
          <AnimatePresence mode="wait">
            {isAnimating ? (
              <QuantumGenerationAnimation key="animation" durationMs={ANIMATION_DURATION_MS} />
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Binary State Display */}
                <div className="bg-black/40 rounded-2xl p-5 border border-white/5 relative group/bits">
                  <div className="h-10 flex items-center justify-center font-mono overflow-hidden">
                    {binary ? (
                      <div className="text-lg tracking-[0.4em] text-emerald-400/80">
                        {binary}
                      </div>
                    ) : (
                      <div className="text-slate-600 text-[10px] tracking-widest italic uppercase">AWAITING ENTROPY...</div>
                    )}
                  </div>
                </div>

                {/* Input Controls */}
                <div className="space-y-4">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Destination"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-center text-xl font-light focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700"
                  />

                  <button
                    onClick={generateOtp}
                    disabled={loading || isAnimating || timeLeft > 0}
                    className={`w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all duration-500 relative overflow-hidden ${
                      timeLeft > 0 || isAnimating
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-white text-black hover:scale-[1.02] active:scale-95"
                    }`}
                  >
                    {timeLeft > 0 ? `KEY READY [${timeLeft}S]` : "GENERATE QUANTUM KEY"}
                  </button>
                </div>

                {/* Verification Section */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <input
                    type="text"
                    maxLength={6}
                    value={userOtp}
                    onChange={(e) => setUserOtp(e.target.value)}
                    placeholder="ENTER OTP"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-center text-3xl font-mono tracking-[0.5em] focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-slate-700"
                  />
                  
                  <button
                    onClick={verifyOtp}
                    disabled={loading || !isKeyGenerated}
                    className={`w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all ${
                      isKeyGenerated 
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/20 active:scale-95"
                      : "bg-slate-800 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    VALIDATE KEY
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status HUD */}
          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                <div className={`p-3 rounded-xl text-center text-[10px] font-bold tracking-wider uppercase border ${
                  message.includes("SUCCESSFUL") || message.includes("ESTABLISHED") 
                    ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
                    : "bg-rose-500/5 border-rose-500/10 text-rose-400"
                }`}>
                  {message}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Hardware Info */}
        <div className="mt-8 flex justify-between items-center px-4">
          <div className="flex gap-4">
            <div className="text-[10px] font-bold text-slate-600 tracking-tighter">
              CORES: <span className="text-slate-400">127-Q</span>
            </div>
            <div className="text-[10px] font-bold text-slate-600 tracking-tighter">
              TEMP: <span className="text-slate-400">0.015 K</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400/40 tracking-widest italic">
            NON-CLASSICAL ENTROPY
          </div>
        </div>
      </div>
    </div>
  )
}

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/viewer" element={<OtpViewer />} />
      </Routes>
    </Router>
  )
}

export default App
