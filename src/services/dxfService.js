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
   * Export sheets to DXF files
   * @param {Array} sheets - Array of sheet objects with nested parts
   * @param {Object} cabinetInfo - Cabinet metadata
   * @returns {Array} Array of DXF file objects
   */
  exportSheets(sheets, cabinetInfo) {
    const dxfFiles = [];

    sheets.forEach((sheet, index) => {
      const dxfContent = this.createSheetDXF(sheet, index + 1, cabinetInfo);
      dxfFiles.push({
        filename: `Sheet_${index + 1}_${sheet.thickness}in.dxf`,
        content: dxfContent
      });
    });

    return dxfFiles;
  }

  /**
   * Create DXF content for a single sheet
   */
  createSheetDXF(sheet, sheetNumber, cabinetInfo) {
    this.dxf = new DxfWriter();

    // Add layers
    this.dxf.addLayer('CUT', DxfWriter.ACI.RED, 'CONTINUOUS');
    this.dxf.addLayer('POCKET', DxfWriter.ACI.BLUE, 'CONTINUOUS');
    this.dxf.addLayer('DRILL', DxfWriter.ACI.GREEN, 'CONTINUOUS');
    this.dxf.addLayer('LABEL', DxfWriter.ACI.YELLOW, 'CONTINUOUS');
    this.dxf.addLayer('SHEET_OUTLINE', DxfWriter.ACI.WHITE, 'CONTINUOUS');

    // Draw sheet outline
    this.dxf.setActiveLayer('SHEET_OUTLINE');
    this.dxf.drawRect(0, 0, sheet.width, sheet.height);

    // Add sheet info text OUTSIDE sheet area (negative Y for below sheet)
    this.dxf.setActiveLayer('LABEL');
    this.dxf.drawText(
      0, 
      -0.5, 
      0.2, 
      0, 
      `Sheet ${sheetNumber} - ${sheet.width}x${sheet.height}x${sheet.thickness}" | Cabinet: ${cabinetInfo.type} ${cabinetInfo.width}x${cabinetInfo.height}x${cabinetInfo.depth}"`
    );

    // Draw each part
    sheet.parts.forEach((part, partIndex) => {
      this.drawPart(part, partIndex);
    });

    return this.dxf.toDxfString();
  }

  /**
   * Draw a part with cut lines and labels
   */
  drawPart(part, index) {
    const x = part.x;
    const y = part.y;
    const width = part.width;
    const height = part.height;

    // Draw cut outline on CUT layer (outer perimeter to cut out the part)
    this.dxf.setActiveLayer('CUT');
    this.dxf.drawRect(x, y, width, height);

    // Draw all machining operations (dados, rabbets, pockets, etc.)
    if (part.cuts && part.cuts.length > 0) {
      part.cuts.forEach(cut => {
        this.drawCut(cut, x, y, width, height);
      });
    }

    // Add part label OUTSIDE the part area to avoid interfering with machining
    this.dxf.setActiveLayer('LABEL');
    const labelX = x + width + 0.5; // Place label to the right of part
    const labelY = y + height;
    
    this.dxf.drawText(
      labelX,
      labelY,
      0.15,
      0,
      `${part.instanceId || part.name}`
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
  drawCut(cut, partX, partY, partWidth, partHeight) {
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
    } else {
      // Default center cut
      cutX = partX + (cut.x || 0);
      cutY = partY + (cut.y || 0);
      cutWidth = cut.width;
      cutHeight = cut.height || cut.width;
    }

    // Draw cut on POCKET layer (for CNC pocketing operations)
    this.dxf.setActiveLayer('POCKET');
    
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

    // Add depth annotation OUTSIDE the part area on LABEL layer
    this.dxf.setActiveLayer('LABEL');
    const labelX = cutX + cutWidth / 2;
    const labelY = cutY + cutHeight + 0.1;
    
    this.dxf.drawText(
      labelX,
      labelY,
      0.08,
      0,
      `${cut.type.toUpperCase()} ${cut.depth.toFixed(3)}" DEEP`
    );
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
