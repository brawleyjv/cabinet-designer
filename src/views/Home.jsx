import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🪚 Cabinet Designer</h1>
        <p className="tagline">Professional cabinet design and CNC-ready exports</p>
      </header>
      
      <div className="home-content">
        <section className="features">
          <div className="feature-card">
            <h3>📐 Parametric Design</h3>
            <p>Input dimensions and joinery options</p>
          </div>
          <div className="feature-card">
            <h3>🔧 Smart Nesting</h3>
            <p>Optimize material usage automatically</p>
          </div>
          <div className="feature-card">
            <h3>📤 Pro Exports</h3>
            <p>DXF, cut lists, and assembly guides</p>
          </div>
        </section>
        
        <div className="cta-section">
          <Link to="/designer" className="btn-primary">Start Designing</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
