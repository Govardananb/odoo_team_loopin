import { useState, useMemo } from 'react'
import { useTravel } from '../context/TravelContext'
import TripCard from '../components/TripCard'
import PageTransition from '../components/PageTransition'
import { motion } from 'framer-motion'
import { staggerContainer, slideDown } from '../lib/animations'

export default function TripsPage() {
  const { trips } = useTravel()
  const [filter, setFilter] = useState('All')

  const filteredTrips = useMemo(() => {
    if (filter === 'All') return trips
    return trips.filter(t => t.status === filter.toLowerCase())
  }, [trips, filter])

  const categories = ['All', 'Upcoming', 'Planning', 'Completed']

  return (
    <PageTransition>
      <div className="pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div {...slideDown}>
            <p className="text-warm-beige text-xs uppercase tracking-[0.2em] font-medium mb-3">Your Journeys</p>
            <h1 className="font-display text-hero font-semibold text-off-white mb-4">
              All Trips
            </h1>
          </motion.div>

          {/* Filters */}
          <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === cat
                    ? 'bg-soft-blue text-matte-black'
                    : 'bg-charcoal text-fog-dim hover:text-off-white hover:bg-white/5 border border-border-subtle'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </motion.div>

          {filteredTrips.length === 0 && (
            <div className="text-center py-12">
              <p className="text-fog-dim">No trips found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
