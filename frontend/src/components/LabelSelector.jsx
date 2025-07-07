"use client"
import { useState } from "react"
import { Check, X } from "lucide-react"
import { PREDEFINED_LABELS } from "../utils/labels"

const LabelSelector = ({ selectedLabels = [], onLabelsChange, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLabels = PREDEFINED_LABELS.filter((label) =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleLabel = (labelId) => {
    const isSelected = selectedLabels.includes(labelId)
    if (isSelected) {
      onLabelsChange(selectedLabels.filter((id) => id !== labelId))
    } else {
      onLabelsChange([...selectedLabels, labelId])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100">Select Labels</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-700">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search labels..."
            className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>

        {/* Labels List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {filteredLabels.map((label) => {
              const isSelected = selectedLabels.includes(label.id)
              return (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-700 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${label.color}`} />
                    <span className="text-slate-200 font-medium">{label.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-green-400" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button onClick={onClose} className="w-full btn-primary">
            Done ({selectedLabels.length} selected)
          </button>
        </div>
      </div>
    </div>
  )
}

export default LabelSelector
