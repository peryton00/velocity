/**
 * INVOICE PDF GENERATOR - MASTERPIECE EDITION (BUG-FIXED)
 * A pixel-perfect replica of the reference PDF with precise alignment,
 * weighted borders, and robust text handling to prevent overflows.
 */

export async function generateInvoicePDF(invoiceData, companySettings = {}) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const PW = 210;
  const margin = 8;
  const fullW = PW - (margin * 2);

  // --- STYLES ---
  const black = [0, 0, 0];
  
  doc.setFont('helvetica', 'normal');
  doc.setLineWidth(0.4); 
  doc.setDrawColor(...black);

  let y = margin;

  // --- TOP BAR ---
  doc.rect(margin, y, fullW, 7);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', PW / 2, y + 5, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Original for Recipient', PW - margin - 2, y + 4.5, { align: 'right' });
  y += 7;

  // --- HEADER SECTION ---
  doc.setLineWidth(0.1);
  doc.rect(margin, y, fullW, 42);
  doc.setLineWidth(0.4);
  doc.line(PW / 2, y, PW / 2, y + 42); 

  // Left: Company Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(companySettings.name || 'VELOCITY CYCLES INDIA PVT. LTD.', margin + 3, y + 6); // Added padding
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const addr = companySettings.address || '';
  const addrLines = doc.splitTextToSize(addr, (PW / 2) - margin - 8); // More padding
  doc.text(addrLines, margin + 3, y + 10.5);
  
  let curY = y + 10.5 + (addrLines.length * 3.5);
  const drawLine = (label, value) => {
    if (curY > y + 40) return; // Prevent overflow of the box
    doc.setFont('helvetica', 'bold');
    doc.text(label + ' :', margin + 3, curY);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value || 'N/A'), margin + 25, curY);
    curY += 3.5;
  };
  drawLine('GSTIN', companySettings.gstin);
  drawLine('State', companySettings.state || 'Gujarat (24)');
  drawLine('PAN', companySettings.pan);
  drawLine('Bank Name', companySettings.bank_name);
  drawLine('A/c No', companySettings.account_no);
  drawLine('IFSC Code', companySettings.ifsc);

  // Right: Invoice Details (Fixed Alignment)
  const col2X = PW / 2 + 3;
  const colonX = col2X + 30; // Shifted left to avoid right-border overflow
  const valueX = colonX + 2;
  doc.setFontSize(8);
  const drawRightDetail = (label, value, ry) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, col2X, ry);
    doc.text(':', colonX, ry);
    doc.setFont('helvetica', 'normal');
    // Ensure value doesn't hit right border
    const valText = String(value || '');
    const maxValW = PW - margin - valueX - 2;
    const truncated = doc.splitTextToSize(valText, maxValW)[0];
    doc.text(truncated, valueX, ry);
  };

  drawRightDetail('Invoice No.', invoiceData.invoice_no, y + 6);
  drawRightDetail('Invoice Date', formatDate(invoiceData.invoice_date), y + 11);
  drawRightDetail('Packing List No.', invoiceData.packing_no, y + 16);
  drawRightDetail('Sale Type', invoiceData.sale_type, y + 21);
  drawRightDetail('Customer PO No.', invoiceData.po_no, y + 26);
  drawRightDetail('Customer PO Date', formatDate(invoiceData.po_date), y + 31);
  drawRightDetail('State', companySettings.state || 'Gujarat (24)', y + 36);

  y += 42;

  // --- PARTIES SECTION ---
  doc.setLineWidth(0.4);
  doc.rect(margin, y, fullW, 32);
  doc.line(PW / 2, y, PW / 2, y + 32);
  doc.setLineWidth(0.1);
  doc.line(margin, y + 6, PW - margin, y + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DETAILS OF RECEIVER / BILL TO', margin + 3, y + 4);
  doc.text('DETAILS OF CONSIGNEE / SHIP TO', col2X, y + 4);

  const cust = invoiceData.customer || {};
  doc.setFontSize(8.5);
  doc.text(cust.company_name || cust.name || '', margin + 3, y + 10);
  doc.text(cust.company_name || cust.name || '', col2X, y + 10);
  
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const bAddr = doc.splitTextToSize(cust.billing_address || '', (PW / 2) - margin - 8);
  doc.text(bAddr, margin + 3, y + 14);
  const sAddr = doc.splitTextToSize(cust.shipping_address || cust.billing_address || '', (PW / 2) - margin - 8);
  doc.text(sAddr, col2X, y + 14);

  // Added Phone & Email
  doc.setFontSize(7);
  if (cust.phone) doc.text(`Tel: ${cust.phone}`, margin + 3, y + 25);
  if (cust.email) doc.text(`Email: ${cust.email}`, margin + 3, y + 28);

  doc.setFont('helvetica', 'bold');
  doc.text(`GSTIN : ${cust.gstin || 'N/A'}`, margin + 3, y + 31);
  doc.text(`GSTIN : ${cust.gstin || 'N/A'}`, col2X, y + 31);

  y += 35; // Increased box height slightly

  // --- WATERMARK ---
  doc.saveGraphicsState();
  doc.setFontSize(14);
  doc.setTextColor(230, 230, 230);
  doc.setFont('helvetica', 'bold');
  doc.text('Do Not Dispatch', PW / 2, y - 20, { angle: 90, align: 'center' });
  doc.restoreGraphicsState();

  // --- PRODUCTS TABLE ---
  const items = invoiceData.items || [];
  const totalQty = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0), 0);
  
  const tableBody = items.map((item, idx) => [
    idx + 1,
    item.sku || '',
    item.hsn_code || '',
    item.name,
    item.brand || '',
    item.quantity,
    item.unit || 'Nos',
    `${item.gst_rate}%`,
    `${fmtNum(item.unit_price)}`,
    `${fmtNum(item.total_amount)}`
  ]);

  doc.autoTable({
    startY: y,
    head: [['S.NO', 'SKU NO', 'HSN CODE', 'DESCRIPTION OF GOODS', 'BRAND', 'QTY', 'UOM', 'GST%', 'RATE', 'TAXABLE']],
    body: tableBody,
    foot: [['', '', '', 'Total', '', totalQty, '', '', '', '']], // Added Total Qty row
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontSize: 6.5,
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      halign: 'center',
      valign: 'middle'
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 7,
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 18 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 50 },
      4: { cellWidth: 15 },
      5: { cellWidth: 10, halign: 'center' },
      6: { cellWidth: 12, halign: 'center' },
      7: { cellWidth: 10, halign: 'center' },
      8: { cellWidth: 20, halign: 'right' },
      9: { cellWidth: 25, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY;

  // --- TOTALS AREA ---
  const totalsW = 75;
  const totalsX = PW - margin - totalsW;
  const startY = y;
  
  const drawTotalRow = (label, value, isBold = false) => {
    doc.setLineWidth(0.1);
    doc.rect(totalsX, y, totalsW, 6);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.text(label, totalsX + 2, y + 4.5);
    doc.text(value, PW - margin - 2, y + 4.5, { align: 'right' });
    y += 6;
  };

  const taxableTotal = items.reduce((s, i) => s + (i.quantity * i.unit_price), 0);
  drawTotalRow('Total Value Before Tax', `INR ${fmtNum(taxableTotal)}`);
  
  if (invoiceData.gst_type === 'inter') {
    drawTotalRow('Integrated Tax (IGST)', `INR ${fmtNum(invoiceData.igst_amount)}`);
  } else {
    drawTotalRow('Central Tax (CGST)', `INR ${fmtNum(invoiceData.cgst_amount)}`);
    drawTotalRow('State Tax (SGST)', `INR ${fmtNum(invoiceData.sgst_amount)}`);
  }
  
  drawTotalRow('Round Off', `INR ${fmtNum(invoiceData.round_off)}`);
  doc.setLineWidth(0.4);
  drawTotalRow('Total Invoice Value', `INR ${fmtNum(invoiceData.total)}`, true);

  // --- WORDS BOX ---
  const endY = y;
  const boxH = endY - startY;
  doc.setLineWidth(0.4);
  doc.rect(margin, startY, totalsX - margin, boxH);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Invoice Value (In words) :', margin + 3, startY + 5);
  doc.setFont('helvetica', 'normal');
  const words = 'INR ' + numberToWords(Math.round(invoiceData.total)) + ' Only';
  const wordsLines = doc.splitTextToSize(words, totalsX - margin - 8);
  doc.text(wordsLines, margin + 3, startY + 10);

  y += 2;

  // --- CD SLABS BOX (FIXED OVERFLOW) ---
  doc.setLineWidth(0.4);
  doc.rect(margin, y, fullW, 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Please pay below amount under cash discount (CD) scheme as per company policy :', margin + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  // Split into two lines or two columns properly
  doc.text(`Slab 1 (1.5% CD) - If payment made on delivery: INR ${fmtNum(invoiceData.total * 0.985)}`, margin + 3, y + 10);
  doc.text(`Slab 2 (0.75% CD) - If payment made within 30 days: INR ${fmtNum(invoiceData.total * 0.9925)}`, PW / 2 + 5, y + 10);
  y += 14;

  // --- DECLARATION & SIGNATURE ---
  doc.setLineWidth(0.4);
  doc.rect(margin, y, fullW, 28);
  const sigBorderX = PW - margin - 65;
  doc.line(sigBorderX, y, sigBorderX, y + 28); 

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Declaration:', margin + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  const decText = 'Certified that the particulars given above are true and correct and the amount indicated represents the price actually charged and there is no flow of additional consideration directly or indirectly from the buyer. Interest @ 18% will be charged on the all accounts unpaid within due date. Subject to Ahmedabad Jurisdication.';
  const decLines = doc.splitTextToSize(decText, sigBorderX - margin - 6);
  doc.text(decLines, margin + 3, y + 9);

  // Signature Area
  const sigCenterX = sigBorderX + (65 / 2);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('For ' + (companySettings.name || 'VELOCITY CYCLES INDIA PVT. LTD.'), sigCenterX, y + 5, { align: 'center' });
  
  doc.setLineWidth(0.1);
  doc.line(sigCenterX - 25, y + 21, sigCenterX + 25, y + 21);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorised Signatory', sigCenterX, y + 25, { align: 'center' });

  // --- FOOTER INFO ---
  doc.setFontSize(6.5);
  doc.setTextColor(100);
  doc.text('This is a computer generated invoice.', PW / 2, 292, { align: 'center' });
  
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, PW - margin, 292, { align: 'right' });
  }

  // --- SAVE ---
  doc.save(`Invoice_${invoiceData.invoice_no || 'DRAFT'}.pdf`);
  return doc;
}

// --- HELPERS ---
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function numberToWords(n) {
  if (n === 0) return 'Zero';
  const ones = ['', 'One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
                 'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen',
                 'Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

  function convert(num) {
    if (num < 20)  return ones[num];
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' ' + ones[num%10] : '');
    if (num < 1000) return ones[Math.floor(num/100)] + ' Hundred' + (num%100 ? ' ' + convert(num%100) : '');
    if (num < 100000) return convert(Math.floor(num/1000)) + ' Thousand' + (num%1000 ? ' ' + convert(num%1000) : '');
    if (num < 10000000) return convert(Math.floor(num/100000)) + ' Lakh' + (num%100000 ? ' ' + convert(num%100000) : '');
    return convert(Math.floor(num/10000000)) + ' Crore' + (num%10000000 ? ' ' + convert(num%10000000) : '');
  }

  return convert(Math.abs(n));
}
