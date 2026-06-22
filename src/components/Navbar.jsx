import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        justype<span className="logo-dot">.</span>
      </Link>
      <div className="navbar-links">
        <Link to="/leaderboard" className="nav-link">leaderboard</Link>
        {user ? (
          <>
            <Link to="/history" className="nav-link">history</Link>
            <button onClick={handleSignOut} className="nav-link nav-link-btn">sign out</button>
          </>
        ) : (
          <>
            <Link to="/auth" className="nav-link">sign in</Link>
          </>
        )}
      </div>
    </nav>
  )
}
