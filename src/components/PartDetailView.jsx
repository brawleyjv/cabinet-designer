import React from 'react';
import './PartDetailView.css';

/**
 * CAD-style detailed view of a single part showing all cuts, dados, and joints
 */
function PartDetailView({ part, enlarged }) {
  if (!part) return null;

  // Use larger scale when in explorer mode
  const scale = enlarged ? 6 : 4; // pixels per inch
  const padding = enlarged ? 80 : 60; // padding for dimensions
  
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
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="part-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background */}
        <rect width={svgWidth} height={svgHeight} fill="white" />

        {/* Main part outline */}
        <rect
          x={padding}
          y={padding}
          width={partWidth}
          height={partHeight}
          fill="#f9f9f9"
          stroke="#000"
          strokeWidth="3"
        />

        {/* Draw cuts (dados, rabbets, etc.) */}
        {part.cuts && part.cuts.map((cut, index) => {
          // Skip drill holes - they're drawn separately below
          if (cut.type === 'drill') {
            return null;
          }

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
          } else if (cut.location === 'face') {
            // Horizontal dado across the face (for shelves)
            cutX = padding;
            cutY = padding + (cut.distanceFromEdge * scale);
            cutWidth = partWidth;
            cutHeight = cut.width * scale;
          }

          return (
            <g key={index}>
              {/* Cut area - simple rectangle showing the dado/rabbet */}
              <rect
                x={cutX}
                y={cutY}
                width={cutWidth}
                height={cutHeight}
                fill="none"
                stroke="#e74c3c"
                strokeWidth="2"
              />
            </g>
          );
        })}

        {/* Draw drill holes */}
        {part.cuts && part.cuts.filter(cut => cut.type === 'drill').map((cut, index) => {
          const holeX = padding + (cut.x * scale);
          const holeY = padding + (cut.y * scale);
          const radius = (cut.diameter / 2) * scale;

          return (
            <g key={`drill-${index}`}>
              {/* Simple circle for drill hole */}
              <circle
                cx={holeX}
                cy={holeY}
                r={radius}
                fill="none"
                stroke="#2196F3"
                strokeWidth="1"
              />
            </g>
          );
        })}
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
                  <td>{cut.location || (cut.type === 'drill' ? 'Face' : '-')}</td>
                  <td>
                    {cut.distanceFromEdge ? 
                      `${cut.distanceFromEdge}"` : 
                      (cut.y ? `${cut.y.toFixed(3)}" from bottom` : '-')
                    }
                  </td>
                  <td>{cut.width ? `${cut.width.toFixed(3)}"` : (cut.diameter ? `Ø${cut.diameter}"` : '-')}</td>
                  <td className="depth">{cut.depth ? `${cut.depth.toFixed(3)}"` : (cut.type === 'drill' ? 'Through' : '-')}</td>
                  <td>
                    {cut.length ? 
                      `${cut.length}"` : 
                      (cut.x ? `${cut.x}" from edge` : '-')
                    }
                  </td>
                  <td className="notes">{cut.notes || ''}</td>
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
