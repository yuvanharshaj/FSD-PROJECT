import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TicketModal from '../components/TicketModal';
import { QRCodeSVG } from 'qrcode.react';
import {
  Car,
  CheckCircle2,
  Calendar,
  CreditCard,
  QrCode,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Printer,
  Download,
  Ticket,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Indian vehicle plate validation regex (supports KA01AB1234 or KA-01-AB-1234)
const INDIAN_VEHICLE_REGEX = /^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4}$/i;

// Multi-step checkout and confirmation page with pre-filled vehicle details and demo payment options
export default function BookingConfirm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Confirm Parking Booking — SmartPark';
  }, []);

  const bookingState = location.state;
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicleNumber || 'KA04MK5566');
  const [paymentMethod, setPaymentMethod] = useState('entry'); // 'entry', 'upi', 'card'
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // If accessed directly without state, redirect back to find page
  if (!bookingState || !bookingState.lot || !bookingState.slot) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <p className="text-sm text-slate-500">No slot selected. Please pick a parking spot first.</p>
        <Link to="/find" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Browse Parking Lots
        </Link>
      </div>
    );
  }

  const { lot, slot, startTime, endTime, durationHours, totalAmount } = bookingState;

  // Submit confirmed booking request to backend API
  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    const cleanVehicle = vehicleNumber.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!INDIAN_VEHICLE_REGEX.test(cleanVehicle)) {
      toast.error('Please enter a valid Indian vehicle number (e.g. KA01AB1234 or KA-04-MK-5566).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/bookings', {
        lotId: lot._id,
        slotId: slot._id,
        vehicleNumber: cleanVehicle,
        startTime,
        endTime
      });

      setConfirmedBooking(res.data.booking);
      toast.success('Parking spot reserved successfully!');
    } catch (err) {
      console.error('Booking failed:', err);
      if (err.response?.status === 409) {
        toast.error('That spot was just taken, please pick another.');
      } else {
        const msg = err.response?.data?.message || 'Failed to complete booking. Please try again.';
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Download digital pass as a printable JSON ticket
  const handleDownloadTicket = () => {
    if (!confirmedBooking) return;
    const ticketData = {
      ticketCode: confirmedBooking.ticketCode,
      facility: lot.name,
      address: `${lot.address}, ${lot.city}`,
      slot: slot.slotNumber,
      vehicle: confirmedBooking.vehicleNumber,
      startTime,
      endTime,
      totalAmount,
      status: 'confirmed'
    };
    const blob = new Blob([JSON.stringify(ticketData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartPark-${confirmedBooking.ticketCode}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Parking ticket receipt downloaded!');
  };

  const startFormatted = new Date(startTime).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  const endFormatted = new Date(endTime).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      
      {/* 3-Step Breadcrumb Progress Bar */}
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-bold">
            ✓
          </span>
          <span>1. Choose</span>
        </div>
        <div className={`h-0.5 w-12 ${confirmedBooking ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${confirmedBooking ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white ${confirmedBooking ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
            {confirmedBooking ? '✓' : '2'}
          </span>
          <span>2. Confirm</span>
        </div>
        <div className={`h-0.5 w-12 ${confirmedBooking ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${confirmedBooking ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${confirmedBooking ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
            3
          </span>
          <span>3. Done</span>
        </div>
      </div>

      {!confirmedBooking ? (
        /* STEP 2: Confirm & Pay Screen */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
          
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 text-left">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Confirm Your Parking Reservation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verify vehicle plate details and select your entry verification method.
            </p>
          </div>

          <form onSubmit={handleConfirmBooking} className="space-y-6">
            
            {/* Facility & Spot Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-left">
              <div>
                <span className="text-slate-400 block font-medium">Facility</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{lot.name}</span>
                <span className="text-[11px] text-slate-500 block">{lot.address}, {lot.city}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Reserved Spot</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                  Slot {slot.slotNumber} ({slot.type.toUpperCase()})
                </span>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block font-medium">Time Window</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{startFormatted} → {endFormatted} ({durationHours} hours)</span>
                </span>
              </div>
            </div>

            {/* Vehicle Number Input with Indian format hint */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Vehicle License Plate Number</span>
                <span className="text-[11px] text-slate-400 font-normal">e.g. KA01AB1234</span>
              </label>
              <div className="relative">
                <Car className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="KA01AB1234"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Hint: Standard Indian vehicle registration (State code + RTO + Series + 4 digits).
              </p>
            </div>

            {/* Demo Payment Selector */}
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Payment Option
                </label>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  DEMO — NO CHARGE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'entry', title: 'Pay at Entry', sub: 'Cash / Fastag Demo' },
                  { id: 'upi', title: 'UPI / QR', sub: 'GPay / PhonePe Demo' },
                  { id: 'card', title: 'Card Demo', sub: 'Debit / Credit' }
                ].map(({ id, title, sub }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      paymentMethod === id
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold block">{title}</span>
                    <span className="text-[10px] opacity-75">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl space-y-2 text-xs border border-slate-200 dark:border-slate-800 text-left">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Parking Fare ({durationHours} hr × ₹{lot.pricePerHour}/hr)</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Convenience / Reservation Fee</span>
                <span className="text-emerald-500 font-bold">FREE</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Payable</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹{totalAmount}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Change Spot
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span>{submitting ? 'Reserving spot...' : 'Confirm & Book Spot'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>
      ) : (
        /* STEP 3: Done / Success Celebration Screen */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-soft text-center space-y-6">
          
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Booking Confirmed!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your parking spot has been reserved. Show your QR pass at the entry barrier.
            </p>
          </div>

          {/* Quick Ticket Badge Card */}
          <div className="max-w-sm mx-auto p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="p-3 bg-white rounded-2xl inline-block shadow-sm border border-slate-200">
              <QRCodeSVG
                value={JSON.stringify({
                  ticket: confirmedBooking.ticketCode,
                  lot: lot.name,
                  slot: slot.slotNumber,
                  vehicle: confirmedBooking.vehicleNumber
                })}
                size={160}
                level="H"
              />
            </div>
            
            <div className="text-xs space-y-1">
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm block">
                {confirmedBooking.ticketCode}
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Slot {slot.slotNumber} • {confirmedBooking.vehicleNumber}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="flex items-center justify-center gap-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Pass</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTicket}
              className="flex items-center justify-center gap-2 py-2.5 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Receipt</span>
            </button>

            <Link
              to="/bookings"
              className="flex items-center justify-center gap-2 py-2.5 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              <Ticket className="w-4 h-4" />
              <span>My Bookings</span>
            </Link>
          </div>

          {/* Printable Ticket Modal */}
          <TicketModal
            isOpen={showPrintModal}
            onClose={() => setShowPrintModal(false)}
            booking={confirmedBooking}
          />

        </div>
      )}

    </div>
  );
}
