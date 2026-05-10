import { useTravel } from '../context/TravelContext'
import PageTransition from '../components/PageTransition'
import { motion } from 'framer-motion'
import { slideDown } from '../lib/animations'
import { DollarSign, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function GlobalBudgetPage() {
  const { trips } = useTravel()

  const totalBudget = trips.reduce((acc, t) => acc + (t.budgetTotal || 0), 0)
  const totalSpent = trips.reduce((acc, t) => acc + (t.budgetSpent || 0), 0)
  const pctUsed = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0

  return (
    <PageTransition>
      <div className="pt-28 pb-12 px-6">
        <div className="max-max-w-7xl mx-auto">
          <motion.div {...slideDown}>
            <p className="text-warm-beige text-xs uppercase tracking-[0.2em] font-medium mb-3">Financials</p>
            <h1 className="font-display text-hero font-semibold text-off-white mb-4">
              Budget Summary
            </h1>
          </motion.div>

          {/* Summary Card */}
          <div className="glass-card p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-fog-dim uppercase tracking-wider mb-1">Total Budget</div>
              <div className="text-2xl font-display font-semibold text-off-white">${totalBudget.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-fog-dim uppercase tracking-wider mb-1">Total Spent</div>
              <div className="text-2xl font-display font-semibold text-off-white">${totalSpent.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-fog-dim uppercase tracking-wider mb-1">Budget Used</div>
              <div className="text-2xl font-display font-semibold text-off-white">{pctUsed}%</div>
              <div className="w-full bg-white/5 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-soft-blue h-full" style={{ width: `${pctUsed}%` }} />
              </div>
            </div>
          </div>

          {/* Trips List */}
          <h2 className="font-display text-xl font-semibold text-off-white mb-4">Breakdown by Trip</h2>
          <div className="space-y-4">
            {trips.map(trip => {
              const tripPct = trip.budgetTotal ? Math.round((trip.budgetSpent / trip.budgetTotal) * 100) : 0
              return (
                <div key={trip.id} className="bg-charcoal border border-border-subtle hover:border-border-hover rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                  <div className="flex-1">
                    <h3 className="font-display text-base font-semibold text-off-white">{trip.name}</h3>
                    <p className="text-xs text-fog-dim mt-1">{trip.destination}</p>
                  </div>
                  
                  <div className="w-full md:w-64 space-y-1">
                    <div className="flex justify-between text-xs text-fog">
                      <span>${trip.budgetSpent?.toLocaleString()} spent</span>
                      <span>${trip.budgetTotal?.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${tripPct > 90 ? 'bg-red-400' : 'bg-soft-blue'}`} style={{ width: `${tripPct}%` }} />
                    </div>
                  </div>
                  
                  <Link
                    to={`/trips/${trip.id}/budget`}
                    className="flex items-center gap-1.5 text-xs text-soft-blue hover:text-soft-blue/80 font-medium"
                  >
                    Details
                    <ArrowRight size={12} />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
