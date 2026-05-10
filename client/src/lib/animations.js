// Framer Motion animation variants for Traveloop

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5, ease: 'easeOut' },
}

export const blurIn = {
  initial: { opacity: 0, filter: 'blur(12px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(8px)' },
  transition: { duration: 0.7, ease: 'easeOut' },
}

export const slideUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 16 },
  transition: { duration: 0.5, ease: 'easeOut' },
}

export const slideDown = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.4, ease: 'easeOut' },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.4, ease: 'easeOut' },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' },
}

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.4, ease: 'easeOut' },
}

export const cardHover = {
  rest: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.4)' },
  hover: { scale: 1.015, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' },
  transition: { duration: 0.25, ease: 'easeOut' },
}
