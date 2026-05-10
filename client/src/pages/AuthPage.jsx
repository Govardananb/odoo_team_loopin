import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Eye, EyeOff, ArrowRight, Mail, Lock, User } from 'lucide-react'
import { useTravel } from '../context/TravelContext'
import { blurIn, slideUp, staggerContainer, staggerItem } from '../lib/animations'

const BG_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=80'

function InputField({ id, label, type = 'text', value, onChange, placeholder, icon: Icon, showToggle, onToggle, visible }) {
  return (
    <motion.div variants={staggerItem} className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-fog-dim uppercase tracking-wider">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fog-dim/50">
            <Icon size={14} />
          </div>
        )}
        <input
          id={id}
          type={showToggle ? (visible ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-border-subtle hover:border-border-hover focus:border-soft-blue/50 rounded-xl px-10 py-3 text-sm text-white placeholder:text-fog-dim/40 transition-all duration-200 focus:bg-white/8 focus:shadow-glow-blue"
          style={{ paddingLeft: Icon ? '2.5rem' : undefined }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fog-dim/50 hover:text-fog-dim transition-colors"
          >
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useTravel()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    login({ name: name || email.split('@')[0], email })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-matte-black">
      {/* Left — cinematic backdrop */}
      <motion.div
        {...blurIn}
        className="hidden lg:flex flex-1 relative overflow-hidden"
      >
        <img
          src={BG_IMAGE}
          alt="Cinematic travel backdrop"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-matte-black/60 via-matte-black/20 to-matte-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-matte-black via-transparent to-matte-black/30" />

        {/* Left content */}
        <div className="relative z-10 flex flex-col justify-end p-16 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <p className="text-warm-beige text-xs tracking-[0.2em] uppercase mb-4 font-medium">A calm space to plan</p>
            <h1 className="text-white font-display text-hero font-semibold leading-tight mb-6 glow-text-beige">
              Every journey<br />begins with a<br />quiet intention.
            </h1>
            <p className="text-fog/70 text-base leading-relaxed max-w-sm">
              Traveloop helps you plan meaningful trips — one cinematic destination at a time.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right — form panel */}
      <div className="w-full lg:w-[480px] flex flex-col justify-center px-8 py-12 lg:px-14 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal to-matte-black" />
        <div className="absolute top-0 right-0 w-96 h-96 opacity-5" style={{ background: 'radial-gradient(circle, #6EA8FE 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-sm mx-auto w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5 mb-12"
          >
            <div className="w-9 h-9 rounded-xl bg-soft-blue/20 border border-soft-blue/30 flex items-center justify-center">
              <Compass size={18} className="text-soft-blue" />
            </div>
            <span className="font-display font-semibold text-white text-section-title tracking-tight">traveloop</span>
          </motion.div>

          {/* Tab switcher */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex gap-1 p-1 bg-white/5 rounded-xl border border-border-subtle mb-8"
          >
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
                  tab === t
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-fog-dim hover:text-fog'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </motion.div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={tab}
              initial={{ opacity: 0, x: tab === 'login' ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === 'login' ? 12 : -12 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
            >
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="flex flex-col gap-4"
              >
                {tab === 'register' && (
                  <InputField
                    id="name"
                    label="Full Name"
                    value={name}
                    onChange={setName}
                    placeholder="Your name"
                    icon={User}
                  />
                )}
                <InputField
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@email.com"
                  icon={Mail}
                />
                <InputField
                  id="password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  icon={Lock}
                  showToggle
                  onToggle={() => setShowPw(!showPw)}
                  visible={showPw}
                />

                {tab === 'login' && (
                  <motion.div variants={staggerItem} className="flex justify-end">
                    <button type="button" className="text-xs text-fog-dim hover:text-soft-blue transition-colors">
                      Forgot password?
                    </button>
                  </motion.div>
                )}

                <motion.button
                  variants={staggerItem}
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="mt-2 w-full flex items-center justify-center gap-2.5 py-3.5 bg-soft-blue hover:bg-soft-blue/90 text-matte-black font-semibold text-sm rounded-xl transition-all duration-200 hover:shadow-glow-blue disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-matte-black/30 border-t-matte-black rounded-full animate-spin" />
                      {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    <>
                      {tab === 'login' ? 'Sign In' : 'Start Exploring'}
                      <ArrowRight size={15} />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.form>
          </AnimatePresence>

          <p className="text-center text-xs text-fog-dim mt-8">
            {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
              className="text-soft-blue hover:underline font-medium"
            >
              {tab === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
