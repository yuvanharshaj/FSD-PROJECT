import React, { useState } from 'react';
import { Ticket, Calendar, MapPin, Car, AlertTriangle, QrCode, XCircle } from 'lucide-react';
import Modal from './Modal';

// Reusable booking record card displaying ticket details, status, and cancel action
export default function BookingCard({ booking, onCancel, onViewTicket }) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const now = new Date();
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  const canCancel = booking.status === 'confirmed' && now < startTime;

  // Render status badge with contextual styling
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Confirm and trigger booking cancellation
  const handleConfirmCancel = async () => {
    setCancelling(true);
    await onCancel(booking._id);
    setCancelling(false);
    setShowCancelModal(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-soft hover:shadow-soft-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Info Column */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {booking.ticketCode}
            </span>
            {renderStatusBadge(booking.status)}
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {booking.lot?.name || 'Parking Facility'}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{booking.lot?.address}, {booking.lot?.city}</span>
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                {startTime.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}: {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-indigo-500" />
              <span>Slot <strong>{booking.slot?.slotNumber || 'Slot'}</strong> ({booking.vehicleNumber})</span>
            </span>
          </div>
        </div>

        {/* Right Pricing & Actions Column */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="text-left md:text-right">
            <span className="text-xs text-slate-400 block">Total Fare</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
              ₹{booking.totalAmount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewTicket(booking)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>View Ticket</span>
            </button>

            {canCancel && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Parking Reservation"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/50">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Are you sure you want to cancel this booking for <strong>{booking.lot?.name}</strong> (Slot {booking.slot?.slotNumber})? This slot will be immediately released for other drivers.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Keep Booking
            </button>
            <button
              type="button"
              disabled={cancelling}
              onClick={handleConfirmCancel}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition-all active:scale-95 disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
