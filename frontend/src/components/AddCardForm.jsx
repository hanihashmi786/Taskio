"use client"
import { useState } from "react"
import { X, Plus, Calendar, Tag, FileText } from "lucide-react"
import useBoardStore from "../store/boardStore"
import LabelSelector from "./LabelSelector"
import { getLabelById } from "../utils/labels"

const AddCardForm = ({ boardId, listId, insertIndex = -1, onCancel, onAdd }) => {
  const { addCard } = useBoardStore()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    labels: [],
  })
  const [showLabelSelector, setShowLabelSelector] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)

    try {
      const cardData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || null,
        labels: formData.labels.map((labelId) => getLabelById(labelId)).filter(Boolean),
      }

      addCard(boardId, listId, cardData, insertIndex)

      // Reset form
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        labels: [],
      })

      onAdd()
    } catch (error) {
      console.error("Error creating card:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onCancel()
    }
  }

  const removeLabel = (labelId) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.filter((id) => id !== labelId),
    }))
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-slate-600/50 p-6 shadow-xl fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            Create New Card
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus-ring"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Card Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter card title..."
              className="w-full p-4 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Add a description (optional)..."
              className="w-full p-4 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-200"
              rows={3}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              className="w-full p-4 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            />
          </div>

          {/* Labels */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Labels
              </label>
              <button
                type="button"
                onClick={() => setShowLabelSelector(true)}
                className="flex items-center gap-1 text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10"
              >
                <Plus className="w-3 h-3" />
                Add Label
              </button>
            </div>

            {formData.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-slate-900/30 rounded-lg border border-gray-200 dark:border-slate-700/50">
                {formData.labels.map((labelId) => {
                  const label = getLabelById(labelId)
                  if (!label) return null
                  return (
                    <div
                      key={labelId}
                      className={`${label.color} ${label.textColor} text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-2 shadow-sm`}
                    >
                      {label.name}
                      <button
                        type="button"
                        onClick={() => removeLabel(labelId)}
                        className="hover:bg-black/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700/50">
            <button
              type="submit"
              disabled={!formData.title.trim() || isSubmitting}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Card
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus-ring"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {showLabelSelector && (
        <LabelSelector
          selectedLabels={formData.labels}
          onLabelsChange={(labels) => handleInputChange("labels", labels)}
          onClose={() => setShowLabelSelector(false)}
        />
      )}
    </>
  )
}

export default AddCardForm
