import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white text-slate-500 text-xs py-12 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 text-center">
        
        {/* Minimalist Horizontal Nav Links (Matching User Reference Image 2) */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <Link to="/" className="hover:text-orange-600 transition-colors">About Campus</Link>
          <Link to="/events" className="hover:text-orange-600 transition-colors">Event Schedule</Link>
          <Link to="/certificates" className="hover:text-orange-600 transition-colors">Certificate Verification</Link>
          <span className="text-slate-400">Activity Credits</span>
          <span className="text-slate-400">Attendance Policy</span>
        </div>

        {/* Minimalist Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 text-[11px] text-slate-400">
          <div>
            © 2026 <strong className="text-slate-700">vitap eveReg</strong>. All rights reserved • VIT-AP University Directorate of Student Welfare.
          </div>

          <div className="flex items-center gap-3 font-semibold text-slate-500 text-[10px] uppercase tracking-wider">
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">NAAC A++</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">UGC ACCREDITED</span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Verifiable PDF
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
