import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6">
        <span className="text-white text-3xl font-bold">C</span>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-3">CampusChain</h1>
      <p className="text-gray-500 text-lg max-w-md mb-8">
        Your campus - Your voice - Your record. All in one place.
      </p>
      <div className="flex gap-3">
        <Link to="/register">
          <Button>Get started</Button>
        </Link>
        <Link to="/login">
          <Button variant="secondary">Sign in</Button>
        </Link>
      </div>
    </div>
  )
}