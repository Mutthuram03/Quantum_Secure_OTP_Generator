import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './QuantumGenerationAnimation.css'

const STAGE_SEQUENCE = [
  { id: 'init', label: 'Initializing Qubits', start: 0, end: 0.33 },
  { id: 'superposition', label: 'Entering Superposition', start: 0.33, end: 0.72 },
  { id: 'measurement', label: 'Measurement and Collapse', start: 0.72, end: 1 },
]

function buildBinaryStream(length = 64) {
  return Array.from({ length }, () => (Math.random() > 0.5 ? '1' : '0')).join('')
}

function QuantumGenerationAnimation({ durationMs = 3200 }) {
  const [progress, setProgress] = useState(0)
  const [stream, setStream] = useState(buildBinaryStream())

  useEffect(() => {
    const start = performance.now()

    const progressTimer = setInterval(() => {
      const elapsed = performance.now() - start
      const ratio = Math.min(1, elapsed / durationMs)
      setProgress(ratio)
      if (ratio >= 1) {
        clearInterval(progressTimer)
      }
    }, 16)

    const streamTimer = setInterval(() => {
      setStream(buildBinaryStream())
    }, 140)

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

  const shouldShowDigits = progress > 0.74

  return (
    <motion.div
      className="quantum-panel"
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="quantum-bg-orb quantum-bg-orb-a" />
      <div className="quantum-bg-orb quantum-bg-orb-b" />

      <div className="quantum-headline-wrap">
        <div className="quantum-kicker">Quantum Generation Pipeline</div>
        <AnimatePresence mode="wait">
          <motion.h3
            key={activeStage.id}
            className="quantum-stage-title"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {activeStage.label}
          </motion.h3>
        </AnimatePresence>
      </div>

      <div className="quantum-visual-core">
        <motion.div
          className="quantum-ring quantum-ring-outer"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
        />
        <motion.div
          className="quantum-ring quantum-ring-inner"
          animate={{ rotate: -360, scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
        />

        <div className="quantum-wave-grid" data-superposition={activeStage.id === 'superposition'} />

        <AnimatePresence>
          {shouldShowDigits && (
            <motion.div
              className="quantum-collapse-digits"
              initial={{ opacity: 0, scale: 1.2, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
              transition={{ duration: 0.55 }}
            >
              0 1 0 1 1 0
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="quantum-stream" aria-hidden="true">
        {stream}
      </div>

      <div className="quantum-progress-track">
        <motion.div
          className="quantum-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(progress * 100)}%` }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}

export default QuantumGenerationAnimation
