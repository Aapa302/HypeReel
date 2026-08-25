import { motion, useMotionTemplate, useSpring } from 'framer-motion'
import { useRef } from 'react'

const MAX_TILT = 9

export default function TiltCard({ children, className = '', intensity = 1, ...rest }) {
  const ref = useRef(null)
  const rotateX = useSpring(0, { stiffness: 220, damping: 20 })
  const rotateY = useSpring(0, { stiffness: 220, damping: 20 })
  const transform = useMotionTemplate`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`

  const handleMove = (event) => {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * MAX_TILT * 2 * intensity)
    rotateX.set(-py * MAX_TILT * 2 * intensity)
  }

  const handleLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ transform, transformStyle: 'preserve-3d' }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
