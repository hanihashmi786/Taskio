"use client"
import { useState, useEffect } from "react"
import { X, UserPlus, Crown, Shield, User, Mail, Trash2, MoreHorizontal, Loader2 } from "lucide-react"
import useBoardStore from "../store/boardStore"
import API from "../api/index"

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "";

function getAvatarUrl(avatar) {
  if (!avatar) return "/placeholder.svg";
  if (avatar.startsWith("http")) return avatar;
  if (avatar.startsWith("/media/")) return MEDIA_URL.replace(/\/$/, "") + avatar;
  if (avatar.startsWith("media/")) return MEDIA_URL.replace(/\/$/, "") + "/" + avatar;
  if (avatar.startsWith("avatars/")) return MEDIA_URL.replace(/\/$/, "") + "/media/" + avatar;
  return avatar;
}

const BoardMembers = ({ boardId, onClose }) => {
  const { getCurrentBoard, removeMemberFromBoard, updateMemberRole, canEditBoard } = useBoardStore()
  const [showAddMember, setShowAddMember] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [addingUserId, setAddingUserId] = useState(null)
  const [showMemberOptions, setShowMemberOptions] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [refresh, setRefresh] = useState(false)

  // Get current board and safe members array
  const board = getCurrentBoard()
  const members = Array.isArray(board?.members) ? board.members : []
  const canEdit = canEditBoard(boardId)

  console.log("Current board:", board)
  console.log("Board members:", members)
  if (!board) return null

  // --- Search users to add ---
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([])
      setError("")
      return
    }
    setSearching(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await API.get(`/accounts/search-users/?q=${encodeURIComponent(searchTerm)}&board=${boardId}`)
        setSearchResults(res.data)
        setError("")
      } catch (error) {
        // Print entire error to console for debugging
        console.error("search-users API error:", error?.response?.data || error)
        setError(error?.response?.data?.error || "Failed to search users.")
        setSearchResults([])
      }
      setSearching(false)
    }, 350)
    return () => clearTimeout(timeout)
  }, [searchTerm, boardId, refresh])

  // --- Add user to board ---
  const handleAdd = async (userId) => {
    setAddingUserId(userId)
    setError("")
    setSuccess("")
    try {
      const res = await API.post("/accounts/add-board-member/", {
        board_id: boardId,
        user_id: userId,
        role: "member"
      })
      setSuccess("User added to board!")
      setSearchResults((prev) => prev.filter(u => u.id !== userId))
      setSearchTerm("")
      setRefresh(r => !r)
    } catch (error) {
      console.error("addBoardMember API error:", error?.response?.data || error)
      setError(error?.response?.data?.error || "Could not add member.")
    }
    setAddingUserId(null)
  }

  // --- Remove member ---
  const handleRemoveMember = async (memberId) => {
    try {
      if (window.confirm("Are you sure you want to remove this member from the board?")) {
        await removeMemberFromBoard(boardId, memberId)
        setShowMemberOptions(null)
        setRefresh(r => !r)
      }
    } catch (error) {
      console.error("removeMemberFromBoard API error:", error?.response?.data || error)
      setError(error?.response?.data?.error || "Could not remove member.")
    }
  }

  // --- Role management ---
  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateMemberRole(boardId, memberId, newRole)
      setShowMemberOptions(null)
      setRefresh(r => !r)
    } catch (error) {
      console.error("updateMemberRole API error:", error?.response?.data || error)
      setError(error?.response?.data?.error || "Could not update role.")
    }
  }

  // --- Role helpers ---
  const getRoleIcon = (role) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return <User className="w-4 h-4 text-gray-500 dark:text-slate-400" />
    }
  }
  const getRoleLabel = (role) => {
    switch (role) {
      case "owner":
        return "Owner"
      case "admin":
        return "Admin"
      default:
        return "Member"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Board Members</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Add Member Search */}
          {canEdit && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">Add Member</h3>
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value)
                  setError("")
                  setSuccess("")
                }}
                placeholder="Search by name or email"
                className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-1"
              />
              {searching && (
                <div className="text-sm text-gray-500 flex items-center"><Loader2 className="animate-spin w-4 h-4 mr-2" />Searching…</div>
              )}
              {error && <div className="text-sm text-red-600">{error}</div>}
              {success && <div className="text-sm text-green-600">{success}</div>}
              <ul>
                {searchResults.map(user => (
                  <li key={user.id} className="flex items-center py-1 border-b last:border-b-0">
                    <img
                      src={getAvatarUrl(user.avatar)}
                      alt={user.first_name || "No Name"}
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                    <span className="flex-1">{user.first_name || "No Name"} <span className="text-gray-500 text-xs">({user.email})</span></span>
                    <button
                      onClick={() => handleAdd(user.id)}
                      disabled={addingUserId === user.id}
                      className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
                      title="Add to board"
                    >
                      {addingUserId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100">
                Members ({members.length})
              </h3>
            </div>
            {members.map((member) => (
              <div key={member.id} className="relative group">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarUrl(member.avatar)}
                      alt={member.first_name || "No Name"}
                      className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-slate-600"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-slate-100">{member.first_name || "No Name"}</span>
                        {getRoleIcon(member.role)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-full">
                      {getRoleLabel(member.role)}
                    </span>
                    {canEdit && member.role !== "owner" && (
                      <div className="relative">
                        <button
                          onClick={() => setShowMemberOptions(showMemberOptions === member.id ? null : member.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        </button>

                        {showMemberOptions === member.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMemberOptions(null)} />
                            <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg py-2 z-20 min-w-[140px] fade-in">
                              {member.role === "member" && (
                                <button
                                  onClick={() => handleRoleChange(member.id, "admin")}
                                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                                >
                                  <Shield className="w-4 h-4" />
                                  Make Admin
                                </button>
                              )}
                              {member.role === "admin" && (
                                <button
                                  onClick={() => handleRoleChange(member.id, "member")}
                                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                                >
                                  <User className="w-4 h-4" />
                                  Make Member
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default BoardMembers
