/**
 * INVOICE PDF GENERATOR
 * Alpha Vector Inventory Management System
 * Generates professional invoices matching Alpha Vector template
 */

// jsPDF loaded via CDN - accessed from window.jspdf
// jsPDF-AutoTable extends jsPDF automatically

export async function generateInvoicePDF(invoiceData, companySettings = {}) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const PW = 210;  // Page width
  const pageH = 297;

  // ── COLORS ──
  const darkGreen  = [0,   89,  0  ];
  const firGreen   = [5,   145, 0  ];
  const frostGreen = [168, 192, 132];
  const kiwiGreen  = [240, 245, 146];
  const black      = [0,   0,   0  ];
  const white      = [255, 255, 255];
  const lightGray  = [245, 245, 245];

  const company = {
    name:    companySettings.name    || 'Alphavector India Pvt. Ltd.',
    address: companySettings.address || '101-108, 10th Floor, City Center, Ahmedabad - 380009',
    state:   companySettings.state   || 'Gujarat (24)',
    gstin:   companySettings.gstin   || '24AADCA2897D2ZT',
    pan:     companySettings.pan     || 'AADCA2897D',
    phone:   companySettings.phone   || '+91 79 2630 0000',
    email:   companySettings.email   || 'billing@alphavector.in',
    bank:    companySettings.bank    || 'HDFC Bank Limited',
    account: companySettings.account || '57500000881890',
    ifsc:    companySettings.ifsc    || 'HDFC0000291',
    branch:  companySettings.branch  || 'Ahmedabad Main Branch'
  };

  let y = 10;

  // ── HEADER BACKGROUND BAND ──
  doc.setFillColor(...darkGreen);
  doc.rect(0, 0, PW, 38, 'F');

  // Company Name
  doc.setTextColor(...white);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, 12, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(company.address, 12, 21);
  doc.text(`GSTIN: ${company.gstin}  |  PAN: ${company.pan}`, 12, 26);
  doc.text(`Ph: ${company.phone}  |  ${company.email}`, 12, 31);

  // TAX INVOICE label (right side)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...kiwiGreen);
  doc.text('TAX INVOICE', PW - 12, 15, { align: 'right' });

  // IRN placeholder
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 230, 200);
  const irn = invoiceData.irn || 'IRN: 3a1f0000-xxxx-xxxx-xxxx-xxxxxxxx0000';
  doc.text(irn, PW - 12, 21, { align: 'right' });
  doc.text('e-Invoice generated', PW - 12, 25, { align: 'right' });

  y = 45;

  // ── INVOICE DETAILS BOX ──
  doc.setFillColor(...lightGray);
  doc.roundedRect(12, y - 5, PW - 24, 22, 2, 2, 'F');

  doc.setTextColor(...darkGreen);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice No: ${invoiceData.invoice_no || 'INV-' + new Date().getFullYear() + '01-0001'}`, 16, y + 2);
  doc.text(`Date: ${formatDate(invoiceData.invoice_date)}`, 16, y + 8);
  doc.text(`Due Date: ${formatDate(invoiceData.due_date)}`, 16, y + 14);

  doc.text(`Payment Terms: ${invoiceData.payment_term || 'Net 30'}`, 110, y + 2);
  doc.text(`Place of Supply: ${invoiceData.place_of_supply || company.state}`, 110, y + 8);

  y += 26;

  // ── BILL TO / SHIP TO ──
  const colW = (PW - 24) / 2 - 4;

  // Bill To box
  doc.setFillColor(...frostGreen);
  doc.rect(12, y, colW, 6, 'F');
  doc.setTextColor(...darkGreen);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO PARTY', 16, y + 4.5);

  doc.setFillColor(252, 252, 252);
  doc.rect(12, y + 6, colW, 28, 'F');
  doc.setDrawColor(...frostGreen);
  doc.rect(12, y, colW, 34, 'S');

  const cust = invoiceData.customer || {};
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...black);
  doc.text(cust.name || 'Customer Name', 16, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const billAddr = cust.billing_address || 'Address Line 1, City - 000000';
  const billLines = doc.splitTextToSize(billAddr, colW - 6);
  doc.text(billLines.slice(0, 2), 16, y + 19);
  doc.text(`GSTIN: ${cust.gstin || 'N/A'}`, 16, y + 30);

  // Ship To box
  const sx = 12 + colW + 8;
  doc.setFillColor(...frostGreen);
  doc.rect(sx, y, colW, 6, 'F');
  doc.setTextColor(...darkGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SHIP TO PARTY', sx + 4, y + 4.5);

  doc.setFillColor(252, 252, 252);
  doc.rect(sx, y + 6, colW, 28, 'F');
  doc.setDrawColor(...frostGreen);
  doc.rect(sx, y, colW, 34, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...black);
  doc.text(cust.name || 'Customer Name', sx + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const shipAddr = cust.shipping_address || cust.billing_address || 'Address Line 1, City - 000000';
  const shipLines = doc.splitTextToSize(shipAddr, colW - 6);
  doc.text(shipLines.slice(0, 2), sx + 4, y + 19);
  doc.text(`GSTIN: ${cust.gstin || 'N/A'}`, sx + 4, y + 30);

  y += 40;

  // ── PRODUCTS TABLE ──
  const items = invoiceData.items || [];

  const tableBody = items.map((item, idx) => [
    idx + 1,
    item.sku || '',
    item.name,
    item.hsn_code || '',
    item.unit || 'Nos',
    item.quantity,
    `₹${fmtNum(item.unit_price)}`,
    `${item.gst_rate || 0}%`,
    `₹${fmtNum(item.discount || 0)}`,
    `₹${fmtNum(item.total_amount || (item.quantity * item.unit_price))}`
  ]);

  doc.autoTable({
    startY: y,
    head: [['#', 'SKU', 'Description', 'HSN', 'Unit', 'Qty', 'Rate', 'GST%', 'Disc', 'Amount']],
    body: tableBody,
    theme: 'plain',
    headStyles: {
      fillColor: firGreen,
      textColor: white,
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 3.5,
      textColor: black
    },
    alternateRowStyles: {
      fillColor: kiwiGreen
    },
    columnStyles: {
      0:  { cellWidth: 8,  halign: 'center' },
      1:  { cellWidth: 18 },
      2:  { cellWidth: 42 },
      3:  { cellWidth: 16 },
      4:  { cellWidth: 12, halign: 'center' },
      5:  { cellWidth: 12, halign: 'right' },
      6:  { cellWidth: 20, halign: 'right' },
      7:  { cellWidth: 12, halign: 'center' },
      8:  { cellWidth: 18, halign: 'right' },
      9:  { cellWidth: 22, halign: 'right' }
    },
    margin: { left: 12, right: 12 },
    tableLineColor: frostGreen,
    tableLineWidth: 0.3,
    didDrawPage: (data) => {
      // re-draw header on new pages
    }
  });

  y = doc.lastAutoTable.finalY + 6;

  // ── TOTALS SECTION ──
  const totalsX = 120;
  const totalsW = PW - 24 - (totalsX - 12);

  // GST breakdown
  const cgst  = invoiceData.cgst_amount  || 0;
  const sgst  = invoiceData.sgst_amount  || 0;
  const igst  = invoiceData.igst_amount  || invoiceData.gst_amount || 0;
  const isIGST = igst > 0 && cgst === 0;

  doc.setFontSize(8);
  const rows = [
    ['Subtotal', `₹${fmtNum(invoiceData.subtotal)}`],
    ['Discount', `-₹${fmtNum(invoiceData.discount || 0)}`],
  ];
  if (isIGST) {
    rows.push([`IGST (${invoiceData.gst_rate || ''}%)`, `₹${fmtNum(igst)}`]);
  } else {
    if (cgst) rows.push([`CGST`, `₹${fmtNum(cgst)}`]);
    if (sgst) rows.push([`SGST`, `₹${fmtNum(sgst)}`]);
  }
  rows.push(['Round Off', `₹${fmtNum(invoiceData.round_off || 0)}`]);

  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkGreen);
    doc.text(label, totalsX + 2, y);
    doc.setTextColor(...black);
    doc.text(value, PW - 14, y, { align: 'right' });
    y += 5.5;
  });

  // Total row
  doc.setFillColor(...firGreen);
  doc.rect(totalsX, y, PW - 24 - (totalsX - 12), 9, 'F');
  doc.setTextColor(...white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL', totalsX + 4, y + 6);
  doc.text(`₹${fmtNum(invoiceData.total)}`, PW - 14, y + 6, { align: 'right' });

  y += 14;

  // Amount in words
  doc.setTextColor(...darkGreen);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  const amtWords = numberToWords(Math.round(invoiceData.total || 0));
  doc.text(`Amount in words: ${amtWords} Only`, 12, y);

  y += 8;

  // ── CASH DISCOUNT SLABS ──
  doc.setFillColor(252, 252, 220);
  doc.rect(12, y, PW - 24, 14, 'F');
  doc.setDrawColor(...kiwiGreen);
  doc.rect(12, y, PW - 24, 14, 'S');

  doc.setTextColor(100, 100, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Cash Discount Schemes:', 16, y + 5);
  doc.setFont('helvetica', 'normal');

  const base = invoiceData.total || 0;
  const slab1 = (base * 0.985).toFixed(2);
  const slab2 = (base * 0.9925).toFixed(2);
  doc.text(`Slab 1 (1.5% CD): Pay ₹${fmtNum(parseFloat(slab1))} on delivery`, 16, y + 10);
  doc.text(`Slab 2 (0.75% CD): Pay ₹${fmtNum(parseFloat(slab2))} within 30 days`, 100, y + 10);

  y += 20;

  // ── BANK DETAILS + SIGNATURE ──
  const bankW = 100;

  doc.setFillColor(...frostGreen);
  doc.rect(12, y, bankW, 6, 'F');
  doc.setTextColor(...darkGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BANK DETAILS', 16, y + 4.5);

  doc.setFillColor(248, 252, 244);
  doc.rect(12, y + 6, bankW, 20, 'F');
  doc.setDrawColor(...frostGreen);
  doc.rect(12, y, bankW, 26, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...black);
  doc.setFontSize(8);
  doc.text(`Bank: ${company.bank}`, 16, y + 12);
  doc.text(`A/C No: ${company.account}`, 16, y + 18);
  doc.text(`IFSC: ${company.ifsc}`, 16, y + 24);

  // Signature area
  const sigX = 12 + bankW + 8;
  const sigW = PW - 24 - bankW - 8;
  doc.setDrawColor(...frostGreen);
  doc.rect(sigX, y, sigW, 26, 'S');
  doc.setTextColor(...darkGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('For ' + company.name, sigX + sigW / 2, y + 8, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(7);
  doc.text('Authorised Signatory', sigX + sigW / 2, y + 22, { align: 'center' });

  y += 32;

  // ── TERMS & CONDITIONS ──
  doc.setFillColor(245, 245, 245);
  doc.rect(12, y, PW - 24, 18, 'F');
  doc.setTextColor(...darkGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Terms & Conditions:', 16, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('1. Goods once sold will not be taken back.   2. Interest @18% p.a. will be charged on overdue payments.', 16, y + 10);
  doc.text('3. All disputes subject to Ahmedabad jurisdiction.   4. E. & O.E.', 16, y + 15);

  // ── FOOTER ──
  doc.setFillColor(...darkGreen);
  doc.rect(0, pageH - 8, PW, 8, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(6.5);
  doc.text(`${company.name}  |  ${company.gstin}  |  Generated on ${new Date().toLocaleDateString('en-IN')}`, PW / 2, pageH - 3, { align: 'center' });

  // ── SAVE ──
  doc.save(`Invoice_${invoiceData.invoice_no || 'DRAFT'}.pdf`);
  return doc;
}

// ── HELPERS ──
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function numberToWords(n) {
  if (n === 0) return 'Zero Rupees';
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

  return 'Rupees ' + convert(Math.abs(n));
}

export { fmtNum, formatDate };
