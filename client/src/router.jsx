import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyPage from './pages/VerifyPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ElectionsPage from './pages/elections/ElectionsPage'
import ElectionDetailPage from './pages/elections/ElectionDetailPage'
import ProposalsPage from './pages/proposals/ProposalsPage'
import GrievancesPage from './pages/grievances/GrievancesPage'
import PollsPage from './pages/polls/PollsPage'
import EventsPage from './pages/events/EventsPage'
import EventDetailPage from './pages/events/EventDetailPage'
import ClubsPage from './pages/clubs/ClubsPage'
import ClubDetailPage from './pages/clubs/ClubDetailPage'
import ProfilePage from './pages/profile/ProfilePage'
import CertificatesPage from './pages/certificates/CertificatesPage'
import LeaderboardPage from './pages/leaderboard/LeaderboardPage'
import DirectoryPage from './pages/directory/DirectoryPage'
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import MentorshipPage from './pages/mentorship/MentorshipPage';
import ResumePage from './pages/resume/ResumePage';

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function GuestRoute() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenSpinner />
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />
}

function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenSpinner />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/verify/:code', element: <VerifyPage /> },

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
      { path: '/elections', element: <ElectionsPage /> },
      { path: '/elections/:id', element: <ElectionDetailPage /> },
      { path: '/proposals', element: <ProposalsPage /> },
      { path: '/grievances', element: <GrievancesPage /> },
      { path: '/polls', element: <PollsPage /> },
      { path: '/events', element: <EventsPage /> },
      { path: '/events/:id', element: <EventDetailPage /> },
      { path: '/clubs', element: <ClubsPage /> },
      { path: '/clubs/:id', element: <ClubDetailPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/certificates', element: <CertificatesPage /> },
      { path: '/leaderboard', element: <LeaderboardPage /> },
      { path: '/directory', element: <DirectoryPage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'admin', element: <AdminDashboardPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'mentorship', element: <MentorshipPage /> },
      { path: 'resume', element: <ResumePage /> },
      
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])

export default router