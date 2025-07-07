"use client"
import { useState, useEffect } from "react"
import { X, Calendar, Tag, CheckSquare, MessageCircle, Plus, Trash2, Send, UserX, Users } from "lucide-react"
import useBoardStore from "../store/boardStore"

const CardModal = ({ card, onClose }) => {
  const { updateCard, deleteCard, getCurrentBoard } = useBoardStore()
  const [formData, setFormData] = useState({
    title: card.title,
    description: card.description || "",
    dueDate: card.dueDate || "",
    assignees: card.assignees || [],
    checklist: card.checklist || [],
    comments: card.comments || [],
  })
  const [newComment, setNewComment] = useState("")
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)

  const board = getCurrentBoard()
  const listId = board?.lists.find((list) => list.cards.some((c) => c.id === card.id))?.id

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (board && listId) {
      updateCard(board.id, listId, card.id, {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || null,
      })
    }
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      if (board && listId) {
        deleteCard(board.id, listId, card.id)
      }
      onClose()
    }
  }

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: `comment-${Date.now()}`,
        text: newComment.trim(),
        author: "Current User",
        timestamp: new Date().toISOString(),
      }
      handleInputChange("comments", [...formData.comments, comment])
      setNewComment("")
    }
  }

  const handleCommentKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      addComment()
    }
  }

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const item = {
        id: `check-${Date.now()}`,
        text: newChecklistItem.trim(),
        completed: false,
      }
      handleInputChange("checklist", [...formData.checklist, item])
      setNewChecklistItem("")
    }
  }

  const toggleChecklistItem = (itemId) => {
    const updatedChecklist = formData.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    )
    handleInputChange("checklist", updatedChecklist)
  }

  const removeChecklistItem = (itemId) => {
    const updatedChecklist = formData.checklist.filter((item) => item.id !== itemId)
    handleInputChange("checklist", updatedChecklist)
  }

  const handleAssigneeToggle = (memberId) => {
    const currentAssignees = formData.assignees || []
    const isAssigned = currentAssignees.includes(memberId)

    if (isAssigned) {
      handleInputChange(
        "assignees",
        currentAssignees.filter((id) => id !== memberId),
      )
    } else {
      handleInputChange("assignees", [...currentAssignees, memberId])
    }
  }

  const removeAssignee = (memberId) => {
    const currentAssignees = formData.assignees || []
    handleInputChange(
      "assignees",
      currentAssignees.filter((id) => id !== memberId),
    )
  }

  const completedTasks = formData.checklist.filter((item) => item.completed).length
  const assignedMembers = board?.members.filter((member) => formData.assignees?.includes(member.id)) || []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Card Details</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add a more detailed description..."
            />
          </div>

          {/* Due Date and Assignees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Assignees ({assignedMembers.length})
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                  className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-left text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add assignees...
                </button>

                {showAssigneeDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAssigneeDropdown(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg py-2 z-20 max-h-48 overflow-y-auto">
                      {board?.members.map((member) => {
                        const isAssigned = formData.assignees?.includes(member.id)
                        return (
                          <button
                            key={member.id}
                            onClick={() => handleAssigneeToggle(member.id)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                              isAssigned
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                : "text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                            }`}
                          >
                            <img
                              src={member.avatar || "/placeholder.svg"}
                              alt={member.name}
                              className="w-6 h-6 rounded-full ring-2 ring-gray-200 dark:ring-slate-600"
                            />
                            <span className="flex-1">{member.name}</span>
                            {isAssigned && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Display assigned members */}
              {assignedMembers.length > 0 && (
                <div className="mt-3 space-y-2">
                  {assignedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={member.avatar || "/placeholder.svg"}
                          alt={member.name}
                          className="w-6 h-6 rounded-full ring-2 ring-gray-200 dark:ring-slate-600"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{member.name}</span>
                      </div>
                      <button
                        onClick={() => removeAssignee(member.id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors"
                        title="Remove assignee"
                      >
                        <UserX className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Checklist {formData.checklist.length > 0 && `(${completedTasks}/${formData.checklist.length})`}
              </label>
              {formData.checklist.length > 0 && (
                <div className="w-24 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedTasks / formData.checklist.length) * 100}%` }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 mb-3">
              {formData.checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span
                    className={`flex-1 ${
                      item.completed
                        ? "line-through text-gray-500 dark:text-slate-400"
                        : "text-gray-900 dark:text-slate-100"
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => removeChecklistItem(item.id)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
                placeholder="Add checklist item..."
                className="flex-1 p-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addChecklistItem}
                disabled={!newChecklistItem.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Comments ({formData.comments.length})
            </label>

            <div className="space-y-3 mb-4">
              {formData.comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-slate-100 text-sm">{comment.author}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-slate-300 text-sm">{comment.text}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleCommentKeyPress}
                placeholder="Write a comment..."
                className="flex-1 p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
              />
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default CardModal
