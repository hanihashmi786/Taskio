"use client"
import { useState } from "react"
import { X, Plus, UserPlus, Crown, Shield, User, Mail, Trash2, MoreHorizontal } from "lucide-react"
import useBoardStore from "../store/boardStore"

const BoardMembers = ({ boardId, onClose }) => {
  const { getCurrentBoard, addMemberToBoard, removeMemberFromBoard, updateMemberRole, canEditBoard } = useBoardStore()
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberData, setNewMemberData] = useState({
    name: "",
    email: "",
    avatar: "",
  })
  const [showMemberOptions, setShowMemberOptions] = useState(null)

  const board = getCurrentBoard()
  const canEdit = canEditBoard(boardId)

  if (!board) return null

  const handleAddMember = (e) => {
    e.preventDefault()
    if (newMemberData.name.trim() && newMemberData.email.trim()) {
      const memberToAdd = {
        ...newMemberData,
        name: newMemberData.name.trim(),
        email: newMemberData.email.trim(),
        avatar:
          newMemberData.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(newMemberData.name)}&background=3b82f6&color=fff`,
      }
      addMemberToBoard(boardId, memberToAdd)
      setNewMemberData({ name: "", email: "", avatar: "" })
      setShowAddMember(false)
    }
  }

  const handleRemoveMember = (memberId) => {
    if (window.confirm("Are you sure you want to remove this member from the board?")) {
      removeMemberFromBoard(boardId, memberId)
      setShowMemberOptions(null)
    }
  }

  const handleRoleChange = (memberId, newRole) => {
    updateMemberRole(boardId, memberId, newRole)
    setShowMemberOptions(null)
  }

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
          {/* Add Member Form */}
          {showAddMember && canEdit && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
              <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-3">Add New Member</h3>
              <form onSubmit={handleAddMember} className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={newMemberData.name}
                    onChange={(e) => setNewMemberData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={newMemberData.email}
                    onChange={(e) => setNewMemberData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Email address"
                    className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="url"
                    value={newMemberData.avatar}
                    onChange={(e) => setNewMemberData((prev) => ({ ...prev, avatar: e.target.value }))}
                    placeholder="Avatar URL (optional)"
                    className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMember(false)}
                    className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100">
                Members ({board.members.length})
              </h3>
              {canEdit && !showAddMember && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Member
                </button>
              )}
            </div>

            {board.members.map((member) => (
              <div key={member.id} className="relative group">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar || "/placeholder.svg"}
                      alt={member.name}
                      className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-slate-600"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-slate-100">{member.name}</span>
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
