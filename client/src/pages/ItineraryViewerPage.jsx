import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, DollarSign, ArrowLeft, Share2, Printer, Clock } from 'lucide-react'
import { useTravel } from '../context/TravelContext'
import { fadeIn, staggerContainer, staggerItem, blurIn } from '../lib/animations'
import PageTransition from '../components/PageTransition'

const MOOD_LABELS = {
  explore: '🧭 Explorer',
  relax: '🌊 Relaxed',
  adventure: '⛰️ Adventurer',
  culture: '🏛️ Cultural',
  food: '🍜 Foodie',
  romance: '✨ Romantic',
}

export default function ItineraryViewerPage() {
  const { id } = useParams()
  const { getTripById } = useTravel()
  const trip = getTripById(id)

  if (!trip) return (
    <PageTransition>
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-fog-dim">Trip not found.</p>
      </div>
    </PageTransition>
  )

  const stops = trip.stops || []
  const days = [...new Set(stops.map(s => s.dayNumber))].sort((a, b) => a - b)

  const tripDays = trip.startDate && trip.endDate
    ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) + 1
    : days.length || 1

  const allDays = days.length > 0 ? days : Array.from({ length: tripDays }, (_, i) => i + 1)

  return (
    <PageTransition>

      {/* Hero */}
      <div className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <motion.img
          {...blurIn}
          src={trip.coverImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&q=80'}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 cinematic-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-matte-black/60 via-transparent to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end max-w-5xl mx-auto px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {trip.mood && (
                <span className="px-2.5 py-1 rounded-xl text-xs bg-white/10 backdrop-blur-sm border border-white/15 text-fog">
                  {MOOD_LABELS[trip.mood] || trip.mood}
                </span>
              )}
              <span className={`px-2.5 py-1 rounded-xl text-xs backdrop-blur-sm border ${
                trip.status === 'upcoming' ? 'bg-soft-blue/20 border-soft-blue/30 text-soft-blue' :
                trip.status === 'completed' ? 'bg-fog/10 border-fog/20 text-fog' :
                'bg-warm-beige/15 border-warm-beige/25 text-warm-beige'
              }`}>
                {trip.status}
              </span>
            </div>
            <h1 className="font-display text-hero font-semibold text-white mb-3 glow-text-beige">
              {trip.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-fog/80 text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} />
                {trip.destination}
              </span>
              {trip.startDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {trip.endDate && ` → ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </span>
              )}
              {trip.budgetTotal > 0 && (
                <span className="flex items-center gap-1.5">
                  <DollarSign size={13} />
                  ${trip.budgetTotal.toLocaleString()} budget
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action bar */}
      <div className="border-b border-border-subtle bg-charcoal">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-fog-dim hover:text-fog text-xs transition-colors">
            <ArrowLeft size={12} />
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to={`/trips/${id}/itinerary`}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-border-subtle rounded-xl text-xs text-fog transition-all"
            >
              Edit Itinerary
            </Link>
            <Link
              to={`/share/${id}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-soft-blue/10 hover:bg-soft-blue/20 border border-soft-blue/25 rounded-xl text-xs text-soft-blue transition-all"
            >
              <Share2 size={11} />
              Share
            </Link>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        {stops.length === 0 ? (
          <motion.div {...fadeIn} className="text-center py-20">
            <div className="text-5xl mb-4">✈️</div>
            <h3 className="font-display text-xl text-white mb-3">Your itinerary is empty</h3>
            <p className="text-fog-dim text-sm mb-6">Start adding stops to build your journey.</p>
            <Link
              to={`/trips/${id}/itinerary`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-soft-blue text-matte-black font-semibold text-sm rounded-xl"
            >
              Build Itinerary
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="relative"
          >
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border-subtle" />

            {allDays.map((day, dayIdx) => {
              const dayStops = stops.filter(s => s.dayNumber === day)
              const dateLabel = trip.startDate
                ? new Date(new Date(trip.startDate).getTime() + (day - 1) * 86400000)
                    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                : `Day ${day}`

              return (
                <motion.div key={day} variants={staggerItem} className="relative pl-14 mb-12">
                  {/* Day circle on timeline */}
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-charcoal border-2 border-soft-blue/40 flex items-center justify-center">
                    <span className="text-xs font-bold text-soft-blue">{day}</span>
                  </div>

                  {/* Day header */}
                  <div className="mb-5">
                    <h2 className="font-display text-lg font-semibold text-white">{dateLabel}</h2>
                    <p className="text-fog-dim text-xs mt-0.5">{dayStops.length} stop{dayStops.length !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Stops */}
                  <div className="space-y-3">
                    {dayStops.map((stop, stopIdx) => (
                      <motion.div
                        key={stop.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: dayIdx * 0.1 + stopIdx * 0.05 }}
                        className="p-4 rounded-xl border border-border-subtle bg-charcoal hover:border-border-hover transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-warm-beige mt-2 shrink-0" />
                          <div>
                            <h3 className="font-display text-sm font-semibold text-white">{stop.placeName}</h3>
                            {stop.placeType && (
                              <span className="text-xs text-fog-dim">{stop.placeType}</span>
                            )}
                            {stop.notes && (
                              <p className="text-xs text-fog-dim/70 mt-2 leading-relaxed">{stop.notes}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Trip summary footer */}
        {stops.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 p-6 glass-card text-center"
          >
            <div className="text-2xl mb-3">🏁</div>
            <h3 className="font-display text-lg font-semibold text-white mb-2">Journey Complete</h3>
            <p className="text-fog-dim text-sm">
              {stops.length} stops across {allDays.length} day{allDays.length !== 1 ? 's' : ''} in {trip.destination}.
            </p>
            {trip.budgetTotal > 0 && (
              <p className="text-fog-dim text-xs mt-1">Budget: ${trip.budgetSpent?.toLocaleString()} / ${trip.budgetTotal?.toLocaleString()}</p>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
