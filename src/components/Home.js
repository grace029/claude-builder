import React from 'react';
import './Home.css';

function Home({ setCurrentPage }) {
  return (
    <div className="home">
      <div className="hero-section">
        <h1 className="hero-title">Welcome to TigerTrails</h1>
        <p className="hero-subtitle">
          Discover hidden gems and secret spots across Princeton's campus
        </p>
        <button className="cta-button" onClick={() => setCurrentPage('locations')}>
          Start Exploring 🗺️
        </button>
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">📍</div>
          <h3>Discover Locations</h3>
          <p>Explore new and undiscovered places on campus that most students don't know about</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🪙</div>
          <h3>Collect Tokens</h3>
          <p>Earn 10 tokens for every new location you visit and unlock achievements</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏆</div>
          <h3>Track Progress</h3>
          <p>See your exploration journey and compete with fellow Tigers</p>
        </div>
      </div>

      <div className="info-section">
        <h2>How It Works</h2>
        <ol className="steps">
          <li>Browse through our curated list of campus locations</li>
          <li>Visit a location in person</li>
          <li>Mark it as visited to collect your tokens</li>
          <li>Build your collection and discover Princeton like never before!</li>
        </ol>
      </div>
    </div>
  );
}

export default Home;
