import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlusCircle, Compass, TrendingUp, MapPin, Calendar, ArrowRight } from 'lucide-react'
import { useTravel } from '../context/TravelContext'
import { DESTINATIONS } from '../lib/mockData'
import { staggerContainer, staggerItem, blurIn, slideUp } from '../lib/animations'
import PageTransition from '../components/PageTransition'
import TripCard from '../components/TripCard'
import DestinationCard from '../components/DestinationCard'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80'

const QUICK_STATS = [
  { label: 'Trips Planned', icon: Compass },
  { label: 'Countries Visited', icon: MapPin },
  { label: 'Days Travelled', icon: Calendar },
  { label: 'Memories Made', icon: TrendingUp },
]

export default function DashboardPage() {
  const { user, trips } = useTravel()
  const upcoming = trips.filter(t => t.status === 'upcoming' || t.status === 'planning')
  const completed = trips.filter(t => t.status === 'completed')

  const statValues = [trips.length, new Set(trips.map(t => t.destination?.split(',')?.[1]?.trim())).size, 47, completed.length * 8 + 12]

  return (
    <PageTransition>
      {/* Hero section */}
      <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <motion.img
          {...blurIn}
          src={HERO_IMAGE}
          alt="Travel hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 cinematic-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-matte-black/40 via-transparent to-matte-black/20" />

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <p className="text-warm-beige text-xs tracking-[0.2em] uppercase font-medium mb-3">
              Welcome back, {user?.name || 'Traveller'}
            </p>
            <h1 className="text-off-white font-display text-hero font-semibold leading-tight mb-6 glow-text-beige max-w-2xl">
              Where will you wander next?
            </h1>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/trips/new"
                className="flex items-center gap-2 px-6 py-3 bg-white text-matte-black font-semibold text-sm rounded-xl hover:bg-fog transition-all duration-200"
              >
                <PlusCircle size={16} />
                Plan a Trip
              </Link>
              <Link
                to="/explore"
                className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/15 transition-all duration-200"
              >
                <Compass size={16} />
                Explore Destinations
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="border-b border-border-subtle bg-charcoal">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {QUICK_STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.5 }}
              className={`flex items-center gap-3 ${i === 0 ? 'md:col-span-2' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-border-subtle flex items-center justify-center shrink-0">
                <s.icon size={15} className="text-fog-dim" />
              </div>
              <div>
                <div className="text-xl font-display font-semibold text-off-white">{statValues[i]}</div>
                <div className="text-xs text-fog-dim">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">

        {/* Your Trips */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-off-white">Your Journeys</h2>
              <p className="text-fog-dim text-sm mt-1">Upcoming and active trips</p>
            </div>
            <Link
              to="/trips/new"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-border-subtle hover:border-border-hover rounded-xl text-sm text-fog hover:text-white transition-all duration-200"
            >
              <PlusCircle size={13} />
              New Trip
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <motion.div
              {...slideUp}
              className="glass-card p-12 text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-soft-blue/10 border border-soft-blue/20 flex items-center justify-center mx-auto mb-4">
                <Compass size={24} className="text-soft-blue" />
              </div>
              <h3 className="font-display text-lg text-off-white mb-2">No journeys yet</h3>
              <p className="text-fog-dim text-sm mb-6">Every adventure begins with a single step.</p>
              <Link
                to="/trips/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-soft-blue text-matte-black font-semibold text-sm rounded-xl hover:bg-soft-blue/90 transition-all"
              >
                Plan your first trip
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {trips.map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </motion.div>
          )}
        </section>

        {/* Destination Inspiration */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-off-white">Destinations to Dream About</h2>
              <p className="text-fog-dim text-sm mt-1">Handpicked for your next escape</p>
            </div>
            <Link
              to="/explore"
              className="flex items-center gap-2 text-soft-blue text-sm hover:text-soft-blue/80 transition-colors"
            >
              Explore all
              <ArrowRight size={13} />
            </Link>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {DESTINATIONS.slice(0, 4).map(dest => (
              <DestinationCard key={dest.id} dest={dest} />
            ))}
          </motion.div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass size={14} className="text-soft-blue" />
            <span className="font-display text-sm text-fog-dim font-medium">traveloop</span>
          </div>
          <p className="text-xs text-fog-dim/60">A calm space for meaningful journeys.</p>
        </div>
      </footer>
    </PageTransition>
  )
}
