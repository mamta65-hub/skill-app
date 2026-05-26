import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import App from './App'
import LoginSignup from './pages/LoginSignup'
import Dashboard from './pages/Dashboard'
import RoadmapPage from './pages/RoadmapPage'
import LeaderboardPage from './pages/LeaderboardPage'
import AdminPanel from './pages/AdminPanel'
import ChallengePage from './pages/ChallengePage'
import ResumePage from './pages/ResumePage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login"      element={<LoginSignup />} />
          <Route path="/"           element={<App />} />
          <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/roadmap"    element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/admin"      element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          <Route path="/challenges" element={<ProtectedRoute><ChallengePage /></ProtectedRoute>} />
          <Route path="/resume"     element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/profile"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)