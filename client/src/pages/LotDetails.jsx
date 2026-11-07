import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import SlotGrid from '../components/SlotGrid';
import {
  MapPin,
  Clock,
  Car,
  Calendar,
  ShieldCheck,
  Zap,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

// Helper to format Date object into local HTML datetime-local input string
const formatDateTimeInput = (date) => {
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Lot details and interactive slot reservation page with real-time auto-refreshing grid
export default function LotDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lot, setLot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Default time window: starting 30 minutes from now, lasting 2 hours in the future
  const [startTime, setStartTime] = useState(() => {
    return new Date(Date.now() + 30 * 60 * 1000);
  });

  const [endTime, setEndTime] = useState(() => {
    return new Date(Date.now() + 150 * 60 * 1000); // 2.5 hours from now
  });

  // Calculate duration in hours (rounded up)
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
  const totalAmount = lot ? durationHours * lot.pricePerHour : 0;

  useEffect(() => {
    if (lot?.name) {
      document.title = `${lot.name} — SmartPark Slot Reservation`;
    }
  }, [lot]);

  // Fetch parking lot details and slot availability
  const fetchSlotData = async (isBackground = false) => {
    if (isBackground) setRefreshing(true);
    else setLoading(true);

    try {
      const [lotRes, slotRes] = await Promise.all([
        api.get(`/lots/${id}`),
        api.get(`/lots/${id}/slots?start=${startTime.toISOString()}&end=${endTime.toISOString()}`)
      ]);

      setLot(lotRes.data.lot);
      setSlots(slotRes.data.slots);

      // Verify if previously selected slot was booked by someone else
      if (selectedSlot) {
        const stillAvailable = slotRes.data.slots.find(
          s => s._id === selectedSlot._id && !s.isBooked && s.status !== 'maintenance'
        );
        if (!stillAvailable) {
          setSelectedSlot(null);
          toast.error('That spot was just taken, please pick another.');
        }
      }
    } catch (err) {
      console.error('Failed to load lot slots:', err);
      toast.error('Could not load parking slots.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch and trigger on time change
  useEffect(() => {
    fetchSlotData();
  }, [id, startTime, endTime]);

  // Star feature: Auto-refresh slot grid every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchSlotData(true);
    }, 10000);

    return () => clearInterval(timer);
  }, [id, startTime, endTime, selectedSlot]);

  // Handle start time input with past time prevention
  const handleStartTimeChange = (val) => {
    const chosen = new Date(val);
    const now = new Date();
    if (chosen < now) {
      toast.error('Start time must be in the future.');
      return;
    }
    setStartTime(chosen);
    // If end is before or equal to start, adjust end
    if (endTime <= chosen) {
      setEndTime(new Date(chosen.getTime() + 2 * 60 * 60 * 1000));
    }
  };

  // Handle end time input
  const handleEndTimeChange = (val) => {
    const chosen = new Date(val);
    if (chosen <= startTime) {
      toast.error('End time must be after arrival time.');
      return;
    }
    setEndTime(chosen);
  };

  // Quick duration chips handler (1 hr, 2 hrs, Half day)
  const setQuickDuration = (hours) => {
    const newEnd = new Date(startTime.getTime() + hours * 60 * 60 * 1000);
    setEndTime(newEnd);
  };

  // Navigate to confirmation step with selected booking details
  const handleProceed = () => {
    if (!selectedSlot) {
      toast.error('Please select an available parking slot (in green) first.');
      return;
    }

    navigate('/book/confirm', {
      state: {
        lot,
        slot: selectedSlot,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationHours,
        totalAmount
      }
    });
  };

  if (loading && !lot) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500">Loading parking facility & live slots...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Facility Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
            <MapPin className="w-3.5 h-3.5" />
            <span>{lot?.city}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {lot?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>{lot?.address}</span>
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 pt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Hours: {lot?.openTime} – {lot?.closeTime}</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Gated & Guarded</span>
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>EV Charging Available</span>
            </span>
          </div>
        </div>

        {/* Pricing Badge */}
        <div className="text-left md:text-right bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Standard Rate</span>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
            ₹{lot?.pricePerHour}
            <span className="text-xs font-semibold text-slate-500"> / hour</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Rounded up to next full hour</span>
        </div>
      </div>

      {/* Main Interactive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Time Controls & Slot Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Date & Time Picker Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Choose Parking Time Window</span>
              </h3>
              {refreshing && (
                <span className="text-xs text-indigo-500 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Syncing slots</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Arrival Time (Start)
                </label>
                <input
                  type="datetime-local"
                  value={formatDateTimeInput(startTime)}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Departure Time (End)
                </label>
                <input
                  type="datetime-local"
                  value={formatDateTimeInput(endTime)}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Quick Duration Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 mr-1">Quick Add:</span>
              {[
                { label: '1 hour', hours: 1 },
                { label: '2 hours', hours: 2 },
                { label: 'Half day (4 hrs)', hours: 4 }
              ].map(({ label, hours }) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setQuickDuration(hours)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    durationHours === hours
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Slot Grid Component */}
          <SlotGrid
            slots={slots}
            selectedSlotId={selectedSlot?._id}
            onSelectSlot={(slot) => setSelectedSlot(slot)}
            loading={refreshing}
          />

        </div>

        {/* Right Column: Sticky Live Price Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Reservation Summary
            </h3>

            {/* Selected Spot Details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400">Selected Spot:</span>
                {selectedSlot ? (
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
                    {selectedSlot.slotNumber} ({selectedSlot.type.toUpperCase()})
                  </span>
                ) : (
                  <span className="text-amber-500 font-semibold italic">None selected yet</span>
                )}
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400">Duration:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{durationHours} hour(s)</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400">Hourly Rate:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{lot?.pricePerHour} / hr</span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-900 dark:text-white">Estimated Total:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            {/* Prompt or CTA */}
            {!selectedSlot ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>Tap any green spot in the grid to activate booking</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleProceed}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                <span>Book this spot ({selectedSlot.slotNumber})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="text-[11px] text-slate-400 space-y-1">
              <p>• Free cancellation up to your scheduled arrival time.</p>
              <p>• Instant QR entry ticket issued upon confirmation.</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
