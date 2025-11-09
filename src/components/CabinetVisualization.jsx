import React from 'react';
import useCabinetStore from '../store/cabinetStore';
import './CabinetVisualization.css';

function CabinetVisualization() {
  const { 
    cabinetType, 
    width, 
    height, 
    depth, 
    materialThickness,
    toeKick,
    backPanel,
    shelves,
    dividers
  } = useCabinetStore();

  // SVG scaling (convert inches to pixels)
  const scale = 8;
  const svgWidth = 600;
  const svgHeight = 600;
  
  // Calculate cabinet dimensions in pixels
  const cabWidth = width * scale;
  const cabHeight = height * scale;
  // const cabDepth = depth * scale; // Reserved for future 3D view
  const thick = materialThickness * scale;
  
  // Center the cabinet in the SVG
  const offsetX = (svgWidth - cabWidth) / 2;
  const offsetY = (svgHeight - cabHeight) / 2;

  // Toe kick dimensions
  const toeKickHeight = toeKick.enabled ? toeKick.height * scale : 0;
  const actualCabHeight = cabinetType === 'base' && toeKick.enabled 
    ? cabHeight - toeKickHeight 
    : cabHeight;

  return (
    <div className="cabinet-visualization">
      <h3>Front View</h3>
      <svg 
        width={svgWidth} 
        height={svgHeight} 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="cabinet-svg"
      >
        {/* Grid background */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
          </pattern>
          
          {/* Grain patterns */}
          <pattern id="grain-vertical" width="4" height="20" patternUnits="userSpaceOnUse">
            <line x1="2" y1="0" x2="2" y2="20" stroke="#d0d0d0" strokeWidth="0.5"/>
          </pattern>
          <pattern id="grain-horizontal" width="20" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="2" x2="20" y2="2" stroke="#d0d0d0" strokeWidth="0.5"/>
          </pattern>
        </defs>
        
        <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

        {/* Toe Kick (if enabled and base cabinet) */}
        {cabinetType === 'base' && toeKick.enabled && (
          <g className="toe-kick">
            <rect
              x={offsetX}
              y={offsetY + actualCabHeight}
              width={cabWidth}
              height={toeKickHeight}
              fill="#8B4513"
              stroke="#654321"
              strokeWidth="2"
              opacity="0.6"
            />
            <text
              x={offsetX + cabWidth / 2}
              y={offsetY + actualCabHeight + toeKickHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="white"
              fontWeight="bold"
            >
              TOE KICK
            </text>
          </g>
        )}

        {/* Main Cabinet Box */}
        <g className="cabinet-box">
          {/* Left Side */}
          <rect
            x={offsetX}
            y={offsetY}
            width={thick}
            height={actualCabHeight}
            fill="url(#grain-vertical)"
            stroke="#2c3e50"
            strokeWidth="2"
            className="part-side"
          />
          <text
            x={offsetX + thick / 2}
            y={offsetY + actualCabHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#2c3e50"
            fontWeight="bold"
            transform={`rotate(-90, ${offsetX + thick / 2}, ${offsetY + actualCabHeight / 2})`}
          >
            L
          </text>

          {/* Right Side */}
          <rect
            x={offsetX + cabWidth - thick}
            y={offsetY}
            width={thick}
            height={actualCabHeight}
            fill="url(#grain-vertical)"
            stroke="#2c3e50"
            strokeWidth="2"
            className="part-side"
          />
          <text
            x={offsetX + cabWidth - thick / 2}
            y={offsetY + actualCabHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#2c3e50"
            fontWeight="bold"
            transform={`rotate(-90, ${offsetX + cabWidth - thick / 2}, ${offsetY + actualCabHeight / 2})`}
          >
            R
          </text>

          {/* Top */}
          <rect
            x={offsetX + thick}
            y={offsetY}
            width={cabWidth - (2 * thick)}
            height={thick}
            fill="url(#grain-horizontal)"
            stroke="#2c3e50"
            strokeWidth="2"
            className="part-top"
          />
          <text
            x={offsetX + cabWidth / 2}
            y={offsetY + thick / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#2c3e50"
            fontWeight="bold"
          >
            TOP
          </text>

          {/* Bottom */}
          <rect
            x={offsetX + thick}
            y={offsetY + actualCabHeight - thick}
            width={cabWidth - (2 * thick)}
            height={thick}
            fill="url(#grain-horizontal)"
            stroke="#2c3e50"
            strokeWidth="2"
            className="part-bottom"
          />
          <text
            x={offsetX + cabWidth / 2}
            y={offsetY + actualCabHeight - thick / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#2c3e50"
            fontWeight="bold"
          >
            BOTTOM
          </text>

          {/* Shelves */}
          {shelves.map((shelf, index) => {
            const shelfY = offsetY + actualCabHeight - (shelf.position * scale);
            return (
              <g key={index}>
                <rect
                  x={offsetX + thick}
                  y={shelfY}
                  width={cabWidth - (2 * thick)}
                  height={thick}
                  fill="url(#grain-horizontal)"
                  stroke="#3498db"
                  strokeWidth="2"
                  className="part-shelf"
                  opacity="0.8"
                />
                <text
                  x={offsetX + cabWidth / 2}
                  y={shelfY + thick / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fill="#3498db"
                  fontWeight="bold"
                >
                  SHELF {index + 1}
                </text>
              </g>
            );
          })}

          {/* Dividers */}
          {dividers.map((divider, index) => {
            const divX = offsetX + thick + (divider.position * scale);
            return (
              <g key={index}>
                <rect
                  x={divX}
                  y={offsetY + thick}
                  width={thick}
                  height={actualCabHeight - (2 * thick)}
                  fill="url(#grain-vertical)"
                  stroke="#e67e22"
                  strokeWidth="2"
                  className="part-divider"
                  opacity="0.8"
                />
                <text
                  x={divX + thick / 2}
                  y={offsetY + actualCabHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fill="#e67e22"
                  fontWeight="bold"
                  transform={`rotate(-90, ${divX + thick / 2}, ${offsetY + actualCabHeight / 2})`}
                >
                  DIV {index + 1}
                </text>
              </g>
            );
          })}

          {/* Back Panel (dashed outline) */}
          {backPanel.enabled && backPanel.type === 'full' && (
            <rect
              x={offsetX + thick}
              y={offsetY + thick}
              width={cabWidth - (2 * thick)}
              height={actualCabHeight - (2 * thick)}
              fill="none"
              stroke="#95a5a6"
              strokeWidth="1"
              strokeDasharray="4 2"
              className="part-back"
            />
          )}

          {/* Mounting Rails */}
          {backPanel.enabled && backPanel.type === 'rails' && (
            <>
              {/* Top Rail */}
              <rect
                x={offsetX + thick}
                y={offsetY + thick}
                width={cabWidth - (2 * thick)}
                height={backPanel.railHeight * scale}
                fill="#95a5a6"
                stroke="#666"
                strokeWidth="1"
                className="part-back"
                opacity="0.5"
              />
              {/* Bottom Rail */}
              <rect
                x={offsetX + thick}
                y={offsetY + actualCabHeight - thick - (backPanel.railHeight * scale)}
                width={cabWidth - (2 * thick)}
                height={backPanel.railHeight * scale}
                fill="#95a5a6"
                stroke="#666"
                strokeWidth="1"
                className="part-back"
                opacity="0.5"
              />
            </>
          )}
        </g>

        {/* Dimension Lines */}
        <g className="dimensions">
          {/* Width dimension */}
          <line
            x1={offsetX}
            y1={offsetY - 20}
            x2={offsetX + cabWidth}
            y2={offsetY - 20}
            stroke="#666"
            strokeWidth="1"
            markerEnd="url(#arrowhead)"
          />
          <line x1={offsetX} y1={offsetY - 25} x2={offsetX} y2={offsetY - 15} stroke="#666" strokeWidth="1" />
          <line x1={offsetX + cabWidth} y1={offsetY - 25} x2={offsetX + cabWidth} y2={offsetY - 15} stroke="#666" strokeWidth="1" />
          <text
            x={offsetX + cabWidth / 2}
            y={offsetY - 25}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
            fontWeight="bold"
          >
            {width}"
          </text>

          {/* Height dimension */}
          <line
            x1={offsetX + cabWidth + 20}
            y1={offsetY}
            x2={offsetX + cabWidth + 20}
            y2={offsetY + cabHeight}
            stroke="#666"
            strokeWidth="1"
          />
          <line x1={offsetX + cabWidth + 15} y1={offsetY} x2={offsetX + cabWidth + 25} y2={offsetY} stroke="#666" strokeWidth="1" />
          <line x1={offsetX + cabWidth + 15} y1={offsetY + cabHeight} x2={offsetX + cabWidth + 25} y2={offsetY + cabHeight} stroke="#666" strokeWidth="1" />
          <text
            x={offsetX + cabWidth + 35}
            y={offsetY + cabHeight / 2}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
            fontWeight="bold"
            transform={`rotate(-90, ${offsetX + cabWidth + 35}, ${offsetY + cabHeight / 2})`}
          >
            {height}"
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="visualization-legend">
        <div className="legend-item">
          <span className="legend-color" style={{background: '#2c3e50'}}></span>
          <span>Main Box</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{background: '#3498db'}}></span>
          <span>Shelves</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{background: '#e67e22'}}></span>
          <span>Dividers</span>
        </div>
        {backPanel.enabled && backPanel.type === 'full' && (
          <div className="legend-item">
            <span className="legend-color" style={{background: '#95a5a6', border: '1px dashed #666'}}></span>
            <span>Back Panel (1/4")</span>
          </div>
        )}
        {backPanel.enabled && backPanel.type === 'rails' && (
          <div className="legend-item">
            <span className="legend-color" style={{background: '#95a5a6', opacity: 0.5}}></span>
            <span>Mounting Rails</span>
          </div>
        )}
        {cabinetType === 'base' && toeKick.enabled && (
          <div className="legend-item">
            <span className="legend-color" style={{background: '#8B4513'}}></span>
            <span>Toe Kick</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CabinetVisualization;
