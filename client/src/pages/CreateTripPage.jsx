import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, MapPin, Calendar, DollarSign, Compass } from 'lucide-react'
import { useTravel } from '../context/TravelContext'
import { MOOD_OPTIONS, DESTINATIONS } from '../lib/mockData'

const STEPS = ['Name', 'Dates', 'Destination', 'Mood', 'Budget']
const BUDGET_STYLES = [
  { id: 'budget', label: 'Budget', icon: '🎒', desc: 'Hostels & local eats', range: '$30–60/day' },
  { id: 'comfort', label: 'Comfort', icon: '🏨', desc: 'Mid-range hotels', range: '$80–150/day' },
  { id: 'luxury', label: 'Luxury', icon: '✨', desc: 'Premium experience', range: '$200+/day' },
]

function StepIndicator({ current, total, steps }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-12">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all duration-300 ${
            i < current ? 'bg-soft-blue text-matte-black' :
            i === current ? 'bg-white text-matte-black' :
            'bg-white/10 text-fog-dim border border-border-subtle'
          }`}>
            {i < current ? <Check size={12} /> : i + 1}
          </div>
          <span className={`text-xs hidden sm:block ${i === current ? 'text-white' : 'text-fog-dim'}`}>{step}</span>
          {i < total - 1 && (
            <div className={`w-8 h-px transition-all duration-500 ${i < current ? 'bg-soft-blue' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function Step1({ data, setData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-hero font-semibold text-white mb-2">Name your journey</h2>
        <p className="text-fog-dim">Give this trip a name that captures its spirit.</p>
      </div>
      <div>
        <input
          id="trip-name"
          type="text"
          value={data.name}
          onChange={e => setData({ ...data, name: e.target.value })}
          placeholder="e.g. Golden Hour in Japan"
          className="w-full bg-white/5 border border-border-subtle hover:border-border-hover focus:border-soft-blue/50 rounded-xl px-5 py-4 text-lg text-white placeholder:text-fog-dim/40 transition-all duration-200 focus:bg-white/8"
          autoFocus
        />
        <p className="text-xs text-fog-dim/60 mt-2 pl-1">Make it poetic. Make it yours.</p>
      </div>
    </div>
  )
}

function Step2({ data, setData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-hero font-semibold text-white mb-2">When do you travel?</h2>
        <p className="text-fog-dim">Set your departure and return dates.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'startDate', label: 'Departure' },
          { key: 'endDate', label: 'Return' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="text-xs text-fog-dim uppercase tracking-wider block mb-2">{label}</label>
            <input
              type="date"
              value={data[key]}
              onChange={e => setData({ ...data, [key]: e.target.value })}
              className="w-full bg-white/5 border border-border-subtle hover:border-border-hover focus:border-soft-blue/50 rounded-xl px-4 py-3.5 text-white text-sm transition-all duration-200 focus:bg-white/8"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function Step3({ data, setData }) {
  const [query, setQuery] = useState('')
  const filtered = DESTINATIONS.filter(d =>
    !query || d.city.toLowerCase().includes(query.toLowerCase()) || d.country.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-hero font-semibold text-white mb-2">Where are you going?</h2>
        <p className="text-fog-dim">Choose a destination or type your own.</p>
      </div>
      <input
        type="text"
        value={data.destination || query}
        onChange={e => { setQuery(e.target.value); setData({ ...data, destination: e.target.value }) }}
        placeholder="Search destinations..."
        className="w-full bg-white/5 border border-border-subtle focus:border-soft-blue/50 rounded-xl px-5 py-3.5 text-white placeholder:text-fog-dim/40 transition-all duration-200 focus:bg-white/8"
      />
      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
        {filtered.map(dest => (
          <button
            key={dest.id}
            onClick={() => setData({ ...data, destination: `${dest.city}, ${dest.country}`, coverImage: dest.image })}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
              data.destination?.includes(dest.city)
                ? 'border-soft-blue/40 bg-soft-blue/10 text-white'
                : 'border-border-subtle bg-white/3 hover:border-border-hover hover:bg-white/5 text-fog'
            }`}
          >
            <img src={dest.image} alt={dest.city} className="w-10 h-10 rounded-xl object-cover shrink-0" />
            <div>
              <div className="text-sm font-medium">{dest.city}</div>
              <div className="text-xs text-fog-dim">{dest.country}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function Step4({ data, setData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-hero font-semibold text-white mb-2">What's your travel mood?</h2>
        <p className="text-fog-dim">This shapes your activity suggestions.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {MOOD_OPTIONS.map(mood => (
          <button
            key={mood.id}
            onClick={() => setData({ ...data, mood: mood.id })}
            className={`flex flex-col items-center gap-2 p-5 rounded-xl border text-center transition-all duration-200 ${
              data.mood === mood.id
                ? 'border-soft-blue/50 bg-soft-blue/10 text-white'
                : 'border-border-subtle bg-white/3 hover:border-border-hover hover:bg-white/5 text-fog-dim'
            }`}
          >
            <span className="text-3xl">{mood.icon}</span>
            <div>
              <div className="text-sm font-semibold text-white">{mood.label}</div>
              <div className="text-xs text-fog-dim mt-0.5">{mood.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function Step5({ data, setData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-hero font-semibold text-white mb-2">Set your budget</h2>
        <p className="text-fog-dim">How do you like to travel?</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {BUDGET_STYLES.map(style => (
          <button
            key={style.id}
            onClick={() => {
              const amounts = { budget: 1200, comfort: 2500, luxury: 6000 }
              setData({ ...data, budgetStyle: style.id, budgetTotal: amounts[style.id] })
            }}
            className={`flex flex-col items-center gap-2 p-5 rounded-xl border text-center transition-all duration-200 ${
              data.budgetStyle === style.id
                ? 'border-warm-beige/40 bg-warm-beige/10 text-white'
                : 'border-border-subtle bg-white/3 hover:border-border-hover text-fog-dim'
            }`}
          >
            <span className="text-2xl">{style.icon}</span>
            <div className="text-sm font-semibold text-white">{style.label}</div>
            <div className="text-xs text-fog-dim">{style.range}</div>
          </button>
        ))}
      </div>
      <div>
        <label className="text-xs text-fog-dim uppercase tracking-wider block mb-2">Custom Total Budget (USD)</label>
        <div className="relative">
          <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog-dim/50" />
          <input
            type="number"
            value={data.budgetTotal || ''}
            onChange={e => setData({ ...data, budgetTotal: Number(e.target.value) })}
            placeholder="2500"
            className="w-full bg-white/5 border border-border-subtle focus:border-soft-blue/50 rounded-xl pl-10 pr-5 py-3.5 text-white placeholder:text-fog-dim/40 transition-all"
          />
        </div>
      </div>
    </div>
  )
}

const STEP_COMPONENTS = [Step1, Step2, Step3, Step4, Step5]

export default function CreateTripPage() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ name: '', startDate: '', endDate: '', destination: '', mood: '', budgetTotal: '', budgetStyle: '', coverImage: '' })
  const { createTrip } = useTravel()
  const navigate = useNavigate()

  const StepComp = STEP_COMPONENTS[step]

  const canNext = () => {
    if (step === 0) return data.name.trim().length > 0
    if (step === 2) return data.destination.trim().length > 0
    return true
  }

  const handleNext = async () => {
    if (step < STEPS.length - 1) { setStep(step + 1); return }
    const trip = createTrip(data)
    navigate(`/trips/${trip.id}/itinerary`)
  }

  return (
    <div className="max-w-xl mx-auto w-full py-12">
      <StepIndicator current={step} total={STEPS.length} steps={STEPS} />

      <AnimatePresence mode="wait">
        <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[300px]"
              >
                <StepComp data={data} setData={setData} />
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border-subtle">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="flex items-center gap-2 px-4 py-2.5 text-fog-dim hover:text-fog disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-fog-dim">{step + 1} of {STEPS.length}</span>
                <motion.button
                  whileHover={{ scale: canNext() ? 1.02 : 1 }}
                  whileTap={{ scale: canNext() ? 0.98 : 1 }}
                  onClick={handleNext}
                  disabled={!canNext()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-soft-blue hover:bg-soft-blue/90 text-matte-black font-semibold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-blue"
                >
                  {step === STEPS.length - 1 ? 'Create Trip' : 'Continue'}
                  <ArrowRight size={14} />
                </motion.button>
              </div>
            </div>
    </div>
  )
}
