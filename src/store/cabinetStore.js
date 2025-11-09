import { create } from 'zustand';

const useCabinetStore = create((set) => ({
  // Cabinet specifications
  cabinetType: 'base',
  width: 24,
  height: 30,
  depth: 24,
  materialThickness: 0.75,
  actualMaterialThickness: 0.75, // Actual measured thickness (can differ from nominal)
  joineryType: 'dado',
  joineryTolerance: 0.002, // Play/clearance for joinery fits (default 0.002")
  dadoDepth: null, // Dado groove depth (null = auto calculate as 1/3 thickness)
  
  // Toe kick (base cabinets only)
  toeKick: {
    enabled: true,
    height: 4,      // Standard 4" toe kick height
    depth: 3        // Standard 3" toe kick recess
  },
  
  // Back panel options
  backPanel: {
    enabled: true,
    type: 'full',   // 'full', 'rails', or 'none'
    railHeight: 4,  // Height of mounting rails when type is 'rails'
  },
  
  // Shelves
  shelves: [],
  
  // Calculated parts
  parts: [],
  
  // Sheet settings
  sheetWidth: 48,    // Standard 4x8 sheet
  sheetHeight: 96,
  partSpacing: 0.125, // Spacing between parts (kerf allowance)
  bitDiameter: 0.25, // CNC bit diameter (default 1/4")
  edgePadding: 0.125,   // Padding from sheet edge (default 0.125")
  
  // Actions
  setCabinetType: (type) => set({ cabinetType: type }),
  setDimensions: (width, height, depth) => set({ width, height, depth }),
  setMaterialThickness: (thickness, actualThickness) => set({ 
    materialThickness: thickness,
    actualMaterialThickness: actualThickness || thickness
  }),
  setJoineryType: (type) => set({ joineryType: type }),
  setJoineryTolerance: (tolerance) => set({ joineryTolerance: tolerance }),
  setDadoDepth: (depth) => set({ dadoDepth: depth }),
  setToeKick: (toeKick) => set({ toeKick }),
  setBackPanel: (backPanel) => set({ backPanel }),
  addShelf: (position) => set((state) => ({ 
    shelves: [...state.shelves, { position, type: 'fixed', quantity: 1 }] 
  })),
  updateShelf: (index, updates) => set((state) => ({
    shelves: state.shelves.map((shelf, i) => i === index ? { ...shelf, ...updates } : shelf)
  })),
  removeShelf: (index) => set((state) => ({ 
    shelves: state.shelves.filter((_, i) => i !== index) 
  })),
  setParts: (parts) => set({ parts }),
  setSheetSize: (width, height) => set({ sheetWidth: width, sheetHeight: height }),
  setPartSpacing: (spacing) => set({ partSpacing: spacing }),
  setBitDiameter: (diameter) => set({ bitDiameter: diameter }),
  setEdgePadding: (padding) => set({ edgePadding: padding }),
  
  // Reset all
  reset: () => set({
    cabinetType: 'base',
    width: 24,
    height: 30,
    depth: 24,
    materialThickness: 0.75,
    actualMaterialThickness: 0.75,
    joineryType: 'dado',
    joineryTolerance: 0.002,
    dadoDepth: null,
    toeKick: {
      enabled: true,
      height: 4,
      depth: 3
    },
    backPanel: {
      enabled: true,
      type: 'full',
      railHeight: 4,
    },
    shelves: [],
    parts: [],
    sheetWidth: 48,
    sheetHeight: 96,
    partSpacing: 0.125,
    bitDiameter: 0.25,
    edgePadding: 0.125
  })
}));

export default useCabinetStore;
