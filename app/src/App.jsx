import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BuildStatusPage from './pages/BuildStatusPage';

function App() {
    return (
        <div className="app-container">
            <Header />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/build/:buildId" element={<BuildStatusPage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;
