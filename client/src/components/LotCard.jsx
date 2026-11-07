import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowRight, ShieldCheck, Car } from 'lucide-react';

// Reusable parking lot card with availability status bar, pricing, and booking action
export default function LotCard({ lot, availableCount }) {
  // If availableCount is not passed, default to totalSlots or estimate
  const totalSlots = lot.totalSlots || 25;
  const freeSlots = typeof availableCount === 'number' ? availableCount : Math.floor(totalSlots * 0.7);
  const percentage = Math.round((freeSlots / totalSlots) * 100);

  // Determine availability color badge
  const isHighAvailability = percentage > 40;
  const isLowAvailability = percentage > 0 && percentage <= 40;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all overflow-hidden flex flex-col group">
      
      {/* Top Image Banner */}
      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={lot.imageUrl || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'}
          alt={lot.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
          <span>{lot.city}</span>
        </div>
        <div className="absolute top-3 right-3 bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
          ₹{lot.pricePerHour} / hr
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {lot.name}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span>{lot.address}</span>
          </p>

          <div className="mt-3 flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{lot.openTime} – {lot.closeTime}</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified Lot</span>
            </span>
          </div>

          {/* Availability progress bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-indigo-500" />
                <span>{freeSlots} of {totalSlots} free</span>
              </span>
              <span className={`font-semibold ${
                isHighAvailability ? 'text-emerald-600 dark:text-emerald-400' :
                isLowAvailability ? 'text-amber-600 dark:text-amber-400' :
                'text-rose-600 dark:text-rose-400'
              }`}>
                {percentage}% available
              </span>
            </div>
            
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isHighAvailability ? 'bg-emerald-500' :
                  isLowAvailability ? 'bg-amber-500' :
                  'bg-rose-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          <Link
            to={`/lots/${lot._id}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <span>Book this spot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

