import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Zap } from 'lucide-react';

function Header() {
    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="logo">
                    <div className="logo-icon">
                        <Smartphone size={22} />
                    </div>
                    <span className="logo-text">Mobixy</span>
                </Link>

                <nav className="nav-links">
                    <Link to="/" className="nav-link">Builder</Link>
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#" className="nav-link">
                        Docs
                    </a>
                    <a
                        href="#"
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                        <Zap size={16} />
                        Dashboard
                    </a>
                </nav>
            </div>
        </header>
    );
}

export default Header;
