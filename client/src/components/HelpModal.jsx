import React, { useState } from 'react';
import { HelpCircle, Search, CheckCircle2, QrCode, Sparkles, Car, CreditCard } from 'lucide-react';
import Modal from './Modal';

// Floating help trigger button and interactive 4-step quick start guide modal
export default function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 text-xs font-bold"
        aria-label="Quick user guide"
      >
        <HelpCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Help & Guide</span>
      </button>

      {/* Guide Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="SmartPark 4-Step Quick Guide"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Welcome to SmartPark! Reserve guaranteed parking in Bengaluru in four simple steps:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Search & Filter</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Browse Bengaluru parking hubs (MG Road, Indiranagar, Koramangala, Whitefield) on List or Map view.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Pick Your Green Spot</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Select your arrival time and pick any available green slot on the live-syncing grid.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Confirm & Demo Payment</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Verify vehicle license plate and choose entry payment mode (clearly labelled Demo mode).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-blue-500" />
                  <span>Scan QR at Entry Gate</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Get instant digital QR ticket. Scan at the entry gate barrier for barrier-free parking!
                </p>
              </div>
            </div>
          </div>

          {/* Demo tip */}
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-xs text-indigo-800 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-indigo-500 mt-0.5" />
            <div>
              <strong>Instant Evaluator Demo:</strong> Click "Try as Driver" or "Try as Admin" on the login page for 1-click evaluation.
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
            >
              Got it, let's park!
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
