import React from 'react';
import useCabinetStore from '../store/cabinetStore';
import './SheetLayout.css';

function SheetLayout({ sheets }) {
  const { partSpacing } = useCabinetStore();

  if (!sheets || sheets.length === 0) {
    return (
      <div className="sheet-layout">
        <h3>Sheet Layout</h3>
        <p className="empty-message">Click "Update Design" to generate sheet layout</p>
      </div>
    );
  }

  // SVG scaling
  const scale = 4; // pixels per inch
  const maxSvgWidth = 800;

  return (
    <div className="sheet-layout">
      <h3>Sheet Layout & Nesting</h3>
      
      <div className="layout-summary">
        <div className="summary-stat">
          <span className="stat-label">Total Sheets:</span>
          <span className="stat-value">{sheets.length}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Avg Efficiency:</span>
          <span className="stat-value">
            {(sheets.reduce((sum, s) => sum + s.efficiency, 0) / sheets.length).toFixed(1)}%
          </span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Part Spacing:</span>
          <span className="stat-value">{partSpacing}"</span>
        </div>
      </div>

      <div className="sheets-container">
        {sheets.map((sheet, sheetIndex) => {
          const svgWidth = Math.min(sheet.width * scale, maxSvgWidth);
          const svgHeight = (sheet.height * scale * svgWidth) / (sheet.width * scale);
          const actualScale = svgWidth / sheet.width;

          return (
            <div key={sheet.id} className="sheet-item">
              <div className="sheet-header">
                <h4>Sheet {sheetIndex + 1}</h4>
                <div className="sheet-info">
                  <span>{sheet.width}" × {sheet.height}" × {sheet.thickness}"</span>
                  <span className={`efficiency ${sheet.efficiency > 80 ? 'good' : sheet.efficiency > 60 ? 'ok' : 'poor'}`}>
                    {sheet.efficiency.toFixed(1)}% efficient
                  </span>
                  <span className="parts-count">{sheet.parts.length} parts</span>
                </div>
              </div>

              <svg
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="sheet-svg"
              >
                {/* Sheet background */}
                <rect
                  x="0"
                  y="0"
                  width={svgWidth}
                  height={svgHeight}
                  fill="#f9f9f9"
                  stroke="#333"
                  strokeWidth="2"
                />

                {/* Grid lines */}
                <defs>
                  <pattern id={`grid-${sheetIndex}`} width={12 * actualScale} height={12 * actualScale} patternUnits="userSpaceOnUse">
                    <path
                      d={`M ${12 * actualScale} 0 L 0 0 0 ${12 * actualScale}`}
                      fill="none"
                      stroke="#e0e0e0"
                      strokeWidth="0.5"
                    />
                  </pattern>

                  {/* Grain patterns */}
                  <pattern id={`grain-v-${sheetIndex}`} width="3" height="15" patternUnits="userSpaceOnUse">
                    <line x1="1.5" y1="0" x2="1.5" y2="15" stroke="#999" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                  <pattern id={`grain-h-${sheetIndex}`} width="15" height="3" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="1.5" x2="15" y2="1.5" stroke="#999" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                </defs>

                <rect x="0" y="0" width={svgWidth} height={svgHeight} fill={`url(#grid-${sheetIndex})`} />

                {/* Parts */}
                {sheet.parts.map((part, partIndex) => {
                  const x = part.x * actualScale;
                  const y = part.y * actualScale;
                  const w = part.width * actualScale;
                  const h = part.height * actualScale;
                  
                  // Color based on part type
                  let fillColor = '#3498db';
                  if (part.name.includes('Side')) fillColor = '#2c3e50';
                  if (part.name.includes('Top') || part.name.includes('Bottom')) fillColor = '#34495e';
                  if (part.name.includes('Shelf')) fillColor = '#3498db';
                  if (part.name.includes('Divider')) fillColor = '#e67e22';
                  if (part.name.includes('Back')) fillColor = '#95a5a6';
                  if (part.name.includes('Toe')) fillColor = '#8B4513';

                  const grainPattern = part.grainDirection === 'vertical' 
                    ? `url(#grain-v-${sheetIndex})` 
                    : `url(#grain-h-${sheetIndex})`;

                  return (
                    <g key={partIndex} className="part-on-sheet">
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        fill={fillColor}
                        stroke="#fff"
                        strokeWidth="2"
                        opacity="0.8"
                      />
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        fill={grainPattern}
                      />
                      <text
                        x={x + w / 2}
                        y={y + h / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="10"
                        fill="#fff"
                        fontWeight="bold"
                        style={{ pointerEvents: 'none' }}
                      >
                        {part.instanceId || part.name}
                      </text>
                      <text
                        x={x + w / 2}
                        y={y + h / 2 + 12}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="8"
                        fill="#fff"
                        style={{ pointerEvents: 'none' }}
                      >
                        {part.width.toFixed(2)}" × {part.height.toFixed(2)}"
                      </text>
                      {part.rotation !== 0 && (
                        <text
                          x={x + 5}
                          y={y + 12}
                          fontSize="9"
                          fill="#fff"
                          fontWeight="bold"
                        >
                          ↻{part.rotation}°
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              <div className="sheet-stats">
                <div className="stat">
                  <strong>Used Area:</strong> {(sheet.width * sheet.height - sheet.wastedArea).toFixed(2)} sq in
                </div>
                <div className="stat">
                  <strong>Wasted Area:</strong> {sheet.wastedArea.toFixed(2)} sq in
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SheetLayout;
