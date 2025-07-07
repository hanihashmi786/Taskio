"use client"

import { useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, User, Lock, Trello } from "lucide-react"

const Signin = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (message) {
      setMessage("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setIsLoading(true)

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/accounts/login/", formData)

      localStorage.setItem("access_token", response.data.access_token)
      localStorage.setItem("trello-auth", "true")

      const userData = {
        username: formData.username,
        email: response.data.email || `${formData.username}@example.com`,
        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`,
        id: response.data.user_id || Date.now().toString(),
      }
      localStorage.setItem("trello-user", JSON.stringify(userData))

      setMessage("Login successful! 🎉")

      setTimeout(() => {
        navigate("/dashboard")
      }, 1000)
    } catch (error) {
      setMessage(error.response && error.response.data ? error.response.data.error || "Login failed!" : "Login failed!")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    const demoUser = {
      username: "demo_user",
      email: "demo@example.com",
      avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`,
      id: "demo-user",
    }

    localStorage.setItem("trello-user", JSON.stringify(demoUser))
    localStorage.setItem("trello-auth", "true")
    localStorage.setItem("access_token", "demo-token")
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Trello className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your Trello Clone account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div
              className={`p-4 rounded-lg text-sm font-medium text-center border ${
                message.includes("successful")
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-4 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-slate-600 text-blue-500 focus:ring-blue-500/50 bg-slate-900/50"
              />
              <span className="ml-2 text-sm text-slate-400">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800/60 text-slate-400">Or</span>
            </div>
          </div>

          <button type="button" onClick={handleDemoLogin} className="w-full btn-secondary py-4 text-base font-semibold">
            Try Demo Account
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signin
