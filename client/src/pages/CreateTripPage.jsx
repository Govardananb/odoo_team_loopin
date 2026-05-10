import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, MapPin, Calendar, DollarSign, Compass, Plus } from 'lucide-react'
import { useTravel } from '../context/TravelContext'
import { MOOD_OPTIONS } from '../lib/mockData'
import PageTransition from '../components/PageTransition'
import { slideDown, fadeIn } from '../lib/animations'

const BUDGET_STYLES = [
  { id: 'budget', label: 'Budget', icon: '🎒', desc: 'Hostels & local eats', range: '$30–60/day' },
  { id: 'comfort', label: 'Comfort', icon: '🏨', desc: 'Mid-range hotels', range: '$80–150/day' },
  { id: 'luxury', label: 'Luxury', icon: '✨', desc: 'Premium experience', range: '$200+/day' },
]

export default function CreateTripPage() {
  const navigate = useNavigate()
  const { createTrip } = useTravel()

  const [data, setData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    destination: '',
    mood: 'explore',
    budgetStyle: 'comfort',
  })

  const handleCreate = () => {
    if (!data.name || !data.destination) {
      alert('Please fill in at least the trip name and destination.')
      return
    }
    
    const newTrip = {
      id: `trip-${Date.now()}`,
      name: data.name,
      destination: data.destination,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'planning',
      mood: data.mood,
      budgetStyle: data.budgetStyle,
      coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&q=80', // Default
      stops: []
    }
    
    createTrip(newTrip)
    navigate(`/trips/${newTrip.id}/itinerary`)
  }

  return (
    <PageTransition>
      <div className="pt-28 pb-12 px-6 bg-matte-black min-h-screen">
        <div className="max-w-4xl mx-auto">
          <motion.div {...slideDown} className="mb-8">
            <Link to="/dashboard" className="flex items-center gap-1.5 text-fog-dim hover:text-fog text-xs mb-3 transition-colors">
              <ArrowLeft size={12} />
              Back to Dashboard
            </Link>
            <h1 className="font-display text-hero font-semibold text-off-white mb-2">
              Create a New Journey
            </h1>
            <p className="text-fog-dim">Fill in the details to start planning your trip.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Basic Info */}
            <div className="space-y-6">
              <div>
                <label className="text-xs text-fog-dim uppercase tracking-wider block mb-2">Trip Name</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={e => setData({ ...data, name: e.target.value })}
                  placeholder="e.g. Golden Hour in Japan"
                  className="w-full bg-charcoal border border-border-subtle hover:border-border-hover focus:border-soft-blue/50 rounded-xl px-4 py-3 text-white placeholder:text-fog-dim/40 transition-all focus:bg-white/5"
                />
              </div>

              <div>
                <label className="text-xs text-fog-dim uppercase tracking-wider block mb-2">Destination</label>
                <input
                  type="text"
                  value={data.destination}
                  onChange={e => setData({ ...data, destination: e.target.value })}
                  placeholder="e.g. Tokyo, Japan"
                  className="w-full bg-charcoal border border-border-subtle hover:border-border-hover focus:border-soft-blue/50 rounded-xl px-4 py-3 text-white placeholder:text-fog-dim/40 transition-all focus:bg-white/5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-fog-dim uppercase tracking-wider block mb-2">Departure</label>
                  <input
                    type="date"
                    value={data.startDate}
                    onChange={e => setData({ ...data, startDate: e.target.value })}
                    className="w-full bg-charcoal border border-border-subtle hover:border-border-hover focus:border-soft-blue/50 rounded-xl px-4 py-3 text-white text-sm transition-all focus:bg-white/5"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label className="text-xs text-fog-dim uppercase tracking-wider block mb-2">Return</label>
                  <input
                    type="date"
                    value={data.endDate}
                    onChange={e => setData({ ...data, endDate: e.target.value })}
                    className="w-full bg-charcoal border border-border-subtle hover:border-border-hover focus:border-soft-blue/50 rounded-xl px-4 py-3 text-white text-sm transition-all focus:bg-white/5"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Style & Budget */}
            <div className="space-y-6">
              <div>
                <label className="text-xs text-fog-dim uppercase tracking-wider block mb-2">Trip Mood</label>
                <div className="grid grid-cols-2 gap-2">
                  {MOOD_OPTIONS.map(mood => (
                    <button
                      key={mood.id}
                      onClick={() => setData({ ...data, mood: mood.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        data.mood === mood.id
                          ? 'border-soft-blue bg-soft-blue/5 text-off-white'
                          : 'border-border-subtle bg-charcoal text-fog-dim hover:border-border-hover hover:text-off-white'
                      }`}
                    >
                      <div className="text-sm font-medium">{mood.label}</div>
                      <div className="text-xs text-fog-dim mt-0.5">{mood.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-fog-dim uppercase tracking-wider block mb-2">Budget Style</label>
                <div className="space-y-2">
                  {BUDGET_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setData({ ...data, budgetStyle: style.id })}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        data.budgetStyle === style.id
                          ? 'border-soft-blue bg-soft-blue/5 text-off-white'
                          : 'border-border-subtle bg-charcoal text-fog-dim hover:border-border-hover hover:text-off-white'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium">{style.icon} {style.label}</div>
                        <div className="text-xs text-fog-dim mt-0.5">{style.desc}</div>
                      </div>
                      <div className="text-xs font-medium text-soft-blue">{style.range}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-soft-blue text-matte-black font-semibold rounded-xl hover:bg-soft-blue/90 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Create & Start Planning
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
