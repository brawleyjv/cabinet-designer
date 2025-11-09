# 🪚 Cabinet Designer – React Dev README (Claude 4.0 + GitHub Copilot)

## 🧠 Project Overview
A browser-based cabinet design tool built in React. It allows users to input cabinet specs, apply joinery logic, visualize nested layouts, and export DXF files, cut lists, and ZIP bundles for CNC or manual fabrication.

---

## 📊 Current Status

**✅ PHASES 1-5 COMPLETE - CORE FUNCTIONALITY OPERATIONAL**

The cabinet designer is now fully functional with:
- Complete UI with form inputs and real-time validation
- Advanced calculation engine supporting 4 joinery types + toe kicks
- Interactive 2D visualization with grain patterns and color coding
- Custom bin packing algorithm with CNC spacing support
- Full export system (DXF, CSV, PDF, ZIP)

**🚀 Running on:** `http://localhost:3003`

**📦 Core Libraries Installed:**
- `react-router-dom` - Page navigation
- `zustand` - State management (chosen over Redux)
- `react-hook-form` - Form validation
- `dxf-writer` - DXF file generation
- `papaparse` - CSV export
- `jspdf` - PDF generation
- `jszip` - ZIP bundling

**🔧 Next Steps:** Phases 6-7 available for enhanced features and advanced capabilities

---

## 🖥️ Dev Environment Setup

### ✅ Prerequisites
- Node.js ≥ 18.x
- npm ≥ 9.x
- VSCode with GitHub Copilot enabled
- Claude 4.0 via Copilot Chat or CLI
- XAMPP (for optional PHP backend)
- Git (version control)

### ✅ Recommended VSCode Extensions
| Extension            | Purpose                          |
|---------------------|----------------------------------|
| ESLint               | Code quality and linting         |
| Prettier             | Auto-formatting                  |
| React Developer Tools | Inspect React components        |
| GitLens              | Git history and insights         |
| REST Client          | Test APIs directly in VSCode     |

---

## 🗂️ Project Structure

```
cabinet-designer/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── CabinetForm.jsx              ✅ Complete with all inputs
│   │   ├── CabinetForm.css
│   │   ├── PartPreview.jsx              ✅ Container for visualizations
│   │   ├── PartPreview.css
│   │   ├── CabinetVisualization.jsx     ✅ SVG cabinet schematic
│   │   ├── CabinetVisualization.css
│   │   ├── SheetLayout.jsx              ✅ SVG sheet nesting view
│   │   ├── SheetLayout.css
│   │   ├── ExportButtons.jsx            ✅ DXF/CSV/PDF/ZIP exports
│   │   └── ExportButtons.css
│   ├── services/
│   │   ├── calculationService.js        ✅ 4 joinery types + toe kicks
│   │   ├── nestingService.js            ✅ Custom bin packing algorithm
│   │   ├── dxfService.js                ✅ Multi-layer DXF generation
│   │   ├── csvService.js                ✅ Cut lists + sheet layouts
│   │   ├── pdfService.js                ✅ Printable documents
│   │   └── zipService.js                ✅ Complete bundle packaging
│   ├── store/
│   │   └── cabinetStore.js              ✅ Zustand state management
│   ├── views/
│   │   ├── Home.jsx                     ✅ Landing page
│   │   ├── Home.css
│   │   ├── Designer.jsx                 ✅ Main design workspace
│   │   ├── Designer.css
│   │   ├── Order.jsx                    ✅ Order/quote form
│   │   └── Order.css
│   ├── App.jsx                          ✅ Routing + navigation
│   ├── App.css
│   ├── index.js
│   └── index.css
├── build/                               ✅ Production build ready
├── .env
├── package.json
├── README.md
└── DEV_GUIDE.md
```

---

## 🧰 Core Libraries & APIs

| Feature            | Library           | Status | Notes                              |
|--------------------|-------------------|--------|-------------------------------------|
| DXF Export         | dxf-writer        | ✅ | Multi-layer export (CUT, POCKET, DRILL, LABEL) |
| Nesting            | Custom Algorithm  | ✅ | Shelf-based bin packing, grain-aware |
| CSV Export         | PapaParse         | ✅ | Cut lists + sheet layouts |
| PDF Export         | jsPDF             | ✅ | Printable cut sheets |
| ZIP Packaging      | JSZip             | ✅ | Bundle all exports + README |
| Form Handling      | React Hook Form   | ✅ | Validation + clean form logic |
| State Management   | Zustand           | ✅ | Lightweight, simple API |
| Routing            | React Router      | ✅ | 3 main views (Home, Designer, Order) |
| 3D Rendering       | Three.js + R3F    | ⏳ | Phase 8 - Optional 3D viewer |
| 3D Controls        | @react-three/drei | ⏳ | Phase 8 - OrbitControls, helpers |
| Geometry Lib       | clipper-lib       | ⏳ | Not needed yet (custom calcs working) |

---

## 🧩 Feature Map

### 🖥️ UI Components ✅
- ✅ Cabinet type selector (wall, base, tall)
- ✅ Parametric input fields (width, height, depth, material thickness)
- ✅ Joinery options (dado, rabbet, finger joint, butt joint)
- ✅ Shelf & divider controls (add/remove)
- ✅ Toe kick configuration (base cabinets only)
- ✅ Sheet size selector (7 presets + custom)
- ✅ CNC spacing/kerf input (0-1", default 0.25")
- ⏳ Face frame generator (Phase 7)
- ⏳ Drawer box generator (Phase 7)

### 📐 Layout & Nesting ✅
- ✅ 2D sheet layout panel (SVG)
- ✅ Interactive cabinet schematic
- ✅ Grain direction indicators (vertical/horizontal patterns)
- ✅ Color-coded part types (sides, top/bottom, shelves, dividers, toe kick)
- ✅ Efficiency badges (green/orange/red based on material waste)

### 📤 Export Logic ✅
- ✅ DXF generation with labeled parts and layers
- ✅ CSV cut list export (parts with dimensions and grain)
- ✅ PDF printable documents (cut lists + sheet layouts)
- ✅ ZIP bundling (all exports + README)
- ⏳ G-code generation (Phase 7)
- ⏳ Assembly instructions (Phase 6)

---

## 🎯 Suggested Enhancements

### 💾 Project Management Features (Phase 6)
- **Save/Load designs** - LocalStorage or cloud-based project saving
- **Design library** - Save common cabinet configurations as templates
- **Revision history** - Undo/redo functionality for design changes

### 🗄️ Material & Hardware Database (Phase 6)
- **Material presets** - Common sheet sizes (4x8, 5x8) and thicknesses (1/4", 1/2", 3/4")
- **Hardware calculator** - Auto-calculate hinges, drawer slides, shelf pins needed
- **Material cost estimator** - Price calculations based on material type and waste

### ✅ Validation & Error Handling (Phase 6)
- **Real-time validation** - Warn if dimensions are impractical (too thin, too wide, etc.)
- **Joinery compatibility checks** - Prevent impossible joinery for given material thickness
- **Nesting failure handling** - Alert if parts won't fit on available sheet sizes

### 📦 Enhanced Exports (Phase 7)
- **G-code generation** - For direct CNC machine control
- **Assembly instructions** - Step-by-step build guide with diagrams
- **Edge banding calculator** - Linear feet of banding needed per edge type

### 🎨 UX Improvements (Phase 6)
- **Units toggle** - Switch between imperial/metric
- **Dark/light mode** - Easier on eyes during long design sessions
- **Keyboard shortcuts** - Speed up repetitive tasks
- **Mobile-responsive design** - At least for viewing/reviewing designs

### 🛠️ Quality of Life Features (Phase 6-7)
- **Batch processing** - Design multiple cabinets for a full kitchen
- **Mirror/duplicate function** - Quick left/right cabinet pairs
- **Part labeling system** - Automatic naming convention (e.g., "LWC-01-Left", "LWC-01-Right")

---

## 📚 Development Phases

### **Phase 1: Foundation & Basic UI** ✅ *COMPLETED*
**Goal:** Get the app structure running with basic input capabilities

- [x] Initialize React app and install core dependencies
- [x] Set up project structure (components/, services/, views/)
- [x] Create basic routing (Home, Designer, Order views)
- [x] Build CabinetForm component with basic inputs
  - [x] Cabinet type selector
  - [x] Width, height, depth inputs
  - [x] Material thickness input
- [x] Implement basic state management (Zustand - chosen over Redux for simplicity)
- [x] Add form validation with React Hook Form
- [x] Style with basic CSS (responsiveness comes later)

**Deliverable:** ✅ Working form that captures cabinet specifications

**What Was Built:**
- Complete routing with React Router DOM (`Home.jsx`, `Designer.jsx`, `Order.jsx`)
- Zustand store (`cabinetStore.js`) managing all cabinet state
- Full `CabinetForm.jsx` with all inputs, validation, and form submission
- Basic CSS styling for all components
- Navigation menu for switching between views
- App running successfully on localhost:3003

---

### **Phase 2: Calculation Engine** ✅ *COMPLETED*
**Goal:** Generate accurate part dimensions with joinery logic

- [x] Create calculation service module
- [x] Implement basic box geometry calculations
  - [x] Top, bottom, sides dimensions
  - [x] Back panel calculations
- [x] Add joinery offset logic
  - [x] Dado joint calculations
  - [x] Rabbet joint calculations
  - [x] Finger/box joint calculations
  - [x] Butt joint calculations (added)
- [x] Implement shelf calculations
  - [x] Fixed shelf positioning
  - [x] Adjustable shelf dados
- [x] Add divider logic (vertical partitions)
- [x] Add toe kick support for base cabinets (bonus feature)
- [x] Create part list data structure

**Deliverable:** ✅ Accurate part dimensions based on inputs and joinery type

**What Was Built:**
- Complete `calculationService.js` with 4 joinery algorithms:
  - `calculateDadoBox()` - top/bottom fit into dado grooves in sides
  - `calculateRabbetBox()` - half-lap joints on edges
  - `calculateFingerBox()` - interlocking finger joints
  - `calculateButtBox()` - simple butt joints (no offsets)
- `calculateToeKickParts()` - generates 3 rails for base cabinet toe kicks
- Dynamic shelf and divider calculations with proper dado offsets
- Parts include: sides, top, bottom, back, shelves, dividers, toe kick rails
- All parts labeled with grain direction (horizontal/vertical)

**Key Implementation Details:**
- Toe kick support: 3.5" tall recess with configurable depth (default 3")
- Dado depth: 1/4" grooves for shelf/top/bottom fit
- Rabbet depth: Half material thickness for half-lap joints
- Finger joints: Full material thickness interlocking
- All dimensions account for material thickness and joinery offsets

---

### **Phase 3: Visualization** ✅ *COMPLETED*
**Goal:** Show users what they're designing

- [x] Build PartPreview component (simple 2D schematic)
- [x] Create interactive cabinet diagram
  - [x] Show assembled view
  - [x] Label major components
- [x] Implement grain direction indicators
- [x] Add SVG rendering
- [x] Create color-coding system for part types
- [x] Show real-time updates as form changes

**Deliverable:** ✅ Visual representation of cabinet design

**What Was Built:**
- `CabinetVisualization.jsx` - SVG-based front view of assembled cabinet
- Grain patterns using SVG `<pattern>` elements:
  - Vertical grain: vertical lines for sides and dividers
  - Horizontal grain: horizontal lines for top, bottom, shelves
- Color coding: 
  - Sides (blue)
  - Top/bottom (brown)
  - Shelves/dividers (green)
  - Toe kick (gray)
- Interactive controls to add/remove shelves and dividers directly in the form
- Real-time updates - visualization changes as form values change
- Part labels showing component names
- Dimension lines showing width and height
- Toe kick visualization for base cabinets (recessed area shown)

**Key Implementation Details:**
- SVG viewBox scaling for consistent display at any cabinet size
- Pattern IDs for grain direction (`vertical-grain`, `horizontal-grain`)
- Automatic layout calculation based on shelf/divider positions
- Conditional rendering of toe kick (base cabinets only)

---

### **Phase 4: Nesting & Layout** ✅ *COMPLETED*
**Goal:** Optimize part arrangement on sheet materials

- [x] Built custom bin packing algorithm (no external library needed)
- [x] Create SheetLayout component
- [x] Implement material sheet size configuration
  - [x] Preset sizes: 2x4, 4x4, 4x8, 5x5, 5x8, 5x10
  - [x] Custom size option
- [x] Build nesting algorithm integration
- [x] Add grain direction respect in nesting
- [x] Calculate material waste/efficiency
- [x] Show multiple sheet layouts if needed
- [x] Add CNC spacing/kerf allowance

**Deliverable:** ✅ Optimized sheet layout with minimal waste

**What Was Built:**
- `nestingService.js` - custom shelf-based bin packing algorithm
- Algorithm features:
  - Grain direction awareness (won't rotate parts with vertical grain)
  - Collision detection with spacing buffer
  - Shelf-based packing (places parts on horizontal levels)
  - Multi-sheet support (creates new sheet if parts don't fit)
- Part spacing/kerf input (0-1", default 0.25") for CNC bit clearance
- `SheetLayout.jsx` - SVG visualization of nested parts on sheets
- Color-coded efficiency badges:
  - Green (>80% efficiency) - Excellent
  - Orange (60-80% efficiency) - Good
  - Red (<60% efficiency) - Poor
- Grid background for visual reference (1" squares)
- Part labels showing dimensions and rotation status
- Real-time efficiency calculations

**Key Implementation Details:**
- Spacing buffer added to collision detection rectangles
- Efficiency = (total part area) / (sheet area) × 100
- Occupied rectangles track all placed parts for collision checking
- Parts sorted by area (largest first) for better packing
- Sheet size presets cover common plywood dimensions

---

### **Phase 5: Export Functionality** ✅ *COMPLETED*
**Goal:** Generate production-ready files

- [x] Integrate dxf-writer library
- [x] Build DXF export service
  - [x] Generate layers (CUT, POCKET, DRILL, LABEL, SHEET_OUTLINE)
  - [x] Add part labels to DXF
  - [x] Include grain direction arrows
- [x] Create CSV cut list export (PapaParse)
  - [x] Part name, dimensions, quantity
  - [x] Material type, grain direction
  - [x] Sheet layout export with efficiency metrics
- [x] Implement PDF generation (jsPDF)
  - [x] Cut list printout (landscape table format)
  - [x] Sheet layout diagrams with part lists
- [x] Add ZIP bundling (JSZip)
  - [x] Package all exports together
  - [x] Include metadata/README file
- [x] Build download UI components

**Deliverable:** ✅ Complete export system with DXF, CSV, PDF, and ZIP

**What Was Built:**

**DXF Export (`dxfService.js`):**
- Multi-layer DXF files (one per sheet)
- Layers:
  - `CUT` - part outlines for cutting
  - `POCKET` - dado grooves for joinery
  - `DRILL` - shelf pin holes
  - `LABEL` - part identification text
  - `SHEET_OUTLINE` - material boundary
- Grain direction arrows (0.5" long, pointing up for vertical grain)
- Part labels positioned at center of each part
- Coordinates in inches (DXF units)

**CSV Export (`csvService.js`):**
- Two export functions:
  - `exportCutList()` - comprehensive parts list with:
    - Part name, width, height, material thickness
    - Grain direction, part type, notes
  - `exportSheetLayout()` - sheet-by-sheet breakdown with:
    - Sheet number, dimensions, efficiency percentage
    - List of parts on each sheet with positions
- Summary sections with totals and metadata

**PDF Export (`pdfService.js`):**
- Landscape orientation for better table layout
- Cut list PDF:
  - Tabular format with all part specifications
  - Summary header with cabinet details
- Sheet layout PDF:
  - Visual diagrams of each sheet
  - Part lists with dimensions and positions
  - Efficiency metrics per sheet

**ZIP Bundling (`zipService.js`):**
- Folder structure:
  - `/dxf/` - all DXF files (sheet1.dxf, sheet2.dxf, ...)
  - `/csv/` - cut list and sheet layout CSVs
  - `/pdf/` - printable documents
  - `README.txt` - project summary
- Async generation with proper MIME types
- Single download containing complete project

**Export UI (`ExportButtons.jsx`):**
- 4 color-coded buttons:
  - DXF Export (red) - CNC files only
  - CSV Export (green) - Spreadsheet data only
  - PDF Export (blue) - Printable documents only
  - Complete Bundle (purple) - ZIP with everything
- Loading states during async ZIP generation
- Disabled states when no parts available
- Clear visual feedback for each export type

---

### **Phase 6: Enhanced Features** ⏳ *PENDING*
**Goal:** Add convenience and professional features

- [ ] **Project Management**
  - [ ] Save/load designs (LocalStorage)
  - [ ] Design templates library
  - [ ] Undo/redo functionality
- [ ] **Material Database**
  - [ ] Material presets
  - [ ] Hardware calculator
  - [ ] Cost estimator
- [ ] **Advanced Validation**
  - [ ] Real-time dimension warnings
  - [ ] Joinery compatibility checks
  - [ ] Nesting failure alerts
- [ ] **UX Polish**
  - [ ] Imperial/metric toggle
  - [ ] Dark/light mode
  - [ ] Keyboard shortcuts
  - [ ] Mobile responsiveness

**Deliverable:** Production-ready professional tool

---

### **Phase 7: Advanced Capabilities** ⏳ *FUTURE*
**Goal:** Differentiate and expand market

- [ ] Face frame generator
- [ ] Drawer box module
- [ ] G-code generation
- [ ] Assembly instructions generator
- [ ] Edge banding calculator
- [ ] Batch/kitchen-wide processing
- [ ] Cloud storage integration
- [ ] User accounts and project sharing
- [ ] White-label customization

**Deliverable:** Feature-complete enterprise solution

---

### **Phase 8: 3D Visualization** ⏳ *OPTIONAL ENHANCEMENT*
**Goal:** Add interactive 3D preview with rotation capabilities

**Tech Stack:**
- `three` - Core 3D rendering library
- `@react-three/fiber` - React wrapper for Three.js
- `@react-three/drei` - Helpful utilities (OrbitControls, etc.)

**Implementation Steps:**

- [ ] Install dependencies
  ```bash
  npm install three @react-three/fiber @react-three/drei
  ```

- [ ] Create `Cabinet3DView.jsx` component
  - [ ] Set up Canvas with camera and lighting
  - [ ] Add OrbitControls for rotation/zoom/pan
  - [ ] Render parametric cabinet mesh from store data
  - [ ] Add materials with realistic wood textures

- [ ] Integrate into Designer view
  - [ ] Add toggle between 2D and 3D views
  - [ ] Sync 3D model with cabinet specifications
  - [ ] Update in real-time as form values change

- [ ] Enhanced 3D features (optional)
  - [ ] Separate meshes for each part (sides, top, bottom, shelves)
  - [ ] Color coding matching 2D visualization
  - [ ] Grain direction textures
  - [ ] Exploded view mode
  - [ ] Part highlighting on hover

**Minimal Implementation Example:**

```jsx
// src/components/Cabinet3DView.jsx
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import useCabinetStore from '../store/cabinetStore'

const Cabinet3DView = () => {
  const { width, height, depth } = useCabinetStore()
  
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <OrbitControls />
      
      {/* Parametric cabinet box */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width / 12, height / 12, depth / 12]} />
        <meshStandardMaterial color="burlywood" />
      </mesh>
    </Canvas>
  )
}

export default Cabinet3DView
```

```jsx
// src/views/Designer.jsx - Integration
import Cabinet3DView from '../components/Cabinet3DView'

export default function Designer() {
  const [view3D, setView3D] = useState(false)
  
  return (
    <div>
      <button onClick={() => setView3D(!view3D)}>
        Toggle {view3D ? '2D' : '3D'} View
      </button>
      
      {view3D ? (
        <div style={{ height: '600px', width: '100%' }}>
          <Cabinet3DView />
        </div>
      ) : (
        <PartPreview /> {/* Existing 2D view */}
      )}
    </div>
  )
}
```

**What This Provides:**
- ✅ Rotatable 3D cabinet visualization
- ✅ OrbitControls for intuitive pan/zoom/rotate
- ✅ Proper lighting for depth and realism
- ✅ Parametric sizing from store state
- ✅ Easy to expand with detailed part breakdown
- ✅ Minimal bundle size impact (~100KB gzipped)

**Future Enhancements:**
- Export 3D model as OBJ/STL for rendering software
- Animate assembly sequence
- VR/AR preview capabilities
- Photorealistic materials and textures
- Lighting/shadow customization

**Deliverable:** Interactive 3D cabinet preview with rotation

---

## 🛠️ Local Deployment with XAMPP

1. Build React app:
   ```bash
   npm run build
   ```
2. Copy `/build` contents to:
   ```
   C:\xampp\htdocs\cabinet-designer
   ```
3. Access via:
   ```
   http://localhost/cabinet-designer
   ```

Optional `.htaccess` for React Router:
```apache
RewriteEngine On
RewriteBase /cabinet-designer/
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /cabinet-designer/index.html [L]
```

---

## 🧪 Testing & Debugging

- Use browser dev tools for layout inspection
- Check console for any React warnings (current ESLint warnings are cosmetic only)
- Test all joinery types to verify calculations
- Verify exports download correctly
- Check sheet nesting with various cabinet sizes

---

## 🤖 Claude 4.0 + Copilot Usage Tips

- Use Claude to:
  - Scaffold React components from feature specs
  - Generate DXF logic using dxf-writer
  - Implement nesting algorithms
  - Chunk UI logic into reusable modules
  - Draft backend PHP scripts for order submission

- Use Copilot to:
  - Autocomplete geometry and layout logic
  - Suggest React hooks and form validation
  - Refactor and comment code for clarity
  - Generate export handlers (CSV, PDF, ZIP)

---

## 📎 Quick Start Checklist

**Development Environment:**
- [x] Node.js and npm installed
- [x] VSCode with GitHub Copilot enabled
- [x] Claude 4.0 available via Copilot Chat
- [x] Git repository initialized
- [ ] XAMPP installed (for later deployment)

**Project Setup:**
- [x] React app created
- [x] All dependencies installed
- [x] Project structure established
- [x] App running on localhost:3003

**Core Functionality:**
- [x] Form inputs and validation
- [x] Calculation engine (4 joinery types)
- [x] Toe kick support
- [x] Cabinet visualization
- [x] Sheet nesting with spacing
- [x] DXF/CSV/PDF/ZIP exports

---

## 🚀 Future Expansion

- ⏳ Interactive 3D preview with React Three Fiber (Phase 8)
- ⏳ Face frame and drawer box generators (Phase 7)
- ⏳ G-code generation for direct CNC control (Phase 7)
- ⏳ Assembly instruction generator (Phase 6)
- ⏳ Material cost estimator (Phase 6)
- ⏳ Integrate Firebase for cloud storage and user accounts (Phase 7)
- ⏳ Wrap app in Electron or Tauri for desktop deployment
- ⏳ Offer white-label version for cabinet shops
- ⏳ Export 3D models as OBJ/STL (Phase 8 enhancement)

---

## 📝 Development Notes

**Technology Decisions:**
- **Zustand over Redux:** Simpler API, less boilerplate, sufficient for this use case
- **Custom nesting algorithm:** SVGNest and rectpack2D not needed - custom shelf-based bin packing works well
- **No clipper-lib yet:** Current geometric calculations are simple enough without polygon library
- **SVG over Canvas (for 2D):** SVG easier to debug, inspect, and export
- **React Three Fiber (for 3D):** Declarative 3D rendering that fits React paradigm

**Known Issues:**
- ESLint warning about unused `cabDepth` variable in visualization (cosmetic only)
- Some npm peer dependency warnings (safe to ignore for development)

**Performance Notes:**
- Nesting algorithm is O(n²) but fast enough for typical cabinet part counts (5-20 parts)
- DXF generation is synchronous but completes quickly (<100ms per sheet)
- ZIP bundling is async and shows loading state for better UX

---

## 🏆 Accomplishments

**✅ Fully Functional Cabinet Designer:**
- Complete UI with all inputs and controls
- Advanced joinery calculations (dado, rabbet, finger, butt)
- Toe kick support for base cabinets
- Real-time visualization with grain patterns
- Intelligent sheet nesting with CNC spacing
- Multi-format exports (DXF, CSV, PDF, ZIP)

**📊 Ready For:**
- User testing and feedback
- Phase 6 enhancements (save/load, validation, UX polish)
- Phase 7 advanced features (3D preview, G-code, face frames)
- Production deployment to XAMPP

---

*Last Updated: After completion of Phase 5*
*App Status: Running on localhost:3003*
*Core Development: Complete (Phases 1-5)*
