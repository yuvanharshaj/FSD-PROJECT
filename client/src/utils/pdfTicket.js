import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

// Format timestamp into clean Indian date-time format (e.g. 07 Nov 2026, 10:30 AM)
const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Generate and trigger download of an official A5 PDF parking pass
export const downloadPdfTicket = async (booking, user = null) => {
  try {
    if (!booking) {
      throw new Error('No booking details provided');
    }

    const ticketCode = booking.ticketCode || 'SPK-PASS';
    const lotName = booking.lot?.name || booking.facility || 'SmartPark Facility';
    const lotAddress = booking.lot?.address
      ? `${booking.lot.address}, ${booking.lot.city || 'Bengaluru'}`
      : booking.address || 'Bengaluru, Karnataka';
    const slotNumber = booking.slot?.slotNumber || booking.slot || 'Reserved Spot';
    const vehicleNumber = booking.vehicleNumber || 'Registered Vehicle';
    const startTimeFormatted = formatDateTime(booking.startTime);
    const endTimeFormatted = formatDateTime(booking.endTime);
    const totalAmount = booking.totalAmount || 0;
    const status = (booking.status || 'confirmed').toUpperCase();
    const bookedByName = user?.name || booking.user?.name || 'SmartPark Driver';

    // Calculate duration in hours
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const durationHours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));

    // Generate high-resolution QR data URL
    const qrPayload = JSON.stringify({
      ticketCode,
      lot: lotName,
      slot: slotNumber,
      vehicle: vehicleNumber,
      start: booking.startTime,
      end: booking.endTime
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 400,
      margin: 1,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff'
      }
    });

    // Initialize A5 portrait document (148mm wide x 210mm high)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });

    // Ensure pristine white background even if device or app is in dark mode
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 148, 210, 'F');

    // Indigo top banner accent
    doc.setFillColor(79, 70, 229); // #4F46E5
    doc.rect(0, 0, 148, 8, 'F');

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 27, 75); // Dark indigo
    doc.text('SmartPark — Parking Pass', 74, 18, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('DIGITAL ENTRY RESERVATION & VERIFICATION TICKET', 74, 23, { align: 'center' });

    // Large Centered QR Code
    const qrSize = 46;
    const qrX = (148 - qrSize) / 2;
    const qrY = 27;

    // Draw light rounded card behind QR
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(qrX - 4, qrY - 2, qrSize + 8, qrSize + 14, 3, 3, 'FD');

    // Embed QR image
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Ticket Code in bold monospace
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229);
    doc.text(ticketCode, 74, qrY + qrSize + 7, { align: 'center' });

    // Details Container Box
    const boxX = 14;
    const boxY = 93;
    const boxW = 120;
    const boxH = 92;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(boxX, boxY, boxW, boxH, 3, 3, 'D');

    // Facility Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(lotName, boxX + 5, boxY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const wrappedAddress = doc.splitTextToSize(lotAddress, boxW - 10);
    doc.text(wrappedAddress, boxX + 5, boxY + 13);

    // Separator line
    const sepY = boxY + 20;
    doc.setDrawColor(226, 232, 240);
    doc.line(boxX + 5, sepY, boxX + boxW - 5, sepY);

    // Metadata 2-column key-values
    const leftCol = boxX + 5;
    const rightCol = boxX + 62;
    let currentY = sepY + 7;

    const renderField = (label, value, isRight = false, isHighlight = false) => {
      const col = isRight ? rightCol : leftCol;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text(label.toUpperCase(), col, currentY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      if (isHighlight) {
        doc.setTextColor(79, 70, 229);
      } else {
        doc.setTextColor(30, 41, 59);
      }
      doc.text(String(value), col, currentY + 4.5);
    };

    // Row 1: Slot Number & Vehicle Number
    renderField('Reserved Slot', slotNumber, false, true);
    renderField('Vehicle Number', vehicleNumber, true);
    currentY += 12;

    // Row 2: Start Date/Time & End Date/Time
    renderField('Entry From', startTimeFormatted, false);
    renderField('Exit By', endTimeFormatted, true);
    currentY += 12;

    // Row 3: Duration & Amount Paid
    renderField('Duration', `${durationHours} Hour(s)`, false);
    renderField('Amount Paid', `Rs. ${totalAmount}`, true, true);
    currentY += 12;

    // Row 4: Status & Booked By
    renderField('Status', status, false);
    renderField('Booked By', bookedByName, true);

    // Footer Security Notice
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, 190, 120, 12, 2, 2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'Show this QR code at the entry barrier. Demo payment, no real charge.',
      74,
      197,
      { align: 'center' }
    );

    // Save PDF
    const fileName = `SmartPark-Ticket-${ticketCode}.pdf`;
    doc.save(fileName);
    toast.success('Ticket downloaded');
    return true;
  } catch (err) {
    console.error('PDF generation error:', err);
    toast.error('Failed to download ticket PDF. Please try again.');
    return false;
  }
};

