import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, QrCode, Award, AlertCircle, 
  CheckCircle2, Download, Trash2, GraduationCap, 
  ArrowRight, ShieldCheck, Ticket, CalendarPlus, Star
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

  // Feedback modal
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

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
        addToast('Registration cancelled. Your seat was automatically promoted to the next waitlisted student.', 'info');
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

  const handleDownloadICS = (reg) => {
    try {
      const safeDate = (reg.event_date || '2026-03-15').replace(/-/g, '');
      const safeTime = (reg.event_time ? reg.event_time.replace(/:/g, '') + '00' : '100000');
      const startDateTime = `${safeDate}T${safeTime}`;
      const endDateTime = `${safeDate}T130000`;

      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//VIT-AP University//eveReg Portal//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${reg.event_title}`,
        `DESCRIPTION:Ticket Pass: ${reg.ticket_code}\\nVenue: ${reg.event_venue}\\nStudent: ${user?.full_name}`,
        `LOCATION:${reg.event_venue}`,
        `DTSTART:${startDateTime}`,
        `DTEND:${endDateTime}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(reg.event_title || 'event').replace(/[^a-zA-Z0-9]/g, '_')}_pass.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast('Event calendar reminder downloaded (.ics)', 'success');
    } catch (err) {
      addToast('Could not generate calendar file', 'error');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackTarget) return;

    setSubmittingFeedback(true);
    try {
      await api.submitFeedback(feedbackTarget.event_id, {
        rating: Number(rating),
        comments: comments.trim() || 'Valuable collegiate workshop session.',
      });
      addToast('Feedback submitted! Thank you for helping improve campus activities.', 'success');
      setFeedbackTarget(null);
      setComments('');
    } catch (err) {
      addToast(err.message || 'Could not submit feedback', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const upcomingRegs = registrations.filter((r) => r.status === 'confirmed');
  const attendedRegs = registrations.filter((r) => r.status === 'attended');
  const waitlistedRegs = registrations.filter((r) => r.status === 'waitlisted');

  const displayed = 
    activeTab === 'upcoming' ? upcomingRegs :
    activeTab === 'attended' ? attendedRegs : waitlistedRegs;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10 text-left">
      
      {/* 1. Header (Minimalist Editorial Style from Image 2) */}
      <div className="text-center space-y-2 pt-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block">
          STUDENT ACCESS & PASS LOCKER
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {user?.full_name}
        </h1>
        <div className="text-xs text-slate-500 font-medium flex items-center justify-center gap-3">
          <span>{user?.department || 'Computer Science & Engineering'}</span>
          <span>•</span>
          <span className="font-mono text-slate-700">Roll No: {user?.student_id || 'STU-2023-042'}</span>
          <span>•</span>
          <span className="text-emerald-700 font-semibold">{upcomingRegs.length} Confirmed Passes</span>
        </div>
      </div>

      {/* 2. Centered Tabs (Exact Image 2 Style) */}
      <div className="flex items-center justify-center gap-8 text-xs font-semibold tracking-wide border-b border-slate-100 pb-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-2 transition-all ${
            activeTab === 'upcoming'
              ? 'text-slate-900 font-black border-b-2 border-slate-900'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Confirmed Passes ({upcomingRegs.length})
        </button>

        <button
          onClick={() => setActiveTab('attended')}
          className={`pb-2 transition-all ${
            activeTab === 'attended'
              ? 'text-slate-900 font-black border-b-2 border-slate-900'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Certificate Locker ({attendedRegs.length})
        </button>

        <button
          onClick={() => setActiveTab('waitlisted')}
          className={`pb-2 transition-all ${
            activeTab === 'waitlisted'
              ? 'text-slate-900 font-black border-b-2 border-slate-900'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Waitlist Queue ({waitlistedRegs.length})
        </button>
      </div>

      {/* 3. Passes & Events Grid (Spacious 3-Column Image 2 Style) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No records in this section</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Browse the catalog to register for upcoming symposiums and receive your digital QR pass.
          </p>
          <Link
            to="/events"
            className="mt-4 inline-block px-6 py-2.5 bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayed.map((reg) => (
            <div
              key={reg.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between hover:shadow-xs transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-[11px]">
                  <span className="font-mono text-slate-500 font-semibold">{reg.ticket_code}</span>
                  <StatusBadge status={reg.status} type="registration" />
                </div>

                <Link
                  to={`/events/${reg.event_id}`}
                  className="font-bold text-slate-900 text-sm hover:text-orange-600 transition-colors line-clamp-2 mt-3 block"
                >
                  {reg.event_title}
                </Link>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{reg.event_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{reg.event_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{reg.event_venue}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                {reg.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => setSelectedTicket(reg)}
                      className="flex-1 py-2 px-3 rounded-none bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" /> View Pass
                    </button>
                    <button
                      onClick={() => handleDownloadICS(reg)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      title="Add to Calendar (.ics)"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCancelTarget(reg)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Cancel Seat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}

                {reg.status === 'attended' && (
                  <>
                    <Link
                      to="/certificates"
                      className="flex-1 py-2 px-3 rounded-none bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" /> PDF Certificate
                    </Link>
                    <button
                      onClick={() => setFeedbackTarget(reg)}
                      className="py-2 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" /> Rate
                    </button>
                  </>
                )}

                {reg.status === 'waitlisted' && (
                  <>
                    <span className="flex-1 text-center py-2 text-xs font-semibold text-amber-800 bg-amber-50 rounded-lg">
                      Queue Active
                    </span>
                    <button
                      onClick={() => setCancelTarget(reg)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Leave Waitlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Digital Pass Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Official Campus Event Pass"
      >
        {selectedTicket && (
          <div className="text-center space-y-4">
            <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-200 text-slate-900">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 text-left">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    VIT-AP University Student Welfare Office
                  </div>
                  <div className="font-bold text-sm text-slate-900">Official Access Pass</div>
                </div>
                <GraduationCap className="w-6 h-6 text-orange-600" />
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block shadow-xs">
                <QRCodeSVG
                  value={selectedTicket.ticket_code}
                  size={180}
                  level="H"
                  includeMargin={true}
                  fgColor="#0F172A"
                />
              </div>

              <div className="mt-4 space-y-1">
                <div className="text-xs font-mono font-bold tracking-widest text-slate-900 bg-white inline-block px-3 py-1 rounded-lg border border-slate-200">
                  {selectedTicket.ticket_code}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 pt-2">
                  {selectedTicket.event_title}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-left grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Attendee</span>
                  <span className="font-semibold text-slate-900">{selectedTicket.user_name}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Venue</span>
                  <span className="font-semibold text-slate-900">{selectedTicket.event_venue}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Present this pass at venue check-in. Compatible with smartphone cameras.
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleDownloadICS(selectedTicket)}
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-orange-600" />
                Add to Calendar
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-5 py-2 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Close Pass
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 5. Cancellation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Confirm Seat Cancellation"
      >
        {cancelTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to cancel your seat for <strong className="text-slate-900">{cancelTarget.event_title}</strong>?
            </p>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Fair-Queue Waitlist Policy:</strong>
                <p className="mt-0.5">
                  Your seat will be immediately reassigned to the next queued student on the official waitlist.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full"
              >
                Keep Seat
              </button>
              <button
                onClick={handleCancelRegistration}
                disabled={cancelling}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-2xs"
              >
                {cancelling ? 'Releasing Seat...' : 'Confirm Release'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 6. Event Feedback Modal */}
      <Modal
        isOpen={!!feedbackTarget}
        onClose={() => setFeedbackTarget(null)}
        title={`Submit Feedback: ${feedbackTarget?.event_title || ''}`}
      >
        {feedbackTarget && (
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Overall Session Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Feedback & Comments
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your thoughts on the event agenda, speaker, venue organization, and key takeaways..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingFeedback}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-orange-600 rounded-full shadow-xs"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}
