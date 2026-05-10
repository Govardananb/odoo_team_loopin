import { useState, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, GripVertical, Trash2, ArrowLeft, Search, Check, MapPin } from 'lucide-react'
import { useTravel } from '../context/TravelContext'
import PageTransition from '../components/PageTransition'
import { slideDown, fadeIn } from '../lib/animations'
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

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

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [activeDay, setActiveDay] = useState(1)

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

  const mapCenter = useMemo(() => {
    if (stops.length > 0 && stops[0].lat && stops[0].lon) {
      return [parseFloat(stops[0].lat), parseFloat(stops[0].lon)]
    }
    return [20.5937, 78.9629] // Default to India
  }, [stops])

  const polylinePath = useMemo(() => {
    return stops.map(s => [parseFloat(s.lat), parseFloat(s.lon)]).filter(p => !isNaN(p[0]) && !isNaN(p[1]))
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

  const handleAddStop = (place) => {
    const newStop = {
      id: `stop-${Date.now()}`,
      dayNumber: activeDay,
      placeName: place.display_name.split(',')[0],
      lat: place.lat,
      lon: place.lon,
      notes: place.display_name.split(',').slice(1, 3).join(',')
    }
    const updatedStops = [...stops, newStop]
    updateTrip(id, { stops: updatedStops })
    setSearchResults([])
    setSearchQuery('')
  }

  if (!trip) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-fog-dim">Trip not found.</p>
    </div>
  )

  return (
    <PageTransition>
      <div className="pt-28 pb-12 px-6 bg-matte-black min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Link to="/dashboard" className="flex items-center gap-1.5 text-fog-dim hover:text-fog text-xs transition-colors">
              <ArrowLeft size={12} />
              Back to Dashboard
            </Link>
            <button
              onClick={() => alert('Itinerary saved!')}
              className="text-xs text-soft-blue hover:text-soft-blue/80 font-medium"
            >
              Save Itinerary
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Map & Info */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-border-subtle bg-charcoal relative z-0">
                <MapContainer center={mapCenter} zoom={5} style={{ width: '100%', height: '100%' }} zoomControl={false}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  {stops.map(s => (
                    s.lat && s.lon && (
                      <Marker key={s.id} position={[parseFloat(s.lat), parseFloat(s.lon)]}>
                        <Popup>
                          <div className="text-xs font-semibold">{s.placeName}</div>
                        </Popup>
                      </Marker>
                    )
                  ))}
                  <Polyline positions={polylinePath} color="#6EA8FE" weight={2} />
                </MapContainer>
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold text-off-white">{trip.name}</h1>
                <p className="text-sm text-fog-dim mt-1">{trip.destination}</p>
              </div>
              
              <div className="text-xs text-fog-dim uppercase tracking-wider font-medium mt-6">Select a day to add stops</div>
              <div className="space-y-1">
                {allDays.map(day => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all flex justify-between items-center ${
                      activeDay === day
                        ? 'bg-soft-blue/10 border border-soft-blue/30 text-soft-blue'
                        : 'border border-transparent hover:border-border-subtle text-fog-dim hover:text-off-white'
                    }`}
                  >
                    <span className="text-sm font-medium">Day {day}</span>
                    {activeDay === day && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Timeline & Search (Takes up 2 columns) */}
            <div className="md:col-span-2 space-y-6">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search places to add to Day ${activeDay}...`}
                  className="w-full bg-charcoal border border-border-subtle focus:border-soft-blue/50 rounded-xl pl-12 pr-4 py-3.5 text-off-white placeholder:text-fog-dim/40 transition-all duration-200"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog-dim" />
              </form>

              {/* Search Results */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    {...fadeIn}
                    className="bg-charcoal border border-border-subtle rounded-xl overflow-hidden shadow-lg max-h-60 overflow-y-auto no-scrollbar"
                  >
                    {searchResults.slice(0, 5).map(r => (
                      <div
                        key={r.place_id}
                        onClick={() => handleAddStop(r)}
                        className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-fog border-b border-border-subtle last:border-0 flex justify-between items-center"
                      >
                        <span className="truncate">{r.display_name}</span>
                        <span className="text-xs text-soft-blue ml-2 shrink-0">Add to Day {activeDay}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Timeline */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="space-y-6">
                  {allDays.map(day => {
                    const dayStops = stops.filter(s => s.dayNumber === day)
                    if (day !== activeDay && dayStops.length === 0) return null // Hide empty inactive days to save space
                    
                    return (
                      <div key={day} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className={`text-sm font-semibold ${day === activeDay ? 'text-soft-blue' : 'text-white'}`}>
                            Day {day}
                          </div>
                          <span className="text-xs text-fog-dim">{dayStops.length} stops</span>
                        </div>
                        
                        <SortableContext items={dayStops.map(s => s.id)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-2">
                            {dayStops.map(stop => (
                              <SortableStop key={stop.id} stop={stop} onDelete={handleDeleteStop} />
                            ))}
                            {dayStops.length === 0 && day === activeDay && (
                              <div className="text-xs text-fog-dim/50 border border-dashed border-border-subtle rounded-xl p-4 text-center">
                                Search for a place to add to Day {day}
                              </div>
                            )}
                          </div>
                        </SortableContext>
                      </div>
                    )
                  })}
                </div>
              </DndContext>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
