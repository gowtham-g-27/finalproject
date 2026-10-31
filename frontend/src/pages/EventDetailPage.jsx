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
      <div className="max-w-6xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-96 bg-slate-100 rounded-3xl mb-8" />
        <div className="h-8 bg-slate-100 rounded-lg w-1/3 mx-auto mb-4" />
        <div className="h-4 bg-slate-50 rounded-lg w-1/2 mx-auto" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto my-24 p-10 text-center bg-white rounded-3xl border border-slate-100 shadow-2xs">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-medium tracking-tight text-slate-900">Event Not Found</h2>
        <p className="text-sm text-slate-400 mt-2">The requested event does not exist or may have been unlisted.</p>
        <Link to="/events" className="mt-6 inline-block text-xs uppercase tracking-widest font-bold text-slate-900 hover:text-orange-600 border-b border-slate-900 pb-0.5">
          Return to Events
        </Link>
      </div>
    );
  }

  const isFull = event.registered_count >= event.capacity;
  const spotsLeft = Math.max(0, event.capacity - event.registered_count);
  const percentFilled = Math.min(100, Math.round((event.registered_count / event.capacity) * 100));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Back link */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to catalogue
        </button>
        <div className="text-[11px] uppercase tracking-widest text-slate-400">
          Ref #{event.id?.slice(0, 8)}
        </div>
      </div>

      {/* Main Grid: Left image showcase, Right details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left column: Visual showcase with circular badges */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative bg-[#F8F9FA] rounded-3xl p-4 sm:p-6 border border-slate-100 overflow-hidden group">
            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={event.poster_url || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80"}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
              />
            </div>

            {/* Circular badge chips matching Lezada */}
            <div className="absolute top-8 left-8 flex flex-col gap-2">
              <span className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold tracking-tight shadow-sm">
                {event.category?.slice(0, 4)?.toUpperCase() || 'EVT'}
              </span>
              {isFull ? (
                <span className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold tracking-tight shadow-sm">
                  WAIT
                </span>
              ) : (
                <span className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold tracking-tight shadow-sm">
                  OPEN
                </span>
              )}
            </div>

            <div className="absolute top-8 right-8">
              <StatusBadge status={event.status} />
            </div>
          </div>

          {/* About description */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 space-y-6">
            <div>
              <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3">About this Event</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base font-normal">
                {event.description}
              </p>
            </div>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">Topic Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full text-xs text-slate-600 bg-[#F8F9FA] border border-slate-200/60"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Eligibility */}
            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-slate-100">
              <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-1">
                Eligibility & Prerequisites
              </h3>
              <p className="text-xs text-slate-500">
                {event.eligibility || 'Open to all registered university students.'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleDownloadCalendar}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-slate-900 transition-colors shadow-2xs"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-900" /> Add to Calendar (.ics)
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  addToast('Event link copied to clipboard!', 'info');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:border-slate-900 transition-colors shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-900" /> Share Event
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Registration & Schedule Details */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-[#F8F9FA] rounded-3xl p-6 sm:p-8 border border-slate-100 space-y-6">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-1">
                {event.category}
              </div>
              <h1 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight leading-snug">
                {event.title}
              </h1>
              <div className="mt-2 text-xs text-slate-500">
                Organized by <span className="font-semibold text-slate-900">{event.organizer_name}</span>
              </div>
            </div>

            {/* Meta specification list */}
            <div className="space-y-4 pt-4 border-t border-slate-200/60 text-xs text-slate-700">
              <div className="flex items-start justify-between py-1 border-b border-slate-200/40">
                <span className="text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </span>
                <span className="font-semibold text-slate-900">{event.date}</span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-slate-200/40">
                <span className="text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Duration
                </span>
                <span className="font-semibold text-slate-900">{event.start_time} - {event.end_time}</span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-slate-200/40">
                <span className="text-slate-400 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Campus Location
                </span>
                <span className="font-semibold text-slate-900 text-right">{event.venue}</span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-slate-200/40">
                <span className="text-slate-400 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> Seats Taken
                </span>
                <span className="font-semibold text-slate-900">{event.registered_count} / {event.capacity}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isFull ? 'bg-rose-500' : 'bg-slate-900'} transition-all duration-500`}
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                <span>{spotsLeft > 0 ? `${spotsLeft} seats remaining` : 'Capacity reached'}</span>
                <span>{percentFilled}% full</span>
              </div>
            </div>

            {/* Registration CTA Button */}
            {myRegistration ? (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Registration confirmed
                </div>
                <div className="text-xs text-slate-500">
                  Access Status: <span className="font-bold uppercase text-slate-900">{myRegistration.status}</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/dashboard"
                    className="w-full py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-slate-900 hover:bg-orange-600 text-white transition-colors"
                  >
                    View QR Access Pass
                  </Link>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    Cancel Registration
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={submitting}
                className={`w-full py-3.5 rounded-xl font-bold uppercase text-xs tracking-widest text-white transition-all shadow-xs active:scale-[0.99] ${
                  isFull
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-slate-900 hover:bg-orange-600'
                }`}
              >
                {submitting
                  ? 'Processing...'
                  : isFull
                  ? `Join Priority Waitlist (${event.waitlist_count} ahead)`
                  : 'Register for Access'}
              </button>
            )}
          </div>

          {/* Quick Security & Eligibility badge */}
          <div className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-3 text-xs text-slate-500">
            <Award className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Digital attendance badge & verified certificate issued upon check-in.</span>
          </div>

        </div>

      </div>

      {/* Reviews & Feedback Section */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-normal text-slate-900 tracking-tight">Attendee Feedback & Reviews</h2>
            <p className="text-xs text-slate-400 mt-1">Verified reviews from participating students</p>
          </div>

          {feedbackData && (
            <div className="flex items-center gap-3 bg-[#F8F9FA] px-4 py-2.5 rounded-2xl border border-slate-100">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <div>
                <div className="text-base font-bold text-slate-900 leading-none">
                  {feedbackData.average_rating > 0 ? feedbackData.average_rating : '5.0'}
                  <span className="text-xs text-slate-400 font-normal"> / 5.0</span>
                </div>
                <div className="text-[10px] text-slate-400">{feedbackData.total_reviews} reviews</div>
              </div>
            </div>
          )}
        </div>

        {/* Submit feedback if registered or attended */}
        {user && (
          <form onSubmit={handleSubmitFeedback} className="bg-[#F8F9FA] p-6 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-900">Leave Your Rating & Review</h3>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
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
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-slate-900"
            />

            <button
              type="submit"
              disabled={submittingFeedback}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-slate-900 hover:bg-orange-600 transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" /> Submit Review
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-3">
          {feedbackData?.reviews?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No reviews submitted yet for this event.
            </p>
          ) : (
            feedbackData?.reviews?.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl border border-slate-100 bg-[#F8F9FA]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">{r.user_name}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
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

