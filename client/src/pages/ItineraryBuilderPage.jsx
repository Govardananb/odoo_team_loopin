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
import { Plus, MapPin, GripVertical, Trash2, Clock, ChevronDown, ChevronRight, ArrowLeft, Eye, DollarSign, Search, Check } from 'lucide-react'
import { useTravel } from '../context/TravelContext'
import { staggerItem, fadeIn } from '../lib/animations'
import PageTransition from '../components/PageTransition'
import Globe from 'react-globe.gl'

const RECOMMENDATIONS = [
  { name: 'Chennai', lat: '13.0827', lon: '80.2707', display_name: 'Chennai, Tamil Nadu' },
  { name: 'Pondicherry', lat: '11.9416', lon: '79.8083', display_name: 'Puducherry, India' },
  { name: 'Mahabalipuram', lat: '12.6269', lon: '80.1927', display_name: 'Mahabalipuram, Tamil Nadu' },
  { name: 'Delhi', lat: '28.6139', lon: '77.2090', display_name: 'Delhi, India' },
  { name: 'Jaipur', lat: '26.9124', lon: '75.7873', display_name: 'Jaipur, Rajasthan' },
]

function SortableStop({ stop, onDelete }) {
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
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [activeDay, setActiveDay] = useState(1)
  const [dimensions, setDimensions] = useState({ width: window.innerWidth * 0.66, height: window.innerHeight - 56 })
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')

  const handlePlanRoute = async () => {
    if (!fromLocation || !toLocation) return
    try {
      const fromRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fromLocation)}`)
      const fromData = await fromRes.json()
      
      const toRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(toLocation)}`)
      const toData = await toRes.json()
      
      if (fromData[0] && toData[0]) {
        const fromStop = {
          id: `stop-${Date.now()}-from`,
          dayNumber: 1,
          placeName: fromData[0].display_name.split(',')[0],
          lat: fromData[0].lat,
          lon: fromData[0].lon,
          notes: 'Starting Point'
        }
        const toStop = {
          id: `stop-${Date.now()}-to`,
          dayNumber: tripDays,
          placeName: toData[0].display_name.split(',')[0],
          lat: toData[0].lat,
          lon: toData[0].lon,
          notes: 'Destination'
        }
        
        updateTrip(id, { stops: [fromStop, ...stops, toStop] })
        
        if (globeRef.current) {
          globeRef.current.pointOfView({ lat: parseFloat(fromData[0].lat), lng: parseFloat(fromData[0].lon), altitude: 1.5 }, 1000)
        }
        setFromLocation('')
        setToLocation('')
      }
    } catch (err) {
      console.error('Failed to plan route:', err)
    }
  }

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
    const data = stops.map(s => ({
      ...s,
      lat: parseFloat(s.lat),
      lon: parseFloat(s.lon),
      name: s.placeName
    })).filter(s => s.lat && s.lon)
    
    if (selectedPlace) {
      data.push({
        ...selectedPlace,
        lat: parseFloat(selectedPlace.lat),
        lon: parseFloat(selectedPlace.lon),
        name: selectedPlace.display_name?.split(',')[0] || selectedPlace.name
      })
    }
    return data
  }, [stops, selectedPlace])

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

  const handleSelectPlace = (place) => {
    setSelectedPlace(place)
    setSearchResults([])
    setSearchQuery('')
    
    // Fly to location
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: parseFloat(place.lat), lng: parseFloat(place.lon), altitude: 1.5 }, 1000)
    }
  }

  const handleAddStop = () => {
    if (!selectedPlace) return
    
    const newStop = {
      id: `stop-${Date.now()}`,
      dayNumber: activeDay,
      placeName: selectedPlace.display_name?.split(',')[0] || selectedPlace.name,
      lat: selectedPlace.lat,
      lon: selectedPlace.lon,
      notes: selectedPlace.display_name?.split(',').slice(1, 3).join(',') || ''
    }
    const updatedStops = [...stops, newStop]
    updateTrip(id, { stops: updatedStops })
    setSelectedPlace(null)
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
        <div className="w-96 h-full overflow-y-auto border-r border-border-subtle bg-charcoal p-6 flex flex-col gap-6 no-scrollbar">
          <div>
            <div className="flex justify-between items-center mb-3">
              <Link to="/dashboard" className="flex items-center gap-1.5 text-fog-dim hover:text-fog text-xs transition-colors">
                <ArrowLeft size={12} />
                Dashboard
              </Link>
              <button
                onClick={() => alert('Itinerary saved!')}
                className="text-xs text-soft-blue hover:text-soft-blue/80 font-medium"
              >
                Save
              </button>
            </div>
            <h1 className="font-display text-2xl font-semibold text-off-white">{trip.name}</h1>
            <p className="text-sm text-fog-dim mt-1">{trip.destination}</p>
          </div>

          {/* Route Planner (From/To) */}
          <div className="space-y-3">
            <div className="text-xs text-fog-dim uppercase tracking-wider font-medium">Route Planner</div>
            <div className="space-y-2">
              <input
                type="text"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                placeholder="From (e.g. Chennai)"
                className="w-full bg-white/5 border border-border-subtle focus:border-soft-blue/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-fog-dim/40"
              />
              <input
                type="text"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                placeholder="To (e.g. Pondicherry)"
                className="w-full bg-white/5 border border-border-subtle focus:border-soft-blue/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-fog-dim/40"
              />
              <button
                onClick={handlePlanRoute}
                className="w-full bg-soft-blue text-matte-black font-semibold text-xs py-2.5 rounded-xl hover:bg-soft-blue/90 transition-all"
              >
                Plan Route
              </button>
            </div>
          </div>

          <hr className="border-border-subtle" />

          {/* Quick Adds */}
          <div className="space-y-2">
            <div className="text-xs text-fog-dim uppercase tracking-wider font-medium">Quick Adds</div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {RECOMMENDATIONS.map(place => (
                <button
                  key={place.name}
                  onClick={() => handleSelectPlace(place)}
                  className="px-3 py-1.5 bg-white/5 border border-border-subtle rounded-lg text-xs text-fog hover:text-off-white transition-all"
                >
                  {place.name}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-border-subtle" />

          <div className="text-xs text-fog-dim uppercase tracking-wider font-medium">Select a day to add stops</div>

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
                  const isActive = activeDay === day
                  
                  return (
                    <div
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`space-y-3 p-3 rounded-xl transition-all cursor-pointer ${
                        isActive ? 'bg-white/5 border border-soft-blue/20' : 'border border-transparent hover:border-border-subtle'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`font-display font-semibold text-sm ${isActive ? 'text-soft-blue' : 'text-white'}`}>Day {day}</div>
                          {isActive && <Check size={12} className="text-soft-blue" />}
                        </div>
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
                placeholder="Search places to add..."
                className="w-full bg-charcoal border border-border-subtle focus:border-soft-blue/50 rounded-xl pl-12 pr-4 py-3.5 text-off-white placeholder:text-fog-dim/40 transition-all duration-200"
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog-dim" />
            </form>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-charcoal border border-border-subtle rounded-xl overflow-hidden shadow-lg max-h-60 overflow-y-auto no-scrollbar">
                {searchResults.slice(0, 5).map(r => (
                  <div
                    key={r.place_id}
                    onClick={() => handleSelectPlace(r)}
                    className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-fog border-b border-border-subtle last:border-0 truncate"
                  >
                    {r.display_name}
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
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            bumpScale={0.003}
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
            labelColor={d => d.id === selectedPlace?.place_id ? '#D9C3A5' : '#6EA8FE'}
            labelSize={1.5}
            labelDotRadius={0.5}
          />

          {/* Floating Card for Selected Place */}
          {selectedPlace && (
            <div className="absolute bottom-6 left-6 z-10 w-full max-w-sm glass-card p-6 space-y-4">
              <div>
                <h3 className="font-display text-xl font-semibold text-off-white">
                  {selectedPlace.display_name?.split(',')[0] || selectedPlace.name}
                </h3>
                <p className="text-sm text-fog-dim mt-1">
                  {selectedPlace.display_name?.split(',').slice(1, 3).join(',') || ''}
                </p>
              </div>
              
              <div className="flex justify-between items-center text-sm text-fog">
                <span>Adding to **Day {activeDay}**</span>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="text-xs text-fog-dim hover:text-off-white"
                >
                  Cancel
                </button>
              </div>
              
              <button
                onClick={handleAddStop}
                className="w-full flex items-center justify-center gap-2 bg-soft-blue text-matte-black font-semibold text-sm py-3 rounded-xl hover:bg-soft-blue/90 transition-all"
              >
                <Plus size={16} />
                Add to Itinerary
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
