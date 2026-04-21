import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './QuantumGenerationAnimation.css'

const STAGE_SEQUENCE = [
  { id: 'init', label: 'INITIALIZING QUBITS', start: 0, end: 0.3 },
  { id: 'superposition', label: 'ENTERING SUPERPOSITION', start: 0.3, end: 0.7 },
  { id: 'measurement', label: 'MEASUREMENT & COLLAPSE', start: 0.7, end: 1 },
]

function buildBinaryStream(length = 80) {
  return Array.from({ length }, () => (Math.random() > 0.5 ? '1' : '0')).join('')
}

function QuantumGenerationAnimation({ durationMs = 3400 }) {
  const [progress, setProgress] = useState(0)
  const [stream, setStream] = useState(buildBinaryStream())

  useEffect(() => {
    const start = performance.now()
    const progressTimer = setInterval(() => {
      const elapsed = performance.now() - start
      const ratio = Math.min(1, elapsed / durationMs)
      setProgress(ratio)
      if (ratio >= 1) clearInterval(progressTimer)
    }, 16)

    const streamTimer = setInterval(() => {
      setStream(buildBinaryStream())
    }, 100)

    return () => {
      clearInterval(progressTimer)
      clearInterval(streamTimer)
    }
  }, [durationMs])

  const activeStage = useMemo(() => {
    return (
      STAGE_SEQUENCE.find((stage) => progress >= stage.start && progress < stage.end) ||
      STAGE_SEQUENCE[STAGE_SEQUENCE.length - 1]
    )
  }, [progress])

  const shouldShowDigits = progress > 0.75

  return (
    <motion.div
      className="quantum-panel"
      data-stage={activeStage.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="quantum-bg-grid" />
      <div className="quantum-bg-orb quantum-bg-orb-a" />
      <div className="quantum-bg-orb quantum-bg-orb-b" />
      <div className="quantum-scanline" />

      <div className="quantum-headline-wrap">
        <div className="quantum-kicker">Quantum Processing Unit v2.4</div>
        <AnimatePresence mode="wait">
          <motion.h3
            key={activeStage.id}
            className="quantum-stage-title"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            {activeStage.label}
          </motion.h3>
        </AnimatePresence>
      </div>

      <div className="quantum-visual-core">
        <div className="quantum-wave-overlay" />
        
        {/* SVG Quantum Circuit Visualization */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 200">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="var(--q-cyan)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          {[40, 70, 100, 130, 160].map((y, i) => (
            <motion.path
              key={i}
              d={`M 50 ${y} L 350 ${y}`}
              stroke="url(#lineGrad)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: i * 0.1 }}
            />
          ))}
        </svg>

        <div className="quantum-circuit-layer">
          <motion.div
            className="quantum-ring quantum-ring-outer"
            animate={{ 
              rotate: 360,
              scale: activeStage.id === 'superposition' ? [1, 1.1, 1] : 1
            }}
            transition={{ 
              rotate: { repeat: Infinity, duration: 8, ease: "linear" },
              scale: { repeat: Infinity, duration: 2 }
            }}
          />
          <motion.div
            className="quantum-ring quantum-ring-inner"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
          />
          
          <AnimatePresence>
            {shouldShowDigits && (
              <motion.div
                className="quantum-collapse-digits"
                initial={{ opacity: 0, scale: 0.5, filter: 'blur(20px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ type: 'spring', damping: 12 }}
              >
                {Math.random().toString().slice(2, 8).split('').join(' ')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="quantum-stream" aria-hidden="true">
        {stream}
      </div>

      <div className="quantum-progress-container">
        <div className="quantum-progress-track">
          <motion.div
            className="quantum-progress-fill"
            animate={{ width: `${progress * 100}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default QuantumGenerationAnimation

