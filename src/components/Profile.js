import React from 'react';
import './Profile.css';

function Profile({ tokens, visitedCount }) {
  const totalLocations = 8;
  const progress = (visitedCount / totalLocations) * 100;

  const getExplorerLevel = () => {
    if (visitedCount === 0) return "New Explorer";
    if (visitedCount < 3) return "Curious Tiger";
    if (visitedCount < 5) return "Campus Navigator";
    if (visitedCount < 8) return "Trail Blazer";
    return "Master Explorer";
  };

  const getNextMilestone = () => {
    if (visitedCount < 3) return { next: 3, title: "Curious Tiger" };
    if (visitedCount < 5) return { next: 5, title: "Campus Navigator" };
    if (visitedCount < 8) return { next: 8, title: "Trail Blazer" };
    return { next: 8, title: "Master Explorer" };
  };

  const explorerLevel = getExplorerLevel();
  const nextMilestone = getNextMilestone();

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="avatar">🐯</div>
        <h1>Princeton Explorer</h1>
        <div className="level-badge">{explorerLevel}</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🪙</div>
          <div className="stat-value">{tokens}</div>
          <div className="stat-label">Total Tokens</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-value">{visitedCount}/{totalLocations}</div>
          <div className="stat-label">Locations Visited</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{Math.round(progress)}%</div>
          <div className="stat-label">Completion</div>
        </div>
      </div>

      <div className="progress-section">
        <h2>Exploration Progress</h2>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">
          {visitedCount === totalLocations
            ? "🎉 You've discovered all locations!"
            : `${totalLocations - visitedCount} locations remaining`}
        </p>
      </div>

      {visitedCount < totalLocations && (
        <div className="milestone-section">
          <h2>Next Milestone</h2>
          <div className="milestone-card">
            <div className="milestone-icon">🏆</div>
            <div className="milestone-info">
              <h3>{nextMilestone.title}</h3>
              <p>Visit {nextMilestone.next - visitedCount} more location{nextMilestone.next - visitedCount !== 1 ? 's' : ''} to unlock</p>
            </div>
          </div>
        </div>
      )}

      <div className="achievements-section">
        <h2>Achievements</h2>
        <div className="achievements-grid">
          <div className={`achievement ${visitedCount >= 1 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">🌟</div>
            <p>First Steps</p>
            <small>Visit your first location</small>
          </div>
          <div className={`achievement ${visitedCount >= 3 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">🔥</div>
            <p>Getting Warmed Up</p>
            <small>Visit 3 locations</small>
          </div>
          <div className={`achievement ${visitedCount >= 5 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">⭐</div>
            <p>Halfway There</p>
            <small>Visit 5 locations</small>
          </div>
          <div className={`achievement ${visitedCount >= 8 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">👑</div>
            <p>Master Explorer</p>
            <small>Visit all locations</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
