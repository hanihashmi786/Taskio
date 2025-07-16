"use client"

import { useState, useEffect } from "react"
import { getProfile, updateProfile } from "../api/auth"
import { Save, Camera, User, Mail, Calendar } from "lucide-react"
import { useApp } from "../context/AppContext"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "";

function getAvatarUrl(avatar) {
  if (!avatar) return "/placeholder.svg";
  if (avatar.startsWith("http")) return avatar;
  if (avatar.startsWith("/media/")) return MEDIA_URL.replace(/\/$/, "") + avatar;
  if (avatar.startsWith("media/")) return MEDIA_URL.replace(/\/$/, "") + "/" + avatar;
  if (avatar.startsWith("avatars/")) return MEDIA_URL.replace(/\/$/, "") + "/media/" + avatar;
  return avatar;
}

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState("")
  const [memberSince, setMemberSince] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const { updateUser } = useApp();

  useEffect(() => {
    setLoading(true)
    getProfile()
      .then(res => {
        setFormData({
          firstName: res.data.first_name || "",
          lastName: res.data.last_name || "",
          email: res.data.email || "",
          avatar: res.data.avatar || "",
        })
        setAvatarPreview(res.data.avatar || "")
        setMemberSince(res.data.date_joined ? new Date(res.data.date_joined) : null)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load profile. Please log in again.")
        setLoading(false)
      })
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSuccess("")
    setError("")
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setFormData(prev => ({ ...prev, avatar: "" })) // clear base64
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess("")
    setError("")
    try {
      const form = new window.FormData()
      form.append("first_name", formData.firstName)
      form.append("last_name", formData.lastName)
      if (avatarFile) {
        form.append("avatar", avatarFile)
      }
      const res = await updateProfile(form)
      setFormData({
        firstName: res.data.first_name || "",
        lastName: res.data.last_name || "",
        email: res.data.email || "",
        avatar: res.data.avatar || "",
      })
      setAvatarPreview(res.data.avatar || "")
      setAvatarFile(null)
      // Update localStorage and sessionStorage user info for header
      try {
        let authData = {};
        let stored = localStorage.getItem("trello-auth");
        if (!stored) {
          stored = sessionStorage.getItem("trello-auth");
        }
        if (stored) {
          authData = JSON.parse(stored);
        }
        if (authData && authData.user) {
          authData.user = {
            ...authData.user,
            first_name: res.data.first_name,
            last_name: res.data.last_name,
            email: res.data.email,
            avatar: res.data.avatar,
          };
          localStorage.setItem("trello-auth", JSON.stringify(authData));
          sessionStorage.setItem("trello-auth", JSON.stringify(authData));
        }
        // Also update trello-user for context rehydration
        const userObj = {
          name: (res.data.first_name + " " + res.data.last_name).trim(),
          email: res.data.email,
          username: res.data.email, // or use res.data.username if available
          avatar: res.data.avatar,
        };
        localStorage.setItem("trello-user", JSON.stringify(userObj));
        sessionStorage.setItem("trello-user", JSON.stringify(userObj));
        // Update context user for header
        if (updateUser) {
          updateUser(userObj);
        }
      } catch (e) { /* ignore */ }
      setSuccess("Profile updated successfully.")
    } catch (err) {
      setError("Failed to update profile. Please log in again.")
    }
    setSaving(false)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" style={{ minHeight: "100vh", overflowY: "auto" }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-slate-100">Profile</h1>
        <p className="text-gray-600 dark:text-slate-400">Manage your personal information and view your activity.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-100 dark:border-slate-700"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <img
                    src={
                      avatarPreview
                        ? getAvatarUrl(avatarPreview)
                        : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face"
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
                  {(formData.firstName + " " + formData.lastName).trim() || "Your Name"}
                </h2>
                <p className="text-gray-600 dark:text-slate-400 mb-4">{formData.email}</p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Since {memberSince ? memberSince.getFullYear() : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-6">Personal Information</h3>
              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                  {success}
                </div>
              )}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-slate-700">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile