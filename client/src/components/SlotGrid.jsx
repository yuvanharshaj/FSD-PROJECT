import React, { useState } from 'react';
import { Car, Bike, Zap, Accessibility, Check, AlertCircle, Wrench } from 'lucide-react';

// Star feature: Interactive parking slot picker grid with real-time status and type filtering
export default function SlotGrid({ slots = [], selectedSlotId, onSelectSlot, loading }) {
  const [activeType, setActiveType] = useState('all');

  // Filter slots according to user's vehicle type selection
  const filteredSlots = slots.filter(slot => {
    if (activeType === 'all') return true;
    return slot.type === activeType;
  });

  // Render appropriate icon based on slot vehicle type
  const renderTypeIcon = (type) => {
    switch (type) {
      case 'bike':
        return <Bike className="w-4 h-4" title="Bike" />;
      case 'ev':
        return <Zap className="w-4 h-4 text-emerald-400" title="EV Charging" />;
      case 'accessible':
        return <Accessibility className="w-4 h-4 text-sky-400" title="Accessible" />;
      case 'car':
      default:
        return <Car className="w-4 h-4" title="Car" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-soft space-y-6">
      
      {/* Header and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Select a Parking Slot</span>
            {loading && <span className="text-xs text-indigo-500 font-normal animate-pulse">(Updating live...)</span>}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click on any green spot to reserve it for your arrival window
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block shadow-sm" />
            <span className="text-slate-700 dark:text-slate-300">Free</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-600 inline-block shadow-sm ring-2 ring-blue-300" />
            <span className="text-slate-700 dark:text-slate-300">Selected</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-500 inline-block shadow-sm" />
            <span className="text-slate-700 dark:text-slate-300">Booked</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-400 inline-block shadow-sm" />
            <span className="text-slate-700 dark:text-slate-300">Maintenance</span>
          </span>
        </div>
      </div>

      {/* Vehicle Type Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Spots', icon: Car },
          { id: 'car', label: 'Car Spots', icon: Car },
          { id: 'bike', label: 'Bike Spots', icon: Bike },
          { id: 'ev', label: 'EV Charging', icon: Zap },
          { id: 'accessible', label: 'Accessible', icon: Accessibility },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveType(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeType === id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Slots Interactive Grid */}
      {filteredSlots.length === 0 ? (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p className="text-sm">No slots match the selected vehicle filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filteredSlots.map((slot) => {
            const isSelected = selectedSlotId === slot._id;
            const isMaintenance = slot.status === 'maintenance';
            const isBooked = slot.isBooked;
            const isFree = !isBooked && !isMaintenance;

            // Compute card color scheme
            let buttonStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 hover:scale-105 active:scale-95 cursor-pointer';
            let badgeBg = 'bg-emerald-500 text-white';

            if (isSelected) {
              buttonStyle = 'bg-blue-600 border-blue-600 text-white shadow-lg ring-4 ring-blue-200 dark:ring-blue-900 scale-105 cursor-pointer';
              badgeBg = 'bg-white text-blue-700';
            } else if (isMaintenance) {
              buttonStyle = 'bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-500 cursor-not-allowed opacity-75';
              badgeBg = 'bg-slate-400 text-white';
            } else if (isBooked) {
              buttonStyle = 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400 cursor-not-allowed opacity-80';
              badgeBg = 'bg-rose-500 text-white';
            }

            return (
              <button
                key={slot._id}
                type="button"
                disabled={!isFree && !isSelected}
                onClick={() => isFree && onSelectSlot(slot)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${buttonStyle}`}
              >
                {/* Status indicator pill */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${badgeBg}`}>
                    {isSelected ? 'SELECTED' : isMaintenance ? 'MNT' : isBooked ? 'BUSY' : 'FREE'}
                  </span>
                  <div className="opacity-80">
                    {isMaintenance ? <Wrench className="w-3.5 h-3.5" /> : renderTypeIcon(slot.type)}
                  </div>
                </div>

                {/* Slot Number Label */}
                <span className="text-base font-extrabold tracking-tight mt-1">
                  {slot.slotNumber}
                </span>

                {/* Subtext description */}
                <span className="text-[10px] uppercase font-medium opacity-75 mt-0.5">
                  {slot.type}
                </span>

                {/* Selected Checkmark overlay */}
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Helper Footer text */}
      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2">
        <span>Auto-syncs slot availability every 10 seconds.</span>
        <span>{filteredSlots.filter(s => !s.isBooked && s.status !== 'maintenance').length} spots available</span>
      </div>
    </div>
  );
}
