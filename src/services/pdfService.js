/**
 * PDF Export Service
 * Generates PDF documents with cut lists and layouts
 */
import { jsPDF } from 'jspdf';

class PdfService {
  /**
   * Export cut list to PDF
   * @param {Array} parts - Array of part objects
   * @param {Object} cabinetInfo - Cabinet metadata
   * @returns {jsPDF} PDF document
   */
  static exportCutListPDF(parts, cabinetInfo) {
    const pdf = new jsPDF();
    let y = 20;

    // Title
    pdf.setFontSize(18);
    pdf.text('Cabinet Cut List', 105, y, { align: 'center' });
    y += 15;

    // Cabinet Info
    pdf.setFontSize(12);
    pdf.text(`Cabinet Type: ${cabinetInfo.type}`, 20, y);
    y += 7;
    pdf.text(`Dimensions: ${cabinetInfo.width}" W × ${cabinetInfo.height}" H × ${cabinetInfo.depth}" D`, 20, y);
    y += 7;
    pdf.text(`Material: ${cabinetInfo.materialThickness}" thickness`, 20, y);
    y += 7;
    pdf.text(`Joinery: ${cabinetInfo.joineryType}`, 20, y);
    y += 15;

    // Table header
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text('Part Name', 20, y);
    pdf.text('Width', 80, y);
    pdf.text('Height', 110, y);
    pdf.text('Thick', 140, y);
    pdf.text('Qty', 165, y);
    pdf.text('Grain', 180, y);
    y += 2;
    pdf.line(20, y, 200, y);
    y += 5;

    // Parts
    pdf.setFont(undefined, 'normal');
    parts.forEach(part => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(part.name, 20, y);
      pdf.text(`${part.width.toFixed(3)}"`, 80, y);
      pdf.text(`${part.height.toFixed(3)}"`, 110, y);
      pdf.text(`${part.thickness}"`, 140, y);
      pdf.text(part.quantity.toString(), 165, y);
      pdf.text(part.grainDirection.substring(0, 4), 180, y);
      y += 7;
    });

    // Summary
    y += 10;
    if (y > 250) {
      pdf.addPage();
      y = 20;
    }

    pdf.line(20, y, 200, y);
    y += 7;
    pdf.setFont(undefined, 'bold');
    pdf.text('SUMMARY', 20, y);
    y += 7;
    pdf.setFont(undefined, 'normal');
    
    const totalParts = parts.reduce((sum, p) => sum + p.quantity, 0);
    const totalArea = parts.reduce((sum, p) => sum + (p.width * p.height * p.quantity), 0);
    
    pdf.text(`Total Parts: ${totalParts}`, 20, y);
    y += 7;
    pdf.text(`Total Material Area: ${totalArea.toFixed(2)} sq in`, 20, y);
    y += 10;

    // Part notes
    pdf.setFont(undefined, 'bold');
    pdf.text('NOTES:', 20, y);
    y += 7;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(8);
    
    parts.forEach(part => {
      if (part.notes && y < 280) {
        pdf.text(`${part.name}: ${part.notes}`, 20, y);
        y += 5;
      }
    });

    return pdf;
  }

  /**
   * Export sheet layout to PDF
   * @param {Array} sheets - Array of sheet objects
   * @param {Object} cabinetInfo - Cabinet metadata
   * @returns {jsPDF} PDF document
   */
  static exportSheetLayoutPDF(sheets, cabinetInfo) {
    const pdf = new jsPDF('landscape');
    
    sheets.forEach((sheet, index) => {
      if (index > 0) pdf.addPage('landscape');
      
      let y = 20;

      // Sheet title
      pdf.setFontSize(16);
      pdf.text(`Sheet ${index + 1} Layout`, 148, y, { align: 'center' });
      y += 10;

      // Sheet info
      pdf.setFontSize(10);
      pdf.text(`${sheet.width}" × ${sheet.height}" × ${sheet.thickness}"`, 148, y, { align: 'center' });
      y += 5;
      pdf.text(`Efficiency: ${sheet.efficiency.toFixed(1)}% | Parts: ${sheet.parts.length}`, 148, y, { align: 'center' });
      y += 15;

      // Draw sheet layout (simplified)
      const scale = 2; // Scale factor for PDF
      const offsetX = 20;
      const offsetY = y;

      // Sheet outline
      pdf.rect(offsetX, offsetY, sheet.width * scale, sheet.height * scale);

      // Parts
      sheet.parts.forEach(part => {
        const px = offsetX + (part.x * scale);
        const py = offsetY + (part.y * scale);
        const pw = part.width * scale;
        const ph = part.height * scale;

        pdf.rect(px, py, pw, ph);
        
        // Part label
        pdf.setFontSize(6);
        const labelX = px + pw / 2;
        const labelY = py + ph / 2;
        pdf.text(part.instanceId || part.name, labelX, labelY, { align: 'center' });
      });

      // Parts list
      y = offsetY + (sheet.height * scale) + 15;
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Parts on this sheet:', 20, y);
      y += 7;
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(8);

      sheet.parts.forEach(part => {
        if (y < 190) {
          pdf.text(`• ${part.instanceId || part.name} - ${part.width.toFixed(2)}" × ${part.height.toFixed(2)}"`, 25, y);
          y += 5;
        }
      });
    });

    return pdf;
  }

  /**
   * Download PDF file
   */
  static downloadPDF(pdf, filename) {
    pdf.save(filename);
  }
}

export default PdfService;
