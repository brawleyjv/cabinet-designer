import React from 'react';
import './PartDetailView.css';

/**
 * CAD-style detailed view of a single part showing all cuts, dados, and joints
 */
function PartDetailView({ part }) {
  if (!part) return null;

  const scale = 4; // pixels per inch
  const padding = 60; // padding for dimensions
  
  const partWidth = part.width * scale;
  const partHeight = part.height * scale;
  const svgWidth = partWidth + (padding * 2);
  const svgHeight = partHeight + (padding * 2);

  return (
    <div className="part-detail-view">
      <div className="part-header">
        <h3>{part.name}</h3>
        <div className="part-specs">
          <span className="spec-item"><strong>W:</strong> {part.width}"</span>
          <span className="spec-item"><strong>H:</strong> {part.height}"</span>
          <span className="spec-item"><strong>T:</strong> {part.thickness}"</span>
          <span className="spec-item"><strong>Grain:</strong> {part.grainDirection}</span>
          {part.quantity > 1 && <span className="spec-item qty"><strong>Qty:</strong> {part.quantity}</span>}
        </div>
      </div>

      <svg 
        width={svgWidth} 
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="part-svg"
      >
        {/* Grid background */}
        <defs>
          <pattern id={`grid-${part.name}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="0.5"/>
          </pattern>
          <marker id="arrowhead-detail" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#666" />
          </marker>
        </defs>
        
        <rect width={svgWidth} height={svgHeight} fill={`url(#grid-${part.name})`} />

        {/* Main part outline */}
        <rect
          x={padding}
          y={padding}
          width={partWidth}
          height={partHeight}
          fill="#f9f9f9"
          stroke="#2c3e50"
          strokeWidth="2"
        />

        {/* Grain direction indicator */}
        {part.grainDirection === 'vertical' ? (
          <>
            <line x1={padding + 10} y1={padding + 10} x2={padding + 10} y2={padding + partHeight - 10} stroke="#95a5a6" strokeWidth="1" strokeDasharray="2 2" />
            <line x1={padding + 20} y1={padding + 10} x2={padding + 20} y2={padding + partHeight - 10} stroke="#95a5a6" strokeWidth="1" strokeDasharray="2 2" />
            <line x1={padding + 30} y1={padding + 10} x2={padding + 30} y2={padding + partHeight - 10} stroke="#95a5a6" strokeWidth="1" strokeDasharray="2 2" />
          </>
        ) : (
          <>
            <line x1={padding + 10} y1={padding + 10} x2={padding + partWidth - 10} y2={padding + 10} stroke="#95a5a6" strokeWidth="1" strokeDasharray="2 2" />
            <line x1={padding + 10} y1={padding + 20} x2={padding + partWidth - 10} y2={padding + 20} stroke="#95a5a6" strokeWidth="1" strokeDasharray="2 2" />
            <line x1={padding + 10} y1={padding + 30} x2={padding + partWidth - 10} y2={padding + 30} stroke="#95a5a6" strokeWidth="1" strokeDasharray="2 2" />
          </>
        )}

        {/* Draw cuts (dados, rabbets, etc.) */}
        {part.cuts && part.cuts.map((cut, index) => {
          let cutX, cutY, cutWidth, cutHeight;
          
          if (cut.location === 'top edge') {
            cutX = padding;
            cutY = padding + (cut.distanceFromEdge * scale);
            cutWidth = partWidth;
            cutHeight = cut.width * scale;
          } else if (cut.location === 'bottom edge') {
            cutX = padding;
            cutY = padding + partHeight - ((cut.distanceFromEdge + cut.width) * scale);
            cutWidth = partWidth;
            cutHeight = cut.width * scale;
          } else if (cut.location === 'left edge') {
            cutX = padding + (cut.distanceFromEdge * scale);
            cutY = padding;
            cutWidth = cut.width * scale;
            cutHeight = partHeight;
          } else if (cut.location === 'right edge') {
            cutX = padding + partWidth - ((cut.distanceFromEdge + cut.width) * scale);
            cutY = padding;
            cutWidth = cut.width * scale;
            cutHeight = partHeight;
          }

          return (
            <g key={index}>
              {/* Cut area - different patterns for different types */}
              <rect
                x={cutX}
                y={cutY}
                width={cutWidth}
                height={cutHeight}
                fill={cut.type === 'dado' ? '#e74c3c' : '#3498db'}
                opacity="0.3"
                stroke={cut.type === 'dado' ? '#c0392b' : '#2980b9'}
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              
              {/* Depth indicator */}
              <text
                x={cutX + cutWidth / 2}
                y={cutY + cutHeight / 2}
                textAnchor="middle"
                fontSize="10"
                fill="#2c3e50"
                fontWeight="bold"
              >
                {cut.type.toUpperCase()} {cut.depth.toFixed(3)}" deep
              </text>

              {/* Cut dimension line */}
              <line
                x1={cutX}
                y1={cutY - 5}
                x2={cutX + cutWidth}
                y2={cutY - 5}
                stroke="#e74c3c"
                strokeWidth="1"
                markerEnd="url(#arrowhead-detail)"
              />
              <text
                x={cutX + cutWidth / 2}
                y={cutY - 10}
                textAnchor="middle"
                fontSize="9"
                fill="#e74c3c"
              >
                {cut.width.toFixed(3)}" wide
              </text>
            </g>
          );
        })}

        {/* Overall dimensions */}
        {/* Width dimension */}
        <line
          x1={padding}
          y1={padding - 30}
          x2={padding + partWidth}
          y2={padding - 30}
          stroke="#2c3e50"
          strokeWidth="1"
          markerEnd="url(#arrowhead-detail)"
        />
        <line x1={padding} y1={padding - 35} x2={padding} y2={padding - 25} stroke="#2c3e50" strokeWidth="1" />
        <line x1={padding + partWidth} y1={padding - 35} x2={padding + partWidth} y2={padding - 25} stroke="#2c3e50" strokeWidth="1" />
        <text
          x={padding + partWidth / 2}
          y={padding - 35}
          textAnchor="middle"
          fontSize="12"
          fill="#2c3e50"
          fontWeight="bold"
        >
          {part.width}"
        </text>

        {/* Height dimension */}
        <line
          x1={padding + partWidth + 30}
          y1={padding}
          x2={padding + partWidth + 30}
          y2={padding + partHeight}
          stroke="#2c3e50"
          strokeWidth="1"
        />
        <line x1={padding + partWidth + 25} y1={padding} x2={padding + partWidth + 35} y2={padding} stroke="#2c3e50" strokeWidth="1" />
        <line x1={padding + partWidth + 25} y1={padding + partHeight} x2={padding + partWidth + 35} y2={padding + partHeight} stroke="#2c3e50" strokeWidth="1" />
        <text
          x={padding + partWidth + 45}
          y={padding + partHeight / 2}
          textAnchor="middle"
          fontSize="12"
          fill="#2c3e50"
          fontWeight="bold"
          transform={`rotate(-90, ${padding + partWidth + 45}, ${padding + partHeight / 2})`}
        >
          {part.height}"
        </text>
      </svg>

      {/* Cut details list */}
      {part.cuts && part.cuts.length > 0 && (
        <div className="cuts-detail-list">
          <h4>Machining Operations ({part.cuts.length})</h4>
          <table className="cuts-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Location</th>
                <th>From Edge</th>
                <th>Width</th>
                <th>Depth</th>
                <th>Length</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {part.cuts.map((cut, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="cut-type">{cut.type.toUpperCase()}</td>
                  <td>{cut.location}</td>
                  <td>{cut.distanceFromEdge}"</td>
                  <td>{cut.width.toFixed(3)}"</td>
                  <td className="depth">{cut.depth.toFixed(3)}"</td>
                  <td>{cut.length}"</td>
                  <td className="notes">{cut.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Part notes */}
      {part.notes && (
        <div className="part-notes">
          <strong>Notes:</strong> {part.notes}
        </div>
      )}
    </div>
  );
}

export default PartDetailView;
