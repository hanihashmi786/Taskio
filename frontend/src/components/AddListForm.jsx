"use client"
import { useState } from "react"
import { X, Plus } from "lucide-react"
import useBoardStore from "../store/boardStore"

const AddListForm = ({ boardId, onCancel, onAdd }) => {
  const { addList } = useBoardStore()
  const [title, setTitle] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      addList(boardId, title.trim())
      setTitle("")
      onAdd()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onCancel()
    }
  }

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl card-shadow border border-slate-700/50 p-6 fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter list title..."
          className="w-full p-4 border border-slate-600 rounded-lg bg-slate-900/50 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-base font-medium"
          autoFocus
        />

        <div className="flex gap-3">
          <button type="submit" disabled={!title.trim()} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add List
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="p-2.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition-colors focus-ring"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddListForm
