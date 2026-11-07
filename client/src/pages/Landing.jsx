import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LotCard from '../components/LotCard';
import { LotCardSkeleton } from '../components/Skeleton';
import {
  Search,
  Calendar,
  Clock,
  Car,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
  MousePointerClick
} from 'lucide-react';

// Public landing homepage showcasing hero search, 3-step workflow, and featured Bengaluru lots
export default function Landing() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('Bengaluru');
  const navigate = useNavigate();

  // Fetch featured parking lots on mount
  useEffect(() => {
    const fetchLots = async () => {
      try {
        const res = await api.get('/lots');
        setLots(res.data.lots.slice(0, 4));
      } catch (err) {
        console.error('Failed to load lots:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLots();
  }, []);

  // Handle hero search submission and route to Find page
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/find?city=${encodeURIComponent(searchCity)}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Smart Bengaluru Parking Network</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Find and book parking in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
              seconds.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Real-time slot availability, instant digital ticket with QR pass, zero congestion at entry gates.
          </p>

          {/* Quick Search Card */}
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-soft-lg border border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <MapPin className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div className="text-left flex-1">
                  <label className="text-[10px] font-semibold uppercase text-slate-400 block">City</label>
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Clock className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div className="text-left flex-1">
                  <label className="text-[10px] font-semibold uppercase text-slate-400 block">Duration</label>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 block truncate">
                    Flexible / Hourly
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>Find Parking</span>
              </button>

            </form>
          </div>

          {/* Highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Live Slot Sensors</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Guaranteed Reserved Spot</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span>Paperless QR Pass</span>
            </span>
          </div>

        </div>
      </section>

      {/* 3-Step How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            How SmartPark Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Reserve your verified spot before you hit the road in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-soft text-left relative overflow-hidden group hover:border-indigo-400 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-500" />
              <span>Search</span>
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Explore parking hubs near your destination across Bengaluru with transparent hourly rates.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-soft text-left relative overflow-hidden group hover:border-emerald-400 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MousePointerClick className="w-5 h-5 text-emerald-500" />
              <span>Choose</span>
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Pick your exact green slot from the interactive grid (Car, Bike, EV Charging, or Accessible).
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-soft text-left relative overflow-hidden group hover:border-indigo-400 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-indigo-500" />
              <span>Park</span>
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Show your digital QR code pass at the boom barrier or entry guard and drive straight in.
            </p>
          </div>

        </div>
      </section>

      {/* Featured Parking Lots Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Featured Parking Lots in Bengaluru
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Prime spots in MG Road, Indiranagar, Koramangala & Whitefield
            </p>
          </div>

          <Link
            to="/find"
            className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <span>View All Lots</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <LotCardSkeleton />
            <LotCardSkeleton />
            <LotCardSkeleton />
            <LotCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lots.map((lot) => (
              <LotCard key={lot._id} lot={lot} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
