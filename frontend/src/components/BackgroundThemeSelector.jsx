"use client"
import { useState, useRef } from "react"
import { Palette, Sparkles, Waves, Check, X, Upload, ImageIcon } from "lucide-react"

const natureImages = [
  {
    id: "mountain-lake",
    name: "Mountain Lake",
    url: "/placeholder.svg?height=400&width=800",
    preview: "bg-gradient-to-br from-blue-400 to-green-500",
  },
  {
    id: "forest-path",
    name: "Forest Path",
    url: "/placeholder.svg?height=400&width=800",
    preview: "bg-gradient-to-br from-green-600 to-green-800",
  },
  {
    id: "ocean-sunset",
    name: "Ocean Sunset",
    url: "/placeholder.svg?height=400&width=800",
    preview: "bg-gradient-to-br from-orange-400 to-pink-500",
  },
  {
    id: "mountain-peaks",
    name: "Mountain Peaks",
    url: "/placeholder.svg?height=400&width=800",
    preview: "bg-gradient-to-br from-blue-300 to-gray-600",
  },
  {
    id: "autumn-forest",
    name: "Autumn Forest",
    url: "/placeholder.svg?height=400&width=800",
    preview: "bg-gradient-to-br from-yellow-400 to-red-600",
  },
  {
    id: "lavender-field",
    name: "Lavender Field",
    url: "/placeholder.svg?height=400&width=800",
    preview: "bg-gradient-to-br from-purple-400 to-blue-400",
  },
  {
    id: "desert-dunes",
    name: "Desert Dunes",
    url: "/placeholder.svg?height=400&width=800",
    preview: "bg-gradient-to-br from-yellow-300 to-orange-500",
  },
  {
    id: "cherry-blossoms",
    name: "Cherry Blossoms",
    url: "/placeholder.svg?height=400&width=800",
    preview: "bg-gradient-to-br from-pink-300 to-green-400",
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
  const [customImages, setCustomImages] = useState([])
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
      // Create a local URL for the uploaded image
      const imageUrl = URL.createObjectURL(file)
      const newCustomImage = {
        id: `custom-${Date.now()}`,
        name: file.name.split(".")[0],
        url: imageUrl,
        preview: "bg-gradient-to-br from-gray-400 to-gray-600",
        isCustom: true,
      }

      setCustomImages((prev) => [...prev, newCustomImage])

      // Auto-select the uploaded image
      handleThemeSelect({
        ...newCustomImage,
        type: "image",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setUploading(false)
      event.target.value = null
    }
  }

  const renderThemeGrid = (themes) => {
    return (
      <div className="grid grid-cols-4 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme)}
            className={`relative h-24 rounded-xl border-2 transition-all duration-200 overflow-hidden group ${
              currentTheme?.id === theme.id
                ? "border-blue-400 ring-2 ring-blue-400/30 scale-105"
                : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:scale-102"
            }`}
          >
            {theme.url ? (
              <img
                src={theme.url || "/placeholder.svg"}
                alt={theme.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none"
                  e.target.nextSibling.style.display = "block"
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
                  {activeTab === "gradients" && "Gradient Themes"}
                  {activeTab === "patterns" && "Pattern Themes"}
                  {activeTab === "solid" && "Solid Color Themes"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {activeTab === "nature" && "Beautiful nature photography for a calming workspace"}
                  {activeTab === "gradients" && "Beautiful gradient backgrounds for a modern look"}
                  {activeTab === "patterns" && "Subtle patterns to add texture to your board"}
                  {activeTab === "solid" && "Clean solid colors for a minimalist approach"}
                </p>
              </div>

              {activeTab === "nature" && (
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

          {activeTab === "nature" && renderThemeGrid(allNatureImages)}
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
