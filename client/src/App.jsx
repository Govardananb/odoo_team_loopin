import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { TravelProvider, useTravel } from './context/TravelContext'

import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import CreateTripPage from './pages/CreateTripPage'
import ExplorePage from './pages/ExplorePage'
import ExploreGlobePage from './pages/ExploreGlobePage'
import ItineraryBuilderPage from './pages/ItineraryBuilderPage'
import ActivityExplorerPage from './pages/ActivityExplorerPage'
import BudgetPage from './pages/BudgetPage'
import ItineraryViewerPage from './pages/ItineraryViewerPage'
import SharedItineraryPage from './pages/SharedItineraryPage'
import Layout from './components/Layout'
import TripsPage from './pages/TripsPage'
import GlobalBudgetPage from './pages/GlobalBudgetPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children }) {
  const { user } = useTravel()
  // For demo, bypass auth if visiting dashboard directly
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/share/:shareId" element={<SharedItineraryPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/globe" element={<ExploreGlobePage />} />
          <Route path="/trips/new" element={<CreateTripPage />} />
          <Route path="/trips/:id/itinerary" element={<ItineraryBuilderPage />} />
          <Route path="/trips/:id/activities" element={<ActivityExplorerPage />} />
          <Route path="/trips/:id/budget" element={<BudgetPage />} />
          <Route path="/trips/:id/view" element={<ItineraryViewerPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/budget" element={<GlobalBudgetPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <TravelProvider>
        <AppRoutes />
      </TravelProvider>
    </BrowserRouter>
  )
}
