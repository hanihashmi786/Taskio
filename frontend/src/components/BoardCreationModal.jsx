"use client"
import { useState } from "react"
import { X, Plus, Palette, Type, FileText } from "lucide-react"
import useBoardStore from "../store/boardStore"

const BoardCreationModal = ({ onClose }) => {
  const { addBoard, setCurrentBoard } = useBoardStore()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    color: "bg-blue-500",
    icon: "📋",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const iconOptions = ["📋", "🚀", "💼", "📊", "🎯", "⚡", "🔥", "💡", "🎨", "🏆", "📈", "🔧"]

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)

    try {
      const newBoard = {
        id: `board-${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        color: formData.color,
        icon: formData.icon,
        createdAt: new Date().toISOString(),
        lists: [],
      }

      addBoard(newBoard)
      setCurrentBoard(newBoard.id)
      onClose()
    } catch (error) {
      console.error("Error creating board:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Create New Board</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Board Preview */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-4 h-4 rounded-full ${formData.color}`} />
              <span className="text-2xl">{formData.icon}</span>
              <span className="text-lg font-semibold text-slate-100">{formData.title || "Board Title"}</span>
            </div>
            <p className="text-sm text-slate-400 ml-7">
              {formData.description || "Board description will appear here"}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Board Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter board title..."
              className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe what this board is for..."
              className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-200"
              rows={3}
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
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
                      ? "border-blue-400 bg-slate-700"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <div className={`w-full h-6 rounded ${color.preview} mb-2`} />
                  <span className="text-xs text-slate-300">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Board Icon
              <span className="text-xs text-slate-400 ml-2">(Choose an emoji to represent your board)</span>
            </label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleInputChange("icon", icon)}
                  className={`p-3 rounded-lg border-2 text-2xl transition-all duration-200 hover:scale-110 ${
                    formData.icon === icon ? "border-blue-400 bg-slate-700" : "border-slate-600 hover:border-slate-500"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => handleInputChange("icon", e.target.value)}
                placeholder="Or enter custom emoji..."
                className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-center text-xl"
                maxLength={2}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition-colors focus-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || isSubmitting}
              className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Board
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
