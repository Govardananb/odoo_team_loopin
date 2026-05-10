import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, DollarSign, Compass, Share2, ExternalLink } from 'lucide-react'
import { useTravel } from '../context/TravelContext'
import { blurIn, staggerContainer, staggerItem, fadeIn } from '../lib/animations'

const MOOD_LABELS = {
  explore: '🧭 Explorer',
  relax: '🌊 Relaxed',
  adventure: '⛰️ Adventurer',
  culture: '🏛️ Cultural',
  food: '🍜 Foodie',
  romance: '✨ Romantic',
}

export default function SharedItineraryPage() {
  const { shareId } = useParams()
  const { trips } = useTravel()
  // In production this would be a public API call; for now find by trip ID
  const trip = trips.find(t => t.id === shareId || t.shareId === shareId) || trips[0]

  if (!trip) {
    return (
      <div className="min-h-screen bg-matte-black flex flex-col items-center justify-center gap-4">
        <div className="text-4xl">✈️</div>
        <h1 className="font-display text-2xl text-white">Journey not found</h1>
        <p className="text-fog-dim text-sm">This itinerary may be private or no longer shared.</p>
      </div>
    )
  }

  const stops = trip.stops || []
  const days = [...new Set(stops.map(s => s.dayNumber))].sort((a, b) => a - b)

  return (
    <div className="min-h-screen bg-matte-black">
      {/* Minimal navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-matte-black/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Compass size={15} className="text-soft-blue" />
          <span className="font-display text-sm font-semibold text-white">traveloop</span>
        </div>
        <button
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="flex items-center gap-1.5 px-3 py-1.5 glass-card text-xs text-fog-dim hover:text-fog transition-all"
        >
          <Share2 size={11} />
          Copy Link
        </button>
      </nav>

      {/* Hero */}
      <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <motion.img
          {...blurIn}
          src={trip.coverImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&q=80'}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 cinematic-overlay" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(15,17,21,0.6), transparent)' }} />

        {/* Centered hero content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {trip.mood && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-fog text-xs mb-5">
                {MOOD_LABELS[trip.mood] || trip.mood}
              </div>
            )}
            <h1 className="font-display text-hero font-semibold text-white mb-4 glow-text-beige max-w-3xl leading-tight">
              {trip.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-5 text-fog/80 text-sm mt-2">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} />
                {trip.destination}
              </span>
              {trip.startDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              )}
              {stops.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Compass size={13} />
                  {stops.length} stops
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Editorial content */}
      <div className="max-w-3xl mx-auto px-6 py-20">
        {/* Introduction */}
        <motion.div {...fadeIn} className="mb-16 text-center">
          <p className="text-warm-beige text-xs uppercase tracking-[0.2em] font-medium mb-4">A Journey Shared</p>
          <p className="text-fog leading-relaxed text-base">
            This is a curated travel itinerary for <strong className="text-white">{trip.destination}</strong>.
            {trip.startDate && ` Spanning ${Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) + 1} days`} of discovery, culture, and memorable moments.
          </p>
        </motion.div>

        {/* Trip stats */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          {[
            { label: 'Stops', value: stops.length, icon: '📍' },
            { label: 'Days', value: days.length || 1, icon: '📅' },
            { label: 'Budget', value: trip.budgetTotal ? `$${trip.budgetTotal.toLocaleString()}` : '—', icon: '💰' },
          ].map(stat => (
            <div key={stat.label} className="text-center p-4 rounded-2xl border border-border-subtle bg-charcoal">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="font-display text-section-title font-semibold text-white">{stat.value}</div>
              <div className="text-xs text-fog-dim">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        {days.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-fog-dim">No stops added to this itinerary.</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-12"
          >
            {days.map((day, dayIdx) => {
              const dayStops = stops.filter(s => s.dayNumber === day)
              const dateLabel = trip.startDate
                ? new Date(new Date(trip.startDate).getTime() + (day - 1) * 86400000)
                    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                : `Day ${day}`

              return (
                <motion.section key={day} variants={staggerItem}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-px flex-1 bg-border-subtle" />
                    <div className="text-xs text-fog-dim uppercase tracking-wider font-medium">{dateLabel}</div>
                    <div className="h-px flex-1 bg-border-subtle" />
                  </div>
                  <div className="space-y-4">
                    {dayStops.map(stop => (
                      <motion.div
                        key={stop.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: dayIdx * 0.1 }}
                        className="flex gap-4 p-5 rounded-2xl border border-border-subtle bg-charcoal"
                      >
                        <div className="w-8 h-8 rounded-full bg-soft-blue/15 border border-soft-blue/25 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin size={12} className="text-soft-blue" />
                        </div>
                        <div>
                          <h3 className="font-display text-base font-semibold text-white">{stop.placeName}</h3>
                          {stop.placeType && <p className="text-xs text-fog-dim mt-0.5">{stop.placeType}</p>}
                          {stop.notes && <p className="text-sm text-fog/70 mt-2 leading-relaxed">{stop.notes}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )
            })}
          </motion.div>
        )}

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-col items-center gap-4 p-8 glass-card">
            <Compass size={28} className="text-soft-blue" />
            <h3 className="font-display text-lg text-white font-semibold">Plan your own journey</h3>
            <p className="text-fog-dim text-sm">Create a free account and start planning with Traveloop.</p>
            <a
              href="/auth"
              className="flex items-center gap-2 px-5 py-2.5 bg-soft-blue text-matte-black font-semibold text-sm rounded-xl hover:bg-soft-blue/90 transition-all"
            >
              Get Started
              <ExternalLink size={13} />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-2">
          <Compass size={13} className="text-soft-blue" />
          <span className="text-xs text-fog-dim">Shared via <strong className="text-fog">traveloop</strong> · A calm space for meaningful journeys.</span>
        </div>
      </footer>
    </div>
  )
}
