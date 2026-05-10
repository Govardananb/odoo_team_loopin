import { motion } from 'framer-motion'
import { pageTransition } from '../lib/animations'

export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      {...pageTransition}
      className={`min-h-screen bg-matte-black ${className}`}
    >
      {children}
    </motion.div>
  )
}
