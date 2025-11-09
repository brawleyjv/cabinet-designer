import React from 'react';
import CabinetForm from '../components/CabinetForm';
import PartPreview from '../components/PartPreview';
import './Designer.css';

function Designer() {
  return (
    <div className="designer-container">
      <header className="designer-header">
        <h1>Cabinet Designer</h1>
      </header>
      
      <div className="designer-workspace">
        <aside className="designer-sidebar">
          <CabinetForm />
        </aside>
        
        <main className="designer-canvas">
          <PartPreview />
        </main>
      </div>
    </div>
  );
}

export default Designer;
