import React, { useState } from 'react';
import './Locations.css';
import CampusMap from './CampusMap';

const CAMPUS_LOCATIONS = [
  {
    id: 1,
    name: "The Secret Garden at Prospect House",
    category: "Hidden Gem",
    description: "A tranquil garden tucked behind Prospect House, perfect for quiet study or reflection.",
    tokens: 10,
    difficulty: "Easy",
    coordinates: [40.3487, -74.6594]
  },
  {
    id: 2,
    name: "Firestone Library Roof Garden",
    category: "Scenic Spot",
    description: "An elevated garden space with stunning views of campus architecture.",
    tokens: 10,
    difficulty: "Medium",
    coordinates: [40.3498, -74.6564]
  },
  {
    id: 3,
    name: "The Tunnel System Under Campus",
    category: "Adventure",
    description: "Explore the historic steam tunnels connecting various campus buildings.",
    tokens: 10,
    difficulty: "Hard",
    coordinates: [40.3460, -74.6552]
  },
  {
    id: 4,
    name: "Behind the Graffiti Wall",
    category: "Hidden Gem",
    description: "A quiet courtyard space behind the famous graffiti wall on University Place.",
    tokens: 10,
    difficulty: "Easy",
    coordinates: [40.3445, -74.6583]
  },
  {
    id: 5,
    name: "The Sundial at McCosh Walk",
    category: "Historic",
    description: "An often-overlooked sundial with inscriptions dating back to the 1800s.",
    tokens: 10,
    difficulty: "Easy",
    coordinates: [40.3478, -74.6580]
  },
  {
    id: 6,
    name: "Stony Ford Cedar Swamp",
    category: "Nature",
    description: "A unique ecological preserve just off campus with rare plant species.",
    tokens: 10,
    difficulty: "Medium",
    coordinates: [40.3425, -74.6515]
  },
  {
    id: 7,
    name: "East Pyne Courtyard",
    category: "Architectural",
    description: "A beautiful Gothic courtyard that most students walk past without entering.",
    tokens: 10,
    difficulty: "Easy",
    coordinates: [40.3485, -74.6572]
  },
  {
    id: 8,
    name: "The Kissing Rock",
    category: "Tradition",
    description: "A legendary rock formation near Lake Carnegie with campus folklore attached.",
    tokens: 10,
    difficulty: "Medium",
    coordinates: [40.3385, -74.6612]
  }
];

function Locations({ visitedLocations, onVisitLocation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(CAMPUS_LOCATIONS.map(loc => loc.category))];

  const filteredLocations = selectedCategory === 'All'
    ? CAMPUS_LOCATIONS
    : CAMPUS_LOCATIONS.filter(loc => loc.category === selectedCategory);

  return (
    <div className="locations">
      <div className="locations-header">
        <h1>Discover Princeton</h1>
        <p>Explore {CAMPUS_LOCATIONS.length} hidden locations across campus</p>
      </div>

      <CampusMap
        locations={filteredLocations}
        visitedLocations={visitedLocations}
        onVisitLocation={onVisitLocation}
      />

      <div className="filter-section">
        <label>Filter by category:</label>
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="locations-grid">
        {filteredLocations.map(location => {
          const isVisited = visitedLocations.includes(location.id);
          return (
            <div
              key={location.id}
              className={`location-card ${isVisited ? 'visited' : ''}`}
            >
              <div className="location-header">
                <span className={`difficulty ${location.difficulty.toLowerCase()}`}>
                  {location.difficulty}
                </span>
                <span className="category-tag">{location.category}</span>
              </div>
              <h3>{location.name}</h3>
              <p>{location.description}</p>
              <div className="location-footer">
                <span className="token-reward">🪙 {location.tokens} tokens</span>
                {isVisited ? (
                  <button className="visited-button" disabled>
                    ✓ Visited
                  </button>
                ) : (
                  <button
                    className="visit-button"
                    onClick={() => onVisitLocation(location.id)}
                  >
                    Mark as Visited
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Locations;
