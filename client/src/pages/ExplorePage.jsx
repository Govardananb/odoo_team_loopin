import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Compass } from 'lucide-react'
import { DESTINATIONS } from '../lib/mockData'
import { staggerContainer, staggerItem, slideDown } from '../lib/animations'
import PageTransition from '../components/PageTransition'
import DestinationCard from '../components/DestinationCard'

const CATEGORIES = ['All', 'Culture', 'Beach', 'Adventure', 'Mountain', 'City']
const CONTINENTS = ['All Continents', 'Asia', 'Europe', 'Africa', 'South America', 'Oceania']

function DestinationModal({ dest, onClose }) {
  if (!dest) return null
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-matte-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative glass-card rounded-modal w-full max-w-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
      >
        {/* Header image */}
        <div className="relative h-72">
          <img src={dest.image} alt={dest.city} className="w-full h-full object-cover" />
          <div className="absolute inset-0 cinematic-overlay" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-all"
          >
            <X size={14} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="font-display text-hero font-semibold text-white">{dest.city}</h2>
            <p className="text-fog/80 text-sm">{dest.country} · {dest.continent}</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <p className="text-warm-beige text-sm italic">"{dest.tagline}"</p>
          <p className="text-fog text-sm leading-relaxed">{dest.description}</p>
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-border-subtle">
            <div>
              <div className="text-xs text-fog-dim mb-1">Rating</div>
              <div className="text-white font-semibold">⭐ {dest.rating}</div>
            </div>
            <div>
              <div className="text-xs text-fog-dim mb-1">Avg Cost</div>
              <div className="text-white font-semibold">${dest.avgCost}/day</div>
            </div>
            <div>
              <div className="text-xs text-fog-dim mb-1">Best Time</div>
              <div className="text-white font-semibold text-sm">{dest.bestTime}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-fog-dim uppercase tracking-wider mb-2">Highlights</div>
            <div className="flex flex-wrap gap-2">
              {dest.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-xl text-xs bg-white/5 border border-border-subtle text-fog capitalize">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [continent, setContinent] = useState('All Continents')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    return DESTINATIONS.filter(d => {
      const matchQ = !query || d.city.toLowerCase().includes(query.toLowerCase()) || d.country.toLowerCase().includes(query.toLowerCase())
      const matchC = category === 'All' || d.category === category
      const matchCont = continent === 'All Continents' || d.continent === continent
      return matchQ && matchC && matchCont
    })
  }, [query, category, continent])

  return (
    <PageTransition>

      {/* Page header */}
      <div className="pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div {...slideDown}>
            <p className="text-warm-beige text-xs uppercase tracking-[0.2em] font-medium mb-3">Discover</p>
            <div className="flex justify-between items-center mb-4">
              <h1 className="font-display text-hero font-semibold text-white mb-0">
                Explore the world
              </h1>
              <Link
                to="/explore/globe"
                className="flex items-center gap-2 px-4 py-2 bg-charcoal border border-border-subtle hover:border-border-hover rounded-xl text-sm text-fog hover:text-off-white transition-all duration-200"
              >
                <Compass size={16} className="text-soft-blue" />
                Globe View
              </Link>
            </div>
            <p className="text-fog-dim text-base max-w-lg">
              Handpicked destinations across every continent — each one a story waiting to be lived.
            </p>
          </motion.div>

          {/* Search + filters */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog-dim/50" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search cities or countries..."
                className="w-full bg-white/5 border border-border-subtle focus:border-soft-blue/40 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-fog-dim/40 transition-all focus:bg-white/8"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-fog-dim hover:text-fog">
                  <X size={12} />
                </button>
              )}
            </div>

            <select
              value={continent}
              onChange={e => setContinent(e.target.value)}
              className="bg-white/5 border border-border-subtle rounded-xl px-4 py-3 text-sm text-fog focus:border-soft-blue/40 transition-all"
              style={{ colorScheme: 'dark' }}
            >
              {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  category === cat
                    ? 'bg-soft-blue text-matte-black font-semibold'
                    : 'bg-white/5 text-fog-dim hover:text-fog hover:bg-white/8 border border-border-subtle'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🌏</div>
            <h3 className="font-display text-lg text-white mb-2">No destinations found</h3>
            <p className="text-fog-dim text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-fog-dim mb-6">{filtered.length} destinations found</p>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filtered.map(dest => (
                <DestinationCard key={dest.id} dest={dest} onSelect={setSelected} />
              ))}
            </motion.div>
          </>
        )}
      </div>

      {/* Modal */}
      {selected && <DestinationModal dest={selected} onClose={() => setSelected(null)} />}
    </PageTransition>
  )
}
