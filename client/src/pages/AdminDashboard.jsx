import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import Skeleton from '../components/Skeleton';
import {
  TrendingUp,
  Car,
  Ticket,
  MapPin,
  Plus,
  Trash2,
  Edit,
  Wrench,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Building,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ComposedChart
} from 'recharts';
import toast from 'react-hot-toast';

// Comprehensive administrative dashboard featuring analytics charts, booking auditing, and lot management
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Table search, status filter, and pagination state
  const [searchBooking, setSearchBooking] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'confirmed', 'completed', 'cancelled'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Lot Modal State
  const [showLotModal, setShowLotModal] = useState(false);
  const [editingLot, setEditingLot] = useState(null);
  const [lotForm, setLotForm] = useState({
    name: '',
    address: '',
    city: 'Bengaluru',
    lat: 12.9716,
    lng: 77.5946,
    totalSlots: 25,
    pricePerHour: 50,
    openTime: '06:00',
    closeTime: '23:00'
  });

  // Slot Maintenance Modal State
  const [selectedLotForSlots, setSelectedLotForSlots] = useState(null);
  const [lotSlots, setLotSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    document.title = 'Admin Dashboard — SmartPark';
  }, []);

  // Fetch dashboard stats, all bookings, and parking lots from backend
  const loadDashboardData = async () => {
    try {
      const [statsRes, bookingsRes, lotsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/bookings?limit=100'),
        api.get('/lots')
      ]);

      setStats(statsRes.data.stats);
      setBookings(bookingsRes.data.bookings);
      setLots(lotsRes.data.lots);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      toast.error('Could not load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Save new parking lot or update existing lot with input validation
  const handleSaveLot = async (e) => {
    e.preventDefault();
    if (!lotForm.name.trim() || !lotForm.address.trim() || !lotForm.city.trim()) {
      toast.error('Please fill in all required facility fields.');
      return;
    }
    if (lotForm.pricePerHour <= 0) {
      toast.error('Hourly rate must be greater than zero.');
      return;
    }

    try {
      if (editingLot) {
        await api.put(`/lots/${editingLot._id}`, lotForm);
        toast.success('Parking lot updated successfully.');
      } else {
        await api.post('/lots', lotForm);
        toast.success('New parking lot added with slots.');
      }
      setShowLotModal(false);
      setEditingLot(null);
      loadDashboardData();
    } catch (err) {
      console.error('Lot save failed:', err);
      toast.error(err.response?.data?.message || 'Failed to save lot.');
    }
  };

  // Delete parking lot and its slots
  const handleDeleteLot = async (lotId) => {
    if (!window.confirm('Are you sure you want to delete this parking facility and its slots?')) return;
    try {
      await api.delete(`/lots/${lotId}`);
      toast.success('Parking lot removed.');
      loadDashboardData();
    } catch (err) {
      console.error('Failed to delete lot:', err);
      toast.error('Failed to delete parking lot.');
    }
  };

  // Open slot maintenance modal for a lot
  const handleOpenSlots = async (lot) => {
    setSelectedLotForSlots(lot);
    setLoadingSlots(true);
    try {
      const res = await api.get(`/lots/${lot._id}/slots`);
      setLotSlots(res.data.slots);
    } catch (err) {
      console.error('Failed to load slots for maintenance:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Toggle maintenance flag on a specific slot
  const handleToggleMaintenance = async (slotId) => {
    try {
      const res = await api.patch(`/lots/${selectedLotForSlots._id}/slots/${slotId}/toggle-maintenance`);
      toast.success(res.data.message);
      // Update local state
      setLotSlots(prev => prev.map(s => s._id === slotId ? res.data.slot : s));
    } catch (err) {
      console.error('Failed to toggle maintenance:', err);
      toast.error('Failed to update slot status.');
    }
  };

  // Filter bookings table by search query and status filter
  const filteredBookings = bookings.filter(b => {
    const q = searchBooking.toLowerCase().trim();
    const ticketMatch = !q || b.ticketCode?.toLowerCase().includes(q);
    const userMatch = !q || b.user?.name?.toLowerCase().includes(q) || b.user?.email?.toLowerCase().includes(q);
    const lotMatch = !q || b.lot?.name?.toLowerCase().includes(q);
    const statusMatch = statusFilter === 'all' || b.status === statusFilter;

    return (ticketMatch || userMatch || lotMatch) && statusMatch;
  });

  // Calculate pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage));
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Admin Oversight & Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time occupancy rates, revenue metrics, and facility controls.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingLot(null);
            setLotForm({
              name: '',
              address: '',
              city: 'Bengaluru',
              lat: 12.9716,
              lng: 77.5946,
              totalSlots: 25,
              pricePerHour: 50,
              openTime: '06:00',
              closeTime: '23:00'
            });
            setShowLotModal(true);
          }}
          className="flex items-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Lot</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32 w-full rounded-2xl" count={4} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Revenue Today"
            value={`₹${stats?.revenueToday || 0}`}
            icon={TrendingUp}
            color="emerald"
            changeText="Confirmed & Completed Bookings"
          />
          <StatCard
            title="Live Occupancy Rate"
            value={`${stats?.occupancyRate || 0}%`}
            icon={Car}
            color="indigo"
            changeText={`${stats?.currentlyOccupiedSlots || 0} of ${stats?.totalSlots || 0} slots active`}
          />
          <StatCard
            title="Total Bookings"
            value={stats?.totalBookings || 0}
            icon={Ticket}
            color="amber"
            changeText="Lifetime platform reservations"
          />
          <StatCard
            title="Active Facilities"
            value={stats?.totalLots || 0}
            icon={MapPin}
            color="sky"
            changeText={`${stats?.totalSlots || 0} total managed parking slots`}
          />
        </div>
      )}

      {/* 7-Day Performance Chart */}
      {!loading && stats?.last7DaysBookings && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Last 7 Days Revenue & Booking Volume
              </h3>
              <p className="text-xs text-slate-500">Daily reservation trends across all parking hubs</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block" />
                <span className="text-slate-700 dark:text-slate-300">Revenue (₹)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
                <span className="text-slate-700 dark:text-slate-300">Bookings Count</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stats.last7DaysBookings}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={3} name="Bookings" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Facilities Management Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Parking Facilities & Slot Management
            </h3>
            <p className="text-xs text-slate-500">Edit rates, view slots, or toggle maintenance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lots.map((lot) => (
            <div
              key={lot._id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                    {lot.city}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    ₹{lot.pricePerHour}/hr
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                  {lot.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">{lot.address}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {lot.totalSlots} slots • {lot.openTime}–{lot.closeTime}
                </p>
              </div>

              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleOpenSlots(lot)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-semibold hover:bg-indigo-100"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Slots</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingLot(lot);
                    setLotForm({
                      name: lot.name,
                      address: lot.address,
                      city: lot.city,
                      lat: lot.lat,
                      lng: lot.lng,
                      totalSlots: lot.totalSlots,
                      pricePerHour: lot.pricePerHour,
                      openTime: lot.openTime,
                      closeTime: lot.closeTime
                    });
                    setShowLotModal(true);
                  }}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                  title="Edit lot"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLot(lot._id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                  title="Delete lot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings Auditing Table with Filter & Pagination */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Platform Reservations Auditing
            </h3>
            <p className="text-xs text-slate-500">Live booking logs, users, and ticket codes ({filteredBookings.length} results)</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              {['all', 'confirmed', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchBooking}
                onChange={(e) => { setSearchBooking(e.target.value); setCurrentPage(1); }}
                placeholder="Search ticket, user, or lot..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Ticket Code</th>
                <th className="py-3 px-3">Driver</th>
                <th className="py-3 px-3">Facility</th>
                <th className="py-3 px-3">Slot</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Fare</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No reservations matching current search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {b.ticketCode}
                    </td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                      <div>{b.user?.name || 'Driver'}</div>
                      <div className="text-[10px] text-slate-400">{b.user?.email}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                      {b.lot?.name || 'Lot'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {b.slot?.slotNumber || 'Slot'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {b.vehicleNumber}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      ₹{b.totalAmount}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        b.status === 'completed' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Add / Edit Lot Modal */}
      <Modal
        isOpen={showLotModal}
        onClose={() => setShowLotModal(false)}
        title={editingLot ? 'Edit Parking Facility' : 'Add New Parking Facility'}
      >
        <form onSubmit={handleSaveLot} className="space-y-4 text-xs text-left">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Facility Name</label>
            <input
              type="text"
              required
              value={lotForm.name}
              onChange={(e) => setLotForm({ ...lotForm, name: e.target.value })}
              placeholder="e.g. Koramangala 6th Block Hub"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Address</label>
            <input
              type="text"
              required
              value={lotForm.address}
              onChange={(e) => setLotForm({ ...lotForm, address: e.target.value })}
              placeholder="e.g. 100ft Road, Koramangala"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">City</label>
              <input
                type="text"
                required
                value={lotForm.city}
                onChange={(e) => setLotForm({ ...lotForm, city: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Price Per Hour (₹)</label>
              <input
                type="number"
                required
                min="10"
                value={lotForm.pricePerHour}
                onChange={(e) => setLotForm({ ...lotForm, pricePerHour: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Open Time</label>
              <input
                type="text"
                required
                value={lotForm.openTime}
                onChange={(e) => setLotForm({ ...lotForm, openTime: e.target.value })}
                placeholder="06:00"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Close Time</label>
              <input
                type="text"
                required
                value={lotForm.closeTime}
                onChange={(e) => setLotForm({ ...lotForm, closeTime: e.target.value })}
                placeholder="23:00"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          {!editingLot && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Total Slots to Auto-Create</label>
              <input
                type="number"
                min="5"
                max="100"
                value={lotForm.totalSlots}
                onChange={(e) => setLotForm({ ...lotForm, totalSlots: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowLotModal(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
            >
              {editingLot ? 'Save Changes' : 'Create Facility'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Slot Maintenance Modal */}
      <Modal
        isOpen={!!selectedLotForSlots}
        onClose={() => setSelectedLotForSlots(null)}
        title={`Slot Maintenance: ${selectedLotForSlots?.name}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs text-left">
          <p className="text-slate-500">
            Click on any slot to toggle its maintenance status. Gray slots cannot be reserved by drivers.
          </p>

          {loadingSlots ? (
            <p className="py-8 text-center text-slate-400">Loading slots...</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-96 overflow-y-auto p-1">
              {lotSlots.map((slot) => {
                const isMnt = slot.status === 'maintenance';
                return (
                  <button
                    key={slot._id}
                    type="button"
                    onClick={() => handleToggleMaintenance(slot._id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isMnt
                        ? 'bg-slate-200 dark:bg-slate-800 border-slate-400 text-slate-600 dark:text-slate-400'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    <span className="font-extrabold text-sm">{slot.slotNumber}</span>
                    <span className="text-[9px] uppercase font-bold mt-0.5">
                      {isMnt ? 'MNT' : 'ACTIVE'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="text-right pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedLotForSlots(null)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
