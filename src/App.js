import React, { useState } from 'react';
import './App.css';
import Home from './components/Home';
import Locations from './components/Locations';
import Profile from './components/Profile';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [visitedLocations, setVisitedLocations] = useState([]);
  const [tokens, setTokens] = useState(0);

  const handleVisitLocation = (locationId) => {
    if (!visitedLocations.includes(locationId)) {
      setVisitedLocations([...visitedLocations, locationId]);
      setTokens(tokens + 10);
    }
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'locations':
        return <Locations
          visitedLocations={visitedLocations}
          onVisitLocation={handleVisitLocation}
        />;
      case 'profile':
        return <Profile
          tokens={tokens}
          visitedCount={visitedLocations.length}
        />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <h1 className="logo">🐯 TigerTrails</h1>
        <div className="nav-links">
          <button
            className={currentPage === 'home' ? 'active' : ''}
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>
          <button
            className={currentPage === 'locations' ? 'active' : ''}
            onClick={() => setCurrentPage('locations')}
          >
            Discover
          </button>
          <button
            className={currentPage === 'profile' ? 'active' : ''}
            onClick={() => setCurrentPage('profile')}
          >
            Profile
          </button>
        </div>
        <div className="token-display">
          🪙 {tokens} Tokens
        </div>
      </nav>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
