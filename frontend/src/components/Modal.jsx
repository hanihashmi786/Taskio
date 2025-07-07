"use client"

import { useState, useEffect } from "react"
import { useApp } from "../context/AppContext"
import useBoardStore from "../store/boardStore"
import { X } from "lucide-react"

const Modal = () => {
  const { modalType, modalData, hideModal, updateCard, deleteCard, deleteList } = useApp()

  const { addBoard, setCurrentBoard } = useBoardStore()

  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (modalData) {
      setFormData(modalData)
    } else {
      setFormData({})
    }
  }, [modalData, modalType])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    switch (modalType) {
      case "createBoard":
        const newBoard = {
          id: `board-${Date.now()}`,
          title: formData.title || "New Board",
          description: formData.description || "",
          color: formData.color || "bg-blue-500",
          icon: formData.icon || "📋",
          createdAt: new Date().toISOString(),
          lists: [],
        }
        addBoard(newBoard)
        setCurrentBoard(newBoard.id)
        break

      case "editBoard":
        // Handle board editing if needed
        break

      case "cardDetails":
        updateCard(modalData.boardId, modalData.listId, { ...modalData.card, ...formData })
        break

      default:
        break
    }

    hideModal()
  }

  const handleDelete = () => {
    switch (modalType) {
      case "boardOptions":
        if (window.confirm("Are you sure you want to delete this board?")) {
          // Handle board deletion
          hideModal()
        }
        break

      case "listOptions":
        if (window.confirm("Are you sure you want to delete this list?")) {
          deleteList(modalData.boardId, modalData.list.id)
          hideModal()
        }
        break

      case "cardDetails":
        if (window.confirm("Are you sure you want to delete this card?")) {
          deleteCard(modalData.boardId, modalData.listId, modalData.card.id)
          hideModal()
        }
        break

      default:
        break
    }
  }

  const renderModalContent = () => {
    switch (modalType) {
      case "createBoard":
      case "editBoard":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-100">
              {modalType === "createBoard" ? "Create New Board" : "Edit Board"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Board Title</label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full p-4 border border-slate-600 rounded-lg bg-slate-900/50 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  placeholder="Enter board title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full p-4 border border-slate-600 rounded-lg bg-slate-900/50 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none"
                  placeholder="Enter board description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Icon</label>
                  <input
                    type="text"
                    value={formData.icon || ""}
                    onChange={(e) => handleInputChange("icon", e.target.value)}
                    className="w-full p-4 border border-slate-600 rounded-lg bg-slate-900/50 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="📋"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Color</label>
                  <select
                    value={formData.color || "bg-blue-500"}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    className="w-full p-4 border border-slate-600 rounded-lg bg-slate-900/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  >
                    <option value="bg-blue-500">Blue</option>
                    <option value="bg-green-500">Green</option>
                    <option value="bg-purple-500">Purple</option>
                    <option value="bg-red-500">Red</option>
                    <option value="bg-yellow-500">Yellow</option>
                    <option value="bg-pink-500">Pink</option>
                    <option value="bg-indigo-500">Indigo</option>
                    <option value="bg-gray-500">Gray</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={hideModal}
                  className="px-6 py-3 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition-colors focus-ring"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-6 py-3">
                  {modalType === "createBoard" ? "Create Board" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )

      case "boardOptions":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-100">Board Options</h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  hideModal()
                  // Add edit functionality
                }}
                className="w-full text-left p-4 hover:bg-slate-700 rounded-lg transition-colors text-slate-200"
              >
                Edit Board
              </button>
              <button
                onClick={() => {
                  hideModal()
                  // Add share functionality
                }}
                className="w-full text-left p-4 hover:bg-slate-700 rounded-lg transition-colors text-slate-200"
              >
                Share Board
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left p-4 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
              >
                Delete Board
              </button>
            </div>
          </div>
        )

      case "listOptions":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-100">List Options</h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  hideModal()
                  // Add edit functionality
                }}
                className="w-full text-left p-4 hover:bg-slate-700 rounded-lg transition-colors text-slate-200"
              >
                Edit List
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left p-4 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
              >
                Delete List
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!modalType) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-600 rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto card-shadow">
        <div className="flex items-center justify-between mb-6">
          <div></div>
          <button onClick={hideModal} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {renderModalContent()}
      </div>
    </div>
  )
}

export default Modal
