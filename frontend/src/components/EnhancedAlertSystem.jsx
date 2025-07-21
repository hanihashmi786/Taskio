"use client"

import { useApp } from "../context/AppContext"
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from "lucide-react"

const EnhancedAlertSystem = () => {
  const { alerts, removeAlert } = useApp()

  const getAlertIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getAlertStyles = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200"
      case "info":
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
    }
  }

  if (!alerts || alerts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start gap-3 p-4 border rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-right ${getAlertStyles(alert.type)}`}
        >
          <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
            <p className="text-sm opacity-90">{alert.message}</p>
          </div>

          <button
            onClick={() => removeAlert(alert.id)}
            className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default EnhancedAlertSystem
