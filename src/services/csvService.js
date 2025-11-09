/**
 * CSV Export Service
 * Generates cut list CSV files using PapaParse
 */
import Papa from 'papaparse';

class CsvService {
  /**
   * Export parts to CSV cut list
   * @param {Array} parts - Array of part objects
   * @param {Object} cabinetInfo - Cabinet metadata
   * @returns {String} CSV content
   */
  static exportCutList(parts, cabinetInfo) {
    const csvData = [];

    // Header row
    csvData.push([
      'Part Name',
      'Width (in)',
      'Height (in)',
      'Thickness (in)',
      'Quantity',
      'Grain Direction',
      'Material Area (sq in)',
      'Notes'
    ]);

    // Expand parts by quantity
    parts.forEach(part => {
      for (let i = 0; i < part.quantity; i++) {
        csvData.push([
          `${part.name}${part.quantity > 1 ? ` #${i + 1}` : ''}`,
          part.width.toFixed(3),
          part.height.toFixed(3),
          part.thickness,
          1,
          part.grainDirection,
          (part.width * part.height).toFixed(2),
          part.notes || ''
        ]);
      }
    });

    // Add summary rows
    csvData.push([]);
    csvData.push(['SUMMARY']);
    csvData.push(['Cabinet Type', cabinetInfo.type]);
    csvData.push(['Cabinet Dimensions', `${cabinetInfo.width}" W × ${cabinetInfo.height}" H × ${cabinetInfo.depth}" D`]);
    csvData.push(['Material Thickness', `${cabinetInfo.materialThickness}"`]);
    csvData.push(['Joinery Type', cabinetInfo.joineryType]);
    csvData.push(['Total Parts', parts.reduce((sum, p) => sum + p.quantity, 0)]);
    
    const totalArea = parts.reduce((sum, part) => {
      return sum + (part.width * part.height * part.quantity);
    }, 0);
    csvData.push(['Total Material Area', `${totalArea.toFixed(2)} sq in`]);

    return Papa.unparse(csvData);
  }

  /**
   * Export sheet layout to CSV
   * @param {Array} sheets - Array of sheet objects
   * @returns {String} CSV content
   */
  static exportSheetLayout(sheets) {
    const csvData = [];

    csvData.push([
      'Sheet Number',
      'Sheet Size',
      'Thickness',
      'Parts Count',
      'Efficiency %',
      'Used Area (sq in)',
      'Wasted Area (sq in)'
    ]);

    sheets.forEach((sheet, index) => {
      csvData.push([
        index + 1,
        `${sheet.width}" × ${sheet.height}"`,
        `${sheet.thickness}"`,
        sheet.parts.length,
        sheet.efficiency.toFixed(2) + '%',
        ((sheet.width * sheet.height) - sheet.wastedArea).toFixed(2),
        sheet.wastedArea.toFixed(2)
      ]);
    });

    // Summary
    csvData.push([]);
    csvData.push(['SUMMARY']);
    csvData.push(['Total Sheets', sheets.length]);
    csvData.push(['Average Efficiency', `${(sheets.reduce((sum, s) => sum + s.efficiency, 0) / sheets.length).toFixed(2)}%`]);
    csvData.push(['Total Waste', `${sheets.reduce((sum, s) => sum + s.wastedArea, 0).toFixed(2)} sq in`]);

    return Papa.unparse(csvData);
  }

  /**
   * Download CSV file
   */
  static downloadCSV(filename, content) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
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

export default CsvService;
