import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, DollarSign, Star, Plus, ArrowLeft, Check } from 'lucide-react'
import { ACTIVITY_CATEGORIES, SAMPLE_ACTIVITIES } from '../lib/mockData'
import { staggerContainer, staggerItem, fadeIn } from '../lib/animations'
import PageTransition from '../components/PageTransition'
import { useTravel } from '../context/TravelContext'

function ActivityCard({ activity, added, onAdd }) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group p-5 rounded-2xl border border-border-subtle bg-charcoal hover:border-border-hover transition-all duration-300 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display text-sm font-semibold text-white leading-snug">{activity.name}</h3>
        <button
          onClick={() => onAdd(activity)}
          className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 ${
            added
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-white/5 border border-border-subtle hover:border-soft-blue/40 hover:bg-soft-blue/10 text-fog-dim hover:text-soft-blue'
          }`}
        >
          {added ? <Check size={12} /> : <Plus size={12} />}
        </button>
      </div>

      <p className="text-fog-dim text-xs leading-relaxed mb-4">{activity.desc}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-fog-dim">
            <Clock size={10} />
            {activity.duration}m
          </span>
          <span className="flex items-center gap-1 text-xs text-fog-dim">
            <DollarSign size={10} />
            {activity.cost === 0 ? 'Free' : `$${activity.cost}`}
          </span>
        </div>
        {activity.rating && (
          <span className="flex items-center gap-1 text-xs text-warm-beige">
            <Star size={9} className="fill-warm-beige" />
            {activity.rating}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function ActivityExplorerPage() {
  const { id } = useParams()
  const { getTripById } = useTravel()
  const trip = getTripById(id)
  const [activeCategory, setActiveCategory] = useState('culture')
  const [added, setAdded] = useState(new Set())

  const activities = SAMPLE_ACTIVITIES[activeCategory] || []

  const handleAdd = (activity) => {
    setAdded(prev => new Set([...prev, activity.id]))
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <motion.div {...fadeIn} className="mb-10">
            <Link to={`/trips/${id}/itinerary`} className="flex items-center gap-1.5 text-fog-dim hover:text-fog text-xs mb-4 transition-colors">
              <ArrowLeft size={12} />
              Back to Itinerary
            </Link>
            <h1 className="font-display text-hero font-semibold text-white mb-2">
              Activities
              {trip && <span className="text-fog-dim font-normal"> — {trip.destination}</span>}
            </h1>
            <p className="text-fog-dim text-sm">Curate your experience. Add moments that matter.</p>
          </motion.div>

          {/* Category selector */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-10">
            {ACTIVITY_CATEGORIES.map(cat => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'border-opacity-50 text-white'
                    : 'border-border-subtle bg-white/3 hover:border-border-hover text-fog-dim'
                }`}
                style={activeCategory === cat.id ? {
                  background: `${cat.color}12`,
                  borderColor: `${cat.color}35`,
                  color: cat.color,
                } : {}}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium leading-tight">{cat.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Activities grid */}
          {activities.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-fog-dim">No activities available for this category.</p>
            </div>
          ) : (
            <motion.div
              key={activeCategory}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {activities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  added={added.has(activity.id)}
                  onAdd={handleAdd}
                />
              ))}
            </motion.div>
          )}

          {added.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
            >
              <div className="flex items-center gap-3 px-5 py-3 glass-card border border-soft-blue/25 shadow-glow-blue">
                <div className="w-5 h-5 rounded-full bg-soft-blue/20 flex items-center justify-center">
                  <Check size={12} className="text-soft-blue" />
                </div>
                <span className="text-sm text-white">{added.size} activit{added.size === 1 ? 'y' : 'ies'} added to itinerary</span>
                <Link
                  to={`/trips/${id}/itinerary`}
                  className="text-xs text-soft-blue hover:underline font-medium"
                >
                  View →
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
