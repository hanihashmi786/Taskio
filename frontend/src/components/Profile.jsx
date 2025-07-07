"use client"

import { useState } from "react"
import { useApp } from "../context/AppContext"
import useBoardStore from "../store/boardStore"
import { Save, Camera, User, Mail, MapPin, Calendar, Activity, TrendingUp, Award } from "lucide-react"

const Profile = () => {
  const { user, updateUser } = useApp()
  const { getUserBoards } = useBoardStore()
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    avatar: user.avatar || "",
  })

  const boards = getUserBoards()

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateUser(formData)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        handleInputChange("avatar", e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Calculate user stats
  const totalCards = boards.reduce(
    (total, board) => total + board.lists.reduce((listTotal, list) => listTotal + list.cards.length, 0),
    0,
  )

  const completedCards = boards.reduce((total, board) => {
    const doneList = board.lists.find(
      (list) => list.title.toLowerCase().includes("done") || list.title.toLowerCase().includes("completed"),
    )
    return total + (doneList ? doneList.cards.length : 0)
  }, 0)

  const memberSince = new Date(2024, 0, 1) // Default member since date

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-slate-100">Profile</h1>
        <p className="text-gray-600 dark:text-slate-400">Manage your personal information and view your activity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <img
                  src={
                    formData.avatar ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face" ||
                    "/placeholder.svg"
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-slate-600 shadow-lg"
                />
                <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">
                {formData.name || "Your Name"}
              </h2>
              <p className="text-gray-600 dark:text-slate-400 mb-4">{formData.email}</p>

              {formData.bio && (
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 italic">"{formData.bio}"</p>
              )}

              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                {formData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{formData.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Since {memberSince.getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 mt-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Activity Stats
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <div className="w-5 h-5 bg-white rounded" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-100">Boards Created</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Total projects</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{boards.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-100">Cards Created</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Total tasks</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{totalCards}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-100">Completed</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Finished tasks</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{completedCards}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-100">Completion Rate</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Success percentage</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6">Personal Information</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-slate-700">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Recent Boards */}
          {boards.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 mt-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Your Recent Boards</h3>
              <div className="space-y-3">
                {boards.slice(0, 5).map((board) => (
                  <div
                    key={board.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full ${board.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-slate-100 truncate">{board.title}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-400">
                        {board.lists.reduce((total, list) => total + list.cards.length, 0)} cards • {board.lists.length}{" "}
                        lists
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      {new Date(board.updatedAt || board.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
