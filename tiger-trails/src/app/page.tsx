'use client'

import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the map component (Leaflet requires client-side only)
const CampusMap = dynamic(() => import('../components/CampusMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
      <div className="text-center">
        <div className="text-4xl mb-2 animate-bounce">🗺️</div>
        <div style={{ color: '#E77500' }}>Loading map...</div>
      </div>
    </div>
  ),
})

// Princeton colors
const colors = {
  orange: '#E77500',
  black: '#000000',
  cream: '#F7F3E3',
  gold: '#C19A17',
  darkOrange: '#CC6600',
}

interface Location {
  id: string
  name: string
  story: string
  secret: string
  points: number
  lat: number
  lng: number
  icon: string
  hint: string
}

interface VisitedLocation {
  id: string
  photo: string
  timestamp: string
}

// Real Princeton coordinates for each location
const LOCATIONS: Location[] = [
  {
    id: 'fitzrandolph',
    name: 'FitzRandolph Gate',
    story: 'Built in 1905, this iconic entrance marks the ceremonial threshold between Princeton and the world. Tradition holds that students who walk through before graduation will never receive their degree.',
    secret: 'The gate was funded by Augustus FitzRandolph, and legend says his ghost still watches to ensure no student breaks the superstition.',
    points: 150,
    lat: 40.3486,
    lng: -74.6593,
    icon: '🚪',
    hint: 'The main entrance on Nassau Street'
  },
  {
    id: 'blair',
    name: 'Blair Arch',
    story: 'This stunning Gothic arch connects Blair Hall to the campus. Its acoustics are legendary, and generations of a cappella groups have serenaded here.',
    secret: 'At exactly midnight on the winter solstice, if you stand in the center and whisper, your voice echoes seven times—once for each founding college.',
    points: 125,
    lat: 40.3480,
    lng: -74.6612,
    icon: '🏛️',
    hint: 'Between Blair Hall and the train station'
  },
  {
    id: 'prospect',
    name: 'Prospect Garden',
    story: 'These formal gardens behind Prospect House have bloomed since 1849. The flower patterns follow mathematical sequences discovered by Princeton mathematicians.',
    secret: 'Hidden among the roses is a sundial that, on the vernal equinox, casts a shadow pointing directly to where Einstein\'s office once stood.',
    points: 100,
    lat: 40.3463,
    lng: -74.6545,
    icon: '🌸',
    hint: 'Behind the President\'s house'
  },
  {
    id: 'cannon',
    name: 'Cannon Green',
    story: 'This Revolutionary War cannon was buried muzzle-down in 1840 after a fierce rivalry with Rutgers. It marks the symbolic heart of campus.',
    secret: 'The cannon was stolen and re-stolen between Princeton and Rutgers so many times that no one truly knows which university\'s cannon it originally was.',
    points: 175,
    lat: 40.3484,
    lng: -74.6580,
    icon: '💣',
    hint: 'The green space behind Nassau Hall'
  },
  {
    id: 'eastpyne',
    name: 'East Pyne Gargoyles',
    story: 'These grotesque guardians have watched over campus since 1897. Each was carved to represent a different academic vice: sloth, plagiarism, and hubris.',
    secret: 'One gargoyle supposedly moves its eyes at night. Students claim it\'s the one carved to represent "watching without learning."',
    points: 200,
    lat: 40.3488,
    lng: -74.6569,
    icon: '👹',
    hint: 'Look up at East Pyne Hall'
  },
  {
    id: 'holder',
    name: 'Holder Tower',
    story: 'Beneath Holder Hall lies a forgotten crypt from when the building housed a chapel. The tower bells above play the Westminster Quarters.',
    secret: 'The crypt contains a sealed time capsule from 1911, to be opened only when Princeton wins three consecutive football championships against Yale—still waiting.',
    points: 250,
    lat: 40.3475,
    lng: -74.6590,
    icon: '🏰',
    hint: 'The tower with the bells near Rockefeller'
  },
  {
    id: 'dinky',
    name: 'Dinky Station',
    story: 'The Dinky—America\'s shortest scheduled rail line—has connected Princeton to the main rail line since 1865. This is where Einstein caught his train.',
    secret: 'Train conductors say that on foggy mornings, you can still see the silhouette of Einstein walking with his violin case toward the platform.',
    points: 125,
    lat: 40.3435,
    lng: -74.6595,
    icon: '🚂',
    hint: 'The small train station on campus'
  },
  {
    id: 'firestone',
    name: 'Firestone Library',
    story: 'The underground passages connecting Firestone to other campus buildings were built to protect rare books during transport. Miles of tunnels hide beneath the lawn.',
    secret: 'Deep in the tunnels, there\'s supposedly a room containing a first edition of every book ever banned—accessible only to librarians with a special key.',
    points: 225,
    lat: 40.3493,
    lng: -74.6575,
    icon: '📚',
    hint: 'The main library with underground levels'
  }
]

export default function Home() {
  const [visitedLocations, setVisitedLocations] = useState<Map<string, VisitedLocation>>(new Map())
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showCertificate, setShowCertificate] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [showPhotoPreview, setShowPhotoPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('tigerTrails')
    if (saved) {
      const data = JSON.parse(saved)
      if (data.visited) {
        const visitedMap = new Map<string, VisitedLocation>()
        data.visited.forEach((v: VisitedLocation) => {
          visitedMap.set(v.id, v)
        })
        setVisitedLocations(visitedMap)
      }
      setPlayerName(data.playerName || '')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('tigerTrails', JSON.stringify({
      visited: Array.from(visitedLocations.values()),
      playerName
    }))
  }, [visitedLocations, playerName])

  const totalPoints = LOCATIONS.filter(loc => visitedLocations.has(loc.id))
    .reduce((sum, loc) => sum + loc.points, 0)

  const maxPoints = LOCATIONS.reduce((sum, loc) => sum + loc.points, 0)
  const progress = (visitedLocations.size / LOCATIONS.length) * 100

  const handlePhotoCapture = (locationId: string, file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setVisitedLocations(prev => {
        const next = new Map(prev)
        next.set(locationId, {
          id: locationId,
          photo: base64String,
          timestamp: new Date().toISOString()
        })
        return next
      })
    }
    reader.readAsDataURL(file)
  }

  const handleUnvisit = (locationId: string) => {
    setVisitedLocations(prev => {
      const next = new Map(prev)
      next.delete(locationId)
      return next
    })
  }

  const triggerPhotoCapture = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedLocation) {
      handlePhotoCapture(selectedLocation.id, file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const allVisited = visitedLocations.size === LOCATIONS.length

  const handleShowCertificate = () => {
    if (!playerName) {
      setShowNameInput(true)
    } else {
      setShowCertificate(true)
    }
  }

  const getVisitedData = (locationId: string) => visitedLocations.get(locationId)

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location)
    setActiveTab('list') // Switch to list view when opening location details
  }

  return (
    <main className="min-h-screen vintage-scroll" style={{ backgroundColor: colors.cream }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hero Header */}
      <header className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.darkOrange} 100%)` }}>
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-pattern)" />
          </svg>
        </div>
        <div className="relative z-10 px-4 py-8 md:py-12 text-center text-white">
          <div className="text-6xl md:text-7xl mb-4 drop-shadow-lg">🐯</div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-2 drop-shadow-lg">
            Tiger Trails
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-xl mx-auto">
            Explore Princeton's legendary locations. Capture your journey. Earn your stripes.
          </p>
        </div>
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '30px' }}>
            <path d="M0,30 C300,60 900,0 1200,30 L1200,60 L0,60 Z" fill={colors.cream} />
          </svg>
        </div>
      </header>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Progress Card */}
        <div className="mb-6 p-6 bg-white rounded-2xl shadow-lg border-2" style={{ borderColor: `${colors.orange}30` }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold" style={{ color: colors.orange }}>Your Expedition Progress</h2>
              <p className="text-sm" style={{ color: `${colors.black}80` }}>
                {visitedLocations.size === 0
                  ? 'Start your adventure! Visit locations and take photos to prove you were there.'
                  : `${visitedLocations.size} of ${LOCATIONS.length} locations discovered`
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: colors.gold }}>{totalPoints}</div>
                <div className="text-xs" style={{ color: `${colors.black}60` }}>points earned</div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: colors.orange }}>{visitedLocations.size}</div>
                <div className="text-xs" style={{ color: `${colors.black}60` }}>locations</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-4 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.orange}20` }}>
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${colors.orange}, ${colors.gold})`,
              }}
            />
            {/* Progress markers */}
            {LOCATIONS.map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-0.5 bg-white/50"
                style={{ left: `${((i + 1) / LOCATIONS.length) * 100}%` }}
              />
            ))}
          </div>

          {allVisited && (
            <button
              onClick={handleShowCertificate}
              className="mt-4 w-full py-3 px-6 text-white font-bold rounded-xl transition-all hover:scale-[1.02] animate-pulse"
              style={{ background: `linear-gradient(90deg, ${colors.orange}, ${colors.gold})` }}
            >
              🎉 Congratulations! Claim Your Certificate
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === 'map' ? 'text-white shadow-lg' : 'bg-white'
            }`}
            style={{
              backgroundColor: activeTab === 'map' ? colors.orange : undefined,
              color: activeTab !== 'map' ? colors.orange : undefined,
              border: `2px solid ${colors.orange}`,
            }}
          >
            🗺️ Map View
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === 'list' ? 'text-white shadow-lg' : 'bg-white'
            }`}
            style={{
              backgroundColor: activeTab === 'list' ? colors.orange : undefined,
              color: activeTab !== 'list' ? colors.orange : undefined,
              border: `2px solid ${colors.orange}`,
            }}
          >
            📋 List View
          </button>
        </div>

        {/* Map View */}
        {activeTab === 'map' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2" style={{ borderColor: `${colors.orange}30` }}>
            <div className="h-[400px] md:h-[500px]">
              <CampusMap
                locations={LOCATIONS}
                visitedLocations={visitedLocations}
                onSelectLocation={handleSelectLocation}
              />
            </div>
            <div className="p-4 border-t flex items-center justify-between text-sm" style={{ borderColor: `${colors.orange}20` }}>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.orange }} />
                  <span>Undiscovered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.gold }} />
                  <span>Visited</span>
                </div>
              </div>
              <span style={{ color: `${colors.black}60` }}>Tap a marker to view details</span>
            </div>
          </div>
        )}

        {/* List View */}
        {activeTab === 'list' && (
          <div className="grid md:grid-cols-2 gap-4">
            {LOCATIONS.map((location) => {
              const isVisited = visitedLocations.has(location.id)
              const visitData = getVisitedData(location.id)
              return (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className="p-4 rounded-2xl text-left transition-all hover:scale-[1.01] hover:shadow-lg bg-white border-2"
                  style={{
                    borderColor: isVisited ? colors.gold : `${colors.orange}30`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    {isVisited && visitData?.photo ? (
                      <div
                        className="w-16 h-16 rounded-xl bg-cover bg-center flex-shrink-0 border-2"
                        style={{
                          backgroundImage: `url(${visitData.photo})`,
                          borderColor: colors.gold
                        }}
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                        style={{ backgroundColor: `${colors.orange}15` }}
                      >
                        {location.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold truncate" style={{ color: isVisited ? colors.gold : colors.orange }}>
                          {location.name}
                        </h3>
                        {isVisited && <span style={{ color: colors.gold }}>✓</span>}
                      </div>
                      <p className="text-sm mb-2 line-clamp-2" style={{ color: `${colors.black}70` }}>
                        {location.hint}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor: isVisited ? `${colors.gold}20` : `${colors.orange}15`,
                            color: isVisited ? colors.gold : colors.orange
                          }}
                        >
                          {isVisited ? '📸 Photo captured' : `${location.points} pts`}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Location Details Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50" onClick={() => setSelectedLocation(null)}>
          <div
            className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header image/pattern */}
            <div
              className="h-32 relative"
              style={{ background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.gold} 100%)` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl drop-shadow-lg">{selectedLocation.icon}</span>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white text-xl flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                ×
              </button>
              <div
                className="absolute bottom-0 right-4 px-4 py-2 rounded-t-xl font-bold text-white"
                style={{ backgroundColor: colors.gold }}
              >
                {selectedLocation.points} pts
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold mb-1" style={{ color: colors.orange }}>
                {selectedLocation.name}
              </h3>
              <p className="text-sm mb-4" style={{ color: `${colors.black}60` }}>
                📍 {selectedLocation.hint}
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: `${colors.cream}` }}>
                  <h4 className="font-bold flex items-center gap-2 mb-2" style={{ color: colors.black }}>
                    📖 The Story
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: `${colors.black}cc` }}>
                    {selectedLocation.story}
                  </p>
                </div>

                <div className="p-4 rounded-xl border-l-4" style={{ backgroundColor: `${colors.orange}10`, borderColor: colors.orange }}>
                  <h4 className="font-bold flex items-center gap-2 mb-2" style={{ color: colors.orange }}>
                    🔮 The Secret
                  </h4>
                  <p className="text-sm italic leading-relaxed" style={{ color: `${colors.black}cc` }}>
                    {selectedLocation.secret}
                  </p>
                </div>

                {/* Photo Section */}
                {visitedLocations.has(selectedLocation.id) && getVisitedData(selectedLocation.id)?.photo && (
                  <div>
                    <h4 className="font-bold flex items-center gap-2 mb-2" style={{ color: colors.gold }}>
                      📸 Your Photo Proof
                    </h4>
                    <div
                      className="relative rounded-xl overflow-hidden cursor-pointer group"
                      onClick={() => setShowPhotoPreview(getVisitedData(selectedLocation.id)?.photo || null)}
                    >
                      <img
                        src={getVisitedData(selectedLocation.id)?.photo}
                        alt={`Photo at ${selectedLocation.name}`}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-lg font-bold">
                          View Full Size
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                        {new Date(getVisitedData(selectedLocation.id)?.timestamp || '').toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  {visitedLocations.has(selectedLocation.id) ? (
                    <>
                      <div
                        className="flex-1 py-4 px-4 font-bold rounded-xl text-center text-lg"
                        style={{ backgroundColor: `${colors.gold}20`, color: colors.gold }}
                      >
                        ✓ Location Discovered!
                      </div>
                      <button
                        onClick={() => handleUnvisit(selectedLocation.id)}
                        className="py-4 px-4 rounded-xl hover:bg-red-50 transition-colors"
                        style={{ color: '#666' }}
                      >
                        🗑️
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={triggerPhotoCapture}
                      className="flex-1 py-4 px-4 text-white font-bold rounded-xl hover:opacity-90 transition-all text-lg shadow-lg flex items-center justify-center gap-2"
                      style={{ background: `linear-gradient(90deg, ${colors.orange}, ${colors.gold})` }}
                    >
                      📷 Take Photo to Verify
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {showPhotoPreview && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[60]"
          onClick={() => setShowPhotoPreview(null)}
        >
          <img
            src={showPhotoPreview}
            alt="Photo preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
          <button
            onClick={() => setShowPhotoPreview(null)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 text-white text-2xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Name Input Modal */}
      {showNameInput && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold" style={{ color: colors.orange }}>
                Almost There!
              </h3>
              <p style={{ color: `${colors.black}70` }}>
                Enter your name for your official certificate
              </p>
            </div>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name..."
              className="w-full px-4 py-4 rounded-xl border-2 outline-none mb-4 text-lg"
              style={{ borderColor: `${colors.orange}40` }}
              onFocus={(e) => e.target.style.borderColor = colors.orange}
              onBlur={(e) => e.target.style.borderColor = `${colors.orange}40`}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNameInput(false)}
                className="flex-1 py-3 px-4 rounded-xl font-medium transition-colors"
                style={{ backgroundColor: `${colors.black}10` }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (playerName.trim()) {
                    setShowNameInput(false)
                    setShowCertificate(true)
                  }
                }}
                className="flex-1 py-3 px-4 text-white font-bold rounded-xl transition-all"
                style={{ background: `linear-gradient(90deg, ${colors.orange}, ${colors.gold})` }}
              >
                Get Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-auto">
          <div className="certificate max-w-2xl w-full my-8 bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div
              className="p-8 text-center text-white relative"
              style={{ background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.gold} 100%)` }}
            >
              <button
                onClick={() => setShowCertificate(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white text-xl flex items-center justify-center hover:bg-white/30"
              >
                ×
              </button>
              <div className="text-6xl mb-4">🐯</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Certificate of Completion
              </h2>
              <div className="text-xl opacity-90">Tiger Trails Explorer</div>
            </div>

            <div className="p-8 text-center" style={{ backgroundColor: colors.cream }}>
              <p className="text-lg mb-2">This certifies that</p>
              <div
                className="text-3xl font-bold mb-4 py-2 inline-block px-8"
                style={{ color: colors.orange, borderBottom: `3px solid ${colors.gold}` }}
              >
                {playerName}
              </div>
              <p className="text-lg mb-6 leading-relaxed">
                has successfully explored all {LOCATIONS.length} legendary locations<br />
                of Princeton University, verified with photographic evidence,<br />
                earning <span className="font-bold" style={{ color: colors.gold }}>{maxPoints} points</span>.
              </p>

              {/* Photo mosaic */}
              <div className="grid grid-cols-4 gap-2 mb-6 max-w-sm mx-auto">
                {LOCATIONS.map(loc => {
                  const visitData = getVisitedData(loc.id)
                  return (
                    <div
                      key={loc.id}
                      className="aspect-square rounded-lg bg-cover bg-center border-2"
                      style={{
                        backgroundImage: visitData?.photo ? `url(${visitData.photo})` : undefined,
                        backgroundColor: !visitData?.photo ? `${colors.orange}20` : undefined,
                        borderColor: colors.gold
                      }}
                    >
                      {!visitData?.photo && (
                        <span className="flex items-center justify-center h-full text-xl">{loc.icon}</span>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-center gap-8 mb-6 text-sm">
                <div>
                  <div className="font-bold" style={{ color: colors.orange }}>Locations</div>
                  <div>{LOCATIONS.length}</div>
                </div>
                <div>
                  <div className="font-bold" style={{ color: colors.orange }}>Points</div>
                  <div>{maxPoints}</div>
                </div>
                <div>
                  <div className="font-bold" style={{ color: colors.orange }}>Date</div>
                  <div>{new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="text-4xl mb-2">🎓</div>
              <p className="text-sm italic" style={{ color: `${colors.black}60` }}>
                "In the Nation's Service and the Service of Humanity"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-8 px-4" style={{ backgroundColor: `${colors.orange}10` }}>
        <div className="text-2xl mb-2">🐯</div>
        <p className="font-bold" style={{ color: colors.orange }}>Tiger Trails</p>
        <p className="text-sm" style={{ color: `${colors.black}60` }}>
          Explore. Capture. Earn your stripes.
        </p>
      </footer>
    </main>
  )
}
