"use client"
import { useState, useRef, useEffect } from "react"
import { Palette, Sparkles, Waves, Check, X, Upload, ImageIcon } from 'lucide-react'

const natureImages = [
  {
    id: "unsplash-mountain",
    name: "Mountain Lake",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "unsplash-forest",
    name: "Forest Path",
    url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "unsplash-ocean",
    name: "Ocean Sunset",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "unsplash-peaks",
    name: "Mountain Peaks",
    url: "https://images.unsplash.com/photo-1465378550170-c1a9136a3b99?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "unsplash-autumn",
    name: "Autumn Forest",
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "unsplash-lavender",
    name: "Lavender Field",
    url: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "unsplash-desert",
    name: "Desert Dunes",
    url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "unsplash-cherry",
    name: "Cherry Blossoms",
    url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
  },
]

const backgroundThemes = {
  gradients: [
    {
      id: "ocean-breeze",
      name: "Ocean Breeze",
      value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      preview: "bg-gradient-to-br from-blue-500 to-purple-600",
    },
    {
      id: "sunset-glow",
      name: "Sunset Glow",
      value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      preview: "bg-gradient-to-br from-pink-400 to-red-500",
    },
    {
      id: "forest-mist",
      name: "Forest Mist",
      value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      preview: "bg-gradient-to-br from-blue-400 to-cyan-400",
    },
    {
      id: "royal-purple",
      name: "Royal Purple",
      value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      preview: "bg-gradient-to-br from-teal-200 to-pink-200",
    },
    {
      id: "golden-hour",
      name: "Golden Hour",
      value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      preview: "bg-gradient-to-br from-yellow-200 to-orange-300",
    },
    {
      id: "midnight-city",
      name: "Midnight City",
      value: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
      preview: "bg-gradient-to-br from-slate-700 to-blue-500",
    },
    {
      id: "emerald-dream",
      name: "Emerald Dream",
      value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      preview: "bg-gradient-to-br from-teal-600 to-green-400",
    },
    {
      id: "cosmic-fusion",
      name: "Cosmic Fusion",
      value: "linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)",
      preview: "bg-gradient-to-br from-rose-500 to-indigo-600",
    },
  ],
  patterns: [
    {
      id: "subtle-dots",
      name: "Subtle Dots",
      value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      pattern: "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2px, transparent 2px)",
      patternSize: "50px 50px",
      preview: "bg-gradient-to-br from-blue-500 to-purple-600",
    },
    {
      id: "diagonal-lines",
      name: "Diagonal Lines",
      value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      pattern:
        "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)",
      preview: "bg-gradient-to-br from-pink-400 to-red-500",
    },
    {
      id: "geometric-grid",
      name: "Geometric Grid",
      value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      pattern:
        "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
      patternSize: "30px 30px",
      preview: "bg-gradient-to-br from-blue-400 to-cyan-400",
    },
    {
      id: "wave-pattern",
      name: "Wave Pattern",
      value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      pattern:
        "radial-gradient(ellipse at top, rgba(255,255,255,0.1), transparent), radial-gradient(ellipse at bottom, rgba(255,255,255,0.1), transparent)",
      preview: "bg-gradient-to-br from-teal-600 to-green-400",
    },
  ],
  solid: [
    {
      id: "deep-blue",
      name: "Deep Blue",
      value: "#1e3a8a",
      preview: "bg-blue-800",
    },
    {
      id: "forest-green",
      name: "Forest Green",
      value: "#166534",
      preview: "bg-green-800",
    },
    {
      id: "royal-purple",
      name: "Royal Purple",
      value: "#6b21a8",
      preview: "bg-purple-800",
    },
    {
      id: "crimson-red",
      name: "Crimson Red",
      value: "#991b1b",
      preview: "bg-red-800",
    },
    {
      id: "slate-gray",
      name: "Slate Gray",
      value: "#374151",
      preview: "bg-gray-700",
    },
    {
      id: "amber-gold",
      name: "Amber Gold",
      value: "#d97706",
      preview: "bg-amber-600",
    },
  ],
}

const BackgroundThemeSelector = ({ currentTheme, onThemeChange, onClose }) => {
  const [activeTab, setActiveTab] = useState("nature")
  const [customImages, setCustomImages] = useState(() => {
    // Load from localStorage for persistence
    try {
      const saved = localStorage.getItem('customBoardBackgrounds')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // --- Sync with localStorage on mount ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem('customBoardBackgrounds')
      if (saved) {
        setCustomImages(JSON.parse(saved))
      }
    } catch {
      setCustomImages([])
      localStorage.removeItem('customBoardBackgrounds')
    }
  }, [])

  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleThemeSelect = (theme) => {
    onThemeChange({
      type: activeTab,
      ...theme,
    })
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}boards/upload-background/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`,
        },
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        let imageUrl = data.url
        let backendBaseUrl = import.meta.env.VITE_API_BASE_URL
        // Remove /api or /api/ from the end if present
        backendBaseUrl = backendBaseUrl.replace(/\/api\/?$/, '')
        if (imageUrl.startsWith('/')) {
          imageUrl = backendBaseUrl.replace(/\/$/, '') + imageUrl
        }
        const newCustomImage = {
          id: `custom-${Date.now()}`,
          name: file.name.split(".")[0],
          url: imageUrl,
          isCustom: true,
        }
        setCustomImages((prev) => {
          const updated = [...prev, newCustomImage]
          localStorage.setItem('customBoardBackgrounds', JSON.stringify(updated))
          return updated
        })
        // Auto-select the uploaded image
        handleThemeSelect({
          ...newCustomImage,
          type: "image",
        })
      }
    } catch (error) {
      alert('Image upload failed.')
    } finally {
      setUploading(false)
      event.target.value = null
    }
  }

  // Add a handler to delete a custom image
  const handleDeleteCustomImage = (id) => {
    setCustomImages((prev) => {
      const updated = prev.filter(img => img.id !== id)
      localStorage.setItem('customBoardBackgrounds', JSON.stringify(updated))
      return updated
    })
  }

  const renderThemeGrid = (themes, isCustom = false) => {
    return (
      <div className="grid grid-cols-4 gap-4">
        {themes.map((theme) => (
          <div key={theme.id} className="relative h-24 rounded-xl border-2 transition-all duration-200 overflow-hidden group">
            <button
              onClick={() => handleThemeSelect(theme)}
              className={`absolute inset-0 w-full h-full z-10 ${
                currentTheme?.id === theme.id
                  ? "border-blue-400 ring-2 ring-blue-400/30 scale-105"
                  : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:scale-102"
              }`}
              style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
            >
              {theme.url ? (
                <img
                  src={theme.url || "/placeholder.svg"}
                  alt={theme.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "/placeholder.svg"
                    e.target.parentNode.parentNode.classList.add('broken-image')
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full ${theme.preview} ${theme.url ? "hidden" : ""}`}
                style={
                  theme.pattern
                    ? {
                        backgroundImage: theme.pattern,
                        backgroundSize: theme.patternSize || "20px 20px",
                      }
                    : {}
                }
              />
              {currentTheme?.id === theme.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <div className="bg-white/90 rounded-full p-2">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {theme.name}
              </div>
            </button>
            {/* Delete button for custom images */}
            {isCustom && (
              <button
                onClick={() => handleDeleteCustomImage(theme.id)}
                className="absolute top-1 right-1 z-20 bg-white/80 hover:bg-red-100 text-red-600 rounded-full p-1 shadow"
                title="Delete image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }

  const allNatureImages = [...natureImages, ...customImages]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Change Background</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">Choose a theme for your board</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 dark:text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("nature")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "nature"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Nature Images
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "custom"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            <Upload className="w-4 h-4" />
            Your Images
          </button>
          <button
            onClick={() => setActiveTab("gradients")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "gradients"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Gradients
          </button>
          <button
            onClick={() => setActiveTab("patterns")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "patterns"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            <Waves className="w-4 h-4" />
            Patterns
          </button>
          <button
            onClick={() => setActiveTab("solid")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "solid"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            <Palette className="w-4 h-4" />
            Solid Colors
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                  {activeTab === "nature" && "Nature Images"}
                  {activeTab === "custom" && "Your Images"}
                  {activeTab === "gradients" && "Gradient Themes"}
                  {activeTab === "patterns" && "Pattern Themes"}
                  {activeTab === "solid" && "Solid Color Themes"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {activeTab === "nature" && "Beautiful nature photography for a calming workspace"}
                  {activeTab === "custom" && "Your uploaded backgrounds (only visible to you)"}
                  {activeTab === "gradients" && "Beautiful gradient backgrounds for a modern look"}
                  {activeTab === "patterns" && "Subtle patterns to add texture to your board"}
                  {activeTab === "solid" && "Clean solid colors for a minimalist approach"}
                </p>
              </div>

              {activeTab === "custom" && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {activeTab === "nature" && renderThemeGrid(natureImages)}
          {activeTab === "custom" && renderThemeGrid(customImages, true)}
          {activeTab === "gradients" && renderThemeGrid(backgroundThemes.gradients)}
          {activeTab === "patterns" && renderThemeGrid(backgroundThemes.patterns)}
          {activeTab === "solid" && renderThemeGrid(backgroundThemes.solid)}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
          <button
            onClick={() =>
              handleThemeSelect({
                id: "default",
                name: "Default",
                type: "default",
                value: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
              })
            }
            className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors font-medium"
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default BackgroundThemeSelector
