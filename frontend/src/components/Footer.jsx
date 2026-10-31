import React from 'react';
import { GraduationCap, Building2, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-orange-100 bg-orange-50/40 text-slate-600 mt-20 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: University Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span>Apex University</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Directorate of Student Affairs & Campus Engagement. Official central platform for inter-collegiate symposiums, workshops, varsity sports, and cultural festivals.
            </p>
          </div>

          {/* Col 2: Campus Portals */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">Portals & Navigation</div>
            <ul className="space-y-1.5 text-slate-600">
              <li><Link to="/events" className="hover:text-orange-600">Event Schedule & Catalog</Link></li>
              <li><Link to="/dashboard" className="hover:text-orange-600">Student Entry Passes (Tickets)</Link></li>
              <li><Link to="/organizer" className="hover:text-orange-600">Faculty Coordinator Studio</Link></li>
              <li><Link to="/admin" className="hover:text-orange-600">Board Review Console</Link></li>
            </ul>
          </div>

          {/* Col 3: Student Verification & Credentials */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">Academic Records</div>
            <ul className="space-y-1.5 text-slate-600">
              <li><Link to="/certificates" className="hover:text-orange-600">Certificate Verification Portal</Link></li>
              <li><span className="text-slate-400">Activity Credit Eligibility Guidelines</span></li>
              <li><span className="text-slate-400">Student Attendance Policies</span></li>
              <li><span className="text-slate-400">Fair-Queue Waitlist Regulations</span></li>
            </ul>
          </div>

          {/* Col 4: Contact & Helpdesk */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">Campus Life Helpdesk</div>
            <div className="space-y-1 text-slate-500 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-orange-600" />
                <span>Student Affairs Complex, Room 204</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-orange-600" />
                <span>studentaffairs@campus.edu</span>
              </div>
              <div className="pt-2 text-[10px] text-slate-400">
                Official Academic Term 2025–2026
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 Apex University. Smart College Event Management System (NexEvent). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Accreditation & Audit Compliant
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
