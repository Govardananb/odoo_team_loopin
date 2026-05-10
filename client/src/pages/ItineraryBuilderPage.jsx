import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragOverlay
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, MapPin, GripVertical, Trash2, Clock, ChevronDown, ChevronRight, ArrowLeft, Eye, DollarSign, Search } from 'lucide-react'
import { useTravel } from '../context/TravelContext'
import { staggerItem, fadeIn } from '../lib/animations'
import PageTransition from '../components/PageTransition'
import Globe from 'react-globe.gl'

function SortableStop({ stop, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
        isDragging
          ? 'border-soft-blue/40 bg-soft-blue/5'
          : 'border-border-subtle bg-charcoal-light hover:border-border-hover'
      }`}>
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-fog-dim/30 hover:text-fog-dim cursor-grab active:cursor-grabbing touch-none p-0.5"
        >
          <GripVertical size={14} />
        </button>
        <div className="w-2 h-2 rounded-full bg-soft-blue mt-1.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-medium text-white text-sm">{stop.placeName}</div>
              {stop.notes && <p className="text-xs text-fog-dim mt-0.5 truncate">{stop.notes}</p>}
            </div>
            <button
              onClick={() => onDelete(stop.id)}
              className="text-fog-dim/30 hover:text-red-400 p-1 rounded-lg hover:bg-white/5 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ItineraryBuilderPage() {
  const { id } = useParams()
  const { getTripById, updateTrip } = useTravel()
  const trip = getTripById(id)
  const globeRef = useRef()

  const [activeId, setActiveId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [dimensions, setDimensions] = useState({ width: window.innerWidth * 0.66, height: window.innerHeight - 56 })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth >= 768 ? window.innerWidth - 384 : window.innerWidth, // 384px is w-96
        height: window.innerHeight - 56
      })
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const stops = trip?.stops || []
  const days = [...new Set(stops.map(s => s.dayNumber))].sort((a, b) => a - b)
  const tripDays = trip?.startDate && trip?.endDate
    ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) + 1
    : days.length || 1
  const allDays = days.length > 0 ? days : Array.from({ length: tripDays }, (_, i) => i + 1)

  // Generate arcs between consecutive stops
  const arcsData = useMemo(() => {
    const arcs = []
    for (let i = 0; i < stops.length - 1; i++) {
      const start = stops[i]
      const end = stops[i + 1]
      if (start.lat && start.lon && end.lat && end.lon) {
        arcs.push({
          startLat: parseFloat(start.lat),
          startLng: parseFloat(start.lon),
          endLat: parseFloat(end.lat),
          endLng: parseFloat(end.lon),
          color: ['#6EA8FE', '#D9C3A5']
        })
      }
    }
    return arcs
  }, [stops])

  // Generate labels for stops
  const labelsData = useMemo(() => {
    return stops.map(s => ({
      ...s,
      lat: parseFloat(s.lat),
      lon: parseFloat(s.lon),
      name: s.placeName
    })).filter(s => s.lat && s.lon)
  }, [stops])

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = stops.findIndex(s => s.id === active.id)
    const newIndex = stops.findIndex(s => s.id === over.id)

    const updatedStops = arrayMove(stops, oldIndex, newIndex)
    updateTrip(id, { stops: updatedStops })
  }, [id, stops, updateTrip])

  const handleDeleteStop = useCallback((stopId) => {
    const updatedStops = stops.filter(s => s.id !== stopId)
    updateTrip(id, { stops: updatedStops })
  }, [id, stops, updateTrip])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery) return
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data)
    } catch (err) {
      console.error('Search failed:', err)
    }
  }

  const handleAddStop = (place, day) => {
    const newStop = {
      id: `stop-${Date.now()}`,
      dayNumber: day,
      placeName: place.display_name.split(',')[0],
      lat: place.lat,
      lon: place.lon,
      notes: place.display_name.split(',').slice(1, 3).join(',')
    }
    const updatedStops = [...stops, newStop]
    updateTrip(id, { stops: updatedStops })
    setSearchResults([])
    setSearchQuery('')
    
    // Fly to location
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: parseFloat(place.lat), lng: parseFloat(place.lon), altitude: 1.5 }, 1000)
    }
  }

  if (!trip) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-fog-dim">Trip not found.</p>
    </div>
  )

  return (
    <PageTransition>
      <div className="flex pt-[56px] h-[calc(100vh-56px)] overflow-hidden bg-matte-black">
        {/* Sidebar Timeline */}
        <div className="w-96 h-full overflow-y-auto border-r border-border-subtle bg-charcoal p-6 flex flex-col gap-6">
          <div>
            <Link to="/dashboard" className="flex items-center gap-1.5 text-fog-dim hover:text-fog text-xs mb-3 transition-colors">
              <ArrowLeft size={12} />
              Dashboard
            </Link>
            <h1 className="font-display text-2xl font-semibold text-off-white">{trip.name}</h1>
            <p className="text-sm text-fog-dim mt-1">{trip.destination}</p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={e => setActiveId(e.active.id)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-6">
                {allDays.map(day => {
                  const dayStops = stops.filter(s => s.dayNumber === day)
                  return (
                    <div key={day} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="font-display font-semibold text-white text-sm">Day {day}</div>
                        <span className="text-xs text-fog-dim">{dayStops.length} stops</span>
                      </div>
                      
                      <div className="space-y-2">
                        {dayStops.map(stop => (
                          <SortableStop key={stop.id} stop={stop} onDelete={handleDeleteStop} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Main Globe Area */}
        <div className="flex-1 h-full relative">
          {/* Floating Search Bar */}
          <div className="absolute top-6 left-6 z-10 w-full max-w-md">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places to add to itinerary..."
                className="w-full bg-charcoal border border-border-subtle focus:border-soft-blue/50 rounded-xl pl-12 pr-4 py-3.5 text-off-white placeholder:text-fog-dim/40 transition-all duration-200"
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog-dim" />
            </form>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-charcoal border border-border-subtle rounded-xl overflow-hidden shadow-lg">
                {searchResults.slice(0, 5).map(r => (
                  <div
                    key={r.place_id}
                    className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-fog border-b border-border-subtle last:border-0 flex justify-between items-center"
                  >
                    <div className="truncate flex-1">{r.display_name}</div>
                    <div className="flex gap-1 ml-2">
                      {allDays.map(day => (
                        <button
                          key={day}
                          onClick={() => handleAddStop(r, day)}
                          className="px-2 py-1 bg-soft-blue/10 text-soft-blue rounded-md text-xs hover:bg-soft-blue/20"
                        >
                          D{day}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Globe
            ref={globeRef}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            arcsData={arcsData}
            arcColor="color"
            arcDashLength={0.4}
            arcDashGap={4}
            arcDashAnimateTime={1500}
            labelsData={labelsData}
            labelText={d => d.name}
            labelLat={d => d.lat}
            labelLng={d => d.lon}
            labelColor={() => '#6EA8FE'}
            labelSize={1.5}
            labelDotRadius={0.5}
          />
        </div>
      </div>
    </PageTransition>
