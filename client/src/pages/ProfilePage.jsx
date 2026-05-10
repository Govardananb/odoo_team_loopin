import { useTravel } from '../context/TravelContext'
import PageTransition from '../components/PageTransition'
import { motion } from 'framer-motion'
import { slideDown } from '../lib/animations'
import { User, Mail, Calendar, Compass } from 'lucide-react'

export default function ProfilePage() {
  const { user, trips } = useTravel()

  const completedTrips = trips.filter(t => t.status === 'completed').length
  const totalSpent = trips.reduce((acc, t) => acc + (t.budgetSpent || 0), 0)

  return (
    <PageTransition>
      <div className="pt-28 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div {...slideDown}>
            <p className="text-warm-beige text-xs uppercase tracking-[0.2em] font-medium mb-3">Account</p>
            <h1 className="font-display text-hero font-semibold text-off-white mb-4">
              Your Profile
            </h1>
          </motion.div>

          {/* Profile Card */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-border-subtle">
                <User size={32} className="text-fog" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-off-white">{user?.name || 'Traveller'}</h2>
                <p className="text-sm text-fog-dim flex items-center gap-1.5 mt-1">
                  <Mail size={12} />
                  {user?.email || 'no-email@example.com'}
                </p>
              </div>
            </div>

            <hr className="border-border-subtle" />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-border-subtle">
                <div className="text-xs text-fog-dim uppercase tracking-wider mb-1">Total Trips</div>
                <div className="text-2xl font-display font-semibold text-off-white">{trips.length}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-border-subtle">
                <div className="text-xs text-fog-dim uppercase tracking-wider mb-1">Completed</div>
                <div className="text-2xl font-display font-semibold text-off-white">{completedTrips}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-border-subtle col-span-2">
                <div className="text-xs text-fog-dim uppercase tracking-wider mb-1">Total Invested in Travel</div>
                <div className="text-2xl font-display font-semibold text-off-white">${totalSpent.toLocaleString()}</div>
              </div>
            </div>
            
            <button className="w-full bg-white/5 border border-border-subtle text-off-white font-medium text-sm py-3 rounded-xl hover:bg-white/10 transition-all">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
