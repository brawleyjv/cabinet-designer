/**
 * Cabinet Calculation Service
 * Generates part dimensions based on cabinet specs and joinery type
 */

class CabinetCalculator {
  constructor(specs) {
    this.type = specs.cabinetType;
    this.width = specs.width;
    this.height = specs.height;
    this.depth = specs.depth;
    this.thickness = specs.materialThickness; // Nominal thickness for display
    this.actualThickness = specs.actualMaterialThickness || specs.materialThickness; // Actual measured thickness
    this.joinery = specs.joineryType;
    this.tolerance = specs.joineryTolerance || 0.002; // Joinery clearance/play
    this.dadoDepth = specs.dadoDepth || (this.actualThickness / 3); // Default to 1/3 thickness (industry standard)
    this.shelves = specs.shelves || [];
    this.dividers = specs.dividers || [];
    this.toeKick = specs.toeKick || { enabled: false, height: 0, depth: 0 };
    this.backPanel = specs.backPanel || { enabled: true, type: 'full', railHeight: 4 };
  }

  /**
   * Calculate all parts for the cabinet
   * @returns {Array} Array of part objects with dimensions and metadata
   */
  calculateParts() {
    const parts = [];

    // Basic box components
    parts.push(...this.calculateBoxParts());

    // Toe kick rails (if base cabinet with toe kick)
    if (this.type === 'base' && this.toeKick.enabled) {
      parts.push(...this.calculateToeKickParts());
    }

    // Shelves
    if (this.shelves.length > 0) {
      parts.push(...this.calculateShelves());
    }

    // Back panel (based on type)
    if (this.backPanel.enabled) {
      if (this.backPanel.type === 'full') {
        parts.push(this.calculateBack());
      } else if (this.backPanel.type === 'rails') {
        parts.push(...this.calculateMountingRails());
      }
    }

    return parts;
  }

  /**
   * Calculate the main box parts (top, bottom, sides)
   */
  calculateBoxParts() {
    const parts = [];
    const offset = this.getJoineryOffset();

    switch (this.joinery) {
      case 'dado':
        parts.push(...this.calculateDadoBox(offset));
        break;
      case 'rabbet':
        parts.push(...this.calculateRabbetBox(offset));
        break;
      case 'finger':
        parts.push(...this.calculateFingerBox(offset));
        break;
      case 'dovetail':
        parts.push(...this.calculateDovetailBox(offset));
        break;
      case 'butt':
        parts.push(...this.calculateButtBox());
        break;
      default:
        parts.push(...this.calculateButtBox());
    }

    return parts;
  }

  /**
   * Get joinery offset depth (how deep the joint cuts)
   */
  getJoineryOffset() {
    switch (this.joinery) {
      case 'dado':
        return this.actualThickness + this.tolerance; // Dado width = actual thickness + small tolerance for fit
      case 'rabbet':
        return this.actualThickness / 2; // Half-lap rabbet
      case 'finger':
        return this.actualThickness; // Through finger joints
      case 'dovetail':
        return this.actualThickness; // Square dovetails (box joint style)
      default:
        return 0;
    }
  }

  /**
   * Get dado width (should match panel thickness for a snug fit)
   */
  getDadoWidth() {
    return this.actualThickness + this.tolerance; // Width of the groove
  }

  /**
   * Calculate parts for dado joinery
   * Top and bottom fit into dados in the sides
   */
  calculateDadoBox(offset) {
    const parts = [];

    // Adjust side height for toe kick if applicable
    const sideHeight = (this.type === 'base' && this.toeKick.enabled) 
      ? this.height - this.toeKick.height 
      : this.height;

    // Check if we have any adjustable shelves
    const hasAdjustableShelves = this.shelves.some(shelf => shelf.type === 'adjustable');
    const shelfPinHoles = hasAdjustableShelves ? this.calculateShelfPinHoles() : [];

    // Sides (full height or adjusted for toe kick, dado grooves will be cut for top/bottom)
    const leftSideCuts = [
      {
        type: 'dado',
        location: 'top edge',
        distanceFromEdge: 0,  // Dado starts at the very top edge
        width: offset,
        depth: this.dadoDepth,
        length: this.depth,
        notes: `Receives top panel. POCKET toolpath ${this.dadoDepth.toFixed(3)}" deep (${((this.dadoDepth/this.actualThickness)*100).toFixed(0)}% thickness). Use ${this.getRecommendedBitSize(offset)} straight bit.`
      }
    ];

    // Only add bottom dado if toe kick is enabled (otherwise no bottom panel)
    if (this.type !== 'base' || this.toeKick.enabled) {
      leftSideCuts.push({
        type: 'dado',
        location: 'bottom edge',
        distanceFromEdge: 0,  // Dado starts at the very bottom edge
        width: offset,
        depth: this.dadoDepth,
        length: this.depth,
        notes: `Receives bottom panel. POCKET toolpath ${this.dadoDepth.toFixed(3)}" deep. Use ${this.getRecommendedBitSize(offset)} straight bit.`
      });
    }

    // Add dados for fixed shelves
    this.shelves.forEach((shelf, index) => {
      if (shelf.type === 'fixed') {
        leftSideCuts.push({
          type: 'dado',
          location: 'face',  // Dado runs horizontally across the face
          distanceFromEdge: shelf.position,  // Distance from bottom edge
          width: offset,  // Same width as top/bottom dados
          depth: this.dadoDepth,
          length: this.depth,
          notes: `Receives Shelf ${index + 1} at ${shelf.position}" from bottom. POCKET toolpath ${this.dadoDepth.toFixed(3)}" deep. Use ${this.getRecommendedBitSize(offset)} straight bit.`
        });
      }
    });

    // Add shelf pin holes if there are adjustable shelves
    if (shelfPinHoles.length > 0) {
      shelfPinHoles.forEach((hole, index) => {
        leftSideCuts.push({
          type: 'drill',
          location: 'face',
          x: hole.frontRow,
          y: hole.fromBottom,
          diameter: hole.diameter,
          depth: hole.depth,
          notes: `${hole.fromBottom.toFixed(3)}" from bottom, ${hole.frontRow}" from front edge`
        });
        leftSideCuts.push({
          type: 'drill',
          location: 'face',
          x: hole.backRow,
          y: hole.fromBottom,
          diameter: hole.diameter,
          depth: hole.depth,
          notes: `${hole.fromBottom.toFixed(3)}" from bottom, ${hole.backRow}" from back edge`
        });
      });
    }

    const fixedShelvesCount = this.shelves.filter(s => s.type === 'fixed').length;
    const hasBottomPanel = this.type !== 'base' || this.toeKick.enabled;

    parts.push({
      name: 'Side - Left',
      width: this.depth,
      height: sideHeight,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'vertical',
      notes: `Dado groove at top edge${hasBottomPanel ? ' and bottom edge' : ''}${fixedShelvesCount > 0 ? ` and ${fixedShelvesCount} shelf dado(s)` : ''}, ${offset}" wide, ${this.dadoDepth.toFixed(3)}" deep${this.toeKick.enabled ? ', sits on toe kick' : ''}${shelfPinHoles.length > 0 ? `. ${shelfPinHoles.length * 2} shelf pin holes (1.25" spacing, 0.197" diameter)` : ''}`,
      cuts: leftSideCuts
    });

    // Right side with same cuts
    const rightSideCuts = [...leftSideCuts];

    parts.push({
      name: 'Side - Right',
      width: this.depth,
      height: sideHeight,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'vertical',
      notes: `Dado groove at top edge${hasBottomPanel ? ' and bottom edge' : ''}${fixedShelvesCount > 0 ? `, ${fixedShelvesCount} shelf dado(s)` : ''}, ${offset}" wide (${this.actualThickness}" + ${this.tolerance}" tolerance), ${this.dadoDepth.toFixed(3)}" deep${this.toeKick.enabled ? ', sits on toe kick' : ''}${shelfPinHoles.length > 0 ? `. ${shelfPinHoles.length * 2} shelf pin holes (1.25" spacing, 0.197" diameter)` : ''}`,
      cuts: rightSideCuts
    });

    // Top and bottom (reduced width to fit in dados)
    const topBottomWidth = this.width - (2 * this.actualThickness);

    parts.push({
      name: 'Top',
      width: topBottomWidth,
      height: this.depth,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'horizontal',
      notes: 'Fits into dado grooves in sides'
    });

    // Only add bottom panel if toe kick is enabled or not a base cabinet
    if (hasBottomPanel) {
      parts.push({
        name: 'Bottom',
        width: topBottomWidth,
        height: this.depth,
        thickness: this.actualThickness,
        quantity: 1,
        grainDirection: 'horizontal',
        notes: 'Fits into dado grooves in sides'
      });
    }

    // Add corner gussets if base cabinet without toe kick
    if (this.type === 'base' && !this.toeKick.enabled) {
      // Triangular corner gussets for structural support
      const gussetSize = 6; // 6 inch triangular gussets
      parts.push({
        name: 'Corner Gusset',
        width: gussetSize,
        height: gussetSize,
        thickness: this.actualThickness,
        quantity: 4,
        grainDirection: 'horizontal',
        notes: 'Triangular corner supports for no-toe-kick base cabinets. Cut diagonally from 6"x6" square.'
      });
    }

    return parts;
  }

  /**
   * Calculate parts for rabbet joinery
   * Rabbets cut on the edges of sides
   */
  calculateRabbetBox(offset) {
    const parts = [];

    // Sides with rabbet cuts
    parts.push({
      name: 'Side - Left',
      width: this.depth,
      height: this.height,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'vertical',
      notes: `Rabbet cut ${offset}" deep on top and bottom edges`
    });

    parts.push({
      name: 'Side - Right',
      width: this.depth,
      height: this.height,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'vertical',
      notes: `Rabbet cut ${offset}" deep on top and bottom edges`
    });

    // Top and bottom (full width minus material for rabbet overlap)
    const topBottomWidth = this.width - (2 * (this.thickness - offset));

    parts.push({
      name: 'Top',
      width: topBottomWidth,
      height: this.depth,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'horizontal',
      notes: 'Fits into rabbet cuts on sides'
    });

    parts.push({
      name: 'Bottom',
      width: topBottomWidth,
      height: this.depth,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'horizontal',
      notes: 'Fits into rabbet cuts on sides'
    });

    return parts;
  }

  /**
   * Calculate parts for finger/box joints
   * All parts are full dimension (fingers interlock)
   */
  calculateFingerBox(offset) {
    const parts = [];

    parts.push({
      name: 'Side - Left',
      width: this.depth,
      height: this.height,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'vertical',
      notes: 'Finger joints on top and bottom edges'
    });

    parts.push({
      name: 'Side - Right',
      width: this.depth,
      height: this.height,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'vertical',
      notes: 'Finger joints on top and bottom edges'
    });

    parts.push({
      name: 'Top',
      width: this.width,
      height: this.depth,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'horizontal',
      notes: 'Finger joints on left and right edges'
    });

    parts.push({
      name: 'Bottom',
      width: this.width,
      height: this.depth,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'horizontal',
      notes: 'Finger joints on left and right edges'
    });

    return parts;
  }

  /**
   * Calculate parts for square dovetail (box joint style) joinery
   * Square pins and tails - similar to finger joints but with specific sizing
   * Note: This is NOT tapered dovetails, but square/box joint dovetails suitable for CNC
   */
  calculateDovetailBox(offset) {
    const parts = [];

    // For square dovetails, we need to consider:
    // - Pin width (typically 1/2 to 2/3 of material thickness)
    // - Tail width (typically equal to or slightly larger than pin width)
    // - Spacing must account for CNC bit diameter
    
    const pinWidth = this.actualThickness * 0.6; // 60% of thickness for pins
    const tailWidth = this.actualThickness * 0.8; // 80% of thickness for tails
    const minBitDiameter = 0.125; // Minimum 1/8" bit for slots

    // Sides have tails (vertical grain preserved)
    parts.push({
      name: 'Side - Left',
      width: this.depth,
      height: this.height,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'vertical',
      notes: `Square dovetail tails on top/bottom edges. Tail width: ${tailWidth.toFixed(3)}", Pin spacing: ${pinWidth.toFixed(3)}". Use ${minBitDiameter}" or larger bit for slots.`
    });

    parts.push({
      name: 'Side - Right',
      width: this.depth,
      height: this.height,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'vertical',
      notes: `Square dovetail tails on top/bottom edges. Tail width: ${tailWidth.toFixed(3)}", Pin spacing: ${pinWidth.toFixed(3)}". Use ${minBitDiameter}" or larger bit for slots.`
    });

    // Top and bottom have pins
    parts.push({
      name: 'Top',
      width: this.width,
      height: this.depth,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'horizontal',
      notes: `Square dovetail pins on left/right edges. Pin width: ${pinWidth.toFixed(3)}", spacing: ${tailWidth.toFixed(3)}". Pins are ${this.actualThickness}" deep.`
    });

    parts.push({
      name: 'Bottom',
      width: this.width,
      height: this.depth,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'horizontal',
      notes: `Square dovetail pins on left/right edges. Pin width: ${pinWidth.toFixed(3)}", spacing: ${tailWidth.toFixed(3)}". Pins are ${this.actualThickness}" deep.`
    });

    return parts;
  }

  /**
   * Calculate parts for butt joints
   * Simple butt joints with no special joinery
   */
  calculateButtBox() {
    const parts = [];

    // Sides (full height)
    parts.push({
      name: 'Side - Left',
      width: this.depth,
      height: this.height,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'vertical',
      notes: 'Butt joint - glue and fasteners'
    });

    parts.push({
      name: 'Side - Right',
      width: this.depth,
      height: this.height,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'vertical',
      notes: 'Butt joint - glue and fasteners'
    });

    // Top and bottom (width minus 2x thickness)
    const topBottomWidth = this.width - (2 * this.thickness);

    parts.push({
      name: 'Top',
      width: topBottomWidth,
      height: this.depth,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'horizontal',
      notes: 'Butt joint - fits between sides'
    });

    parts.push({
      name: 'Bottom',
      width: topBottomWidth,
      height: this.depth,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'horizontal',
      notes: 'Butt joint - fits between sides'
    });

    return parts;
  }

  /**
   * Calculate shelf parts
   */
  /**
   * Calculate shelf parts
   * Shelves are full width, not divided by vertical dividers
   */
  calculateShelves() {
    const shelves = [];
    const shelfWidth = this.width - (2 * this.thickness);

    this.shelves.forEach((shelf, index) => {
      shelves.push({
        name: `Shelf ${index + 1}`,
        width: shelfWidth,
        height: this.depth - this.thickness, // Account for back panel
        thickness: this.actualThickness,
        quantity: shelf.quantity || 1,
        grainDirection: 'horizontal',
        position: shelf.position, // Store position for divider calculations
        shelfType: shelf.type || 'fixed',
        notes: `Full-width shelf at ${shelf.position}" from bottom. Type: ${shelf.type || 'fixed'}`
      });
    });

    return shelves;
  }

  /**
   * Calculate toe kick parts (for base cabinets)
   */
  calculateToeKickParts() {
    const parts = [];
    const toeKickDepth = this.depth - this.toeKick.depth; // Front to back dimension

    // Front toe kick rail (across the front)
    parts.push({
      name: 'Toe Kick - Front Rail',
      width: this.width - (2 * this.thickness), // Between sides
      height: this.toeKick.height,
      thickness: this.actualThickness,
      quantity: 1,
      grainDirection: 'horizontal',
      notes: `Recessed ${this.toeKick.depth}" from front edge`
    });

    // Side toe kick rails (left and right)
    parts.push({
      name: 'Toe Kick - Side Rails',
      width: toeKickDepth,
      height: this.toeKick.height,
      thickness: this.actualThickness,
      quantity: 2,
      grainDirection: 'horizontal',
      notes: 'Supports cabinet sides, attaches to front rail'
    });

    return parts;
  }

  /**
   * Calculate back panel
   */
  calculateBack() {
    // Back panel typically 1/4" and fits in a rabbet
    const backWidth = this.width - (2 * this.thickness) + 1; // Slight overlap for rabbet
    const backHeight = this.height - (2 * this.thickness) + 1;

    return {
      name: 'Back Panel',
      width: backWidth,
      height: backHeight,
      thickness: 0.25, // Standard 1/4" back
      quantity: 1,
      grainDirection: 'vertical',
      notes: 'Fits in 1/4" rabbet groove on inside back edges'
    };
  }

  /**
   * Calculate mounting rails instead of full back
   * Two horizontal rails - one at top, one above bottom
   */
  calculateMountingRails() {
    const railWidth = this.width - (2 * this.actualThickness);
    const railHeight = this.backPanel.railHeight || 4;
    
    return [
      {
        name: 'Top Mounting Rail',
        width: railWidth,
        height: railHeight,
        thickness: this.actualThickness,
        quantity: 1,
        grainDirection: 'horizontal',
        notes: `Attaches to cabinet top, flush with back edge. Use pocket holes or dados in sides.`
      },
      {
        name: 'Bottom Mounting Rail',
        width: railWidth,
        height: railHeight,
        thickness: this.actualThickness,
        quantity: 1,
        grainDirection: 'horizontal',
        notes: `Attaches ${railHeight}" above cabinet bottom, flush with back edge. Provides wall anchoring.`
      }
    ];
  }

  /**
   * Get recommended bit size for a dado width
   */
  getRecommendedBitSize(width) {
    if (width >= 0.75) {
      return '3/4"';
    } else if (width >= 0.5) {
      return '1/2"';
    } else if (width >= 0.375) {
      return '3/8"';
    } else if (width >= 0.25) {
      return '1/4"';
    } else if (width >= 0.125) {
      return '1/8"';
    }
    return '1/8" or smaller';
  }

  /**
   * Calculate shelf pin holes for adjustable shelving
   * Standard 1.25" spacing, 0.197" (5mm) diameter holes
   * Returns array of hole positions from bottom
   */
  calculateShelfPinHoles() {
    const holes = [];
    const holeDiameter = 0.197; // 5mm converted to inches
    const spacing = 1.25; // Standard shelf pin spacing
    const startFromBottom = 6; // Start 6" from bottom
    const endFromTop = 6; // Stop 6" from top
    const insetFromEdge = 1.5; // 1.5" from front and back edges
    
    const sideHeight = (this.type === 'base' && this.toeKick.enabled) 
      ? this.height - this.toeKick.height 
      : this.height;
    
    const maxHeight = sideHeight - endFromTop;
    
    // Calculate hole positions
    let currentHeight = startFromBottom;
    while (currentHeight <= maxHeight) {
      holes.push({
        fromBottom: currentHeight,
        diameter: holeDiameter,
        depth: 0.5, // 1/2" deep (industry standard)
        frontRow: insetFromEdge, // Distance from front edge
        backRow: this.depth - insetFromEdge // Distance from front edge (back row)
      });
      currentHeight += spacing;
    }
    
    return holes;
  }


  /**
   * Get summary statistics
   */
  getSummary() {
    const parts = this.calculateParts();
    
    return {
      totalParts: parts.length,
      totalArea: parts.reduce((sum, part) => {
        return sum + (part.width * part.height * part.quantity);
      }, 0),
      parts: parts
    };
  }
}

export default CabinetCalculator;
