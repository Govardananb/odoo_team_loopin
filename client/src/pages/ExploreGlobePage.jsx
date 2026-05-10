import { useState, useRef, useEffect } from 'react'
import Globe from 'react-globe.gl'
import { Search, Compass, Plus, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'

const RECOMMENDATIONS = [
  { name: 'Paris', lat: '48.8566', lon: '2.3522', display_name: 'Paris, France' },
  { name: 'Tokyo', lat: '35.6895', lon: '139.6917', display_name: 'Tokyo, Japan' },
  { name: 'New York', lat: '40.7128', lon: '-74.0060', display_name: 'New York, USA' },
  { name: 'Sydney', lat: '-33.8688', lon: '151.2093', display_name: 'Sydney, Australia' },
]

export default function ExploreGlobePage() {
  const globeRef = useRef()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [arcsData, setArcsData] = useState([])
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight - 56 })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth - (window.innerWidth >= 768 ? 256 : 0),
        height: window.innerHeight - 56
      })
    }
    window.addEventListener('resize', handleResize)
    handleResize() // Initial call
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery) return
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setResults(data)
      if (data.length > 0) {
        const first = data[0]
        handleSelectPlace(first)
      }
    } catch (err) {
      console.error('Search failed:', err)
    }
  }

  const handleSelectPlace = (place) => {
    setSelectedPlace(place)
    const lat = parseFloat(place.lat)
    const lon = parseFloat(place.lon)
    
    // Point camera to location
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat, lng: lon, altitude: 1.5 }, 1000)
    }
    
    // Add arc from previous location to new location
    if (selectedPlace) {
      setArcsData([...arcsData, {
        startLat: parseFloat(selectedPlace.lat),
        startLng: parseFloat(selectedPlace.lon),
        endLat: lat,
        endLng: lon,
        color: ['#6EA8FE', '#D9C3A5']
      }])
    }
  }

  useEffect(() => {
    // Initial position
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 })
    }
  }, [])

  const handleZoom = (direction) => {
    if (!globeRef.current) return
    const pov = globeRef.current.pointOfView()
    const newAlt = direction === 'in' ? pov.altitude * 0.8 : pov.altitude * 1.2
    globeRef.current.pointOfView({ ...pov, altitude: newAlt }, 500)
  }

  return (
    <PageTransition>
      <div className="relative w-full h-[calc(100vh-56px)] bg-matte-black overflow-hidden">
        {/* Search Bar */}
        <div className="absolute top-6 left-6 z-10 w-full max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter a place to explore..."
              className="w-full bg-charcoal border border-border-subtle focus:border-soft-blue/50 rounded-xl pl-12 pr-4 py-3.5 text-off-white placeholder:text-fog-dim/40 transition-all duration-200"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog-dim" />
          </form>
          
          {/* Results List */}
          {results.length > 0 && (
            <div className="mt-2 bg-charcoal border border-border-subtle rounded-xl overflow-hidden shadow-lg">
              {results.slice(0, 5).map(r => (
                <div
                  key={r.place_id}
                  onClick={() => handleSelectPlace(r)}
                  className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-fog border-b border-border-subtle last:border-0"
                >
                  {r.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Globe */}
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
          labelsData={selectedPlace ? [selectedPlace] : []}
          labelText={d => d.display_name.split(',')[0]}
          labelLat={d => parseFloat(d.lat)}
          labelLng={d => parseFloat(d.lon)}
          labelColor={() => '#6EA8FE'}
          labelSize={1.5}
          labelDotRadius={0.5}
        />

        {/* Floating Card */}
        {selectedPlace && (
          <div className="absolute bottom-6 left-6 z-10 w-full max-w-sm glass-card p-6 space-y-4">
            <div>
              <h3 className="font-display text-xl font-semibold text-off-white">
                {selectedPlace.display_name.split(',')[0]}
              </h3>
              <p className="text-sm text-fog-dim mt-1">
                {selectedPlace.display_name.split(',').slice(1, 3).join(',')}
              </p>
            </div>
            
            <div className="flex justify-between items-center text-sm text-fog">
              <span>Lat: {parseFloat(selectedPlace.lat).toFixed(2)}</span>
              <span>Lon: {parseFloat(selectedPlace.lon).toFixed(2)}</span>
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 bg-soft-blue text-matte-black font-semibold text-sm py-3 rounded-xl hover:bg-soft-blue/90 transition-all">
              <Plus size={16} />
              Add to Journey
            </button>
          </div>
        )}
        
        {/* Back Button */}
        <Link
          to="/explore"
          className="absolute top-6 right-6 z-10 flex items-center gap-2 px-4 py-2 bg-charcoal border border-border-subtle rounded-xl text-sm text-fog hover:text-off-white transition-all"
        >
          <ArrowLeft size={16} />
          Back to Grid
        </Link>

        {/* Recommendations Panel */}
        <div className="absolute top-20 right-6 z-10 w-full max-w-xs glass-card p-4 space-y-3">
          <h3 className="font-display text-sm font-semibold text-off-white">Recommended</h3>
          <div className="space-y-2">
            {RECOMMENDATIONS.map(place => (
              <div
                key={place.name}
                onClick={() => handleSelectPlace(place)}
                className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-all"
              >
                <Compass size={14} className="text-soft-blue" />
                <div className="text-xs text-fog">{place.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
          <button onClick={() => handleZoom('in')} className="w-10 h-10 bg-charcoal border border-border-subtle rounded-xl flex items-center justify-center text-fog hover:text-off-white">
            <Plus size={16} />
          </button>
          <button onClick={() => handleZoom('out')} className="w-10 h-10 bg-charcoal border border-border-subtle rounded-xl flex items-center justify-center text-fog hover:text-off-white">
            <span className="text-lg font-bold">−</span>
          </button>
        </div>
      </div>
    </PageTransition>
  )
}
