import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, QrCode, Award, AlertCircle, 
  CheckCircle2, Download, Trash2, ExternalLink 
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
      await api.cancelRegistration(cancelTarget.id);
      addToast('Registration successfully cancelled', 'info');
      setCancelTarget(null);
      loadRegistrations();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  const upcomingRegs = registrations.filter(
    (r) => r.status === 'confirmed'
  );
  const attendedRegs = registrations.filter(
    (r) => r.status === 'attended'
  );
  const waitlistedRegs = registrations.filter(
    (r) => r.status === 'waitlisted'
  );

  const displayed = 
    activeTab === 'upcoming' ? upcomingRegs :
    activeTab === 'attended' ? attendedRegs : waitlistedRegs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Profile Summary */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm mb-2">
              Student Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{user?.full_name}</h1>
            <p className="text-xs sm:text-sm text-orange-100 mt-1">
              {user?.department} • Roll No: {user?.student_id || 'STU-2026'}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/20">
              <div className="text-2xl font-black">{upcomingRegs.length}</div>
              <div className="text-[11px] font-semibold text-orange-100">Confirmed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/20">
              <div className="text-2xl font-black">{attendedRegs.length}</div>
              <div className="text-[11px] font-semibold text-orange-100">Attended</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/20">
              <div className="text-2xl font-black">{waitlistedRegs.length}</div>
              <div className="text-[11px] font-semibold text-orange-100">Waitlist</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-orange-100 gap-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Confirmed Tickets ({upcomingRegs.length})
        </button>

        <button
          onClick={() => setActiveTab('attended')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'attended'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Attended & Certificates ({attendedRegs.length})
        </button>

        <button
          onClick={() => setActiveTab('waitlisted')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'waitlisted'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
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
            <div key={i} className="h-60 rounded-2xl bg-orange-50/50 animate-pulse border border-orange-100" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="p-16 text-center bg-orange-50/20 rounded-3xl border border-dashed border-orange-200">
          <Calendar className="w-10 h-10 text-orange-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">No registrations in this section</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Ready to participate in upcoming university activities?
          </p>
          <Link
            to="/events"
            className="mt-4 inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-sm"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-2xl border border-orange-100 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <StatusBadge status={reg.status} type="registration" />
                  <span className="text-[10px] font-mono text-slate-400">{reg.ticket_code}</span>
                </div>

                <Link
                  to={`/events/${reg.event_id}`}
                  className="font-bold text-slate-900 text-base hover:text-orange-600 transition-colors line-clamp-2"
                >
                  {reg.event_title}
                </Link>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
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

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-orange-50 flex items-center gap-2">
                {reg.status === 'confirmed' && (
                  <button
                    onClick={() => setSelectedTicket(reg)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Show QR Ticket
                  </button>
                )}

                {reg.status === 'attended' && (
                  <Link
                    to="/certificates"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
                  >
                    <Award className="w-3.5 h-3.5" /> Get Certificate
                  </Link>
                )}

                {reg.status === 'waitlisted' && (
                  <div className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Waitlist Active
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

      {/* QR Code Ticket Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Event Access Pass"
      >
        {selectedTicket && (
          <div className="text-center space-y-6">
            <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 inline-block shadow-inner">
              <QRCodeSVG
                value={selectedTicket.ticket_code}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#0F172A"
              />
            </div>

            <div>
              <div className="text-xs font-mono font-bold tracking-widest text-orange-600 bg-orange-50 inline-block px-3 py-1 rounded-full border border-orange-200">
                {selectedTicket.ticket_code}
              </div>
              <h3 className="mt-3 font-extrabold text-slate-900 text-lg">
                {selectedTicket.event_title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Attendee: <strong className="text-slate-800">{selectedTicket.user_name}</strong> ({selectedTicket.user_email})
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-center gap-2">
              <QrCode className="w-4 h-4 text-orange-500" />
              Present this QR code to the event organizer at the entrance gate.
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Registration"
      >
        {cancelTarget && (
          <div>
            <p className="text-sm text-slate-600">
              Are you sure you want to cancel your seat for <strong className="text-slate-900">{cancelTarget.event_title}</strong>?
              Your ticket will be released immediately to waitlisted candidates.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Keep Seat
              </button>
              <button
                onClick={handleCancelRegistration}
                disabled={cancelling}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
