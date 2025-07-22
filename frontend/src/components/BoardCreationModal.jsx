"use client"
import { useEffect, useState } from "react"
import { X, Plus, Palette, Type, FileText, Edit3, ImageIcon } from "lucide-react"
import useBoardStore from "../store/boardStore"

const colorOptions = [
  { value: "bg-blue-500", label: "Blue", preview: "bg-blue-500" },
  { value: "bg-green-500", label: "Green", preview: "bg-green-500" },
  { value: "bg-purple-500", label: "Purple", preview: "bg-purple-500" },
  { value: "bg-red-500", label: "Red", preview: "bg-red-500" },
  { value: "bg-yellow-500", label: "Yellow", preview: "bg-yellow-500" },
  { value: "bg-pink-500", label: "Pink", preview: "bg-pink-500" },
  { value: "bg-indigo-500", label: "Indigo", preview: "bg-indigo-500" },
  { value: "bg-gray-500", label: "Gray", preview: "bg-gray-500" },
]

const backgroundThemes = [
  { id: "blue", name: "Ocean Blue", value: "bg-gradient-to-br from-blue-400 to-blue-600" },
  { id: "green", name: "Forest Green", value: "bg-gradient-to-br from-green-400 to-green-600" },
  { id: "purple", name: "Royal Purple", value: "bg-gradient-to-br from-purple-400 to-purple-600" },
  { id: "sunset", name: "Sunset", value: "bg-gradient-to-br from-orange-400 via-red-500 to-pink-500" },
  { id: "ocean", name: "Ocean", value: "bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500" },
  { id: "mint", name: "Mint", value: "bg-gradient-to-br from-green-300 via-blue-500 to-purple-600" },
  // Unsplash nature image themes (all working URLs)
  { id: "unsplash-mountain", name: "Mountain", type: "image", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" },
  { id: "unsplash-forest", name: "Forest", type: "image", url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80" },
  { id: "unsplash-lake", name: "Lake", type: "image", url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80" },
  { id: "unsplash-desert", name: "Desert", type: "image", url: "https://images.unsplash.com/photo-1465378550170-3edc8cfc0f0c?auto=format&fit=crop&w=800&q=80" },
  { id: "unsplash-beach", name: "Beach", type: "image", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" },
  { id: "unsplash-river", name: "River", type: "image", url: "https://images.unsplash.com/photo-1444065381814-865dc9da92c0?auto=format&fit=crop&w=800&q=80" },
];

const BoardCreationModal = ({ onClose, board = null, onBoardCreated, onBoardUpdated }) => {
  const { addBoard, editBoard, setCurrentBoard } = useBoardStore()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    color: "bg-blue-500",
    backgroundTheme: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!board

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        title: board.title || "",
        description: board.description || "",
        color: board.color || "bg-blue-500",
        backgroundTheme: board.background_theme || null, // use snake_case from backend
      })
    }
  }, [isEditMode, board])

  const handleInputChange = (field, value) => {
    console.log('handleInputChange called:', field, value)
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('handleSubmit called, closing modal soon')
    if (!formData.title.trim()) return
    setIsSubmitting(true)
    try {
      if (isEditMode) {
        const updated = await editBoard(board.id, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          color: formData.color,
          background_theme: formData.backgroundTheme, // use snake_case
        })
        if (onBoardUpdated) onBoardUpdated(updated)
      } else {
        const created = await addBoard({
          title: formData.title.trim(),
          description: formData.description.trim(),
          color: formData.color,
          background_theme: formData.backgroundTheme, // use snake_case
        })
        setCurrentBoard(created.id)
        if (onBoardCreated) onBoardCreated(created)
      }
      onClose()
    } catch (error) {
      console.error(isEditMode ? "Error editing board:" : "Error creating board:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPreviewStyle = () => {
    const theme = formData.backgroundTheme;
    if (!theme) return {};
    if (theme.type === "image" && theme.url) {
      return {
        backgroundImage: `url(${theme.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    // Gradient logic
    if (theme.value) {
      return {
        background: theme.value
          .replace("bg-gradient-to-br", "linear-gradient(135deg,")
          .replace("bg-", ""),
      };
    }
    return {};
  };

  // Add this handler inside the component
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}boards/upload-background/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        handleInputChange('backgroundTheme', { type: 'image', url: data.url });
      }
    } catch (err) {
      alert('Image upload failed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              {isEditMode ? <Edit3 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              {isEditMode ? "Edit Board" : "Create New Board"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 dark:text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Board Preview */}
          <div
            className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700/50 relative overflow-hidden"
            style={getPreviewStyle()}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-4 h-4 rounded-full ${formData.color}`} />
                <span
                  className={`text-lg font-semibold ${formData.backgroundTheme ? "text-white drop-shadow" : "text-gray-900 dark:text-slate-100"}`}
                >
                  {formData.title || "Board Title"}
                </span>
              </div>
              <p
                className={`text-sm ml-7 ${formData.backgroundTheme ? "text-white/90 drop-shadow" : "text-gray-600 dark:text-slate-400"}`}
              >
                {formData.description || "Board description will appear here"}
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Board Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter board title..."
              className="w-full p-4 bg-white dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe what this board is for..."
              className="w-full p-4 bg-white dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-200"
              rows={3}
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Board Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange("color", color.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.color === color.value
                      ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div className={`w-full h-6 rounded ${color.preview} mb-2`} />
                  <span className="text-xs text-gray-700 dark:text-slate-300">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Background Theme
            </label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <button
                type="button"
                onClick={() => handleInputChange("backgroundTheme", null)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  !formData.backgroundTheme
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
              >
                <div className="w-full h-6 rounded bg-gray-100 dark:bg-slate-700 mb-2" />
                <span className="text-xs text-gray-700 dark:text-slate-300">Default</span>
              </button>
              {backgroundThemes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleInputChange("backgroundTheme", theme)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.backgroundTheme?.id === theme.id
                      ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  {theme.type === "image" && theme.url ? (
                    <div
                      className="w-full h-6 rounded mb-2"
                      style={{
                        backgroundImage: `url(${theme.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ) : (
                    <div className={`w-full h-6 rounded mb-2 ${theme.value || ""}`} />
                  )}
                  <span className="text-xs text-gray-700 dark:text-slate-300">{theme.name}</span>
                </button>
              ))}
            </div>
            {/* Image upload input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 flex items-center justify-center gap-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEditMode ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>
                  {isEditMode ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isEditMode ? "Save Changes" : "Create Board"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BoardCreationModal
