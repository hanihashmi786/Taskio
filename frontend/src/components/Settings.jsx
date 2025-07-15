"use client"

import { useState, useEffect } from "react"
import { useApp } from "../context/AppContext"
import { Moon, Sun, Bell, User, Shield, Download, Upload, Trash2, SettingsIcon } from "lucide-react"

const Settings = () => {
  const { theme, setTheme, showNotification } = useApp()
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    autoSave: true,
    compactMode: false,
  })

  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    avatar: "/placeholder.svg",
  })

  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("trello-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings((prev) => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }

    // Load profile from localStorage
    const savedProfile = localStorage.getItem("trello-user")
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        setProfile((prev) => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error("Error loading profile:", error)
      }
    }
  }, [])

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem("trello-settings", JSON.stringify(newSettings))

    if (key === "theme") {
      setTheme(value)
    }

    showNotification({ message: "Setting updated!", type: "success" })
  }

  const handleProfileChange = (key, value) => {
    const newProfile = { ...profile, [key]: value }
    setProfile(newProfile)
    localStorage.setItem("trello-user", JSON.stringify(newProfile))
    showNotification({ message: "Profile updated!", type: "success" })
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const data = {
        boards: JSON.parse(localStorage.getItem("trello-boards") || "[]"),
        user: profile,
        settings: settings,
        exportDate: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `trello-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      showNotification({ message: "Data exported successfully!", type: "success" })
    } catch (error) {
      showNotification({ message: "Error exporting data", type: "error" })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportData = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (data.boards) localStorage.setItem("trello-boards", JSON.stringify(data.boards))
      if (data.user) {
        setProfile(data.user)
        localStorage.setItem("trello-user", JSON.stringify(data.user))
      }
      if (data.settings) {
        setSettings(data.settings)
        localStorage.setItem("trello-settings", JSON.stringify(data.settings))
      }

      showNotification({
        message: "Data imported successfully! Please refresh the page.",
        type: "success",
      })
    } catch (error) {
      showNotification({
        message: "Error importing data. Please check the file format.",
        type: "error",
      })
    } finally {
      setIsImporting(false)
      event.target.value = ""
    }
  }

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.clear()
      showNotification({ message: "All data cleared successfully!", type: "success" })
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
    </label>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
        <p className="text-gray-600 dark:text-slate-400">Manage your account and application preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h2>
          </div>

          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <img
                src={profile.avatar || "/placeholder.svg"}
                alt="Profile"
                className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-slate-600"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleProfileChange("name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            {theme === "light" ? (
              <Sun className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Theme</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Choose your preferred color scheme</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSettingChange("theme", "light")}
                  className={`p-3 rounded-lg transition-colors ${
                    theme === "light"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400"
                  }`}
                >
                  <Sun className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleSettingChange("theme", "dark")}
                  className={`p-3 rounded-lg transition-colors ${
                    theme === "dark"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400"
                  }`}
                >
                  <Moon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Compact Mode</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Use smaller spacing and elements</p>
              </div>
              <ToggleSwitch
                checked={settings.compactMode}
                onChange={(value) => handleSettingChange("compactMode", value)}
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Receive notifications in your browser</p>
              </div>
              <ToggleSwitch
                checked={settings.notifications}
                onChange={(value) => handleSettingChange("notifications", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Email Updates</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Get updates via email</p>
              </div>
              <ToggleSwitch
                checked={settings.emailUpdates}
                onChange={(value) => handleSettingChange("emailUpdates", value)}
              />
            </div>
          </div>
        </div>

        {/* Productivity Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Productivity</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Auto-save</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Automatically save changes as you work</p>
              </div>
              <ToggleSwitch checked={settings.autoSave} onChange={(value) => handleSettingChange("autoSave", value)} />
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Management</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Export Data</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Download all your boards and settings</p>
              </div>
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Import Data</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Restore from a backup file</p>
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer">
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import
                  </>
                )}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={isImporting}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div>
                <h3 className="font-medium text-red-900 dark:text-red-400">Clear All Data</h3>
                <p className="text-sm text-red-600 dark:text-red-400">Permanently delete all boards and settings</p>
              </div>
              <button
                onClick={handleClearData}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
