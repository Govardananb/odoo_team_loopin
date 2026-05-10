import { motion } from 'framer-motion'
import { MapPin, Star, Clock, DollarSign, ArrowUpRight } from 'lucide-react'
import { staggerItem } from '../lib/animations'

const CATEGORY_COLORS = {
  Culture: '#D9C3A5',
  Beach: '#6EA8FE',
  Adventure: '#6EE7B7',
  Mountain: '#A78BFA',
  City: '#FCA5A5',
}

export default function DestinationCard({ dest, onSelect }) {
  const accentColor = CATEGORY_COLORS[dest.category] || '#6EA8FE'

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -6, transition: { duration: 0.3, ease: 'easeOut' } }}
      onClick={() => onSelect?.(dest)}
      className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-charcoal cursor-pointer hover:border-border-hover transition-all duration-300 hover:shadow-card-hover"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={dest.image}
          alt={dest.city}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 cinematic-overlay" />

        {/* Category pill */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-xs font-medium backdrop-blur-md border"
          style={{
            background: `${accentColor}18`,
            color: accentColor,
            borderColor: `${accentColor}30`,
          }}
        >
          {dest.category}
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10">
          <Star size={10} className="text-warm-beige fill-warm-beige" />
          <span className="text-xs text-white font-medium">{dest.rating}</span>
        </div>

        {/* Hover overlay - arrow */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <ArrowUpRight size={14} className="text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-display text-lg font-semibold text-white">{dest.city}</h3>
        </div>
        <div className="flex items-center gap-1 text-fog-dim text-xs mb-3">
          <MapPin size={10} />
          <span>{dest.country}</span>
        </div>

        <p className="text-fog-dim text-xs leading-relaxed mb-4 line-clamp-2">{dest.tagline}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-fog-dim">
            <DollarSign size={10} />
            <span>~${dest.avgCost}<span className="text-fog-dim/60">/day</span></span>
          </div>
          <div className="flex items-center gap-1 text-xs text-fog-dim">
            <Clock size={10} />
            <span>{dest.bestTime}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {dest.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-xl text-xs bg-white/5 text-fog-dim border border-border-subtle">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
