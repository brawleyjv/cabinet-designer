/**
 * ZIP Export Service
 * Bundles all export files into a single ZIP
 */
import JSZip from 'jszip';
import DxfService from './dxfService';
import CsvService from './csvService';
import PdfService from './pdfService';

class ZipService {
  /**
   * Create a ZIP bundle with all exports
   * @param {Object} data - Object containing parts, sheets, and cabinetInfo
   * @returns {Promise} ZIP blob
   */
  static async createBundle(data) {
    const { parts, sheets, cabinetInfo } = data;
    const zip = new JSZip();

    // Create folders
    const dxfFolder = zip.folder('DXF_Files');
    const csvFolder = zip.folder('CSV_Files');
    const pdfFolder = zip.folder('PDF_Files');

    // Generate DXF files
    const dxfService = new DxfService();
    const dxfFiles = dxfService.exportSheets(sheets, cabinetInfo);
    dxfFiles.forEach(file => {
      dxfFolder.file(file.filename, file.content);
    });

    // Generate CSV files
    const cutListCSV = CsvService.exportCutList(parts, cabinetInfo);
    csvFolder.file('Cut_List.csv', cutListCSV);

    const sheetLayoutCSV = CsvService.exportSheetLayout(sheets);
    csvFolder.file('Sheet_Layout.csv', sheetLayoutCSV);

    // Generate PDF files
    const cutListPDF = PdfService.exportCutListPDF(parts, cabinetInfo);
    pdfFolder.file('Cut_List.pdf', cutListPDF.output('blob'));

    const sheetLayoutPDF = PdfService.exportSheetLayoutPDF(sheets, cabinetInfo);
    pdfFolder.file('Sheet_Layout.pdf', sheetLayoutPDF.output('blob'));

    // Add README
    const readme = this.generateReadme(cabinetInfo, parts, sheets);
    zip.file('README.txt', readme);

    // Generate ZIP
    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Generate README content
   */
  static generateReadme(cabinetInfo, parts, sheets) {
    const totalParts = parts.reduce((sum, p) => sum + p.quantity, 0);
    const totalArea = parts.reduce((sum, p) => sum + (p.width * p.height * p.quantity), 0);
    const avgEfficiency = sheets.reduce((sum, s) => sum + s.efficiency, 0) / sheets.length;

    return `
CABINET DESIGN EXPORT
Generated: ${new Date().toLocaleString()}

CABINET SPECIFICATIONS:
- Type: ${cabinetInfo.type}
- Dimensions: ${cabinetInfo.width}" W × ${cabinetInfo.height}" H × ${cabinetInfo.depth}" D
- Material Thickness: ${cabinetInfo.materialThickness}"
- Joinery Type: ${cabinetInfo.joineryType}

PARTS SUMMARY:
- Total Parts: ${totalParts}
- Total Material Area: ${totalArea.toFixed(2)} sq in
- Unique Part Types: ${parts.length}

SHEET LAYOUT SUMMARY:
- Total Sheets Required: ${sheets.length}
- Average Efficiency: ${avgEfficiency.toFixed(1)}%
- Sheet Size: ${sheets[0]?.width}" × ${sheets[0]?.height}"

FILES INCLUDED:
/DXF_Files/ - CNC-ready DXF files (one per sheet)
/CSV_Files/ - Cut lists and sheet layouts in CSV format
/PDF_Files/ - Printable cut lists and assembly diagrams

USAGE:
1. DXF files can be imported into CAM software for CNC machining
2. CSV files can be opened in Excel or Google Sheets
3. PDF files are ready for printing

NOTES:
- All dimensions are in inches
- Grain direction is indicated in cut list
- Parts are labeled with instance IDs for easy identification
- Spacing between parts on sheets accounts for bit kerf

For questions or issues, refer to the cabinet designer application.
`.trim();
  }

  /**
   * Download ZIP file
   */
  static async downloadZip(zipBlob, filename) {
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default ZipService;
