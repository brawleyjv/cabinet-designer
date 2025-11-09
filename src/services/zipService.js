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
   * @param {Object} data - Object containing parts and cabinetInfo
   * @returns {Promise} ZIP blob
   */
  static async createBundle(data) {
    const { parts, cabinetInfo } = data;
    const zip = new JSZip();

    // Create folders
    const dxfFolder = zip.folder('DXF_Files');
    const csvFolder = zip.folder('CSV_Files');
    const pdfFolder = zip.folder('PDF_Files');

    // Generate DXF files (single file with all parts)
    const dxfService = new DxfService();
    const dxfFiles = dxfService.exportParts(parts, cabinetInfo);
    dxfFiles.forEach(file => {
      dxfFolder.file(file.filename, file.content);
    });

    // Generate CSV files
    const cutListCSV = CsvService.exportCutList(parts, cabinetInfo);
    csvFolder.file('Cut_List.csv', cutListCSV);

    // Generate PDF files
    const cutListPDF = PdfService.exportCutListPDF(parts, cabinetInfo);
    pdfFolder.file('Cut_List.pdf', cutListPDF.output('blob'));

    // Add README
    const readme = this.generateReadme(cabinetInfo, parts);
    zip.file('README.txt', readme);

    // Generate ZIP
    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Generate README content
   */
  static generateReadme(cabinetInfo, parts) {
    const totalParts = parts.reduce((sum, p) => sum + p.quantity, 0);
    const totalArea = parts.reduce((sum, p) => sum + (p.width * p.height * p.quantity), 0);

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

DXF FILES:
- All parts are included in a single DXF file
- Import into Aspire/VCarve for nesting optimization
- Layers: CUT (red), POCKET (blue), DRILL (green), LABEL (black)

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
