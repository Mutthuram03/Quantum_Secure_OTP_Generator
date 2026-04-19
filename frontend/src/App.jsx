import { useState, useEffect } from 'react'
import axios from 'axios'
import QuantumGenerationAnimation from './components/QuantumGenerationAnimation'

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

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && otp) {
      setMessage('OTP Expired! Please generate a new one.')
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
      setMessage(res.data.message || `OTP ready for ${phone || 'default recipient'}!`)
    } catch (err) {
      setMessage('Error generating OTP. Is backend running?')
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
        setMessage('✅ Code Verified! Access Granted.')
        setOtp('') // clear otp after success
        setTimeLeft(0)
      } else if (status === 'expired') {
        setMessage('❌ OTP Expired!')
      } else if (status === 'blocked') {
        setMessage('🚫 Max attempts exceeded. Please generate new OTP.')
      } else {
        setMessage(`⚠️ Invalid OTP. ${res.data.message}`)
        setAttempts(prev => prev + 1)
      }
    } catch (err) {
      setMessage('Error verifying OTP')
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        <h1 className="text-3xl font-bold text-center text-cyan-400 mb-2">Quantum OTP</h1>
        <p className="text-xs text-center text-gray-400 mb-8">
          Powered by Qiskit & Quantum Superposition
        </p>

        {isAnimating && <QuantumGenerationAnimation durationMs={ANIMATION_DURATION_MS} />}

        {/* Binary Visualization */}
        <div className="bg-black/50 p-4 rounded-lg mb-6 text-center font-mono h-24 flex flex-col items-center justify-center border border-cyan-900/50">
          <p className="text-gray-500 text-xs mb-1">QUANTUM STATE MEASUREMENT</p>
          {binary ? (
            <div className="text-2xl tracking-widest text-green-400 animate-pulse">
              {binary.split('').map((bit, i) => (
                <span key={i} className="mx-1">{bit}</span>
              ))}
            </div>
          ) : (
            <div className="text-gray-600">Waiting for qubits...</div>
          )}
        </div>

        {/* Generate Section */}
        <div className="mb-6 space-y-4">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter Mobile Number"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-4 text-center text-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <button
            onClick={generateOtp}
            disabled={loading || isAnimating || timeLeft > 0}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
              timeLeft > 0 || isAnimating
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-500/20'
            }`}
          >
            {isAnimating
              ? 'Simulating Quantum Circuit...'
              : loading
                ? 'Collapsing Wavefunction...'
                : timeLeft > 0
                  ? `Valid for ${timeLeft}s`
                  : 'Generate New Quantum OTP'}
          </button>
        </div>

        {/* Verify Section */}
        {otp && timeLeft > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={userOtp}
                onChange={(e) => setUserOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-4 text-center text-xl tracking-widest focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors shadow-lg shadow-purple-500/20"
            >
              Verify Code
            </button>
            
            <div className="text-center text-sm text-gray-400">
              Attempts: <span className={attempts > 0 ? 'text-red-400' : 'text-white'}>{attempts}/3</span>
            </div>
          </div>
        )}

        {/* Demo Display (Requested for demo) */}
        {otp && timeLeft > 0 && (
          <div className="mt-6 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded text-center">
            <p className="text-xs text-yellow-500 uppercase tracking-wide">Demo Mode: Your OTP is</p>
            <p className="text-2xl font-mono text-yellow-400 font-bold mt-1 tracking-wider">{otp}</p>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className={`mt-6 p-3 rounded text-center text-sm font-medium ${
            message.includes('Success') || message.includes('Verified') ? 'bg-green-900/30 text-green-400' : 
            message.includes('Error') || message.includes('Invalid') || message.includes('Expired') || message.includes('blocked') ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'
          }`}>
            {message}
          </div>
        )}

        {/* Explanation Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-xs text-gray-500 leading-relaxed text-justify">
          <p>
            <strong className="text-cyan-500">How it works:</strong> This OTP is generated using quantum superposition via Qiskit. 
            A circuit of 6 qubits is put into a superposition state using Hadamard gates. 
            Measurement collapses these qubits into random classical bits (0s and 1s), ensuring 
            true unpredictability compared to classical pseudo-random generators.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App