import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, QrCode, Award, AlertCircle, 
  CheckCircle2, Download, Trash2, GraduationCap, 
  ArrowRight, ShieldCheck, Ticket, CalendarPlus, Star, Sparkles, Users
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // available, upcoming, attended, waitlisted
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [eventCategory, setEventCategory] = useState('All');
  const [registeringId, setRegisteringId] = useState(null);

  // Feedback modal
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [regsData, eventsData] = await Promise.all([
        api.getMyRegistrations().catch(() => []),
        api.getEvents().catch(() => [])
      ]);
      setRegistrations(regsData);
      setAllEvents(eventsData);
    } catch (err) {
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEvent = async (eventId) => {
    setRegisteringId(eventId);
    try {
      const res = await api.registerForEvent(eventId);
      if (res.status === 'confirmed') {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
        addToast('Registration confirmed! Access pass added to your locker.', 'success');
      } else {
        addToast('Placed on the priority waitlist queue.', 'warning');
      }
      await loadDashboardData();
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setRegisteringId(null);
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
      loadDashboardData();
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
      await api.submitFeedback({
        event_id: feedbackTarget.event_id,
        rating: Number(rating),
        comment: comments.trim() || 'Valuable collegiate workshop session.',
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

  // Filter available events (approved & upcoming)
  const openEvents = allEvents.filter((e) => e.status === 'approved');
  const filteredAvailableEvents = eventCategory === 'All' 
    ? openEvents 
    : openEvents.filter((e) => e.category === eventCategory);

  const categories = ['All', 'Technical', 'Workshop', 'Cultural', 'Sports', 'Academic', 'Seminar', 'Competition', 'Other'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10 text-left">
      
      {/* 1. Header (Minimalist Editorial Style) */}
      <div className="text-center space-y-2 pt-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block">
          STUDENT PORTAL & CAMPUS ACTIVITY LOCKER
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {user?.full_name}
        </h1>
        <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span>{user?.department || 'Computer Science & Engineering'}</span>
          <span>•</span>
          <span className="font-mono text-slate-700">Roll No: {user?.student_id || '24MIS1001'}</span>
          <span>•</span>
          <span className="text-emerald-700 font-semibold">{upcomingRegs.length} Confirmed Pass{upcomingRegs.length === 1 ? '' : 'es'}</span>
        </div>
      </div>

      {/* 2. Centered Tabs */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 text-xs font-semibold tracking-wide border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-2 transition-all whitespace-nowrap ${
            activeTab === 'available'
              ? 'text-slate-900 font-black border-b-2 border-slate-900'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Available Events ({openEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-2 transition-all whitespace-nowrap ${
            activeTab === 'upcoming'
              ? 'text-slate-900 font-black border-b-2 border-slate-900'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          My Passes ({upcomingRegs.length})
        </button>

        <button
          onClick={() => setActiveTab('attended')}
          className={`pb-2 transition-all whitespace-nowrap ${
            activeTab === 'attended'
              ? 'text-slate-900 font-black border-b-2 border-slate-900'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Certificate Locker ({attendedRegs.length})
        </button>

        <button
          onClick={() => setActiveTab('waitlisted')}
          className={`pb-2 transition-all whitespace-nowrap ${
            activeTab === 'waitlisted'
              ? 'text-slate-900 font-black border-b-2 border-slate-900'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Waitlist Queue ({waitlistedRegs.length})
        </button>
      </div>

      {/* 3. TAB 1: Available Events to Discover & Register */}
      {activeTab === 'available' && (
        <div className="space-y-8">
          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setEventCategory(cat)}
                className={`px-3 py-1.5 rounded-full transition-all text-xs ${
                  eventCategory === cat
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'bg-[#F8F9FA] text-slate-600 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-4/3 rounded-3xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredAvailableEvents.length === 0 ? (
            <div className="text-center py-20 bg-[#F8F9FA] rounded-3xl border border-dashed border-slate-200">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-900">No open events in this category</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Check back soon or switch categories to explore other sessions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAvailableEvents.map((ev) => {
                const regFound = registrations.find((r) => r.event_id === ev.id && r.status !== 'cancelled');
                const isFull = (ev.registered_count || 0) >= (ev.capacity || 100);
                const percent = Math.min(100, Math.round(((ev.registered_count || 0) / (ev.capacity || 100)) * 100));

                return (
                  <div
                    key={ev.id}
                    className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative aspect-16/10 bg-[#F8F9FA] overflow-hidden">
                        <img
                          src={ev.poster_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"}
                          alt={ev.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                        {/* Circular Category Badge */}
                        <div className="absolute top-3.5 left-3.5">
                          <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold tracking-tight shadow-sm">
                            {ev.category?.slice(0, 4).toUpperCase()}
                          </span>
                        </div>
                        {/* Full / Open Tag */}
                        <div className="absolute top-3.5 right-3.5">
                          {isFull ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                              Waitlist
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                              Open
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 sm:p-6 space-y-3">
                        <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
                          {ev.category}
                        </div>
                        <Link
                          to={`/events/${ev.id}`}
                          className="text-base font-semibold text-slate-900 hover:text-orange-600 transition-colors line-clamp-1 block"
                        >
                          {ev.title}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {ev.description}
                        </p>

                        <div className="pt-2 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{ev.date} • {ev.start_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{ev.venue}</span>
                          </div>
                        </div>

                        {/* Capacity meter */}
                        <div className="pt-2">
                          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> Seats
                            </span>
                            <span>{ev.registered_count} / {ev.capacity}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${isFull ? 'bg-amber-500' : 'bg-slate-900'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-5 sm:p-6 pt-0 border-t border-slate-50 flex items-center gap-2">
                      {regFound ? (
                        <button
                          onClick={() => {
                            if (regFound.status === 'confirmed') setSelectedTicket(regFound);
                            else setActiveTab(regFound.status === 'attended' ? 'attended' : 'waitlisted');
                          }}
                          className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {regFound.status === 'confirmed' ? 'Pass Ready (View QR)' : `Status: ${regFound.status}`}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRegisterEvent(ev.id)}
                            disabled={registeringId === ev.id}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white transition-colors flex items-center justify-center gap-1.5 ${
                              isFull
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : 'bg-slate-900 hover:bg-orange-600'
                            }`}
                          >
                            {registeringId === ev.id ? 'Processing...' : isFull ? 'Join Waitlist' : 'Register Free'}
                          </button>
                          <Link
                            to={`/events/${ev.id}`}
                            className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:border-slate-900 text-xs font-semibold transition-colors"
                          >
                            Details
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2, 3, 4: My Passes, Certificates & Waitlist */}
      {activeTab !== 'available' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-4/3 rounded-3xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (activeTab === 'upcoming' ? upcomingRegs : activeTab === 'attended' ? attendedRegs : waitlistedRegs).length === 0 ? (
            <div className="text-center py-20 bg-[#F8F9FA] rounded-3xl border border-dashed border-slate-200">
              <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-900">No records in this section</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Explore available events to register and receive your official digital pass.
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="mt-4 inline-block px-6 py-2.5 bg-slate-900 hover:bg-orange-600 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
              >
                Browse Available Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(activeTab === 'upcoming' ? upcomingRegs : activeTab === 'attended' ? attendedRegs : waitlistedRegs).map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-3xl border border-slate-100 bg-[#F8F9FA] p-6 flex flex-col justify-between hover:shadow-xs transition-all space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 text-[11px]">
                      <span className="font-mono text-slate-500 font-semibold">{reg.ticket_code}</span>
                      <StatusBadge status={reg.status} type="registration" />
                    </div>

                    <Link
                      to={`/events/${reg.event_id}`}
                      className="font-semibold text-slate-900 text-base hover:text-orange-600 transition-colors line-clamp-2 mt-3 block"
                    >
                      {reg.event_title}
                    </Link>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-500 font-normal">
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
                  <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2">
                    {reg.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => setSelectedTicket(reg)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-orange-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5" /> View Pass
                        </button>
                        <button
                          onClick={() => handleDownloadICS(reg)}
                          className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition-colors"
                          title="Add to Calendar (.ics)"
                        >
                          <CalendarPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCancelTarget(reg)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
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
                          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-orange-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" /> PDF Certificate
                        </Link>
                        <button
                          onClick={() => setFeedbackTarget(reg)}
                          className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500" /> Rate
                        </button>
                      </>
                    )}

                    {reg.status === 'waitlisted' && (
                      <>
                        <span className="flex-1 text-center py-2.5 text-xs font-semibold text-amber-800 bg-amber-50 rounded-xl">
                          Queue Active
                        </span>
                        <button
                          onClick={() => setCancelTarget(reg)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
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
        </>
      )}

      {/* Digital Pass Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Official Campus Event Pass"
      >
        {selectedTicket && (
          <div className="text-center space-y-4">
            <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 text-slate-900">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/60 text-left">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    VIT-AP University Student Affairs
                  </div>
                  <div className="font-semibold text-sm text-slate-900">Official Access Pass</div>
                </div>
                <GraduationCap className="w-6 h-6 text-slate-900" />
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-100 inline-block shadow-2xs">
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
                <h3 className="text-base font-bold text-slate-900 pt-2">
                  {selectedTicket.event_title}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 text-left grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Attendee</span>
                  <span className="font-semibold text-slate-900">{selectedTicket.user_name}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">College ID</span>
                  <span className="font-mono text-slate-900 font-semibold">{user?.student_id || '24MIS1001'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadICS(selectedTicket)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:border-slate-900 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <CalendarPlus className="w-3.5 h-3.5" /> Save to Calendar (.ics)
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-orange-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Confirm Cancellation"
      >
        {cancelTarget && (
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Are you sure you want to cancel your registration for{' '}
              <strong className="text-slate-900">{cancelTarget.event_title}</strong>?
            </p>
            <p className="text-xs text-slate-500">
              Your seat will be immediately promoted to the next waitlisted student.
            </p>
            <div className="pt-4 flex justify-end gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Keep Seat
              </button>
              <button
                onClick={handleCancelRegistration}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Seat'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={!!feedbackTarget}
        onClose={() => setFeedbackTarget(null)}
        title="Rate & Review Event"
      >
        {feedbackTarget && (
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div>
              <div className="font-semibold text-sm text-slate-900">{feedbackTarget.event_title}</div>
              <div className="text-xs text-slate-400 mt-0.5">Share your feedback to help improve future events</div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Rating
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Review Comments
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="What did you learn or enjoy most about this session?"
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFeedbackTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingFeedback}
                className="px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-slate-900 hover:bg-orange-600 transition-colors"
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
