import React from 'react';
import './App.css';
import Immersive3DShowcase from './Immersive3DShowcase';

/**
 * App root, includes Navbar and the 3D immersive main container.
 */
function App() {
  return (
    <div className="app" style={{ position: 'relative' }}>
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> KAVIA AI
            </div>
            <button className="btn">Explore</button>
          </div>
        </div>
      </nav>

      {/* 3D Showcase occupies full screen background */}
      <Immersive3DShowcase />

      {/* Overlay any HTML UI as needed, for example, for interaction popups */}
    </div>
  );
}

export default App;