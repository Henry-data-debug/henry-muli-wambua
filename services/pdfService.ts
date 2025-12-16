import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, Transaction } from '../types';

export const generatePDF = (products: Product[], transactions: Transaction[], aiReport: string | null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // -- Header --
  doc.setFillColor(30, 41, 59); // Slate 900
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text("StockFlow AI", 14, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text("Inventory & Operations Report", 14, 30);
  
  doc.setFontSize(10);
  const dateStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
  doc.text(dateStr, pageWidth - 14, 30, { align: 'right' });

  let currentY = 50;

  // -- Key Metrics --
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStock = products.filter(p => p.quantity <= p.minLevel).length;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("Executive Summary", 14, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Asset Value: $${totalValue.toLocaleString()}`, 14, currentY);
  doc.text(`Total Stock Count: ${totalItems} units`, 80, currentY);
  doc.setTextColor(lowStock > 0 ? 220 : 0, 0, 0);
  doc.text(`Low Stock Alerts: ${lowStock}`, 150, currentY);
  
  currentY += 15;

  // -- AI Report Section --
  if (aiReport) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("AI Analysis", 14, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Clean markdown symbols for PDF readability
    const cleanText = aiReport
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/#/g, '')    // Remove headers
      .replace(/\n\n/g, '\n'); // Reduce spacing
    
    const splitText = doc.splitTextToSize(cleanText, pageWidth - 28);
    doc.text(splitText, 14, currentY);
    
    currentY += (splitText.length * 5) + 15;
  }

  // -- Inventory Table --
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("Current Inventory Status", 14, currentY);
  currentY += 5;

  const tableData = products.map(p => [
    p.name,
    p.category,
    p.sku,
    p.quantity,
    `$${p.price.toFixed(2)}`,
    `$${(p.price * p.quantity).toFixed(2)}`,
    p.quantity <= p.minLevel ? 'LOW' : 'OK'
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Item Name', 'Category', 'SKU', 'Qty', 'Unit Price', 'Total Value', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] }, // Blue 500
    styles: { fontSize: 8 },
    didParseCell: (data) => {
      // Color code the Status column
      if (data.section === 'body' && data.column.index === 6) {
        if (data.cell.raw === 'LOW') {
          data.cell.styles.textColor = [220, 38, 38]; // Red
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [22, 163, 74]; // Green
        }
      }
    }
  });

  // -- Recent Transactions --
  // Check if we need a new page for transactions
  let finalY = (doc as any).lastAutoTable.finalY + 15;
  if (finalY > 250) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Recent Activity Log", 14, finalY);
  
  const txnData = transactions.slice(0, 50).map(t => [ // Limit to last 50 for PDF brevity
    new Date(t.date).toLocaleDateString(),
    t.productName,
    t.type,
    t.type === 'IN' ? `+${t.quantity}` : `-${t.quantity}`,
    t.notes || '-'
  ]);

  autoTable(doc, {
    startY: finalY + 5,
    head: [['Date', 'Item', 'Action', 'Change', 'Notes']],
    body: txnData,
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105] }, // Slate 600
    styles: { fontSize: 8 }
  });

  // Save File
  doc.save(`StockFlow_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
