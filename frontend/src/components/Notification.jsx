"use client"

import { useEffect } from "react"
import { useApp } from "../context/AppContext"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"

const Notification = () => {
  const { notification, hideNotification } = useApp()

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideNotification()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [notification, hideNotification])

  if (!notification) return null

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      case "info":
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 fade-in">
      <div className={`flex items-center space-x-3 p-4 rounded-lg border ${getBgColor()} shadow-lg max-w-sm`}>
        {getIcon()}
        <p className="text-sm font-medium flex-1">{notification.message}</p>
        <button onClick={hideNotification} className="p-1 hover:bg-black/10 rounded transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Notification
