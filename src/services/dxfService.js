/**
 * DXF Export Service
 * Generates DXF files from sheet layouts with proper layers
 */
import DxfWriter from 'dxf-writer';

class DxfService {
  constructor() {
    this.dxf = null;
  }

  /**
   * Export all parts to a single DXF file
   * Parts are laid out in a grid for easy import into Aspire for nesting
   * @param {Array} parts - Array of part objects
   * @param {Object} cabinetInfo - Cabinet metadata
   * @returns {Array} Array with single DXF file object
   */
  exportParts(parts, cabinetInfo) {
    const dxfContent = this.createPartsDXF(parts, cabinetInfo);
    return [{
      filename: `Cabinet_${cabinetInfo.type}_${cabinetInfo.width}x${cabinetInfo.height}x${cabinetInfo.depth}_Parts.dxf`,
      content: dxfContent
    }];
  }

  /**
   * Create DXF content with all parts laid out in a grid
   */
  createPartsDXF(parts, cabinetInfo) {
    this.dxf = new DxfWriter();

    // Add a layer for each unique part name
    const uniquePartNames = new Set();
    parts.forEach(part => {
      uniquePartNames.add(part.name);
    });
    
    // Create layers for each part
    const colorCycle = [
      DxfWriter.ACI.RED,      // 1
      DxfWriter.ACI.YELLOW,   // 2
      DxfWriter.ACI.GREEN,    // 3
      DxfWriter.ACI.CYAN,     // 4
      DxfWriter.ACI.BLUE,     // 5
      DxfWriter.ACI.MAGENTA   // 6
    ];
    
    let colorIndex = 0;
    uniquePartNames.forEach(partName => {
      const color = colorCycle[colorIndex % colorCycle.length];
      this.dxf.addLayer(partName, color, 'CONTINUOUS');
      colorIndex++;
    });
    
    // Add label layer with valid color
    this.dxf.addLayer('LABEL', DxfWriter.ACI.WHITE || 7, 'CONTINUOUS');

    // Add header info
    this.dxf.setActiveLayer('LABEL');
    this.dxf.drawText(
      0, 
      -1, 
      0.25, 
      0, 
      `Cabinet: ${cabinetInfo.type} | ${cabinetInfo.width}x${cabinetInfo.height}x${cabinetInfo.depth}" | Material: ${cabinetInfo.materialThickness}" | Joinery: ${cabinetInfo.joineryType}`
    );
    this.dxf.drawText(
      0, 
      -1.5, 
      0.2, 
      0, 
      `All parts below - Import into Aspire/VCarve for nesting optimization`
    );

    // Layout parts in a grid with spacing
    const spacing = 3; // 3" spacing between parts for clarity
    let currentX = 0;
    let currentY = 0;
    let rowHeight = 0;
    const maxRowWidth = 48; // Maximum width per row before wrapping

    let partInstanceIndex = 0;
    
    parts.forEach((part) => {
      // Draw each part multiple times based on quantity
      const quantity = part.quantity || 1;
      
      for (let i = 0; i < quantity; i++) {
        const partWidth = part.width;
        const partHeight = part.height;
        
        // Check if this part would exceed the row width
        if (currentX + partWidth > maxRowWidth && currentX > 0) {
          // Start a new row
          currentY += rowHeight + spacing;
          currentX = 0;
          rowHeight = 0;
        }

        // Draw the part at current position
        this.drawPartAtPosition(part, partInstanceIndex, currentX, currentY, i + 1, quantity);

        // Update position for next part
        currentX += partWidth + spacing;
        rowHeight = Math.max(rowHeight, partHeight);
        partInstanceIndex++;
      }
    });

    return this.dxf.toDxfString();
  }

  /**
   * Draw a part at a specific position
   */
  drawPartAtPosition(part, index, offsetX, offsetY, instanceNum = 1, totalInstances = 1) {
    const x = offsetX;
    const y = offsetY;
    const width = part.width;
    const height = part.height;

    // Draw everything on the part's layer
    this.dxf.setActiveLayer(part.name);
    
    // Draw cut outline (outer perimeter to cut out the part)
    this.dxf.drawRect(x, y, width, height);

    // Draw all machining operations (dados, rabbets, pockets, etc.)
    if (part.cuts && part.cuts.length > 0) {
      part.cuts.forEach(cut => {
        this.drawCut(cut, x, y, width, height, part.name);
      });
    }

    // Add part label OUTSIDE the part area to avoid interfering with machining
    this.dxf.setActiveLayer('LABEL');
    const labelX = x + width + 0.5; // Place label to the right of part
    const labelY = y + height;
    
    // Show instance number if multiple copies
    const labelText = totalInstances > 1 
      ? `${part.name} (${instanceNum}/${totalInstances})`
      : part.name;
    
    this.dxf.drawText(
      labelX,
      labelY,
      0.15,
      0,
      labelText
    );

    this.dxf.drawText(
      labelX,
      labelY - 0.2,
      0.12,
      0,
      `${width.toFixed(3)}" x ${height.toFixed(3)}" x ${part.thickness}"`
    );

    // Add grain direction indicator (small, outside part)
    const grainX = x + width + 0.25;
    const grainY = y;
    
    if (part.grainDirection === 'vertical') {
      this.dxf.drawLine(grainX, grainY, grainX, grainY + 0.5);
      this.dxf.drawLine(grainX, grainY + 0.5, grainX - 0.05, grainY + 0.4);
      this.dxf.drawLine(grainX, grainY + 0.5, grainX + 0.05, grainY + 0.4);
    } else {
      this.dxf.drawLine(grainX, grainY, grainX + 0.5, grainY);
      this.dxf.drawLine(grainX + 0.5, grainY, grainX + 0.4, grainY - 0.05);
      this.dxf.drawLine(grainX + 0.5, grainY, grainX + 0.4, grainY + 0.05);
    }
  }

  /**
   * Draw a single cut (dado, rabbet, pocket, etc.)
   */
  drawCut(cut, partX, partY, partWidth, partHeight, partName) {
    // Handle drill holes separately
    if (cut.type === 'drill') {
      this.drawDrillHole(cut, partX, partY, partWidth, partHeight, partName);
      return;
    }

    let cutX, cutY, cutWidth, cutHeight;
    
    // Calculate absolute position of cut based on location
    if (cut.location === 'top edge') {
      cutX = partX;
      cutY = partY + partHeight - (cut.distanceFromEdge + cut.width);
      cutWidth = cut.length || partWidth;
      cutHeight = cut.width;
    } else if (cut.location === 'bottom edge') {
      cutX = partX;
      cutY = partY + cut.distanceFromEdge;
      cutWidth = cut.length || partWidth;
      cutHeight = cut.width;
    } else if (cut.location === 'left edge') {
      cutX = partX + cut.distanceFromEdge;
      cutY = partY;
      cutWidth = cut.width;
      cutHeight = cut.length || partHeight;
    } else if (cut.location === 'right edge') {
      cutX = partX + partWidth - (cut.distanceFromEdge + cut.width);
      cutY = partY;
      cutWidth = cut.width;
      cutHeight = cut.length || partHeight;
    } else if (cut.location === 'face') {
      // Horizontal dado across the face (for shelves)
      cutX = partX;
      cutY = partY + cut.distanceFromEdge;
      cutWidth = cut.length || partWidth;
      cutHeight = cut.width;
    } else {
      // Default center cut
      cutX = partX + (cut.x || 0);
      cutY = partY + (cut.y || 0);
      cutWidth = cut.width;
      cutHeight = cut.height || cut.width;
    }

    // Draw cut on the same layer as the part
    this.dxf.setActiveLayer(partName);
    
    // Draw rectangle for dado/pocket
    this.dxf.drawRect(cutX, cutY, cutWidth, cutHeight);
    
    // Add centerline to show pocket direction
    if (cutWidth > cutHeight) {
      // Horizontal pocket
      const centerY = cutY + cutHeight / 2;
      this.dxf.drawLine(cutX, centerY, cutX + cutWidth, centerY);
    } else {
      // Vertical pocket
      const centerX = cutX + cutWidth / 2;
      this.dxf.drawLine(centerX, cutY, centerX, cutY + cutHeight);
    }

    // Calculate recommended bit size and toolpath
    const recommendedBit = this.getRecommendedBit(cut);
    const toolpath = this.getToolpathType(cut);
    
    // Add detailed machining annotations OUTSIDE the part area on LABEL layer
    this.dxf.setActiveLayer('LABEL');
    const labelX = cutX + cutWidth / 2;
    const labelY = cutY + cutHeight + 0.15;
    
    // Line 1: Cut type and depth
    this.dxf.drawText(
      labelX,
      labelY,
      0.1,
      0,
      `${cut.type.toUpperCase()} - ${cut.depth.toFixed(3)}" DEEP`
    );
    
    // Line 2: Toolpath recommendation
    this.dxf.drawText(
      labelX,
      labelY - 0.15,
      0.08,
      0,
      `TOOLPATH: ${toolpath}`
    );
    
    // Line 3: Recommended bit
    this.dxf.drawText(
      labelX,
      labelY - 0.28,
      0.08,
      0,
      `BIT: ${recommendedBit}`
    );
    
    // Line 4: Width and length
    this.dxf.drawText(
      labelX,
      labelY - 0.41,
      0.07,
      0,
      `${cut.width.toFixed(3)}" wide x ${(cut.length || (cutWidth > cutHeight ? cutWidth : cutHeight)).toFixed(3)}" long`
    );
  }

  /**
   * Draw drill hole on DXF
   */
  drawDrillHole(cut, partX, partY, partWidth, partHeight, partName) {
    // Calculate position of drill hole
    const holeX = partX + (cut.x || 0);
    const holeY = partY + (cut.y || 0);
    const radius = cut.diameter / 2;

    // Draw hole on the same layer as the part
    this.dxf.setActiveLayer(partName);
    this.dxf.drawCircle(holeX, holeY, radius);
    
    // Add crosshair for center point
    const crosshairSize = radius * 1.5;
    this.dxf.drawLine(holeX - crosshairSize, holeY, holeX + crosshairSize, holeY);
    this.dxf.drawLine(holeX, holeY - crosshairSize, holeX, holeY + crosshairSize);
  }

  /**
   * Get recommended bit size for a cut
   */
  getRecommendedBit(cut) {
    const depth = cut.depth;
    const width = cut.width;
    
    if (cut.type === 'dado' || cut.type === 'pocket') {
      // For dados, bit should be close to width or smaller for multiple passes
      if (width >= 0.75) {
        return '3/4" straight bit (or 1/2" with 2 passes)';
      } else if (width >= 0.5) {
        return '1/2" straight bit (or smaller with multiple passes)';
      } else if (width >= 0.375) {
        return '3/8" straight bit';
      } else if (width >= 0.25) {
        return '1/4" straight bit';
      } else {
        return '1/8" straight bit';
      }
    } else if (cut.type === 'rabbet') {
      return `${width.toFixed(3)}" rabbeting bit or straight bit`;
    } else if (cut.type === 'groove') {
      return `${width.toFixed(3)}" straight bit`;
    }
    
    return 'Straight bit matching width';
  }

  /**
   * Get toolpath type for a cut
   */
  getToolpathType(cut) {
    const depth = cut.depth;
    const width = cut.width;
    
    if (cut.type === 'dado') {
      return 'POCKET (Flat bottom, full depth)';
    } else if (cut.type === 'rabbet') {
      return 'PROFILE (Edge cut to depth)';
    } else if (cut.type === 'groove') {
      return 'POCKET (Centered groove)';
    } else if (cut.type === 'pocket') {
      return 'POCKET (Clear material to depth)';
    }
    
    return 'POCKET';
  }

  /**
   * Download a DXF file
   */
  static downloadDXF(filename, content) {
    const blob = new Blob([content], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default DxfService;
