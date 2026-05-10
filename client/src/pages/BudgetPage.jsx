import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Trash2, ArrowLeft, DollarSign, TrendingUp, AlertCircle, Check } from 'lucide-react'
import { useTravel } from '../context/TravelContext'
import { fadeIn, staggerContainer, staggerItem, slideUp } from '../lib/animations'
import PageTransition from '../components/PageTransition'

const EXPENSE_CATEGORIES = ['Accommodation', 'Food', 'Transport', 'Activities', 'Shopping', 'Other']
const CATEGORY_COLORS = {
  Accommodation: '#6EA8FE',
  Food: '#D9C3A5',
  Transport: '#6EE7B7',
  Activities: '#A78BFA',
  Shopping: '#FCA5A5',
  Other: '#6B7280',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <div className="text-white font-medium">{payload[0].name}</div>
      <div className="text-fog-dim">${payload[0].value?.toFixed(0)}</div>
    </div>
  )
}

function AddExpenseModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ category: 'Food', description: '', amount: '' })
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-matte-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="relative glass-card rounded-modal w-full max-w-md p-6 space-y-4"
      >
        <h3 className="font-display text-lg font-semibold text-white">Add Expense</h3>
        <div className="space-y-3">
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full bg-white/5 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white"
            style={{ colorScheme: 'dark' }}
          >
            {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Description..."
            className="w-full bg-white/5 border border-border-subtle focus:border-soft-blue/40 rounded-xl px-4 py-3 text-sm text-white placeholder:text-fog-dim/40"
          />
          <div className="relative">
            <DollarSign size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog-dim/50" />
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              className="w-full bg-white/5 border border-border-subtle focus:border-soft-blue/40 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder:text-fog-dim/40"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border-subtle text-fog-dim text-sm hover:text-fog">Cancel</button>
          <button
            onClick={() => { onAdd({ ...form, amount: Number(form.amount), date: new Date().toISOString().split('T')[0] }); onClose() }}
            disabled={!form.amount || Number(form.amount) <= 0}
            className="flex-1 py-2.5 rounded-xl bg-soft-blue text-matte-black font-semibold text-sm disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function BudgetPage() {
  const { id } = useParams()
  const { getTripById, addExpense, deleteExpense } = useTravel()
  const trip = getTripById(id)
  const [showAddModal, setShowAddModal] = useState(false)

  if (!trip) return <div className="min-h-screen bg-matte-black flex items-center justify-center"><p className="text-fog-dim">Trip not found.</p></div>

  const expenses = trip.expenses || []
  const total = trip.budgetTotal || 0
  const spent = trip.budgetSpent || 0
  const remaining = Math.max(0, total - spent)
  const spentPct = total ? Math.min((spent / total) * 100, 100) : 0
  const isOverBudget = spent > total && total > 0

  // Pie chart data
  const categoryTotals = EXPENSE_CATEGORIES.reduce((acc, cat) => {
    const catTotal = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
    if (catTotal > 0) acc.push({ name: cat, value: catTotal })
    return acc
  }, [])

  // Area chart - daily spend (mock)
  const dailyData = expenses.reduce((acc, e) => {
    const day = e.date || ''
    const existing = acc.find(d => d.date === day)
    if (existing) existing.amount += e.amount
    else acc.push({ date: day, amount: e.amount })
    return acc
  }, []).sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({ ...d, date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }))

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <motion.div {...fadeIn} className="flex items-center justify-between mb-8">
            <div>
              <Link to={`/trips/${id}/itinerary`} className="flex items-center gap-1.5 text-fog-dim hover:text-fog text-xs mb-3 transition-colors">
                <ArrowLeft size={12} />
                Itinerary
              </Link>
              <h1 className="font-display text-hero font-semibold text-white">Budget Tracker</h1>
              <p className="text-fog-dim text-sm mt-1">{trip.name} · {trip.destination}</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-soft-blue/15 hover:bg-soft-blue/25 border border-soft-blue/25 rounded-xl text-soft-blue text-sm font-medium transition-all"
            >
              <Plus size={13} />
              Add Expense
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            {[
              { label: 'Total Budget', value: `$${total.toLocaleString()}`, color: 'text-white', icon: DollarSign, sub: 'Trip budget' },
              { label: 'Spent', value: `$${spent.toLocaleString()}`, color: isOverBudget ? 'text-red-400' : 'text-warm-beige', icon: TrendingUp, sub: `${spentPct.toFixed(0)}% of budget` },
              { label: 'Remaining', value: `$${remaining.toLocaleString()}`, color: remaining < total * 0.2 ? 'text-red-400' : 'text-soft-blue', icon: Check, sub: isOverBudget ? '⚠ Over budget' : 'Available' },
            ].map(stat => (
              <motion.div
                key={stat.label}
                variants={staggerItem}
                className="p-5 rounded-2xl border border-border-subtle bg-charcoal"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center">
                    <stat.icon size={13} className="text-fog-dim" />
                  </div>
                  <span className="text-xs text-fog-dim">{stat.label}</span>
                </div>
                <div className={`font-display text-2xl font-semibold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-xs text-fog-dim">{stat.sub}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Budget bar */}
          <div className="mb-8 p-5 rounded-2xl border border-border-subtle bg-charcoal">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-fog">Budget Usage</span>
              <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-400' : 'text-fog'}`}>
                {spentPct.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(spentPct, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: isOverBudget ? '#FCA5A5' : spentPct > 70 ? '#D9C3A5' : '#6EA8FE' }}
              />
            </div>
          </div>

          {/* Charts */}
          {categoryTotals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Donut chart */}
              <motion.div {...slideUp} className="p-5 rounded-2xl border border-border-subtle bg-charcoal">
                <h3 className="font-display text-sm font-semibold text-white mb-4">Spending by Category</h3>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={categoryTotals} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value" strokeWidth={0}>
                        {categoryTotals.map(entry => (
                          <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6B7280'} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {categoryTotals.map(cat => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[cat.name] }} />
                          <span className="text-xs text-fog-dim">{cat.name}</span>
                        </div>
                        <span className="text-xs text-white">${cat.value.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Daily spend chart */}
              {dailyData.length > 1 && (
                <motion.div {...slideUp} className="p-5 rounded-2xl border border-border-subtle bg-charcoal">
                  <h3 className="font-display text-sm font-semibold text-white mb-4">Daily Spending</h3>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={dailyData}>
                      <defs>
                        <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6EA8FE" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6EA8FE" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="amount" stroke="#6EA8FE" fill="url(#spendGrad)" strokeWidth={1.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </div>
          )}

          {/* Expense list */}
          <div className="p-5 rounded-2xl border border-border-subtle bg-charcoal">
            <h3 className="font-display text-sm font-semibold text-white mb-4">All Expenses</h3>
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle size={20} className="mx-auto text-fog-dim/40 mb-2" />
                <p className="text-fog-dim text-xs">No expenses logged yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {expenses.map(expense => (
                  <motion.div
                    key={expense.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: CATEGORY_COLORS[expense.category] || '#6B7280' }}
                      />
                      <div>
                        <div className="text-sm text-white">{expense.description || expense.category}</div>
                        <div className="text-xs text-fog-dim">{expense.category} · {expense.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-white">${expense.amount.toLocaleString()}</span>
                      <button
                        onClick={() => deleteExpense(id, expense.id)}
                        className="p-1 rounded-xl text-fog-dim/30 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <AddExpenseModal
          onAdd={(exp) => addExpense(id, exp)}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </PageTransition>
  )
}
