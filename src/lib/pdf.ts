import jsPDF from 'jspdf';
import type { Inspection, Grade } from '../types/inspection';
import { SECTION_DEFS } from './sectionConfig';

const COLORS = {
  primary: [24, 24, 24] as [number, number, number],
  accent: [232, 255, 0] as [number, number, number],
  pass: [29, 184, 122] as [number, number, number],
  advisory: [245, 166, 35] as [number, number, number],
  fail: [224, 52, 52] as [number, number, number],
  muted: [107, 107, 107] as [number, number, number],
  surface: [244, 244, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  border: [232, 232, 228] as [number, number, number],
};

function gradeColor(grade: Grade | null): [number, number, number] {
  if (grade === 'pass') return COLORS.pass;
  if (grade === 'advisory') return COLORS.advisory;
  if (grade === 'fail') return COLORS.fail;
  return COLORS.muted;
}

function gradeLabel(grade: Grade | null): string {
  if (grade === 'pass') return 'PASS';
  if (grade === 'advisory') return 'ADVISORY';
  if (grade === 'fail') return 'FAIL';
  return 'N/A';
}

export function generatePdf(inspection: Inspection): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function checkPageBreak(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = margin;
    }
  }

  // Header
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(...COLORS.accent);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTO INSPECT PRO', margin, 18);

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Vehicle Inspection Report', margin, 26);

  const dateStr = inspection.completedAt
    ? new Date(inspection.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(dateStr, pageWidth - margin, 26, { align: 'right' });
  doc.text(`Inspector: ${inspection.inspectorName}`, pageWidth - margin, 32, { align: 'right' });

  y = 50;

  // Vehicle details
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text(`${inspection.vehicle.make} ${inspection.vehicle.model}`.toUpperCase(), margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.muted);
  const vehicleInfo = [
    `Registration: ${inspection.vehicle.vrm}`,
    `Year: ${inspection.vehicle.year || 'N/A'}`,
    `Colour: ${inspection.vehicle.colour || 'N/A'}`,
    `Mileage: ${inspection.mileage?.toLocaleString() || 'N/A'} miles`,
    `Fuel: ${inspection.vehicle.fuelType || 'N/A'}`,
    `Transmission: ${inspection.vehicle.transmissionType || 'N/A'}`,
  ].join('  |  ');
  doc.text(vehicleInfo, margin, y, { maxWidth: contentWidth });
  y += 8;

  doc.text(
    `Type: ${inspection.type === 'private_purchase' ? 'Private Purchase Appraisal' : 'Pre Delivery Inspection'}`,
    margin, y,
  );
  y += 10;

  // Overall summary box
  doc.setFillColor(...COLORS.surface);
  doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F');

  const colW = contentWidth / 4;
  const boxY = y + 8;

  // Pass count
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.pass);
  doc.text(String(inspection.passCounts), margin + colW * 0.5, boxY, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('PASS', margin + colW * 0.5, boxY + 6, { align: 'center' });

  // Advisory count
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.advisory);
  doc.text(String(inspection.advisoryCounts), margin + colW * 1.5, boxY, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('ADVISORY', margin + colW * 1.5, boxY + 6, { align: 'center' });

  // Fail count
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.fail);
  doc.text(String(inspection.failCounts), margin + colW * 2.5, boxY, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('FAIL', margin + colW * 2.5, boxY + 6, { align: 'center' });

  // Overall grade
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...gradeColor(inspection.overallGrade));
  doc.text(gradeLabel(inspection.overallGrade), margin + colW * 3.5, boxY + 2, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.muted);
  doc.text('OVERALL', margin + colW * 3.5, boxY + 6, { align: 'center' });

  y += 30;

  // Sections
  for (const section of inspection.sections) {
    const sectionDef = SECTION_DEFS.find((d) => d.key === section.sectionKey);
    const sectionLabel = sectionDef?.label || section.sectionKey.replace(/_/g, ' ').toUpperCase();

    checkPageBreak(20 + section.items.length * 12);

    // Section header
    doc.setFillColor(...COLORS.primary);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(sectionLabel, margin + 4, y + 5.5);
    y += 12;

    // Items
    for (const item of section.items) {
      checkPageBreak(16);

      // Grade indicator
      doc.setFillColor(...gradeColor(item.grade));
      doc.circle(margin + 3, y + 1.5, 2, 'F');

      // Item label
      doc.setTextColor(...COLORS.primary);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, margin + 8, y + 3);

      // Grade text
      doc.setTextColor(...gradeColor(item.grade));
      doc.setFontSize(8);
      doc.text(gradeLabel(item.grade), pageWidth - margin, y + 3, { align: 'right' });

      y += 6;

      // Notes
      if (item.notes) {
        doc.setTextColor(...COLORS.muted);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const noteLines = doc.splitTextToSize(item.notes, contentWidth - 10);
        checkPageBreak(noteLines.length * 4 + 2);
        doc.text(noteLines, margin + 8, y + 2);
        y += noteLines.length * 4 + 2;
      }

      y += 3;
    }

    y += 5;
  }

  // Repair cost summary (if Private Purchase)
  if (inspection.type === 'private_purchase' && inspection.aiRepairSummary) {
    checkPageBreak(60);

    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, y, contentWidth, 50, 3, 3, 'F');

    doc.setTextColor(...COLORS.accent);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('REPAIR COST ESTIMATE', margin + 6, y + 10);

    doc.setTextColor(...COLORS.white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    let repairY = y + 18;
    for (const est of inspection.aiRepairSummary.estimates) {
      doc.text(est.itemLabel, margin + 6, repairY);
      doc.text(
        `\u00A3${est.estimatedCostLow} \u2013 \u00A3${est.estimatedCostHigh}`,
        pageWidth - margin - 6,
        repairY,
        { align: 'right' },
      );
      repairY += 5;
    }

    repairY += 3;
    doc.setDrawColor(...COLORS.accent);
    doc.line(margin + 6, repairY, pageWidth - margin - 6, repairY);
    repairY += 6;

    doc.setTextColor(...COLORS.accent);
    doc.setFontSize(9);
    doc.text('Revised Offer Price', margin + 6, repairY);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `\u00A3${inspection.aiRepairSummary.revisedOfferPrice.toLocaleString()}`,
      pageWidth - margin - 6,
      repairY,
      { align: 'right' },
    );

    y += 58;
  }

  // Footer
  checkPageBreak(15);
  y += 5;
  doc.setDrawColor(...COLORS.border);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Auto Inspect Pro | Really Easy Car Credit', margin, y);
  doc.text(`Report ID: ${inspection.id.slice(0, 8)}`, pageWidth - margin, y, { align: 'right' });

  return doc;
}
