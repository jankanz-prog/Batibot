import { Link } from 'react-router-dom'
import { ArrowRight, Gamepad2, Shield, Users, TrendingUp } from 'lucide-react'

const Home = () => {
  const featuredItems = [
    {
      id: 1,
      name: "AK-47 | Redline",
      game: "CS:GO",
      rarity: "mythical",
      image: "/api/placeholder/120/120",
      price: "$45.00"
    },
    {
      id: 2,
      name: "Pudge Hook",
      game: "Dota 2",
      rarity: "legendary",
      image: "/api/placeholder/120/120",
      price: "$120.00"
    },
    {
      id: 3,
      name: "Unusual Hat",
      game: "TF2",
      rarity: "ancient",
      image: "/api/placeholder/120/120",
      price: "$200.00"
    }
  ]

  return (
    <div className="home-container bg-gray-900 text-white min-h-screen p-8">
      {/* Hero Section */}
      <section className="hero-section bg-gray-800 rounded-lg p-8">
        <div className="hero-content">
          <h1 className="hero-title text-5xl font-bold mb-6 text-blue-400">
            Welcome to BarterBay
          </h1>
          <p className="hero-description text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The ultimate cross-game trading platform. Trade items from CS:GO, Dota 2, TF2, and more with players worldwide.
          </p>
          <div className="hero-actions flex justify-center space-x-4">
            <Link to="/register" className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors">
              <span>Get Started</span>
              <ArrowRight size={20} />
            </Link>
            <Link to="/trading" className="btn btn-secondary bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Browse Trades
            </Link>
          </div>
        </div>
        <div className="hero-stats flex justify-center space-x-4">
          <div className="stat-item">
            <TrendingUp className="stat-icon w-5 h-5 text-blue-400" />
            <div className="stat-content">
              <span className="stat-number text-2xl font-bold">5</span>
              <span className="stat-label text-sm text-gray-400">trades available</span>
            </div>
          </div>
          <div className="stat-item">
            <Users className="stat-icon w-5 h-5 text-blue-400" />
            <div className="stat-content">
              <span className="stat-number text-2xl font-bold">1,247</span>
              <span className="stat-label text-sm text-gray-400">active traders</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section bg-gray-800 rounded-lg p-8 mt-8">
        <h2 className="section-title text-3xl font-bold mb-8 text-center">Why Choose BarterBay?</h2>
        <div className="features-grid grid md:grid-cols-3 gap-6">
          <div className="feature-card text-center p-6 bg-gray-700 rounded-lg border border-gray-600">
            <div className="feature-icon-container mb-4">
              <Gamepad2 className="feature-icon w-12 h-12 text-blue-400 mx-auto" />
            </div>
            <h3 className="feature-title text-xl font-semibold mb-2">Multi-Game Support</h3>
            <p className="feature-description text-gray-400">Trade items across different games including CS:GO, Dota 2, TF2, and more.</p>
          </div>
          <div className="feature-card text-center p-6 bg-gray-700 rounded-lg border border-gray-600">
            <div className="feature-icon-container mb-4">
              <Shield className="feature-icon w-12 h-12 text-blue-400 mx-auto" />
            </div>
            <h3 className="feature-title text-xl font-semibold mb-2">Secure Trading</h3>
            <p className="feature-description text-gray-400">Safe and secure peer-to-peer trading with built-in protection mechanisms.</p>
          </div>
          <div className="feature-card text-center p-6 bg-gray-700 rounded-lg border border-gray-600">
            <div className="feature-icon-container mb-4">
              <Users className="feature-icon w-12 h-12 text-blue-400 mx-auto" />
            </div>
            <h3 className="feature-title text-xl font-semibold mb-2">Active Community</h3>
            <p className="feature-description text-gray-400">Join thousands of traders in our vibrant gaming community.</p>
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="featured-items-section bg-gray-800 rounded-lg p-8 mt-8">
        <div className="section-header flex justify-between items-center mb-8">
          <h2 className="section-title text-3xl font-bold">Featured Items</h2>
          <Link to="/trading" className="view-all-link text-blue-400 hover:text-blue-300 transition-colors">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="featured-items-grid grid md:grid-cols-3 gap-6">
          {featuredItems.map(item => (
            <div key={item.id} className={`featured-item rarity-${item.rarity} bg-gray-700 rounded-lg border-2 border-blue-500 p-4 hover:border-blue-400 transition-colors cursor-pointer`}>
              <div className="item-image-container aspect-square bg-gray-600 rounded-lg mb-4 flex items-center justify-center">
                <div className="item-placeholder w-20 h-20 bg-gray-600 rounded"></div>
              </div>
              <div className="item-info">
                <h3 className="item-name font-semibold mb-1">{item.name}</h3>
                <p className="item-game text-sm text-gray-400 mb-2">{item.game}</p>
                <div className="item-footer flex justify-between items-center">
                  <span className={`rarity-badge rarity-${item.rarity} text-sm px-2 py-1 rounded bg-gray-600 text-blue-400`}>
                    {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                  </span>
                  <span className="item-price font-bold text-blue-400">{item.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section bg-gray-800 rounded-lg p-8 mt-8">
        <div className="cta-content text-center">
          <h2 className="cta-title text-3xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="cta-description text-xl text-gray-300 mb-8">Join thousands of gamers trading their favorite items safely and securely.</p>
          <Link to="/register" className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
