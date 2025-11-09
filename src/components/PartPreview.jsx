import React, { useState } from 'react';
import useCabinetStore from '../store/cabinetStore';
import CabinetVisualization from './CabinetVisualization';
import PartDetailView from './PartDetailView';
import ExportButtons from './ExportButtons';
import './PartPreview.css';

function PartPreview() {
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'detailed', or 'partExplorer'
  const [selectedPartIndex, setSelectedPartIndex] = useState(0);
  
  const { 
    cabinetType, 
    width, 
    height, 
    depth, 
    materialThickness, 
    joineryType,
    parts
  } = useCabinetStore();

  const handlePartSelect = (index) => {
    setSelectedPartIndex(index);
    setViewMode('partExplorer');
  };

  const handlePrevPart = () => {
    if (selectedPartIndex > 0) {
      setSelectedPartIndex(selectedPartIndex - 1);
    }
  };

  const handleNextPart = () => {
    if (selectedPartIndex < parts.length - 1) {
      setSelectedPartIndex(selectedPartIndex + 1);
    }
  };

  const handleOpenInNewWindow = () => {
    if (parts.length === 0 || selectedPartIndex >= parts.length) return;
    
    // Create a new window
    const newWindow = window.open('', '_blank', 'width=1400,height=1000,scrollbars=yes,resizable=yes');
    
    if (newWindow) {
      const part = parts[selectedPartIndex];
      
      // Get the part detail HTML
      const partDetailHTML = document.querySelector('.part-explorer .part-detail-view');
      
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${part.name} - Cabinet Designer</title>
            <link rel="stylesheet" href="/static/css/main.css">
            <style>
              body {
                margin: 0;
                padding: 2rem;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                background: #f8f9fa;
              }
              .part-detail-view {
                max-width: 1600px;
                margin: 0 auto;
                background: white;
                padding: 3rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              }
              svg {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>
          <body>
            ${partDetailHTML ? partDetailHTML.outerHTML : '<p>Loading...</p>'}
            <script>
              // Auto-focus the window
              window.focus();
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className="part-preview">
      <div className="preview-header">
        <h2>Cabinet Preview</h2>
        <div className="view-toggle">
          <button 
            className={viewMode === 'overview' ? 'active' : ''}
            onClick={() => setViewMode('overview')}
          >
            Overview
          </button>
          <button 
            className={viewMode === 'partExplorer' ? 'active' : ''}
            onClick={() => {
              setViewMode('partExplorer');
              if (parts.length > 0 && selectedPartIndex >= parts.length) {
                setSelectedPartIndex(0);
              }
            }}
          >
            Part Explorer
          </button>
          <button 
            className={viewMode === 'detailed' ? 'active' : ''}
            onClick={() => setViewMode('detailed')}
          >
            All Parts Detail
          </button>
        </div>
      </div>
      
      {viewMode === 'overview' ? (
        <>
          {/* Enhanced Visual Schematic */}
          <CabinetVisualization />
          
          <div className="spec-summary">
            <h3>Specifications</h3>
            <ul>
              <li><strong>Type:</strong> {cabinetType}</li>
              <li><strong>Dimensions:</strong> {width}" × {height}" × {depth}"</li>
              <li><strong>Material:</strong> {materialThickness}" thickness</li>
              <li><strong>Joinery:</strong> {joineryType}</li>
            </ul>
          </div>

          {/* Export Buttons */}
          <ExportButtons />

          {parts.length > 0 && (
            <div className="parts-list">
              <h3>Parts List ({parts.length} parts)</h3>
              <div className="parts-table">
                <table>
                  <thead>
                    <tr>
                      <th>Part Name</th>
                      <th>Width</th>
                      <th>Height</th>
                      <th>Thickness</th>
                      <th>Qty</th>
                      <th>Grain</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((part, index) => (
                      <tr key={index}>
                        <td>{part.name}</td>
                        <td>{part.width.toFixed(3)}"</td>
                        <td>{part.height.toFixed(3)}"</td>
                        <td>{part.thickness}"</td>
                        <td>{part.quantity}</td>
                        <td>{part.grainDirection}</td>
                        <td>
                          <button 
                            className="btn-view-part"
                            onClick={() => handlePartSelect(index)}
                            title="View detailed part drawing"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : viewMode === 'partExplorer' ? (
        <>
          {/* Part Explorer - Single part view with navigation */}
          {parts.length > 0 ? (
            <div className="part-explorer">
              <div className="part-navigator">
                <button 
                  className="nav-btn"
                  onClick={handlePrevPart}
                  disabled={selectedPartIndex === 0}
                  title="Previous part"
                >
                  ◀ Previous
                </button>
                <div className="part-selector">
                  <label htmlFor="part-select">Select Part:</label>
                  <select 
                    id="part-select"
                    value={selectedPartIndex}
                    onChange={(e) => setSelectedPartIndex(parseInt(e.target.value))}
                  >
                    {parts.map((part, index) => (
                      <option key={index} value={index}>
                        {part.name} ({part.quantity}x)
                      </option>
                    ))}
                  </select>
                  <span className="part-counter">
                    Part {selectedPartIndex + 1} of {parts.length}
                  </span>
                </div>
                <button 
                  className="nav-btn open-window-btn"
                  onClick={handleOpenInNewWindow}
                  title="Open in new window (full size)"
                >
                  ⤢ Full Size
                </button>
                <button 
                  className="nav-btn"
                  onClick={handleNextPart}
                  disabled={selectedPartIndex === parts.length - 1}
                  title="Next part"
                >
                  Next ▶
                </button>
              </div>

              <div className="explorer-content">
                <PartDetailView part={parts[selectedPartIndex]} enlarged={true} />
              </div>

              <div className="part-info-panel">
                <h4>Part Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{parts[selectedPartIndex].name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Dimensions:</span>
                    <span className="info-value">
                      {parts[selectedPartIndex].width.toFixed(3)}" × {parts[selectedPartIndex].height.toFixed(3)}"
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Thickness:</span>
                    <span className="info-value">{parts[selectedPartIndex].thickness}"</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Quantity:</span>
                    <span className="info-value">{parts[selectedPartIndex].quantity}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Grain Direction:</span>
                    <span className="info-value">{parts[selectedPartIndex].grainDirection}</span>
                  </div>
                  {parts[selectedPartIndex].notes && (
                    <div className="info-item full-width">
                      <span className="info-label">Notes:</span>
                      <span className="info-value">{parts[selectedPartIndex].notes}</span>
                    </div>
                  )}
                  {parts[selectedPartIndex].cuts && parts[selectedPartIndex].cuts.length > 0 && (
                    <div className="info-item full-width">
                      <span className="info-label">Machining Operations:</span>
                      <span className="info-value">{parts[selectedPartIndex].cuts.length} cuts/operations</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-parts-message">
              <p>Generate cabinet parts to explore individual part details.</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Detailed CAD View of all parts */}
          {parts.length > 0 ? (
            <div className="detailed-parts-view">
              <h3>Detailed Part Drawings ({parts.length} parts)</h3>
              <p className="detail-intro">
                All parts shown with machining operations, cuts, dados, and dimensions.
              </p>
              {parts.map((part, index) => (
                <PartDetailView key={index} part={part} />
              ))}
            </div>
          ) : (
            <div className="no-parts-message">
              <p>Generate cabinet parts to see detailed CAD drawings.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PartPreview;
