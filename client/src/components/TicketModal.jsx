import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from './Modal';
import { Printer, MapPin, Calendar, Car, CheckCircle2, Ticket, Download } from 'lucide-react';
import { downloadPdfTicket } from '../utils/pdfTicket';

// Printable QR parking ticket modal with entry pass verification code & PDF download
export default function TicketModal({ isOpen, onClose, booking, user = null }) {
  const [downloading, setDownloading] = useState(false);
  if (!booking) return null;

  const lotName = booking.lot?.name || 'Parking Facility';
  const lotAddress = booking.lot?.address || 'Bengaluru';
  const slotNumber = booking.slot?.slotNumber || 'Slot';
  const startTime = new Date(booking.startTime).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  const endTime = new Date(booking.endTime).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Trigger browser print dialog for the parking pass
  const handlePrint = () => {
    window.print();
  };

  // Download official A5 PDF parking pass
  const handleDownloadPdf = async () => {
    setDownloading(true);
    await downloadPdfTicket(booking, user);
    setDownloading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Parking Ticket" maxWidth="max-w-md">
      <div id="printable-ticket" className="text-center space-y-5">
        
        {/* Pass Header */}
        <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
            <Ticket className="w-4 h-4" />
            <span>SmartPark Entry Pass</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {lotName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{lotAddress}</span>
          </p>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl inline-block shadow-md border border-slate-200">
          <QRCodeSVG
            value={JSON.stringify({
              code: booking.ticketCode,
              lot: lotName,
              slot: slotNumber,
              vehicle: booking.vehicleNumber
            })}
            size={180}
            level="H"
            includeMargin={true}
          />
          <p className="mt-2 text-xs font-mono font-bold text-slate-800 tracking-wider">
            {booking.ticketCode}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-left bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl text-xs border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-slate-400 block font-medium">Reserved Slot</span>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{slotNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Vehicle Number</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-slate-500" />
              <span>{booking.vehicleNumber}</span>
            </span>
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block font-medium">Reservation Window</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>{startTime} → {endTime}</span>
            </span>
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Total Amount</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              ₹{booking.totalAmount}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Downloading...' : 'Download PDF Ticket'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
}
