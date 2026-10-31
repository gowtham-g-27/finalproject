import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, QrCode, Award, AlertCircle, 
  CheckCircle2, Download, Trash2, ExternalLink, GraduationCap, 
  Printer, ArrowRight, ShieldCheck, Ticket
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, attended, waitlisted
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await api.getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      addToast('Failed to load your registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await api.cancelRegistration(cancelTarget.id);
      if (res.promoted_waitlist) {
        addToast('Registration cancelled. Your vacated seat was automatically promoted to the next waitlisted student.', 'info');
      } else {
        addToast('Registration cancelled successfully.', 'info');
      }
      setCancelTarget(null);
      loadRegistrations();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  const upcomingRegs = registrations.filter((r) => r.status === 'confirmed');
  const attendedRegs = registrations.filter((r) => r.status === 'attended');
  const waitlistedRegs = registrations.filter((r) => r.status === 'waitlisted');

  const displayed = 
    activeTab === 'upcoming' ? upcomingRegs :
    activeTab === 'attended' ? attendedRegs : waitlistedRegs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Student Profile Overview Card (Real Collegiate Intranet Style) */}
      <div className="bg-white rounded-2xl border border-orange-100 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold text-xl uppercase shadow-xs shrink-0">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200/80 mb-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
                Enrolled Student Account
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {user?.full_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                <span>{user?.department || 'Computer Science'}</span>
                <span>•</span>
                <span className="font-mono text-slate-700">Roll No: {user?.student_id || 'STU-2023-042'}</span>
                <span>•</span>
                <span className="text-slate-600">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Activity Credit Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-orange-50/50 rounded-xl px-4 py-3 text-center border border-orange-100">
              <div className="text-xl font-extrabold text-slate-900">{upcomingRegs.length}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Confirmed</div>
            </div>
            <div className="bg-purple-50/50 rounded-xl px-4 py-3 text-center border border-purple-100">
              <div className="text-xl font-extrabold text-purple-700">{attendedRegs.length}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Certificates</div>
            </div>
            <div className="bg-amber-50/50 rounded-xl px-4 py-3 text-center border border-amber-100">
              <div className="text-xl font-extrabold text-amber-700">{waitlistedRegs.length}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Waitlisted</div>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-orange-100 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'border-orange-600 text-orange-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Ticket className="w-4 h-4" />
          Confirmed Entry Passes ({upcomingRegs.length})
        </button>

        <button
          onClick={() => setActiveTab('attended')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'attended'
              ? 'border-orange-600 text-orange-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          Attended & Earned Certificates ({attendedRegs.length})
        </button>

        <button
          onClick={() => setActiveTab('waitlisted')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'waitlisted'
              ? 'border-orange-600 text-orange-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Waitlist Queue ({waitlistedRegs.length})
        </button>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-orange-50/50 animate-pulse border border-orange-100" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-orange-200">
          <Calendar className="w-10 h-10 text-orange-400 mx-auto mb-2.5" />
          <h3 className="font-bold text-slate-900 text-sm">No records found in this section</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Explore university activities and competitions scheduled for this term.
          </p>
          <Link
            to="/events"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-2xs"
          >
            Browse Campus Events <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-2xl border border-orange-100 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <StatusBadge status={reg.status} type="registration" />
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {reg.ticket_code}
                  </span>
                </div>

                <Link
                  to={`/events/${reg.event_id}`}
                  className="font-bold text-slate-900 text-base hover:text-orange-600 transition-colors line-clamp-2"
                >
                  {reg.event_title}
                </Link>

                <div className="mt-4 space-y-2 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    <span>{reg.event_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>{reg.event_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span className="truncate">{reg.event_venue}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-orange-100/70 flex items-center gap-2">
                {reg.status === 'confirmed' && (
                  <button
                    onClick={() => setSelectedTicket(reg)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-2xs transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Show Digital Pass
                  </button>
                )}

                {reg.status === 'attended' && (
                  <Link
                    to="/certificates"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-2xs transition-colors"
                  >
                    <Award className="w-3.5 h-3.5" /> Download Certificate
                  </Link>
                )}

                {reg.status === 'waitlisted' && (
                  <div className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Waitlist Queue Active
                  </div>
                )}

                {reg.status !== 'attended' && (
                  <button
                    onClick={() => setCancelTarget(reg)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Cancel Registration"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Collegiate Digital Access Pass Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Official Campus Event Entry Pass"
      >
        {selectedTicket && (
          <div className="text-center space-y-6">
            
            {/* Ticket Card */}
            <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-200 text-slate-900 shadow-inner">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-orange-200 text-left">
                <div>
                  <div className="text-[10px] font-bold text-orange-800 uppercase tracking-widest">
                    Apex University Student Affairs
                  </div>
                  <div className="font-bold text-sm text-slate-900">Official Access Pass</div>
                </div>
                <GraduationCap className="w-6 h-6 text-orange-600" />
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-xl border border-orange-200 inline-block shadow-xs">
                <QRCodeSVG
                  value={selectedTicket.ticket_code}
                  size={180}
                  level="H"
                  includeMargin={true}
                  fgColor="#0F172A"
                />
              </div>

              <div className="mt-4 space-y-1">
                <div className="text-xs font-mono font-bold tracking-widest text-orange-700 bg-white inline-block px-3 py-1 rounded-lg border border-orange-200">
                  {selectedTicket.ticket_code}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 pt-2">
                  {selectedTicket.event_title}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-orange-200/70 text-left grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Attendee</span>
                  <span className="font-semibold text-slate-900">{selectedTicket.user_name}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Venue & Date</span>
                  <span className="font-semibold text-slate-900">{selectedTicket.event_venue}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Present this code at the venue gate for organizer check-in verification.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Close Pass
              </button>
            </div>

          </div>
        )}
      </Modal>

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Confirm Seat Cancellation"
      >
        {cancelTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to cancel your registration for <strong className="text-slate-900">{cancelTarget.event_title}</strong>?
            </p>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Automatic Waitlist Promotion Policy:</strong>
                <p className="mt-0.5">
                  Your seat will be immediately reassigned to the next queued student on the official waitlist.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Keep My Seat
              </button>
              <button
                onClick={handleCancelRegistration}
                disabled={cancelling}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs"
              >
                {cancelling ? 'Releasing Seat...' : 'Confirm & Release Seat'}
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
