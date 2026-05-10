import { createContext, useContext, useState, useCallback } from 'react'
import { MOCK_TRIPS } from '../lib/mockData'

const TravelContext = createContext(null)

export function TravelProvider({ children }) {
  const [user, setUser] = useState(null)
  const [trips, setTrips] = useState(MOCK_TRIPS)
  const [activeTrip, setActiveTrip] = useState(null)
  const [theme, setTheme] = useState('dark')

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('dark', next === 'dark')
      document.documentElement.classList.toggle('light', next === 'light')
      return next
    })
  }, [])

  const login = useCallback((userData) => {
    setUser({ id: 'u1', name: userData.name || 'Traveller', email: userData.email, avatar: null })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const createTrip = useCallback((tripData) => {
    const newTrip = {
      id: `trip-${Date.now()}`,
      ...tripData,
      budgetSpent: 0,
      status: 'planning',
      stops: [],
      expenses: [],
      coverImage: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80`,
    }
    setTrips(prev => [newTrip, ...prev])
    return newTrip
  }, [])

  const updateTrip = useCallback((tripId, updates) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, ...updates } : t))
  }, [])

  const deleteTrip = useCallback((tripId) => {
    setTrips(prev => prev.filter(t => t.id !== tripId))
  }, [])

  const addStop = useCallback((tripId, stopData) => {
    const newStop = { id: `s-${Date.now()}`, ...stopData, position: Date.now() }
    setTrips(prev => prev.map(t =>
      t.id === tripId ? { ...t, stops: [...(t.stops || []), newStop] } : t
    ))
    return newStop
  }, [])

  const reorderStops = useCallback((tripId, newStops) => {
    setTrips(prev => prev.map(t =>
      t.id === tripId ? { ...t, stops: newStops } : t
    ))
  }, [])

  const addExpense = useCallback((tripId, expense) => {
    const newExpense = { id: `e-${Date.now()}`, ...expense }
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t
      const newSpent = (t.budgetSpent || 0) + expense.amount
      return { ...t, expenses: [...(t.expenses || []), newExpense], budgetSpent: newSpent }
    }))
  }, [])

  const deleteExpense = useCallback((tripId, expenseId) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t
      const exp = t.expenses.find(e => e.id === expenseId)
      const newSpent = Math.max(0, (t.budgetSpent || 0) - (exp?.amount || 0))
      return { ...t, expenses: t.expenses.filter(e => e.id !== expenseId), budgetSpent: newSpent }
    }))
  }, [])

  const getTripById = useCallback((id) => trips.find(t => t.id === id), [trips])

  return (
    <TravelContext.Provider value={{
      user, login, logout,
      trips, activeTrip, setActiveTrip,
      createTrip, updateTrip, deleteTrip,
      addStop, reorderStops,
      addExpense, deleteExpense,
      getTripById,
      theme, toggleTheme,
    }}>
      {children}
    </TravelContext.Provider>
  )
}

export function useTravel() {
  const ctx = useContext(TravelContext)
  if (!ctx) throw new Error('useTravel must be used within TravelProvider')
  return ctx
}
