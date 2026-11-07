import React from 'react';
import { Car, ShieldCheck, Zap, Heart } from 'lucide-react';

// Reusable footer displaying system information, quick links, and branding
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">SmartPark</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Smart Parking Reservation and Management System for Bengaluru. Effortlessly book verified parking spots in seconds.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Lots</span>
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Instant Confirmation</span>
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Popular Locations</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>MG Road & Brigade Rd</li>
              <li>Indiranagar 100ft Hub</li>
              <li>Koramangala 5th Block</li>
              <li>Whitefield ITPL Parkade</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Demo Credentials</h4>
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <p><strong className="text-slate-700 dark:text-slate-300">Driver:</strong> user@smartpark.com / User@123</p>
              <p><strong className="text-slate-700 dark:text-slate-300">Admin:</strong> admin@smartpark.com / Admin@123</p>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} SmartPark. College Full Stack Development Case Study.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> using React, Node.js & MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
}
