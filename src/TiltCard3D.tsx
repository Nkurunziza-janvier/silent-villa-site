import { type ReactNode, type MouseEvent, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function TiltCard3D({
  children,
  className = '',
  intensity = 8,
}: {
  children: ReactNode
  className?: string
  intensity?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, hovered: false })

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    const rotateY = (x - 0.5) * intensity * 2
    const rotateX = (0.5 - y) * intensity * 2
    setTilt({
      rotateX,
      rotateY,
      glareX: x * 100,
      glareY: y * 100,
      hovered: true,
    })
  }

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, hovered: false })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        scale: tilt.hovered ? 1.015 : 1,
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.6 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1100 }}
      className={`relative ${className}`}
    >
      {children}
      {tilt.hovered && !shouldReduceMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            background: `radial-gradient(420px circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(216,194,143,0.16), transparent 65%)`,
          }}
        />
      )}
    </motion.div>
  )
}
