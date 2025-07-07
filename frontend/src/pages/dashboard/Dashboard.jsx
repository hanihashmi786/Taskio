"use client"
import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"
import Sidebar from "../../components/Sidebar"
import Header from "../../components/Header"
import KanbanBoard from "../../components/KanbanBoard"
import BoardsPage from "../../components/BoardsPage"
import Settings from "../../components/Settings"
import Profile from "../../components/Profile"
import CardModal from "../../components/CardModal"
import Notification from "../../components/Notification"
import { useApp } from "../../context/AppContext"

const Dashboard = () => {
  const { theme } = useTheme()
  const { notification } = useApp()
  const [selectedCard, setSelectedCard] = useState(null)

  return (
    <div className={theme}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-slate-100 transition-colors duration-200">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-hidden">
              <Routes>
                <Route path="/" element={<BoardsPage />} />
                <Route path="/boards" element={<BoardsPage />} />
                <Route path="/board/:id" element={<KanbanBoard onCardClick={setSelectedCard} />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
          </div>
        </div>

        {selectedCard && <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
        <Notification />
      </div>
    </div>
  )
}

export default Dashboard
