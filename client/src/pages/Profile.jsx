import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Car, Shield, LogOut, Check, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// User account profile and vehicle registration management page
export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicleNumber || '');
  const [saving, setSaving] = useState(false);

  // Save updated vehicle license plate to local session
  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    updateUser({ vehicleNumber: vehicleNumber.trim().toUpperCase() });
    setTimeout(() => {
      setSaving(false);
      toast.success('Vehicle number updated!');
    }, 300);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-soft flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {user?.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            <span>{user?.email}</span>
          </p>
          <div className="mt-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Role: {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle Plate Settings Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-indigo-500" />
            <span>Primary Vehicle Plate</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            This vehicle number will be automatically prefilled whenever you book a parking spot.
          </p>
        </div>

        <form onSubmit={handleSave} className="flex gap-2 pt-2">
          <input
            type="text"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            placeholder="e.g. KA-04-MK-5566"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
          >
            {saving ? 'Saving...' : 'Update Plate'}
          </button>
        </form>
      </div>

      {/* Quick Links Card */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/bookings"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:border-indigo-400 transition-colors flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">My Bookings</h4>
            <p className="text-[11px] text-slate-500">View passes & history</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={logout}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-3 text-left text-rose-600"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold">Sign Out</h4>
            <p className="text-[11px] text-slate-400">Exit active session</p>
          </div>
        </button>
      </div>

    </div>
  );
}
