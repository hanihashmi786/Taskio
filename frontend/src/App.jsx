import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { AppProvider } from "./context/AppContext"
import { ThemeProvider } from "./context/ThemeContext"
import Signup from "./pages/auth/Signup"
import Signin from "./pages/auth/Signin"
import Dashboard from "./pages/dashboard/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"

const App = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </ThemeProvider>
  )
}

export default App
