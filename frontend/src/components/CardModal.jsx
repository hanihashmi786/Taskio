"use client"
import { useState, useEffect, useRef } from "react"
import LabelSelector from "./LabelSelector"
import RichTextEditor from "./RichTextEditor"
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
  FileImage,
  FileIcon as FilePdf,
  FileSpreadsheet,
  FileBarChart,
  FileArchive,
  FileAudio,
  FileVideo,
  Download,
  Link,
  ExternalLink,
  AlertCircle,
  Globe,
  Save,
  Eye,
} from "lucide-react"
import { getLabelById } from "../utils/labels"
import useBoardStore from "../store/boardStore"
import useCardStore from "../store/cardStore"
import useChecklistStore from "../store/checklistStore"
import { useApp } from "../context/AppContext"
import { getAttachments, uploadAttachment, deleteAttachment } from "../api/attachments"

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || ""

function getAvatarUrl(avatar) {
  if (!avatar) return "/placeholder.svg"
  if (avatar.startsWith("http")) return avatar
  if (avatar.startsWith("/media/")) return MEDIA_URL.replace(/\/$/, "") + avatar
  if (avatar.startsWith("media/")) return MEDIA_URL.replace(/\/$/, "") + "/" + avatar
  if (avatar.startsWith("avatars/")) return MEDIA_URL.replace(/\/$/, "") + "/media/" + avatar
  return avatar
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
  const { user: contextUser } = useApp()
  let currentUser = contextUser || {}
  let storedAuth = localStorage.getItem("trello-auth")
  if (!storedAuth) {
    storedAuth = sessionStorage.getItem("trello-auth")
  }
  try {
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth).user
      if (parsed) {
        currentUser = { ...currentUser, ...parsed }
      }
    }
  } catch (e) {}

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    assignees: [],
    labels: [],
    url: "",
  })

  const [originalData, setOriginalData] = useState({})

  // UI states
  const [showLabelSelector, setShowLabelSelector] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isTitleEditing, setIsTitleEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [newComment, setNewComment] = useState("")
  const [newChecklistItem, setNewChecklistItem] = useState({})
  const [newChecklistTitle, setNewChecklistTitle] = useState("")
  const [addingChecklist, setAddingChecklist] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // URL validation states
  const [urlError, setUrlError] = useState("")
  const [urlValidating, setUrlValidating] = useState(false)
  const [urlValid, setUrlValid] = useState(false)

  // Attachment states
  const [attachments, setAttachments] = useState([])
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const titleInputRef = useRef(null)

  useEffect(() => {
    if (card) {
      const data = {
        title: card.title || "",
        description: card.description || "",
        due_date: card.due_date || "",
        assignees: card.assignees || [],
        labels: card.labels || [],
        url: card.url || "",
      }
      setFormData(data)
      setOriginalData(data)
      setHasChanges(false)

      if (data.url) {
        validateUrl(data.url, false)
      }
    }
  }, [card])

  useEffect(() => {
    const dataChanged = JSON.stringify(formData) !== JSON.stringify(originalData)
    setHasChanges(dataChanged)
  }, [formData, originalData])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (isTitleEditing) {
          setFormData((prev) => ({ ...prev, title: originalData.title }))
          setIsTitleEditing(false)
        } else {
          onClose()
        }
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
  }, [isOpen, onClose, isTitleEditing, originalData.title])

  useEffect(() => {
    if (!card?.id) return
    fetchChecklist(card.id)
    fetchComments(card.id)
    fetchChecklists(card.id)
  }, [card?.id, fetchChecklist, fetchComments, fetchChecklists])

  useEffect(() => {
    if (card?.id) loadAttachments(card.id)
  }, [card?.id])

  useEffect(() => {
    if (isTitleEditing && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isTitleEditing])

  const loadAttachments = async (cardId) => {
    setLoadingAttachments(true)
    try {
      const { data } = await getAttachments(cardId)
      setAttachments(data)
    } catch (e) {
      console.error("Error loading attachments:", e)
    } finally {
      setLoadingAttachments(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "url") {
      setUrlError("")
      setUrlValid(false)
      if (value.trim()) {
        validateUrl(value)
      }
    }
  }

  const validateUrl = async (url, showLoading = true) => {
    if (!url.trim()) {
      setUrlError("")
      setUrlValid(false)
      return true
    }

    if (showLoading) setUrlValidating(true)

    try {
      // Basic URL format validation
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i

      if (!urlPattern.test(url)) {
        setUrlError("Please enter a valid URL (e.g., https://example.com)")
        setUrlValid(false)
        return false
      }

      // Add protocol if missing
      const fullUrl = url.startsWith("http") ? url : `https://${url}`

      // Simulate validation
      await new Promise((resolve) => setTimeout(resolve, 300))

      setUrlError("")
      setUrlValid(true)

      if (fullUrl !== url) {
        setFormData((prev) => ({ ...prev, url: fullUrl }))
      }

      return true
    } catch (error) {
      setUrlError("Invalid URL format. Please check and try again.")
      setUrlValid(false)
      return false
    } finally {
      if (showLoading) setUrlValidating(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateCard(card.id, {
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date ? formData.due_date.slice(0, 10) : "",
        labels: formData.labels,
        assignees: formData.assignees,
        url: formData.url,
      })
      setOriginalData(formData)
      setHasChanges(false)
      setIsEditing(false)
      setIsTitleEditing(false)
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

  const handleTitleEdit = () => {
    setIsTitleEditing(true)
  }

  const handleTitleSave = () => {
    setIsTitleEditing(false)
  }

  const handleTitleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTitleSave()
    } else if (e.key === "Escape") {
      setFormData((prev) => ({ ...prev, title: originalData.title }))
      setIsTitleEditing(false)
    }
  }

  const toggleAssignee = (userId) => {
    const currentAssignees = Array.isArray(formData.assignees) ? formData.assignees : []
    handleInputChange(
      "assignees",
      currentAssignees.includes(userId)
        ? currentAssignees.filter((id) => id !== userId)
        : [...currentAssignees, userId],
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

  // Attachment handlers
  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFile(file)
    e.target.value = null
  }

  const uploadFile = async (file) => {
    setUploading(true)
    try {
      await uploadAttachment(card.id, file)
      await loadAttachments(card.id)
      setHasChanges(true)
    } catch (e) {
      console.error("Upload failed:", e)
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await uploadFile(files[0])
    }
  }

  const handleDeleteAttachment = async (id) => {
    if (!window.confirm("Delete this attachment?")) return
    try {
      await deleteAttachment(id)
      await loadAttachments(card.id)
      setHasChanges(true)
    } catch (e) {
      console.error("Delete failed:", e)
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

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
      case "svg":
        return <FileImage className="w-4 h-4 text-blue-500" />
      case "pdf":
        return <FilePdf className="w-4 h-4 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="w-4 h-4 text-blue-700" />
      case "xls":
      case "xlsx":
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />
      case "ppt":
      case "pptx":
        return <FileBarChart className="w-4 h-4 text-orange-500" />
      case "zip":
      case "rar":
      case "7z":
        return <FileArchive className="w-4 h-4 text-purple-500" />
      case "mp3":
      case "wav":
      case "ogg":
        return <FileAudio className="w-4 h-4 text-yellow-500" />
      case "mp4":
      case "mov":
      case "avi":
      case "webm":
        return <FileVideo className="w-4 h-4 text-pink-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const isImageFile = (filename) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)
  }

  if (!isOpen || !card) return null

  const cardComments = comments[card.id] || []

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-4xl max-h-[85vh] shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Simplified Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-3 flex-1">
            {isTitleEditing ? (
              <div className="flex-1 relative">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyPress}
                  className="w-full text-lg font-semibold bg-white dark:bg-slate-700 border-2 border-blue-400 focus:border-blue-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white transition-all duration-200"
                  placeholder="Enter card title..."
                />
              </div>
            ) : (
              <div className="flex-1 group cursor-pointer relative" onClick={handleTitleEdit}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 pr-6">
                  {formData.title}
                </h2>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-md text-xs font-medium">
                <Clock className="w-3 h-3" />
                Unsaved
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Compact Tabs */}
            <div className="flex border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
              {[
                { id: "details", label: "Details", icon: FileText },
                { id: "checklists", label: "Checklist", icon: CheckSquare, count: checklistItems.length },
                { id: "comments", label: "Comments", icon: MessageCircle, count: cardComments.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 relative text-sm ${
                    activeTab === tab.id
                      ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 flex-1">
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Description
                    </label>
                    <RichTextEditor
                      value={formData.description || ""}
                      onChange={(html) => handleInputChange("description", html)}
                      placeholder="Add a detailed description..."
                      disabled={false}
                      className="w-full border border-gray-200 dark:border-slate-600 rounded-lg focus-within:border-blue-500 transition-colors duration-200"
                    />
                  </div>

                  {/* Labels */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-purple-500" />
                        Labels
                      </label>
                      <button
                        onClick={() => setShowLabelSelector(true)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(formData.labels || []).map((labelId) => {
                        const label = getLabelById(labelId)
                        if (!label) return null
                        return (
                          <span
                            key={labelId}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${label.color} ${label.textColor}`}
                          >
                            {label.name}
                          </span>
                        )
                      })}
                      {(!formData.labels || formData.labels.length === 0) && (
                        <div className="text-gray-500 dark:text-slate-400 text-xs italic">No labels assigned</div>
                      )}
                    </div>
                  </div>

                  {/* Assignees */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      Assignees
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {board?.members?.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => toggleAssignee(member.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${
                            formData.assignees.includes(member.id)
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                              : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600"
                          }`}
                        >
                          <img
                            src={getAvatarUrl(member.avatar) || "/placeholder.svg"}
                            alt={member.first_name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="font-medium">
                            {member.first_name} {member.last_name}
                          </span>
                          {formData.assignees.includes(member.id) && <Check className="w-3 h-3 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.due_date ? formData.due_date.slice(0, 10) : ""}
                      onChange={(e) => handleInputChange("due_date", e.target.value)}
                      className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-200 text-sm"
                    />
                  </div>

                  {/* Compact Attachments */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-indigo-500" />
                        Attachments
                      </label>
                      <button
                        onClick={handleUploadClick}
                        disabled={uploading}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200 disabled:opacity-50"
                      >
                        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        {uploading ? "Uploading..." : "Add"}
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    </div>

                    {loadingAttachments ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : attachments.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className="group relative bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden hover:shadow-md transition-all duration-200"
                          >
                            {isImageFile(att.file) ? (
                              <div className="relative h-24 bg-gray-100 dark:bg-slate-600">
                                <img
                                  src={att.file.startsWith("http") ? att.file : MEDIA_URL + att.file}
                                  alt={att.file.split("/").pop()}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                  <div className="flex gap-1">
                                    <a
                                      href={att.file.startsWith("http") ? att.file : MEDIA_URL + att.file}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 bg-white/90 rounded hover:bg-white transition-colors"
                                    >
                                      <Eye className="w-3 h-3 text-gray-700" />
                                    </a>
                                    <a
                                      href={att.file.startsWith("http") ? att.file : MEDIA_URL + att.file}
                                      download
                                      className="p-1.5 bg-white/90 rounded hover:bg-white transition-colors"
                                    >
                                      <Download className="w-3 h-3 text-gray-700" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-16 bg-gray-50 dark:bg-slate-600 flex items-center justify-center">
                                {getFileIcon(att.file)}
                              </div>
                            )}

                            <div className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-xs text-gray-900 dark:text-white truncate flex-1">
                                  {att.file.split("/").pop()}
                                </h4>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <a
                                    href={att.file.startsWith("http") ? att.file : MEDIA_URL + att.file}
                                    download
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded transition-colors"
                                    title="Download"
                                  >
                                    <Download className="w-3 h-3 text-gray-500" />
                                  </a>
                                  {att.uploaded_by === currentUser.username && (
                                    <button
                                      onClick={() => handleDeleteAttachment(att.id)}
                                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-500" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mt-1">
                                <span>{att.file_size ? formatBytes(att.file_size) : "N/A"}</span>
                                <span>{att.uploaded_at_formatted || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                          dragOver
                            ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/30"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">No attachments yet</p>
                        <button
                          onClick={handleUploadClick}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors duration-200"
                        >
                          Choose Files
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "checklists" && (
                <div className="space-y-4">
                  {/* Compact Add Checklist */}
                  <div className="bg-blue-50 dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-slate-600">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newChecklistTitle}
                        onChange={(e) => setNewChecklistTitle(e.target.value)}
                        placeholder="Create a new checklist..."
                        className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-200 text-sm"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleAddChecklist()
                        }}
                        disabled={addingChecklist}
                      />
                      <button
                        onClick={handleAddChecklist}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 text-sm font-medium"
                        disabled={addingChecklist || !newChecklistTitle.trim()}
                      >
                        {addingChecklist ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Compact Checklists */}
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
                            className="bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden"
                          >
                            {/* Compact Header */}
                            <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-600">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                                  <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  {checklist.title}
                                </h3>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    percent === 100
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  }`}
                                >
                                  {completed}/{total}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    percent === 100 ? "bg-green-500" : "bg-blue-500"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>

                            {/* Compact Items */}
                            <div className="p-4">
                              <div className="space-y-2 mb-4">
                                {items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-600/50 rounded-lg transition-all duration-200 group"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={item.completed}
                                      onChange={() => handleToggleChecklistItem(item.id, item.completed)}
                                      className="w-4 h-4 text-blue-600 bg-gray-100 border border-gray-300 rounded focus:ring-blue-500 transition-colors duration-200"
                                    />
                                    <span
                                      className={`flex-1 text-sm transition-all duration-200 ${
                                        item.completed
                                          ? "line-through text-gray-400 dark:text-slate-500"
                                          : "text-gray-900 dark:text-white"
                                      }`}
                                    >
                                      {item.text}
                                    </span>
                                    <button
                                      onClick={() => handleDeleteChecklistItem(item.id)}
                                      className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Add Item */}
                              <div className="flex gap-2 p-2 bg-gray-50 dark:bg-slate-600/30 rounded-lg">
                                <input
                                  type="text"
                                  value={newChecklistItem[checklist.id] || ""}
                                  onChange={(e) =>
                                    setNewChecklistItem((prev) => ({ ...prev, [checklist.id]: e.target.value }))
                                  }
                                  placeholder="Add an item..."
                                  className="flex-1 px-2 py-1.5 border border-gray-200 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-200 text-sm"
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      handleAddChecklistItem(checklist.id)
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleAddChecklistItem(checklist.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200 disabled:opacity-50 text-sm font-medium"
                                  disabled={!newChecklistItem[checklist.id]?.trim()}
                                >
                                  <Plus className="w-3 h-3" />
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No checklists yet</h3>
                      <p className="text-gray-500 dark:text-slate-400 text-sm">
                        Create your first checklist to start organizing tasks
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "comments" && (
                <div className="space-y-4">
                  {/* Compact Add Comment */}
                  <div className="bg-blue-50 dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-slate-600">
                    <div className="flex gap-3">
                      <img
                        src={getAvatarUrl(currentUser.avatar) || "/placeholder.svg"}
                        alt={currentUser.first_name || "You"}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 space-y-2">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none transition-colors duration-200 text-sm"
                          rows={2}
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact Comments */}
                  <div className="space-y-3">
                    {cardComments.map((comment) => {
                      const avatarUrl = getAvatarUrl(comment.author?.avatar) || "/placeholder.svg"
                      const displayName =
                        ((comment.author?.first_name || "") + " " + (comment.author?.last_name || "")).trim() ||
                        comment.author?.username ||
                        comment.author?.email ||
                        "User"

                      return (
                        <div
                          key={comment.id}
                          className="flex gap-3 p-4 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600"
                        >
                          <img
                            src={avatarUrl || "/placeholder.svg"}
                            alt={displayName}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">{displayName}</span>
                              <span className="text-xs text-gray-500 dark:text-slate-400">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      )
                    })}

                    {cardComments.length === 0 && (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No comments yet</h3>
                        <p className="text-gray-500 dark:text-slate-400 text-sm">Be the first to add a comment</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compact Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Card Details</h3>

            <div className="space-y-4">
              {/* Due Date */}
              {formData.due_date && (
                <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-orange-500" />
                    Due Date
                  </label>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">{formatDate(formData.due_date)}</span>
                  </div>
                </div>
              )}

              {/* Created */}
              <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Created</label>
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(card.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-3">
                  Quick Actions
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowLabelSelector(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg transition-all duration-200 border border-gray-200 dark:border-slate-600 text-sm"
                  >
                    <Tag className="w-4 h-4 text-purple-500" />
                    <span>Labels</span>
                  </button>

                  <button
                    onClick={handleUploadClick}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg transition-all duration-200 border border-gray-200 dark:border-slate-600 text-sm"
                  >
                    <Paperclip className="w-4 h-4 text-indigo-500" />
                    <span>Attachment</span>
                  </button>

                  <div className="border-t border-gray-200 dark:border-slate-600 pt-3 mt-4">
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 border border-red-200 dark:border-red-800/30 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Card</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Save Button */}
        {hasChanges && (
          <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                <Clock className="w-3 h-3" />
                <span>You have unsaved changes</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormData(originalData)
                    setHasChanges(false)
                    setIsTitleEditing(false)
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 text-sm font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !!urlError}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
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
