import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Home, Search, Wallet, User, LogOut, Menu, Plus, Sun, Moon, Map } from 'lucide-react'
import { useTravel } from '../context/TravelContext'

export default function Layout() {
  const { user, logout, theme, toggleTheme } = useTravel()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const navLinks = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/explore', label: 'Search', icon: Search },
    { to: '/trips', label: 'Trips', icon: Map },
    { to: '/budget', label: 'Budget', icon: Wallet },
    { to: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-matte-black text-off-white">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-matte-black border-b border-border-subtle flex justify-between items-center w-full px-6 py-3">
        <div className="flex items-center gap-4">
          <Menu size={18} className="text-fog-dim cursor-pointer md:hidden" />
          <Link to="/dashboard" className="flex items-center gap-2">
            <Compass size={16} className="text-soft-blue" />
            <span className="font-display text-lg font-bold text-off-white">traveloop</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-fog-dim hover:text-white hover:bg-white/5 transition-all"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-fog-dim hidden md:block">{user.name}</span>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-border-subtle">
                <User size={14} className="text-fog" />
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-fog-dim hover:text-off-white hover:bg-matte-black/5 dark:hover:bg-white/5 transition-all"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex pt-[56px]">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-56px)] fixed left-0 p-4 gap-2 bg-matte-black border-r border-border-subtle">
          <div className="flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'text-off-white bg-matte-black/5 dark:bg-white/10'
                    : 'text-fog-dim hover:text-off-white hover:bg-matte-black/5 dark:hover:bg-white/5'
                }`}
              >
                <link.icon size={16} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Pro Feature Box */}
          <div className="mt-auto glass-card p-4 rounded-xl">
            <p className="text-xs font-semibold text-soft-blue mb-1 uppercase tracking-wider">Pro Feature</p>
            <p className="text-xs text-fog-dim mb-3">AI Itinerary Planner</p>
            <button className="w-full bg-soft-blue text-matte-black font-semibold text-xs py-2 rounded-xl hover:bg-soft-blue/90 transition-all">
              Upgrade
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 p-6 pb-20 md:pb-6 min-h-[calc(100vh-56px)] overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-charcoal border-t border-border-subtle">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              isActive(link.to)
                ? 'text-white'
                : 'text-fog-dim hover:text-white'
            }`}
          >
            <link.icon size={16} />
            <span className="text-[10px] font-medium mt-1">{link.label}</span>
          </Link>
        ))}
        <Link
          to="/trips/new"
          className="flex flex-col items-center justify-center p-2 text-fog-dim hover:text-white"
        >
          <Plus size={16} />
          <span className="text-[10px] font-medium mt-1">Plan</span>
        </Link>
      </nav>
    </div>
  )
}
