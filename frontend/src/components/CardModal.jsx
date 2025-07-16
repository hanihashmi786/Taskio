"use client"
import { useState, useEffect } from "react"
import LabelSelector from "./LabelSelector"
import {
  X,
  Calendar,
  Tag,
  Paperclip,
  Trash2,
  Edit3,
  CheckSquare,
  MessageCircle,
  Users,
  Plus,
  Clock,
  FileText,
  Check,
  Loader2,
} from "lucide-react"
import { getLabelById } from "../utils/labels"
import useBoardStore from "../store/boardStore"
import useCardStore from "../store/cardStore"
import useChecklistStore from "../store/checklistStore"

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "";

function getAvatarUrl(avatar) {
  if (!avatar) return "/placeholder.svg";
  if (avatar.startsWith("http")) return avatar;
  if (avatar.startsWith("/media/")) return MEDIA_URL.replace(/\/$/, "") + avatar;
  if (avatar.startsWith("media/")) return MEDIA_URL.replace(/\/$/, "") + "/" + avatar;
  if (avatar.startsWith("avatars/")) return MEDIA_URL.replace(/\/$/, "") + "/media/" + avatar;
  return avatar;
}

const CardModal = ({ isOpen, onClose, card, listId }) => {
  const { getCurrentBoard } = useBoardStore()
  const { updateCard, deleteCard, comments, fetchComments, addComment } = useCardStore()
  const {
    items: checklistItems,
    fetchChecklist,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    addChecklist,
    fetchChecklists,
    checklists,
  } = useChecklistStore()

  const board = getCurrentBoard()

  // Editable Card Form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    assignees: [],
    labels: [],
  })

  const [originalData, setOriginalData] = useState({})

  // UI states
  const [showLabelSelector, setShowLabelSelector] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [newComment, setNewComment] = useState("")
  const [newChecklistItem, setNewChecklistItem] = useState({})
  const [newChecklistTitle, setNewChecklistTitle] = useState("")
  const [addingChecklist, setAddingChecklist] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (card) {
      const data = {
        title: card.title || "",
        description: card.description || "",
        due_date: card.due_date || "",
        assignees: card.assignees || [],
        labels: card.labels || [],
      }
      setFormData(data)
      setOriginalData(data)
      setHasChanges(false)
    }
  }, [card])

  useEffect(() => {
    // Check if form data has changed
    const dataChanged = JSON.stringify(formData) !== JSON.stringify(originalData)
    setHasChanges(dataChanged)
  }, [formData, originalData])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!card?.id) return
    fetchChecklist(card.id)
    fetchComments(card.id)
    fetchChecklists(card.id)
  }, [card?.id, fetchChecklist, fetchComments, fetchChecklists])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateCard(card.id, {
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        labels: formData.labels,
        assignees: formData.assignees,
      })
      setOriginalData(formData)
      setHasChanges(false)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving card:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      try {
        await deleteCard(card.id, listId)
        onClose()
      } catch (error) {
        console.error("Error deleting card:", error)
      }
    }
  }

  const toggleAssignee = (userId) => {
    handleInputChange(
      "assignees",
      formData.assignees.includes(userId)
        ? formData.assignees.filter((id) => id !== userId)
        : [...formData.assignees, userId],
    )
  }

  const handleAddChecklistItem = async (checklistId) => {
    const text = newChecklistItem[checklistId]
    if (!text || !text.trim()) return
    try {
      await addChecklistItem({
        checklist: checklistId,
        text: text.trim(),
        completed: false,
      })
      setNewChecklistItem((prev) => ({ ...prev, [checklistId]: "" }))
    } catch (error) {
      console.error("Error adding checklist item:", error)
    }
  }

  const handleToggleChecklistItem = async (itemId, completed) => {
    try {
      await updateChecklistItem(itemId, { completed: !completed })
    } catch (error) {
      console.error("Error toggling checklist item:", error)
    }
  }

  const handleDeleteChecklistItem = async (itemId) => {
    try {
      await deleteChecklistItem(itemId)
    } catch (error) {
      console.error("Error deleting checklist item:", error)
    }
  }

  const handleAddChecklist = async () => {
    if (!newChecklistTitle.trim()) return
    setAddingChecklist(true)
    try {
      await addChecklist({ card: card.id, title: newChecklistTitle.trim() })
      setNewChecklistTitle("")
      await fetchChecklists(card.id)
    } catch (error) {
      console.error("Error adding checklist:", error)
    } finally {
      setAddingChecklist(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      await addComment(card.id, { text: newComment.trim() })
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isOpen || !card) return null

  const cardComments = comments[card.id] || []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            {isEditing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="text-xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-900 dark:text-white flex-1 py-1"
                autoFocus
              />
            ) : (
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex-1">{formData.title}</h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              {[
                { id: "details", label: "Details", icon: FileText },
                { id: "checklists", label: "Checklist", icon: CheckSquare },
                { id: "comments", label: "Comments", icon: MessageCircle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === "comments" && cardComments.length > 0 && (
                    <span className="bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 text-xs px-2 py-1 rounded-full">
                      {cardComments.length}
                    </span>
                  )}
                  {tab.id === "checklists" && checklistItems.length > 0 && (
                    <span className="bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 text-xs px-2 py-1 rounded-full">
                      {checklistItems.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 flex-1">
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.description || ""}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="w-full p-4 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                        rows={4}
                        placeholder="Add a description..."
                      />
                    ) : (
                      <div
                        onClick={() => setIsEditing(true)}
                        className="w-full p-4 border border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors min-h-[100px] bg-white dark:bg-slate-700"
                      >
                        {formData.description ? (
                          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{formData.description}</p>
                        ) : (
                          <p className="text-gray-500 dark:text-slate-400">Add a description...</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Labels */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Labels</label>
                      <button
                        onClick={() => setShowLabelSelector(true)}
                        className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Label
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(formData.labels || []).map((labelId) => {
                        const label = getLabelById(labelId)
                        if (!label) return null
                        return (
                          <span
                            key={labelId}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium ${label.color} ${label.textColor} shadow-sm`}
                          >
                            {label.name}
                          </span>
                        )
                      })}
                      {(!formData.labels || formData.labels.length === 0) && (
                        <p className="text-gray-500 dark:text-slate-400 text-sm">No labels assigned</p>
                      )}
                    </div>
                  </div>

                  {/* Assignees */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Assignees
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {board?.members?.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => toggleAssignee(member.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                            formData.assignees.includes(member.id)
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                              : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600"
                          }`}
                        >
                          <img
                            src={member.avatar || "/placeholder.svg"}
                            alt={member.first_name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm font-medium">
                            {member.first_name} {member.last_name}
                          </span>
                        </button>
                      ))}
                      {(!board?.members || board.members.length === 0) && (
                        <p className="text-gray-500 dark:text-slate-400 text-sm">No team members available</p>
                      )}
                    </div>
                  </div>

                  {/* Due Date */}
                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Due Date
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.due_date || ""}
                        onChange={(e) => handleInputChange("due_date", e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "checklists" && (
                <div className="space-y-6">
                  {/* Add New Checklist */}
                  <div className="bg-gray-50 dark:bg-slate-700/30 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newChecklistTitle}
                        onChange={(e) => setNewChecklistTitle(e.target.value)}
                        placeholder="Create a new checklist..."
                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleAddChecklist()
                        }}
                        disabled={addingChecklist}
                      />
                      <button
                        onClick={handleAddChecklist}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        disabled={addingChecklist || !newChecklistTitle.trim()}
                      >
                        {addingChecklist ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {addingChecklist ? "Adding..." : "Add Checklist"}
                      </button>
                    </div>
                  </div>

                  {/* Checklists */}
                  {checklists && checklists.length > 0 ? (
                    <div className="space-y-4">
                      {checklists.map((checklist) => {
                        const items = checklistItems.filter((item) => item.checklist === checklist.id)
                        const completed = items.filter((item) => item.completed).length
                        const total = items.length
                        const percent = total > 0 ? Math.round((completed / total) * 100) : 0

                        return (
                          <div
                            key={checklist.id}
                            className="bg-white dark:bg-slate-700 rounded-lg p-5 border border-gray-200 dark:border-slate-600 shadow-sm"
                          >
                            {/* Checklist Header */}
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                {checklist.title}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                                <span className="font-medium">
                                  {completed}/{total}
                                </span>
                                <span>({percent}%)</span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    percent === 100 ? "bg-green-500" : "bg-blue-500"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>

                            {/* Checklist Items */}
                            <div className="space-y-2 mb-4">
                              {items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-600/50 rounded-lg transition-colors group"
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() => handleToggleChecklistItem(item.id, item.completed)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                  <span
                                    className={`flex-1 text-sm transition-all ${
                                      item.completed
                                        ? "line-through text-gray-400 dark:text-slate-500"
                                        : "text-gray-900 dark:text-white"
                                    }`}
                                  >
                                    {item.text}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteChecklistItem(item.id)}
                                    className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Add New Item */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newChecklistItem[checklist.id] || ""}
                                onChange={(e) =>
                                  setNewChecklistItem((prev) => ({ ...prev, [checklist.id]: e.target.value }))
                                }
                                placeholder="Add an item..."
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleAddChecklistItem(checklist.id)
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleAddChecklistItem(checklist.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-200 rounded-lg transition-colors"
                                disabled={!newChecklistItem[checklist.id]?.trim()}
                              >
                                <Plus className="w-4 h-4" />
                                Add
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckSquare className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-slate-400">No checklists yet</p>
                      <p className="text-sm text-gray-400 dark:text-slate-500">Create your first checklist above</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "comments" && (
                <div className="space-y-6">
                  {/* Add Comment */}
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-200 dark:border-slate-600">
                    <div className="flex gap-3">
                      <img
                        src={getAvatarUrl(/* you may want to use the current user's avatar here if available */)}
                        alt="You"
                        className="w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-slate-600"
                      />
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                          rows={3}
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {cardComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex gap-3 p-4 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600"
                      >
                        <img
                          src={getAvatarUrl(comment.author?.avatar)}
                          alt={comment.author?.first_name || "User"}
                          className="w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-slate-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {comment.author?.first_name} {comment.author?.last_name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                      </div>
                    ))}

                    {cardComments.length === 0 && (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-slate-400">No comments yet</p>
                        <p className="text-sm text-gray-400 dark:text-slate-500">Be the first to add a comment</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 dark:bg-slate-900/50 border-l border-gray-200 dark:border-slate-700 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Card Details</h3>

            <div className="space-y-6">
              {/* Due Date */}
              {formData.due_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Due Date
                  </label>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{formatDate(formData.due_date)}</span>
                  </div>
                </div>
              )}

              {/* Created */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Created</label>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(card.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Actions</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowLabelSelector(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg transition-colors border border-gray-200 dark:border-slate-600"
                  >
                    <Tag className="w-4 h-4" />
                    Labels
                  </button>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg transition-colors border border-gray-200 dark:border-slate-600"
                  >
                    <Calendar className="w-4 h-4" />
                    Due Date
                  </button>

                  <button className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg transition-colors border border-gray-200 dark:border-slate-600">
                    <Paperclip className="w-4 h-4" />
                    Attachment
                  </button>

                  <div className="border-t border-gray-200 dark:border-slate-600 pt-2 mt-4">
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-lg transition-colors border border-red-200 dark:border-red-800/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Card
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button - Fixed at bottom */}
        {hasChanges && (
          <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span className="font-medium">{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Label Selector Modal */}
      {showLabelSelector && (
        <LabelSelector
          selectedLabels={formData.labels}
          onLabelsChange={(labels) => {
            handleInputChange("labels", labels)
            setShowLabelSelector(false)
          }}
          onClose={() => setShowLabelSelector(false)}
        />
      )}
    </div>
  )
}

export default CardModal
