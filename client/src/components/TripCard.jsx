import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MapPin, DollarSign, ArrowRight } from 'lucide-react'
import { staggerItem } from '../lib/animations'

const STATUS_COLORS = {
  upcoming: { bg: 'bg-soft-blue/15', text: 'text-soft-blue', border: 'border-soft-blue/25' },
  planning: { bg: 'bg-warm-beige/15', text: 'text-warm-beige', border: 'border-warm-beige/25' },
  completed: { bg: 'bg-fog/10', text: 'text-fog-dim', border: 'border-fog/15' },
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function BudgetBar({ spent, total }) {
  const pct = total ? Math.min((spent / total) * 100, 100) : 0
  const color = pct > 90 ? '#FCA5A5' : pct > 60 ? '#D9C3A5' : '#6EA8FE'
  return (
    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

export default function TripCard({ trip }) {
  const status = STATUS_COLORS[trip.status] || STATUS_COLORS.planning
  const budgetPct = trip.budgetTotal ? Math.round((trip.budgetSpent / trip.budgetTotal) * 100) : 0

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-charcoal hover:border-border-hover transition-all duration-300 hover:shadow-card-hover"
    >
      {/* Cover image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={trip.coverImage}
          alt={trip.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 cinematic-overlay" />
        {/* Status badge */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-xl text-xs font-medium border backdrop-blur-sm ${status.bg} ${status.text} ${status.border}`}>
          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-white mb-1 truncate">{trip.name}</h3>

        <div className="flex items-center gap-1.5 text-fog-dim text-xs mb-4">
          <MapPin size={11} />
          <span>{trip.destination}</span>
        </div>

        {trip.startDate && (
          <div className="flex items-center gap-1.5 text-fog-dim text-xs mb-4">
            <Calendar size={11} />
            <span>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span>
          </div>
        )}

        {/* Budget */}
        {trip.budgetTotal > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-fog-dim flex items-center gap-1"><DollarSign size={10} /> Budget</span>
              <span className="text-fog">${trip.budgetSpent?.toLocaleString()} / ${trip.budgetTotal?.toLocaleString()}</span>
            </div>
            <BudgetBar spent={trip.budgetSpent} total={trip.budgetTotal} />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to={`/trips/${trip.id}/itinerary`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-border-subtle hover:border-border-hover rounded-xl text-xs text-fog hover:text-white transition-all duration-200"
          >
            Itinerary
          </Link>
          <Link
            to={`/trips/${trip.id}/budget`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-border-subtle hover:border-border-hover rounded-xl text-xs text-fog hover:text-white transition-all duration-200"
          >
            Budget
          </Link>
          <Link
            to={`/trips/${trip.id}/view`}
            className="p-2 bg-soft-blue/10 hover:bg-soft-blue/20 border border-soft-blue/20 rounded-xl text-soft-blue transition-all duration-200"
          >
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
