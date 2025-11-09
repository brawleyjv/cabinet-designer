/**
 * Nesting Service
 * Optimizes part layout on sheet materials using bin packing algorithm
 */

class NestingService {
  constructor(sheetWidth, sheetHeight, bitDiameter = 0.125, partSpacing = 0.25, edgePadding = 0.5) {
    this.sheetWidth = sheetWidth;
    this.sheetHeight = sheetHeight;
    this.bitDiameter = bitDiameter; // CNC bit diameter
    this.partSpacing = partSpacing; // Additional spacing beyond bit
    this.edgePadding = edgePadding; // Padding from sheet edges
    
    // Total spacing = bit diameter + additional spacing
    // When cutting between two parts, we need space for the bit plus padding
    this.totalSpacing = bitDiameter + partSpacing;
    
    this.sheets = [];
    this.errors = []; // Track parts that won't fit
  }

  /**
   * Nest parts onto sheets
   * @param {Array} parts - Array of part objects with width, height, grainDirection
   * @returns {Object} Object with sheets array and errors array
   */
  nestParts(parts) {
    // Reset sheets
    this.sheets = [];
    this.errors = [];

    // Group parts by thickness
    const partsByThickness = this.groupByThickness(parts);

    // Nest each thickness group separately
    Object.keys(partsByThickness).forEach(thickness => {
      const thicknessParts = partsByThickness[thickness];
      this.nestThicknessGroup(thicknessParts, thickness);
    });

    return {
      sheets: this.sheets,
      errors: this.errors
    };
  }

  /**
   * Group parts by thickness
   */
  groupByThickness(parts) {
    const groups = {};
    
    parts.forEach(part => {
      const thickness = part.thickness;
      if (!groups[thickness]) {
        groups[thickness] = [];
      }
      
      // Expand parts based on quantity
      for (let i = 0; i < part.quantity; i++) {
        groups[thickness].push({
          ...part,
          instanceId: `${part.name}-${i + 1}`
        });
      }
    });

    return groups;
  }

  /**
   * Nest parts of the same thickness
   */
  nestThicknessGroup(parts, thickness) {
    // Sort parts by area (largest first) - better packing efficiency
    const sortedParts = [...parts].sort((a, b) => {
      return (b.width * b.height) - (a.width * a.height);
    });

    let currentSheet = this.createNewSheet(thickness);
    
    sortedParts.forEach(part => {
      // First check if part can physically fit on a sheet
      const canFitOnSheet = this.canPartFitOnSheet(part);
      
      if (!canFitOnSheet) {
        this.errors.push({
          part: part,
          reason: `Part "${part.name}" (${part.width}" × ${part.height}") is too large for sheet size (${this.sheetWidth}" × ${this.sheetHeight}") with edge padding (${this.edgePadding}") and spacing (${this.totalSpacing}")`
        });
        return; // Skip this part
      }
      
      // Try both orientations if grain allows
      const orientations = this.getPossibleOrientations(part);
      let placed = false;

      for (let orientation of orientations) {
        const position = this.findPosition(currentSheet, orientation);
        
        if (position) {
          // Place the part
          currentSheet.parts.push({
            ...orientation,
            x: position.x,
            y: position.y,
            rotation: orientation.rotated ? 90 : 0
          });
          
          // Update occupied spaces (with total spacing buffer)
          currentSheet.occupied.push({
            x: position.x,
            y: position.y,
            width: orientation.width + this.totalSpacing,
            height: orientation.height + this.totalSpacing
          });
          
          placed = true;
          break;
        }
      }

      // If couldn't place on current sheet, create new one
      if (!placed) {
        this.sheets.push(currentSheet);
        currentSheet = this.createNewSheet(thickness);
        
        // Place on new sheet (starting with edge padding)
        const position = { x: this.edgePadding, y: this.edgePadding };
        currentSheet.parts.push({
          ...part,
          x: position.x,
          y: position.y,
          rotation: 0
        });
        
        currentSheet.occupied.push({
          x: position.x,
          y: position.y,
          width: part.width + this.totalSpacing,
          height: part.height + this.totalSpacing
        });
      }
    });

    // Add the last sheet if it has parts
    if (currentSheet.parts.length > 0) {
      this.sheets.push(currentSheet);
    }

    // Calculate efficiency for each sheet
    this.sheets.forEach(sheet => {
      this.calculateEfficiency(sheet);
    });
  }

  /**
   * Check if a part can physically fit on a sheet (in any orientation)
   */
  canPartFitOnSheet(part) {
    // Available space accounting for edge padding on both sides
    const availableWidth = this.sheetWidth - (2 * this.edgePadding);
    const availableHeight = this.sheetHeight - (2 * this.edgePadding);
    
    // Check both orientations
    const fitsNormally = (part.width <= availableWidth && part.height <= availableHeight);
    const fitsRotated = (part.height <= availableWidth && part.width <= availableHeight);
    
    return fitsNormally || fitsRotated;
  }

  /**
   * Get possible orientations for a part
   */
  getPossibleOrientations(part) {
    const orientations = [part];

    // Don't rotate parts with vertical grain direction
    // Vertical grain (like cabinet sides) must maintain their orientation
    // Only allow rotation for horizontal grain or if grain direction is not specified
    const canRotate = part.grainDirection !== 'vertical' && part.width !== part.height;
    
    if (canRotate) {
      orientations.push({
        ...part,
        width: part.height,
        height: part.width,
        grainDirection: part.grainDirection === 'horizontal' ? 'vertical' : 'horizontal',
        rotated: true
      });
    }

    return orientations;
  }

  /**
   * Find a position for a part on a sheet
   */
  findPosition(sheet, part) {
    // Try to find a position using shelf algorithm
    const positions = this.generateCandidatePositions(sheet);
    
    for (let pos of positions) {
      if (this.canPlaceAt(sheet, part, pos.x, pos.y)) {
        return pos;
      }
    }

    return null;
  }

  /**
   * Generate candidate positions for placement
   */
  generateCandidatePositions(sheet) {
    // Start with edge padding from origin
    const positions = [{ x: this.edgePadding, y: this.edgePadding }];

    // Generate positions at the corners of existing parts
    sheet.occupied.forEach(rect => {
      positions.push(
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x, y: rect.y + rect.height }
      );
    });

    // Sort by bottom-left preference (lower y first, then lower x)
    return positions.sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
  }

  /**
   * Check if part can be placed at position
   */
  canPlaceAt(sheet, part, x, y) {
    // Account for total spacing (bit diameter + additional padding) around the part
    const paddedWidth = part.width + this.totalSpacing;
    const paddedHeight = part.height + this.totalSpacing;

    // Check if within sheet bounds (accounting for edge padding on far edges)
    if (x + paddedWidth > this.sheetWidth - this.edgePadding || 
        y + paddedHeight > this.sheetHeight - this.edgePadding) {
      return false;
    }

    // Check for overlap with existing parts (with spacing)
    for (let rect of sheet.occupied) {
      if (this.rectanglesOverlap(
        { x, y, width: paddedWidth, height: paddedHeight },
        rect
      )) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if two rectangles overlap
   */
  rectanglesOverlap(rect1, rect2) {
    return !(
      rect1.x + rect1.width <= rect2.x ||
      rect2.x + rect2.width <= rect1.x ||
      rect1.y + rect1.height <= rect2.y ||
      rect2.y + rect2.height <= rect1.y
    );
  }

  /**
   * Create a new sheet
   */
  createNewSheet(thickness) {
    return {
      id: this.sheets.length + 1,
      width: this.sheetWidth,
      height: this.sheetHeight,
      thickness: thickness,
      parts: [],
      occupied: [],
      efficiency: 0,
      wastedArea: 0
    };
  }

  /**
   * Calculate material efficiency for a sheet
   */
  calculateEfficiency(sheet) {
    const sheetArea = this.sheetWidth * this.sheetHeight;
    const usedArea = sheet.parts.reduce((sum, part) => {
      return sum + (part.width * part.height);
    }, 0);

    sheet.efficiency = (usedArea / sheetArea) * 100;
    sheet.wastedArea = sheetArea - usedArea;
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const totalSheets = this.sheets.length;
    const avgEfficiency = this.sheets.reduce((sum, sheet) => sum + sheet.efficiency, 0) / totalSheets;
    const totalWaste = this.sheets.reduce((sum, sheet) => sum + sheet.wastedArea, 0);

    return {
      totalSheets,
      avgEfficiency: avgEfficiency.toFixed(2),
      totalWaste: totalWaste.toFixed(2),
      sheets: this.sheets
    };
  }
}

export default NestingService;
