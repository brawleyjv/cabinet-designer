import React, { useState } from 'react';
import useCabinetStore from '../store/cabinetStore';
import DxfService from '../services/dxfService';
import CsvService from '../services/csvService';
import PdfService from '../services/pdfService';
import ZipService from '../services/zipService';
import './ExportButtons.css';

function ExportButtons() {
  const { 
    cabinetType, 
    width, 
    height, 
    depth, 
    materialThickness, 
    joineryType,
    parts
  } = useCabinetStore();

  const [isExporting, setIsExporting] = useState(false);

  const cabinetInfo = {
    type: cabinetType,
    width,
    height,
    depth,
    materialThickness,
    joineryType
  };

  const handleExportDXF = () => {
    if (parts.length === 0) {
      alert('Please generate a design first by clicking "Update Design"');
      return;
    }

    const dxfService = new DxfService();
    const dxfFiles = dxfService.exportParts(parts, cabinetInfo);

    dxfFiles.forEach(file => {
      DxfService.downloadDXF(file.filename, file.content);
    });
  };

  const handleExportCSV = () => {
    if (parts.length === 0) {
      alert('Please generate a design first by clicking "Update Design"');
      return;
    }

    // Export cut list
    const cutListCSV = CsvService.exportCutList(parts, cabinetInfo);
    CsvService.downloadCSV('Cut_List.csv', cutListCSV);
  };

  const handleExportPDF = () => {
    if (parts.length === 0) {
      alert('Please generate a design first by clicking "Update Design"');
      return;
    }

    // Export cut list PDF
    const cutListPDF = PdfService.exportCutListPDF(parts, cabinetInfo);
    PdfService.downloadPDF(cutListPDF, 'Cut_List.pdf');
  };

  const handleExportAll = async () => {
    if (parts.length === 0) {
      alert('Please generate a design first by clicking "Update Design"');
      return;
    }

    setIsExporting(true);

    try {
      const zipBlob = await ZipService.createBundle({
        parts,
        cabinetInfo
      });

      const filename = `Cabinet_${cabinetType}_${width}x${height}x${depth}.zip`;
      await ZipService.downloadZip(zipBlob, filename);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error creating export bundle. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const hasDesign = parts.length > 0;

  return (
    <div className="export-buttons">
      <h3>Export Options</h3>
      
      <div className="export-grid">
        <button
          className="export-btn export-dxf"
          onClick={handleExportDXF}
          disabled={!hasDesign}
          title="Export DXF files for CNC machining"
        >
          <span className="btn-icon">📐</span>
          <span className="btn-label">DXF Files</span>
          <span className="btn-desc">CNC Ready</span>
        </button>

        <button
          className="export-btn export-csv"
          onClick={handleExportCSV}
          disabled={!hasDesign}
          title="Export cut list as CSV spreadsheet"
        >
          <span className="btn-icon">📊</span>
          <span className="btn-label">CSV Files</span>
          <span className="btn-desc">Cut Lists</span>
        </button>

        <button
          className="export-btn export-pdf"
          onClick={handleExportPDF}
          disabled={!hasDesign}
          title="Export printable PDF documents"
        >
          <span className="btn-icon">📄</span>
          <span className="btn-label">PDF Files</span>
          <span className="btn-desc">Printable</span>
        </button>

        <button
          className="export-btn export-all"
          onClick={handleExportAll}
          disabled={!hasDesign || isExporting}
          title="Export everything in a ZIP bundle"
        >
          <span className="btn-icon">📦</span>
          <span className="btn-label">{isExporting ? 'Creating...' : 'Complete Bundle'}</span>
          <span className="btn-desc">ZIP Package</span>
        </button>
      </div>

      {!hasDesign && (
        <p className="export-note">
          Click "Update Design" in the form to generate exports
        </p>
      )}
    </div>
  );
}

export default ExportButtons;
