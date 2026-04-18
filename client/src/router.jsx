import ElectionsPage from './pages/elections/ElectionsPage'
import ElectionDetailPage from './pages/elections/ElectionDetailPage'
import CreateElectionModal from './pages/elections/CreateElectionModal'
import ProposalsPage from './pages/proposals/ProposalsPage'
import GrievancesPage from './pages/grievances/GrievancesPage'
import PollsPage from './pages/polls/PollsPage'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import LandingPage from './pages/LandingPage'
import EventsPage from './pages/events/EventsPage'
import EventDetailPage from './pages/events/EventDetailPage'
import ClubsPage from './pages/clubs/ClubsPage'
import ClubDetailPage from './pages/clubs/ClubDetailPage'

// Redirect logged-in users away from auth pages
function GuestRoute() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenSpinner />
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />
}

// Protect pages that require login
function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenSpinner />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },

  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
    ],
  },

  {
    element: <ElectionsPage />,
    children: [
        { path: '/elections', element: <ElectionsPage /> },
        { path: '/elections/:id', element: <ElectionDetailPage /> },
    ]
  },

  {
    element: <ProposalsPage />,
    children: [
        { path: '/proposals', element: <ProposalsPage /> },
    ]
  },

  {
    element: <GrievancesPage />,
    children: [
       { path: '/grievances', element: <GrievancesPage /> },
    ]
  },

  {
    element: <PollsPage />,
    children: [
        { path: '/polls', element: <PollsPage /> },
    ]
  },

   {
    element: <EventsPage />,
    children: [
       { path: '/events', element: <EventsPage /> },
    ]
  },

   {
    element: <EventDetailPage />,
    children: [
        { path: '/events/:id', element: <EventDetailPage /> },
    ]
  },

   {
    element: <ClubsPage />,
    children: [
        { path: '/clubs', element: <ClubsPage /> },
    ]
  },

   {
    element: <ClubDetailPage />,
    children: [
        { path: '/clubs/:id', element: <ClubDetailPage /> },
    ]
  },

  { path: '*', element: <Navigate to="/" replace /> },
])

export default router