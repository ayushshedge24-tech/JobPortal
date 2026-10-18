/**
 * High-Fidelity Print & PDF Stylesheet for Standard A4 Vector Output
 * Handles A4 physical dimensions, color accuracy, and intelligent page-break avoidance.
 */

export const getResumePrintStyles = () => `
@page {
  size: 210mm 297mm;
  margin: 12mm 14mm 12mm 14mm;
}

@media print {
  /* Reset page layout */
  html, body {
    width: 210mm !important;
    min-height: 297mm !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    color: #0f172a !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    font-size: 10pt;
  }

  /* Hide interactive application UI */
  .builder-header,
  .editor-panel,
  .section-navigator,
  .mobile-builder-switcher,
  .preview-panel > div:first-child,
  .navbar,
  .footer,
  button,
  .no-print {
    display: none !important;
  }

  /* Reset preview wrapper positioning and zoom */
  .resume-builder-page,
  .builder-workspace,
  .builder-grid-container,
  .builder-col-preview,
  .preview-panel {
    display: block !important;
    height: auto !important;
    width: 100% !important;
    overflow: visible !important;
    position: static !important;
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .resume-preview-scale-wrapper {
    transform: none !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
    width: 100% !important;
  }

  /* A4 canvas reset */
  .resume-a4-sheet {
    box-shadow: none !important;
    border-radius: 0 !important;
    width: 100% !important;
    min-height: auto !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #ffffff !important;
  }

  /* Intelligent Page Break Rules */
  header,
  section,
  .resume-print-section,
  .resume-print-item {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  h1, h2, h3, h4 {
    break-after: avoid !important;
    page-break-after: avoid !important;
  }

  p, li {
    orphans: 3;
    widows: 3;
  }

  /* Clickable link preservation */
  a {
    text-decoration: none !important;
    color: inherit !important;
  }
}
`;

export default getResumePrintStyles;
