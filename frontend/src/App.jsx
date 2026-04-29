import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = `http://${window.location.hostname}:5000`;

const App = () => {
  const [showHome, setShowHome] = useState(true);
  const [key, setKey] = useState('');
  const [otp, setOtp] = useState('');
  const [userInput, setUserInput] = useState('');
  const [logs, setLogs] = useState([]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [explainMode, setExplainMode] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [timer, setTimer] = useState(30);
  const [securityLevel, setSecurityLevel] = useState('High');
  const [attackDetected, setAttackDetected] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    let interval;
    if (otp) {
      interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 30));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otp]);

  useEffect(() => {
    if (timer === 30 && key && !isAttacking) {
      // only auto-generate if we are on step 2
      if (currentStep === 2) {
        generateOtp();
      }
    }
  }, [timer, key, isAttacking, currentStep]);

  const addLogs = (newLogs) => {
    setLogs((prev) => [...prev, ...newLogs].slice(-15));
  };

  const generateKey = async () => {
    try {
      const res = await axios.get(`${API_BASE}/generate-key`);
      setKey(res.data.key);
      setSecurityLevel(res.data.security_level);
      setAttackDetected(false);
      addLogs(res.data.logs);
      setOtp('');
      setVerificationResult(null);
      setVerificationMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const generateOtp = async () => {
    try {
      setIsGenerating(true);
      setOtp(''); // Clear old OTP to show loading
      const res = await axios.get(`${API_BASE}/generate-otp`);
      setOtp(res.data.otp);
      addLogs(res.data.logs);
      setTimer(30);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateAttack = async () => {
    try {
      setIsAttacking(true);
      const res = await axios.post(`${API_BASE}/simulate-attack`);
      setSecurityLevel(res.data.security_level);
      setAttackDetected(true);
      addLogs(res.data.logs);
      setTimeout(() => setIsAttacking(false), 2000);
    } catch (err) {
      console.error(err);
      setIsAttacking(false);
      addLogs([err?.response?.data?.error || "[ERROR] Attack simulation failed"]);
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post(`${API_BASE}/verify-otp`, { otp: userInput });
      setVerificationResult(res.data.success ? 'success' : 'failure');
      setVerificationMessage(res.data.message || res.data.error || 'Verification completed');
      addLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
      setVerificationResult('failure');
      setVerificationMessage(err?.response?.data?.error || 'Verification request failed');
      if (err.response && err.response.data && err.response.data.logs) {
        addLogs(err.response.data.logs);
      } else {
        addLogs(["[ERROR] Communication failure with backend"]);
      }
    }
  };

  if (showHome) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-mono">
        <div className="max-w-6xl mx-auto">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 border-b border-slate-700 pb-6"
          >
            <p className="text-cyan-400 text-xs md:text-sm tracking-[0.25em] uppercase font-bold mb-3">
              Quantum OTP Security Demo
            </p>
            <h1 className="text-4xl md:text-6xl font-black leading-tight bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              One-Time Passwords
              <br />
              Powered by Quantum Principles
            </h1>
            <p className="text-slate-300 mt-6 max-w-3xl leading-relaxed text-sm md:text-base">
              This project demonstrates a secure OTP protocol inspired by quantum behavior. It visualizes key generation, OTP hashing, and verification, while showing how interception attempts impact trust and authorization.
            </p>
          </motion.header>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8"
          >
            {[
              {
                title: 'Quantum Key Init',
                subtitle: 'High-entropy source',
                description: 'Bootstraps a volatile key stream that simulates quantum randomness and immediate tamper impact.'
              },
              {
                title: 'OTP Hashing',
                subtitle: 'Time-bound secret',
                description: 'Generates a 6-digit OTP from key + time windows and stores only secure hash representations.'
              },
              {
                title: 'DB Verification',
                subtitle: 'Strict policy checks',
                description: 'Confirms expiry, match, attempts, and replay protection before final access authorization.'
              }
            ].map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.1 }}
                className="bg-slate-800/70 border border-slate-600 rounded-2xl p-5 backdrop-blur shadow-xl"
              >
                <p className="text-xs tracking-[0.2em] uppercase text-cyan-400 font-bold">{item.subtitle}</p>
                <h2 className="mt-2 text-xl font-bold text-white">{item.title}</h2>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">{item.description}</p>
              </motion.article>
            ))}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">What you can do in the simulation</h3>
                <ul className="space-y-2 text-slate-300 text-sm md:text-base">
                  <li>1. Initialize and regenerate a quantum-inspired key.</li>
                  <li>2. Produce and observe rolling OTP windows.</li>
                  <li>3. Simulate an interception attack and inspect security response.</li>
                  <li>4. Verify an OTP against backend policy enforcement.</li>
                </ul>
              </div>

              <div className="bg-black/30 border border-cyan-900/60 rounded-xl p-5">
                <p className="text-cyan-300 text-xs uppercase tracking-[0.2em] font-bold mb-3">Launch</p>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">
                  Start the live protocol walkthrough and move through the 3-step secure flow.
                </p>
                <button
                  onClick={() => setShowHome(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-bold transition-all shadow-lg shadow-cyan-900/50"
                >
                  Enter Quantum OTP Console
                </button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-mono">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-700 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Quantum Secure OTP Protocol
          </h1>
          <p className="text-slate-400 text-sm mt-1">Status: 
            <span className={`ml-2 font-bold px-2 py-1 rounded bg-slate-800 ${securityLevel === 'High' ? 'text-green-400' : 'text-red-400'}`}>
              Security Level {securityLevel}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHome(true)}
            className="px-4 py-2 rounded-lg font-semibold text-sm border border-slate-600 bg-slate-800 hover:bg-slate-700 transition"
          >
            Home
          </button>
          <label className="flex items-center cursor-pointer bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-700 transition">
            <span className="mr-3 text-sm text-slate-300 font-semibold">Teacher Explainer Mode</span>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${explainMode ? 'bg-cyan-500' : 'bg-slate-600'}`} onClick={() => setExplainMode(!explainMode)}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${explainMode ? 'translate-x-6' : ''}`} />
            </div>
          </label>
        </div>
      </header>

      {/* Stepper Navigation */}
      <div className="flex justify-between items-center mb-8 bg-slate-800/50 p-4 rounded-xl border border-slate-700 max-w-4xl mx-auto backdrop-blur-sm">
        <div className={`flex flex-col items-center flex-1 transition-colors ${currentStep >= 1 ? 'text-cyan-400' : 'text-slate-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 border-2 ${currentStep >= 1 ? 'border-cyan-400 bg-cyan-900/30' : 'border-slate-500'}`}>1</div>
          <span className="text-xs md:text-sm font-semibold tracking-wide uppercase text-center">Initialize Key</span>
        </div>
        <div className={`w-8 md:w-24 h-px ${currentStep >= 2 ? 'bg-cyan-400' : 'bg-slate-700'}`}></div>
        
        <div className={`flex flex-col items-center flex-1 transition-colors ${currentStep >= 2 ? 'text-cyan-400' : 'text-slate-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 border-2 ${currentStep >= 2 ? 'border-cyan-400 bg-cyan-900/30' : 'border-slate-500'}`}>2</div>
          <span className="text-xs md:text-sm font-semibold tracking-wide uppercase text-center">Generate OTP</span>
        </div>
        <div className={`w-8 md:w-24 h-px ${currentStep >= 3 ? 'bg-cyan-400' : 'bg-slate-700'}`}></div>

        <div className={`flex flex-col items-center flex-1 transition-colors ${currentStep >= 3 ? 'text-cyan-400' : 'text-slate-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 border-2 ${currentStep >= 3 ? 'border-cyan-400 bg-cyan-900/30' : 'border-slate-500'}`}>3</div>
          <span className="text-xs md:text-sm font-semibold tracking-wide uppercase text-center">Verify Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            
            {/* STEP 1 */}
            {currentStep === 1 && (
              <motion.section 
                key="step1"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                className="bg-slate-800/80 backdrop-blur rounded-2xl p-8 border border-slate-600 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-3">
                    <span className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]" />
                    Phase 1: Quantum Entropy Source
                  </h2>
                </div>
                
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Before we can generate a secure OTP, we must initialize a high-entropy secret key. In this simulation, we model a quantum-random bit generator to produce a highly volatile 64-bit string.
                </p>

                <div className="h-32 bg-slate-950 rounded-xl border border-slate-700 flex items-center justify-center relative shadow-inner overflow-hidden mb-8">
                  {key ? (
                    <div className="flex flex-wrap gap-2 p-4 justify-center items-center h-full">
                      {key.split('').slice(0, 32).map((bit, i) => (
                        <motion.span 
                          key={i}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.01 }}
                          className={`text-lg font-bold ${bit === '1' ? 'text-cyan-400' : 'text-blue-500'}`}
                        >
                          {bit}
                        </motion.span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic flex items-center gap-2">
                      <span className="animate-spin text-xl">⚙</span> Awaiting Initialization...
                    </p>
                  )}
                  {isAttacking && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.5, repeat: 3 }}
                      className="absolute inset-0 bg-red-500/30 backdrop-blur-sm flex items-center justify-center font-black text-2xl tracking-widest text-red-500 border-4 border-red-500/50"
                    >
                      ! INTERCEPTION DETECTED !
                    </motion.div>
                  )}
                </div>

                {explainMode && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8 p-4 bg-cyan-900/20 border-l-4 border-cyan-500 rounded-r text-sm text-cyan-100">
                    <strong className="text-cyan-400 block mb-1">Teacher Note: Quantum State Collapse</strong>
                    By relying on simulated quantum properties, any attempt by a malicious actor to read the key in transit collapses its state. Notice how simulating an attack changes the key and lowers the security level permanently.
                  </motion.div>
                )}

                {attackDetected && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-sm text-red-100">
                    <strong className="text-red-300 block mb-1">Attack Mode Active</strong>
                    This demo intentionally invalidates OTP verification after interception is detected. To recover, regenerate the key and generate a fresh OTP.
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-slate-700 pt-6">
                  <div className="flex gap-3">
                    <button onClick={generateKey} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 rounded-lg font-bold transition-all transform active:scale-95 shadow-lg shadow-cyan-900/50">
                      {key ? "Regenerate Key" : "Initialize Key"}
                    </button>
                    {key && (
                      <button onClick={simulateAttack} className="px-6 py-3 bg-red-900/50 text-red-400 hover:bg-red-800/50 hover:text-red-300 border border-red-800 rounded-lg font-bold transition-all">
                        Simulate Attack
                      </button>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setCurrentStep(2)} 
                    disabled={!key} 
                    className={`px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${key ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                  >
                    Proceed to Step 2 <span className="text-xl">→</span>
                  </button>
                </div>
              </motion.section>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <motion.section 
                key="step2"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                className="bg-slate-800/80 backdrop-blur rounded-2xl p-8 border border-slate-600 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Phase 2: Secure Hash OTP Generation</h2>
                  <div className="flex items-center gap-2 text-slate-400 bg-slate-900 px-4 py-2 rounded-full border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Window closes in: <span className="font-bold text-white w-6 text-center">{timer}s</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 flex flex-col justify-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">1. Secret Key (truncated)</span>
                      <span className="text-cyan-400 font-mono text-sm break-all">{key.substring(0, 16)}...</span>
                    </div>
                    <div className="flex items-center justify-center text-3xl text-slate-600 font-light">+</div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 flex flex-col justify-center text-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">2. Current Epoch Time</span>
                      <span className="text-blue-400 font-mono text-xl">{Math.floor(Date.now()/30000)}</span>
                    </div>
                  </div>

                  <div className="flex justify-center my-6">
                    <motion.div animate={otp ? { rotateY: [0, 180, 360] } : {}} className="bg-slate-700 px-6 py-2 rounded-full text-sm font-bold text-slate-300 border border-slate-600 shadow-lg">
                      ↓ SHA-256 Hash Function ↓
                    </motion.div>
                  </div>

                  <div className="bg-gradient-to-b from-slate-900 to-black p-8 rounded-2xl text-center border border-slate-700 relative overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.05)]">
                    <div className="text-sm text-slate-500 mb-2 font-bold tracking-[0.2em]">GENERATED 6-DIGIT OTP</div>
                    <div className="text-5xl md:text-7xl font-black tracking-[0.3em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                      {isGenerating ? (
                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}>
                          ......
                        </motion.span>
                      ) : otp || '------'}
                    </div>
                    
                    {otp && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-green-400 text-sm font-bold flex items-center justify-center gap-2">
                        <span className="text-lg">✓</span> Securely hashed and stored in SQLite Database
                      </motion.div>
                    )}

                    {isGenerating && (
                      <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                    )}
                  </div>

                  {explainMode && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded-r text-sm text-blue-100">
                      <strong className="text-blue-400 block mb-1">Teacher Note: Cryptographic Hashing</strong>
                      The raw OTP is never stored. We calculate a SHA-256 hash of the (Key + Timestamp) and store ONLY that hash in our database. This protects against database breaches.
                    </motion.div>
                  )}

                  <div className="flex justify-between items-center border-t border-slate-700 pt-6">
                    <button onClick={() => setCurrentStep(1)} className="px-6 py-3 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-2">
                      <span className="text-xl">←</span> Go Back
                    </button>
                    
                    {!otp && (
                      <button onClick={generateOtp} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold transition-all shadow-lg">
                        Generate OTP
                      </button>
                    )}

                    <button 
                      onClick={() => setCurrentStep(3)} 
                      disabled={!otp} 
                      className={`px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${otp ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                      Proceed to Verification <span className="text-xl">→</span>
                    </button>
                  </div>
                </div>
              </motion.section>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <motion.section 
                key="step3"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                className="bg-slate-800/80 backdrop-blur rounded-2xl p-8 border border-slate-600 shadow-xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-semibold">Phase 3: Database Verification</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-stretch">
                  <div className="flex-1 space-y-6">
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                      <label className="block text-sm text-slate-400 uppercase font-bold tracking-wider mb-4">Enter 6-Digit OTP</label>
                      <input 
                        type="text" 
                        maxLength="6"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-black border-2 border-slate-700 rounded-xl p-6 text-center text-4xl tracking-[0.4em] font-black focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-800 text-white"
                        placeholder="000000"
                      />
                      <button 
                        onClick={verifyOtp}
                        disabled={userInput.length !== 6}
                        className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${userInput.length === 6 ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-900/50' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                      >
                        Execute DB Verification
                      </button>
                    </div>
                  </div>

                  <div className="w-full md:w-5/12 flex flex-col items-center justify-center p-8 bg-slate-950 rounded-xl border border-slate-700 relative overflow-hidden">
                    {verificationResult === 'success' && (
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center z-10">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                          <span className="text-5xl text-green-500">✓</span>
                        </div>
                        <div className="text-green-400 font-black text-2xl uppercase tracking-widest">Authorized</div>
                        <p className="text-green-500/70 text-sm mt-2">Hashes matched perfectly</p>
                      </motion.div>
                    )}
                    
                    {verificationResult === 'failure' && (
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center z-10">
                        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
                          <span className="text-5xl text-red-500">✕</span>
                        </div>
                        <div className="text-red-400 font-black text-2xl uppercase tracking-widest">Access Denied</div>
                        <p className="text-red-500/70 text-sm mt-2">Hash mismatch or expired</p>
                      </motion.div>
                    )}
                    
                    {!verificationResult && (
                      <div className="text-slate-600 text-center flex flex-col items-center gap-4">
                        <span className="text-4xl opacity-50">🛡️</span>
                        <span className="italic">Awaiting input...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {explainMode && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 p-4 bg-purple-900/20 border-l-4 border-purple-500 rounded-r text-sm text-purple-100">
                    <strong className="text-purple-400 block mb-1">Teacher Note: Zero-Knowledge DB Check</strong>
                    The backend queries the SQLite database for the latest record. It applies the SHA-256 hash to your input and compares it to the stored database hash. It also strictly checks the expiration timestamp and max attempt limits.
                  </motion.div>
                )}

                {verificationResult && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-4 rounded-xl border text-sm ${verificationResult === 'success' ? 'bg-green-950/30 border-green-500/40 text-green-100' : 'bg-red-950/30 border-red-500/40 text-red-100'}`}>
                    <strong className="block mb-1">Verification Response</strong>
                    <p>{verificationMessage}</p>
                    {attackDetected && verificationResult === 'failure' && (
                      <p className="mt-2 text-red-200">Reason: Attack simulation sets the session as compromised, so backend rejects verification by design.</p>
                    )}
                  </motion.div>
                )}

                <div className="mt-8 pt-8 border-t border-slate-700">
                  <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-3">
                    <span className="text-cyan-400 text-2xl">🛡️</span> Security Protocol Enforcement
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: "OTP Existence", icon: "🗄️", desc: "Verifies the request exists in the SQLite database and is firmly linked to the requesting user ID." },
                      { title: "OTP Matching", icon: "🔐", desc: "Re-hashes the incoming input using SHA-256 and strictly matches it against the stored database hash." },
                      { title: "Expiry Time", icon: "⏳", desc: "Enforces a strict 60-second time-to-live. OTP instantly becomes invalid if the local timestamp exceeds the DB record." },
                      { title: "Reuse Prevention", icon: "🚫", desc: "Safeguards against replay attacks by flagging the DB record's status as 'used' immediately upon success." },
                      { title: "Attempt Limit", icon: "🛑", desc: "Permanently locks the OTP record after 3 incorrect verification guesses to prevent brute-force attacks." },
                      { title: "Input Validation", icon: "🔢", desc: "Both the Client and Server aggressively sanitize and strictly enforce a 6-digit numeric constraint." },
                      { title: "Session Binding", icon: "🔗", desc: "Ensures the verification payload originates from the exact session identifier that requested the initial OTP." }
                    ].map((cond, idx) => (
                      <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors group">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl group-hover:scale-110 transition-transform">{cond.icon}</span>
                          <h4 className="font-bold text-sm text-cyan-100">{cond.title}</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{cond.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-700 pt-6 mt-8">
                  <button onClick={() => setCurrentStep(2)} className="px-6 py-3 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-2">
                    <span className="text-xl">←</span> Back to OTP
                  </button>
                  
                  {verificationResult && (
                    <button onClick={() => { setCurrentStep(1); setKey(''); setOtp(''); setUserInput(''); setVerificationResult(null); setVerificationMessage(''); setAttackDetected(false); setSecurityLevel('High'); }} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-all text-white border border-slate-500 shadow-lg">
                       Restart Entire Process ↺
                     </button>
                  )}
                </div>
              </motion.section>
            )}

          </AnimatePresence>
        </div>

        {/* Sidebar Terminal Log */}
        <div className="lg:col-span-1 flex flex-col h-[600px] lg:h-auto">
          <section className="bg-black rounded-2xl p-1 border border-slate-700 h-full flex flex-col shadow-2xl relative overflow-hidden flex-1">
            <div className="bg-slate-900 py-3 px-4 border-b border-slate-800 flex items-center gap-2 rounded-t-xl">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2 flex-1 text-center">Server Logs</h2>
            </div>
            
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 custom-scrollbar">
              <AnimatePresence>
                {logs.map((log, i) => {
                  let colorClass = 'text-slate-300';
                  if (log.includes('SUCCESS') || log.includes('Secure') || log.includes('Granted')) colorClass = 'text-green-400';
                  if (log.includes('ALERT') || log.includes('Denied') || log.includes('MISMATCH')) colorClass = 'text-red-400';
                  if (log.includes('Fetching') || log.includes('Applying')) colorClass = 'text-blue-300';
                  
                  return (
                    <motion.div
                      key={`${i}-${log}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`${colorClass} flex gap-2 leading-relaxed`}
                    >
                      <span className="text-slate-600 whitespace-nowrap">[{new Date().toLocaleTimeString()}]</span>
                      <span className="break-words">~ $ {log}</span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {logs.length === 0 && (
                <div className="text-slate-600 italic mt-4 text-center">Server initialized. Standing by...</div>
              )}
              {/* Fake cursor */}
              <div className="mt-2 text-cyan-400 animate-pulse">_</div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default App;
