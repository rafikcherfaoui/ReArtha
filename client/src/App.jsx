import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import UserLayout from './components/UserLayout'

// Landing page
import Landing from './pages/Landing'
import PublicRoute from './components/PublicRoute'

// Auth
import Login from './pages/user/Login'
import Register from './pages/user/Register'

// User pages
import Dashboard from './pages/user/Dashboard'
import Rewards from './pages/user/Rewards'
import MapPage from './pages/user/MapPage'
import Profile from './pages/user/Profile'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminHome from './pages/admin/AdminHome'
import Deposits from './pages/admin/Deposits'
import RewardsAdmin from './pages/admin/RewardsAdmin'
import AdminMap from './pages/admin/AdminMap'
import Users from './pages/admin/Users'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
<Route path="/about" element={<Landing />} />
          {/* Public */}
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
<Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
<Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* User app — all wrapped in UserLayout for bottom nav */}
          <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin panel — sidebar layout */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
            <Route index element={<AdminHome />} />
            <Route path="deposits" element={<Deposits />} />
            <Route path="rewards" element={<RewardsAdmin />} />
            <Route path="map" element={<AdminMap />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App