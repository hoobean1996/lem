/**
 * PDF Export Utility
 *
 * Exports notebook content (markdown + code) to PDF.
 * Focuses on textbook content, not execution output.
 */

import jsPDF from 'jspdf';
import type { Notebook } from '../types';
import { isMarkdownCell, isCodeCell } from './cellHelpers';

// PDF styling constants
const MARGIN = 20;
const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const LINE_HEIGHT = 6;
const CODE_LINE_HEIGHT = 5;

interface PDFState {
  pdf: jsPDF;
  y: number;
}

function addPage(state: PDFState): void {
  state.pdf.addPage();
  state.y = MARGIN;
}

function checkPageBreak(state: PDFState, neededHeight: number): void {
  if (state.y + neededHeight > PAGE_HEIGHT - MARGIN) {
    addPage(state);
  }
}

function renderMarkdown(state: PDFState, content: string): void {
  const lines = content.split('\n');

  for (const line of lines) {
    // Heading 1
    if (line.startsWith('# ')) {
      checkPageBreak(state, 12);
      state.pdf.setFontSize(18);
      state.pdf.setFont('helvetica', 'bold');
      state.pdf.text(line.substring(2), MARGIN, state.y);
      state.y += 10;
      // Add underline
      state.pdf.setDrawColor(200);
      state.pdf.line(MARGIN, state.y - 2, PAGE_WIDTH - MARGIN, state.y - 2);
      state.y += 4;
    }
    // Heading 2
    else if (line.startsWith('## ')) {
      checkPageBreak(state, 10);
      state.pdf.setFontSize(14);
      state.pdf.setFont('helvetica', 'bold');
      state.pdf.text(line.substring(3), MARGIN, state.y);
      state.y += 8;
    }
    // Heading 3
    else if (line.startsWith('### ')) {
      checkPageBreak(state, 8);
      state.pdf.setFontSize(12);
      state.pdf.setFont('helvetica', 'bold');
      state.pdf.text(line.substring(4), MARGIN, state.y);
      state.y += 7;
    }
    // Bold text (simple inline)
    else if (line.includes('**')) {
      checkPageBreak(state, LINE_HEIGHT);
      state.pdf.setFontSize(10);
      state.pdf.setFont('helvetica', 'normal');
      // Simple: just remove ** markers for PDF
      const cleanLine = line.replace(/\*\*/g, '');
      const wrappedLines = state.pdf.splitTextToSize(cleanLine, CONTENT_WIDTH);
      state.pdf.text(wrappedLines, MARGIN, state.y);
      state.y += wrappedLines.length * LINE_HEIGHT;
    }
    // Bullet list
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      checkPageBreak(state, LINE_HEIGHT);
      state.pdf.setFontSize(10);
      state.pdf.setFont('helvetica', 'normal');
      const bulletText = '• ' + line.substring(2);
      const wrappedLines = state.pdf.splitTextToSize(bulletText, CONTENT_WIDTH - 5);
      state.pdf.text(wrappedLines, MARGIN + 5, state.y);
      state.y += wrappedLines.length * LINE_HEIGHT;
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      checkPageBreak(state, LINE_HEIGHT);
      state.pdf.setFontSize(10);
      state.pdf.setFont('helvetica', 'normal');
      const wrappedLines = state.pdf.splitTextToSize(line, CONTENT_WIDTH - 5);
      state.pdf.text(wrappedLines, MARGIN + 5, state.y);
      state.y += wrappedLines.length * LINE_HEIGHT;
    }
    // Empty line
    else if (line.trim() === '') {
      state.y += 3;
    }
    // Regular paragraph
    else {
      checkPageBreak(state, LINE_HEIGHT);
      state.pdf.setFontSize(10);
      state.pdf.setFont('helvetica', 'normal');
      const wrappedLines = state.pdf.splitTextToSize(line, CONTENT_WIDTH);
      state.pdf.text(wrappedLines, MARGIN, state.y);
      state.y += wrappedLines.length * LINE_HEIGHT;
    }
  }

  state.y += 4; // Space after markdown block
}

function renderCode(state: PDFState, content: string): void {
  const lines = content.split('\n');
  const codeBlockHeight = lines.length * CODE_LINE_HEIGHT + 10;

  checkPageBreak(state, Math.min(codeBlockHeight, 60)); // At least show some code

  // Draw code block background
  const blockStartY = state.y;

  // Set monospace font for code
  state.pdf.setFontSize(9);
  state.pdf.setFont('courier', 'normal');

  // Render each line
  for (let i = 0; i < lines.length; i++) {
    checkPageBreak(state, CODE_LINE_HEIGHT);

    // Draw background for this line (light gray)
    state.pdf.setFillColor(245, 245, 245);
    state.pdf.rect(MARGIN, state.y - 4, CONTENT_WIDTH, CODE_LINE_HEIGHT, 'F');

    // Line number
    state.pdf.setTextColor(150);
    const lineNum = String(i + 1).padStart(2, ' ');
    state.pdf.text(lineNum, MARGIN + 2, state.y);

    // Code content
    state.pdf.setTextColor(50);
    const codeLine = lines[i] || ' ';
    // Truncate long lines
    const maxChars = 80;
    const displayLine =
      codeLine.length > maxChars ? codeLine.substring(0, maxChars) + '...' : codeLine;
    state.pdf.text(displayLine, MARGIN + 12, state.y);

    state.y += CODE_LINE_HEIGHT;
  }

  // Draw border around code block
  state.pdf.setDrawColor(200);
  state.pdf.rect(MARGIN, blockStartY - 4, CONTENT_WIDTH, state.y - blockStartY + 2);

  state.pdf.setTextColor(0); // Reset text color
  state.y += 6; // Space after code block
}

export async function exportNotebookToPDF(notebook: Notebook): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const state: PDFState = { pdf, y: MARGIN };

  // Title page
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(notebook.metadata.title, MARGIN, state.y + 20);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100);
  pdf.text(`Author: ${notebook.metadata.author}`, MARGIN, state.y + 35);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, MARGIN, state.y + 42);

  pdf.setDrawColor(200);
  pdf.line(MARGIN, state.y + 50, PAGE_WIDTH - MARGIN, state.y + 50);

  pdf.setTextColor(0);
  state.y = state.y + 60;

  // Render each cell
  for (const cell of notebook.cells) {
    if (isMarkdownCell(cell)) {
      renderMarkdown(state, cell.content);
    } else if (isCodeCell(cell)) {
      renderCode(state, cell.content);
    }
  }

  // Add page numbers
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(150);
    pdf.text(`Page ${i} of ${totalPages}`, PAGE_WIDTH - MARGIN - 20, PAGE_HEIGHT - 10);
  }

  return pdf.output('blob');
}

export async function downloadNotebookPDF(notebook: Notebook): Promise<void> {
  const blob = await exportNotebookToPDF(notebook);

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${notebook.metadata.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
