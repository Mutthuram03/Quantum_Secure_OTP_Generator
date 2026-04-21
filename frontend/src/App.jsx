import { useState, useEffect } from 'react'
import axios from 'axios'
import QuantumGenerationAnimation from './components/QuantumGenerationAnimation'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [otp, setOtp] = useState('')
  const [userOtp, setUserOtp] = useState('')
  const [binary, setBinary] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const API_BASE_URL = 'http://localhost:5000'
  const ANIMATION_DURATION_MS = 3400

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && otp) {
      setMessage('SESSION EXPIRED: Please re-generate quantum key.')
    }
  }, [timeLeft, otp])

  const generateOtp = async () => {
    if (loading || isAnimating || timeLeft > 0) return

    setLoading(true)
    setIsAnimating(true)
    setMessage('')
    setAttempts(0)
    setOtp('')
    setBinary('')
    setUserOtp('')

    try {
      const otpRequest = axios.post(`${API_BASE_URL}/generate-otp`, { phone })
      const animationDelay = new Promise((resolve) => {
        setTimeout(resolve, ANIMATION_DURATION_MS)
      })

      const [res] = await Promise.all([otpRequest, animationDelay])

      setOtp(res.data.otp)
      setBinary(res.data.binary)
      setTimeLeft(60)
      setMessage(`QUANTUM KEY ESTABLISHED FOR ${phone || '+XX XXXXX XXXXX'}`)
    } catch (err) {
      setMessage('UNABLE TO ESTABLISH QUANTUM LINK. Check backend status.')
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
      if (status === 'success') {
        setMessage('AUTHENTICATION SUCCESSFUL: Quantum state verified.')
        setOtp('')
        setTimeLeft(0)
      } else if (status === 'expired') {
        setMessage('AUTHENTICATION FAILED: Token synchronization lost (Expired).')
      } else if (status === 'blocked') {
        setMessage('SECURITY PROTOCOL: Max attempts exceeded. Cooldown active.')
      } else {
        setMessage(`DECOHERENCE DETECTED: Invalid key signature.`)
        setAttempts(prev => prev + 1)
      }
    } catch (err) {
      setMessage('SYSTEM ERROR: Verification pipeline failed.')
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-4 font-sans selection:bg-cyan-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(15,23,42,0)_0%,_#020617_100%)] pointer-events-none" />
      
      {/* HUD Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center relative z-10"
      >
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-[0.3em] mb-4">
          SECURE QUANTUM GATEWAY
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 mb-2">
          Quantum<span className="text-cyan-400">OTP</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium tracking-wide">
          Next-Generation Entropy via Qiskit Runtime
        </p>
      </motion.div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
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
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Quantum State Vector</span>
                    <div className="flex gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${binary ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} />
                    </div>
                  </div>
                  <div className="h-10 flex items-center justify-center font-mono overflow-hidden">
                    {binary ? (
                      <div className="text-lg tracking-[0.4em] text-emerald-400/80 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                        {binary}
                      </div>
                    ) : (
                      <div className="text-slate-600 text-xs tracking-widest italic animate-pulse">Awaiting measure() command...</div>
                    )}
                  </div>
                </div>

                {/* Input Controls */}
                <div className="space-y-4">
                  <div className="relative group">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+XX XXXXX XXXXX"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-center text-xl font-light focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all placeholder:text-slate-700"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-cyan-500/50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                  </div>

                  <button
                    onClick={generateOtp}
                    disabled={loading || isAnimating || timeLeft > 0}
                    className={`w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all duration-500 relative overflow-hidden ${
                      timeLeft > 0 || isAnimating
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-white text-black hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    <span className="relative z-10">
                      {timeLeft > 0 ? `RE-KEY IN ${timeLeft}S` : 'INITIATE QUANTUM GENERATION'}
                    </span>
                  </button>
                </div>

                {/* Verification Section */}
                {otp && timeLeft > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-6 border-t border-white/5 space-y-4"
                  >
                    <input
                      type="text"
                      maxLength={6}
                      value={userOtp}
                      onChange={(e) => setUserOtp(e.target.value)}
                      placeholder="······"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-center text-3xl font-mono tracking-[0.5em] focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-slate-800"
                    />
                    
                    <button
                      onClick={verifyOtp}
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm tracking-widest uppercase shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
                    >
                      VALIDATE KEY
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Demo/Status HUD */}
          <AnimatePresence>
            {(otp || message) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 space-y-3"
              >
                {otp && timeLeft > 0 && (
                  <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl text-center">
                    <span className="text-[9px] font-bold text-cyan-500/60 tracking-widest uppercase block mb-1">Decrypted Buffer (Demo)</span>
                    <span className="text-xl font-mono text-cyan-400 font-bold tracking-widest">{otp}</span>
                  </div>
                )}
                
                {message && (
                  <div className={`p-3 rounded-xl text-center text-[10px] font-bold tracking-wider uppercase border ${
                    message.includes('SUCCESSFUL') || message.includes('ESTABLISHED') 
                      ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' 
                      : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                  }`}>
                    {message}
                  </div>
                )}
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

export default App