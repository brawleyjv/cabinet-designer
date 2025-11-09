import React, { useState } from 'react';
import useCabinetStore from '../store/cabinetStore';
import CabinetVisualization from './CabinetVisualization';
import PartDetailView from './PartDetailView';
import SheetLayout from './SheetLayout';
import ExportButtons from './ExportButtons';
import './PartPreview.css';

function PartPreview() {
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'detailed'
  
  const { 
    cabinetType, 
    width, 
    height, 
    depth, 
    materialThickness, 
    joineryType,
    parts,
    sheets
  } = useCabinetStore();

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
            className={viewMode === 'detailed' ? 'active' : ''}
            onClick={() => setViewMode('detailed')}
          >
            Detailed CAD View
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

          {/* Sheet Layout */}
          <SheetLayout sheets={sheets} />

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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Detailed CAD View of each part */}
          {parts.length > 0 ? (
            <div className="detailed-parts-view">
              <h3>Detailed Part Drawings ({parts.length} parts)</h3>
              <p className="detail-intro">
                Each part shown with all machining operations, cuts, dados, and dimensions.
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

