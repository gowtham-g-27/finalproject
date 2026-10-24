import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-orange-100 bg-orange-50/30 text-slate-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">NexEvent Campus Platform</p>
              <p className="text-xs text-slate-500">Smart College Event Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <span>FastAPI Backend</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <span>React + Vite</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <span>Firebase & Firestore Ready</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <span>QR Attendance</span>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1">
            Production Ready University Engineering Project
          </div>
        </div>
      </div>
    </footer>
  );
}
