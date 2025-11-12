import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Shield, Zap, Users, TrendingUp, Award, ArrowRight } from 'lucide-react';
import '../styles/landing.css';

// Import fullpage.js
import fullpage from 'fullpage.js';
import 'fullpage.js/dist/fullpage.css';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const fullpageRef = useRef<any>(null);

    useEffect(() => {
        // Initialize fullpage.js
        fullpageRef.current = new fullpage('#fullpage', {
            autoScrolling: true,
            scrollHorizontally: true,
            navigation: true,
            navigationPosition: 'right',
            showActiveTooltip: false,
            slidesNavigation: false,
            controlArrows: false,
            anchors: ['hero', 'features', 'about', 'stats', 'join'],
            navigationTooltips: ['Home', 'Features', 'About', 'Stats', 'Join'],
            scrollingSpeed: 400,
            easingcss3: 'ease-out',
            normalScrollElements: '.join-section',
            touchSensitivity: 5,
            scrollOverflow: false,
            fitToSection: true,
            fitToSectionDelay: 300,
        });

        return () => {
            if (fullpageRef.current) {
                fullpageRef.current.destroy('all');
            }
        };
    }, []);

    const handleJoinNow = () => {
        navigate('/register');
    };

    return (
        <div id="fullpage">
            {/* Section 1: Hero */}
            <div className="section hero-section">
                <div className="section-content">
                    <div className="hero-logo">
                        <Gamepad2 size={80} />
                    </div>
                    <h1 className="hero-title">Batibot</h1>
                    <p className="hero-subtitle">The Ultimate Cross-Game Trading Platform</p>
                    <p className="hero-description">
                        Trade items across multiple games with confidence and security
                    </p>
                    <div className="scroll-indicator">
                        <span>Scroll Down</span>
                        <div className="scroll-arrow">↓</div>
                    </div>
                </div>
            </div>

            {/* Section 2: Features */}
            <div className="section features-section">
                <div className="section-content">
                    <h2 className="section-title">Features</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Shield size={48} />
                            </div>
                            <h3>Secure Trading</h3>
                            <p>Trade with confidence using our secure escrow system and verified users</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Zap size={48} />
                            </div>
                            <h3>Live Trading</h3>
                            <p>Real-time trade negotiations with instant notifications and updates</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Users size={48} />
                            </div>
                            <h3>Community</h3>
                            <p>Join thousands of traders in a vibrant, active trading community</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <TrendingUp size={48} />
                            </div>
                            <h3>Track Progress</h3>
                            <p>Monitor your trading stats, achievements, and rank progression</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: About */}
            <div className="section about-section">
                <div className="section-content">
                    <h2 className="section-title">About Batibot</h2>
                    <div className="about-content">
                        <div className="about-text">
                            <p className="about-description">
                                Batibot is a revolutionary cross-game item trading platform that brings together 
                                gamers from different communities to trade, barter, and build their collections.
                            </p>
                            <p className="about-description">
                                Inspired by classic trading interfaces, we've built a modern, secure platform 
                                that makes trading simple, safe, and enjoyable for everyone.
                            </p>
                            <div className="about-features">
                                <div className="about-feature-item">
                                    <Award size={24} />
                                    <span>Rank & Achievement System</span>
                                </div>
                                <div className="about-feature-item">
                                    <Shield size={24} />
                                    <span>Verified User Profiles</span>
                                </div>
                                <div className="about-feature-item">
                                    <Zap size={24} />
                                    <span>Instant Trade Notifications</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Stats */}
            <div className="section stats-section">
                <div className="section-content">
                    <h2 className="section-title">Platform Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-box">
                            <div className="stat-number">10K+</div>
                            <div className="stat-label">Active Traders</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">50K+</div>
                            <div className="stat-label">Items Traded</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">98%</div>
                            <div className="stat-label">Success Rate</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Support</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 5: Join Now */}
            <div className="section join-section">
                <div className="section-content">
                    <h2 className="join-title">Ready to Start Trading?</h2>
                    <p className="join-description">
                        Join thousands of traders and start building your collection today
                    </p>
                    <button className="join-button" onClick={handleJoinNow}>
                        <span>Join Now</span>
                        <ArrowRight size={20} />
                    </button>
                    <p className="join-footer">
                        Already have an account? <a href="/login">Sign in</a>
                    </p>
                </div>
            </div>
        </div>
    );
};
