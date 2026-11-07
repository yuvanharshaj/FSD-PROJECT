import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import BookingCard from '../components/BookingCard';
import TicketModal from '../components/TicketModal';
import Skeleton from '../components/Skeleton';
import { Ticket, Search, Calendar, Car, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

// User reservation history and management dashboard with status categorization tabs
export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'cancelled'
  const [activeTicket, setActiveTicket] = useState(null);

  // Load all user bookings from backend API
  const fetchMyBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      toast.error('Could not load your reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  // Handle cancelling a reservation
  const handleCancel = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success('Reservation cancelled successfully.');
      fetchMyBookings();
    } catch (err) {
      console.error('Failed to cancel:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel reservation.');
    }
  };

  const now = new Date();

  // Categorize bookings by tabs
  const upcomingBookings = bookings.filter(
    b => b.status === 'confirmed' && new Date(b.endTime) > now
  );
  const pastBookings = bookings.filter(
    b => b.status === 'completed' || (b.status === 'confirmed' && new Date(b.endTime) <= now)
  );
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  let currentList = upcomingBookings;
  if (activeTab === 'past') currentList = pastBookings;
  if (activeTab === 'cancelled') currentList = cancelledBookings;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>My Parking Bookings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View active passes, upcoming spots, and booking receipts.
          </p>
        </div>

        <Link
          to="/find"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 self-start sm:self-auto"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Book Another Spot</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl max-w-md text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'upcoming'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Upcoming ({upcomingBookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'past'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Past ({pastBookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cancelled')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'cancelled'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Cancelled ({cancelledBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" count={3} />
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No {activeTab} bookings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {activeTab === 'upcoming'
              ? "You don't have any upcoming parking reservations. Ready to head out?"
              : `No ${activeTab} reservations found in your account history.`}
          </p>
          {activeTab === 'upcoming' && (
            <Link
              to="/find"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              <span>Explore Parking Lots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancel}
              onViewTicket={(b) => setActiveTicket(b)}
            />
          ))}
        </div>
      )}

      {/* Reusable QR Ticket Modal */}
      <TicketModal
        isOpen={!!activeTicket}
        onClose={() => setActiveTicket(null)}
        booking={activeTicket}
      />

    </div>
  );
}
