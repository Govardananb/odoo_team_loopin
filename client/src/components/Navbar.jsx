import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Compass, PlusCircle, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useTravel } from '../context/TravelContext'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/explore', label: 'Explore' },
]

export default function Navbar() {
  const { user, logout } = useTravel()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="glass-card px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-soft-blue/20 border border-soft-blue/30 flex items-center justify-center group-hover:bg-soft-blue/30 transition-all duration-300">
              <Compass size={16} className="text-soft-blue" />
            </div>
            <span className="font-display font-semibold text-white text-lg tracking-tight">
              traveloop
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'text-white bg-white/10'
                    : 'text-fog-dim hover:text-fog hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/trips/new"
              className="flex items-center gap-2 px-4 py-2 bg-soft-blue/15 hover:bg-soft-blue/25 border border-soft-blue/25 rounded-xl text-soft-blue text-sm font-medium transition-all duration-200 hover:shadow-glow-blue"
            >
              <PlusCircle size={14} />
              New Trip
            </Link>

            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-warm-beige/20 border border-warm-beige/30 flex items-center justify-center">
                  <User size={14} className="text-warm-beige" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-fog-dim hover:text-fog hover:bg-white/5 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-fog-dim hover:text-fog hover:bg-white/5 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mt-2 p-4 flex flex-col gap-2"
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive(link.to) ? 'text-white bg-white/10' : 'text-fog-dim hover:text-fog'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/trips/new"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 bg-soft-blue/15 border border-soft-blue/25 rounded-xl text-soft-blue text-sm font-medium"
            >
              <PlusCircle size={14} />
              New Trip
            </Link>
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 text-fog-dim text-sm hover:text-fog"
              >
                <LogOut size={14} />
                Logout
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
