import React from 'react';
import { Github, Twitter, Heart } from 'lucide-react';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <p className="footer-text">
                    © {currentYear} Mobixy. Built with <Heart size={14} style={{ display: 'inline', color: '#ef4444', verticalAlign: 'middle' }} /> for developers
                </p>

                <div className="footer-links">
                    <a href="#" className="footer-link">Privacy Policy</a>
                    <a href="#" className="footer-link">Terms of Service</a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">
                        <Github size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        GitHub
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-link">
                        <Twitter size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Twitter
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
