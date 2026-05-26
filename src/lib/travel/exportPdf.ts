import { jsPDF } from 'jspdf';
import type { ChecklistItem, TimelineItem, TravelPlanResult } from '@/lib/travel/planEngine';

export interface TravelPackMeta {
  petName: string;
  fromLabel: string;
  toLabel: string;
  travelDate: string | null;
  generatedAt: string;
}

export function downloadTravelPackPdf(
  meta: TravelPackMeta,
  plan: TravelPlanResult
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 14;
  let y = margin;
  const pageW = doc.internal.pageSize.getWidth();
  const maxW = pageW - margin * 2;

  function lineGap(n = 6) {
    y += n;
    if (y > 280) {
      doc.addPage();
      y = margin;
    }
  }

  function heading(text: string, size = 14) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size);
    doc.setTextColor(15, 110, 86);
    doc.text(text, margin, y);
    lineGap(size === 14 ? 8 : 6);
  }

  function body(text: string, size = 10) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(text, maxW);
    doc.text(lines, margin, y);
    lineGap(4 + lines.length * 4);
  }

  // Header
  doc.setFillColor(15, 110, 86);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('VuraPet Travel Pack', margin, 12);
  doc.setFontSize(10);
  doc.text(`${meta.petName} · ${meta.fromLabel} → ${meta.toLabel}`, margin, 20);
  y = 36;

  if (meta.travelDate) {
    body(`Travel date: ${meta.travelDate}`);
  }
  body(`Readiness score: ${plan.readinessScore}%`);
  body(`Generated: ${meta.generatedAt}`);
  lineGap(4);

  heading('Disclaimer');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  body(
    'This document is for planning only — not legal or veterinary advice. Requirements change frequently. Always verify with official government sources and your airline before travel.'
  );
  lineGap(6);

  if (plan.gaps.length > 0) {
    heading('Action required');
    plan.gaps.forEach(g => {
      body(`• ${g.message}`);
    });
    lineGap(4);
  }

  heading('Checklist');
  plan.checklist.forEach(item => {
    const mark = item.status === 'done' ? '[x]' : '[ ]';
    body(`${mark} ${item.title}${item.dueDate ? ` (by ${item.dueDate})` : ''}`);
    if (item.detail) {
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      body(`   ${item.detail}`, 8);
    }
  });

  lineGap(6);
  heading('Timeline');
  plan.timeline.forEach(item => {
    body(`${item.label}: ${item.text}`);
  });

  if (plan.destRule.commonMistake) {
    lineGap(4);
    heading('Common mistake');
    body(plan.destRule.commonMistake);
  }

  const filename = `vurapet-travel-${meta.petName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(filename);
}
