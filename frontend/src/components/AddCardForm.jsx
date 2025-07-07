"use client"
import { useState } from "react"
import { X, Plus, Type, FileText } from "lucide-react"
import useBoardStore from "../store/boardStore"
import LabelSelector from "./LabelSelector"

const AddCardForm = ({ listId, boardId, onCancel, onAdd }) => {
  const { addCard } = useBoardStore()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    labels: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)

    try {
      const newCard = {
        id: `card-${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        labels: formData.labels,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: null,
        assignees: [], // Empty initially, can be added through card details
        attachments: [],
        comments: [],
        checklist: [],
      }

      addCard(boardId, listId, newCard)
      onAdd()
    } catch (error) {
      console.error("Error creating card:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Type className="w-4 h-4" />
            Card Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter card title..."
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            required
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Add a description..."
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-200"
            rows={3}
          />
        </div>

        {/* Labels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Labels</label>
          <LabelSelector
            selectedLabels={formData.labels}
            onLabelsChange={(labels) => handleInputChange("labels", labels)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!formData.title.trim() || isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Card
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddCardForm
