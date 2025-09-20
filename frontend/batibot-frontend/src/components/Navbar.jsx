import { Link, useNavigate, useLocation } from 'react-router-dom'
import { User, Package, ArrowLeftRight, LogOut } from 'lucide-react'

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="steam-header">
      <div className="header-content">
        <Link to="/" className="steam-logo">
          <div className="logo-icon">
            <ArrowLeftRight size={16} />
          </div>
          BarterBay
        </Link>

        <nav className="header-nav">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>Store</Link>
          <Link to="/inventory" className={`nav-item ${isActive('/inventory') ? 'active' : ''}`}>Inventory</Link>
          <Link to="/trading" className={`nav-item ${isActive('/trading') ? 'active' : ''}`}>Trading</Link>
        </nav>

        <div className="user-menu">
          {user ? (
            <>
              <div className="user-info">
                <User size={14} />
                <span>{user.username}</span>
              </div>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">Login</Link>
              <Link to="/register" className="nav-item">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
