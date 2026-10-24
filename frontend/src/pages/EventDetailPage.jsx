import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Users, Award, ShieldAlert, 
  Share2, Download, Star, CheckCircle2, AlertCircle, ArrowLeft, Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent } = useAuth();
  const { addToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myRegistration, setMyRegistration] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // New Feedback Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    loadEventDetails();
  }, [id, user]);

  const loadEventDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getEvent(id);
      setEvent(data);

      // Check if current user is registered
      if (user) {
        const myRegs = await api.getMyRegistrations();
        const found = myRegs.find((r) => r.event_id === id && r.status !== 'cancelled');
        setMyRegistration(found || null);
      }

      // Load feedback
      const fb = await api.getEventFeedback(id);
      setFeedbackData(fb);
    } catch (err) {
      addToast(err.message || 'Failed to load event details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.registerForEvent(id);
      setMyRegistration(res);
      
      if (res.status === 'confirmed') {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        addToast(`Successfully registered! Your ticket is confirmed.`, 'success');
      } else {
        addToast(`Placed on the waitlist. You will be notified when a seat opens.`, 'warning');
      }
      
      // Refresh event capacity
      const updatedEv = await api.getEvent(id);
      setEvent(updatedEv);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!myRegistration) return;
    setSubmitting(true);
    try {
      await api.cancelRegistration(myRegistration.id);
      setShowCancelModal(false);
      setMyRegistration(null);
      addToast('Registration cancelled.', 'info');

      // Refresh event
      const updatedEv = await api.getEvent(id);
      setEvent(updatedEv);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCalendar = async () => {
    try {
      const blob = await api.downloadCalendarIcs(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast('Event added to calendar download', 'success');
    } catch (err) {
      addToast('Failed to generate calendar file', 'error');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      addToast('Please enter a feedback comment', 'warning');
      return;
    }

    setSubmittingFeedback(true);
    try {
      await api.submitFeedback({
        event_id: id,
        rating,
        comment: comment.trim(),
        organization_rating: rating,
        content_rating: rating,
      });
      setComment('');
      addToast('Thank you for your feedback!', 'success');
      // Reload feedback
      const fb = await api.getEventFeedback(id);
      setFeedbackData(fb);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-64 bg-orange-100/60 rounded-3xl mb-8" />
        <div className="h-8 bg-orange-100 rounded-lg w-1/2 mx-auto mb-4" />
        <div className="h-4 bg-orange-50 rounded-lg w-3/4 mx-auto" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-orange-100 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Event Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested event does not exist or may have been unlisted.</p>
        <Link to="/events" className="mt-6 inline-block text-sm font-semibold text-orange-600 hover:underline">
          Return to Browse Events
        </Link>
      </div>
    );
  }

  const isFull = event.registered_count >= event.capacity;
  const spotsLeft = Math.max(0, event.capacity - event.registered_count);
  const percentFilled = Math.min(100, Math.round((event.registered_count / event.capacity) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to events
      </button>

      {/* Main Event Card */}
      <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="relative h-72 sm:h-96 w-full bg-slate-900">
          <img
            src={event.poster_url || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80"}
            alt={event.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-900 shadow-sm">
              {event.category}
            </span>
            <StatusBadge status={event.status} />
          </div>

          {/* Banner bottom info */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {event.title}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-orange-200">
              Organized by <span className="font-semibold text-white">{event.organizer_name}</span>
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900">About this Event</h2>
              <p className="mt-3 text-slate-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {event.description}
              </p>
            </div>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Topic Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Eligibility */}
            <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Eligibility & Prerequisites
              </h3>
              <p className="text-sm text-slate-600">
                {event.eligibility || 'Open to all registered university students.'}
              </p>
            </div>

            {/* Calendar & Share actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-orange-50">
              <button
                onClick={handleDownloadCalendar}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-orange-200 hover:bg-orange-50 transition-colors shadow-xs"
              >
                <Calendar className="w-4 h-4 text-orange-600" /> Add to Calendar (.ics)
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  addToast('Event link copied to clipboard!', 'info');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-orange-200 hover:bg-orange-50 transition-colors shadow-xs"
              >
                <Share2 className="w-4 h-4 text-orange-600" /> Share Event
              </button>
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <div className="space-y-6">
            <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-200/80 shadow-xs space-y-6">
              <h3 className="font-bold text-slate-900 text-base">Date & Venue</h3>

              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">{event.date}</div>
                    <div className="text-slate-500">Event Date</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">{event.start_time} - {event.end_time}</div>
                    <div className="text-slate-500">Time Duration</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">{event.venue}</div>
                    <div className="text-slate-500">Campus Location</div>
                  </div>
                </div>
              </div>

              {/* Capacity status */}
              <div className="pt-4 border-t border-orange-200/60">
                <div className="flex justify-between items-center text-xs mb-1.5 font-semibold">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> Seating Capacity
                  </span>
                  <span>{event.registered_count} / {event.capacity}</span>
                </div>

                <div className="w-full bg-orange-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isFull ? 'bg-amber-500' : 'bg-orange-500'}`}
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>

                {isFull && (
                  <p className="text-[11px] text-amber-700 font-semibold mt-2">
                    Event is currently full. Registrations will join the priority waitlist.
                  </p>
                )}
              </div>

              {/* Registration CTA Button */}
              {myRegistration ? (
                <div className="p-4 rounded-xl bg-white border border-emerald-200 space-y-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    You are registered!
                  </div>
                  <div className="text-xs text-slate-600">
                    Status: <span className="font-bold uppercase text-slate-800">{myRegistration.status}</span>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Link
                      to="/dashboard"
                      className="w-full py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition-colors"
                    >
                      View QR Ticket
                    </Link>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="text-xs text-rose-600 hover:underline font-medium"
                    >
                      Cancel Registration
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={submitting}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-md active:scale-[0.98] ${
                    isFull
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25'
                      : 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/25'
                  }`}
                >
                  {submitting
                    ? 'Processing...'
                    : isFull
                    ? `Join Waitlist (${event.waitlist_count} waiting)`
                    : 'Register for Free'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Feedback Section */}
      <div className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-orange-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Attendee Reviews & Feedback</h2>
            <p className="text-xs text-slate-500 mt-1">Verified reviews from participating campus students</p>
          </div>

          {feedbackData && (
            <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              <div>
                <div className="text-lg font-extrabold text-slate-900 leading-none">
                  {feedbackData.average_rating > 0 ? feedbackData.average_rating : '5.0'}
                  <span className="text-xs text-slate-500 font-normal"> / 5.0</span>
                </div>
                <div className="text-[10px] text-slate-500">{feedbackData.total_reviews} total reviews</div>
              </div>
            </div>
          )}
        </div>

        {/* Submit feedback if registered or attended */}
        {user && (
          <form onSubmit={handleSubmitFeedback} className="bg-orange-50/40 p-5 rounded-2xl border border-orange-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Leave Your Rating & Feedback</h3>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">Your Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              placeholder="What did you learn or enjoy most about this event?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <button
              type="submit"
              disabled={submittingFeedback}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" /> Submit Review
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {feedbackData?.reviews?.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No reviews submitted yet for this event.
            </p>
          ) : (
            feedbackData?.reviews?.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-orange-50 bg-white">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{r.user_name}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Confirm Cancellation"
      >
        <p className="text-sm text-slate-600 leading-relaxed">
          Are you sure you want to cancel your registration for <strong className="text-slate-900">{event.title}</strong>?
          If other students are waitlisted, your seat will immediately be offered to the next student in line.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setShowCancelModal(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
          >
            Keep Registration
          </button>
          <button
            onClick={handleCancelRegistration}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
          >
            {submitting ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </Modal>

    </div>
  );
}
