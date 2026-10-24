import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Users, QrCode, Sparkles, Edit, Trash2, 
  Clock, MapPin, Eye, FileText, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import QRScannerModal from './QRScannerModal';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [scanningEvent, setScanningEvent] = useState(null);

  // AI Assistant state
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState('Technical');
  const [generatingAi, setGeneratingAi] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    tags: '',
    venue: '',
    date: '',
    start_time: '10:00',
    end_time: '13:00',
    registration_deadline: '',
    capacity: 100,
    poster_url: '',
    eligibility: 'All students with college ID',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrganizerEvents();
  }, []);

  const loadOrganizerEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getOrganizerEvents();
      setEvents(data);
    } catch (err) {
      addToast('Failed to load organizer events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAi = async () => {
    if (!aiTopic.trim()) {
      addToast('Please enter an event topic or theme for the AI', 'warning');
      return;
    }

    setGeneratingAi(true);
    try {
      const res = await api.aiEventAssistant({
        topic: aiTopic.trim(),
        category: aiCategory,
        audience: 'College Students',
      });

      setFormData((prev) => ({
        ...prev,
        title: res.suggested_title,
        description: res.suggested_description,
        tags: res.suggested_tags.join(', '),
        category: aiCategory,
        eligibility: res.suggested_eligibility,
      }));

      addToast('AI event details generated! Customize any field as desired.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const tagsList = formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      await api.createEvent({
        ...formData,
        tags: tagsList,
        capacity: Number(formData.capacity),
        registration_deadline: formData.registration_deadline || `${formData.date}T${formData.start_time}`,
      });

      addToast('Event created and submitted for administrator approval!', 'success');
      setShowCreateModal(false);
      resetForm();
      loadOrganizerEvents();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Technical',
      tags: '',
      venue: '',
      date: '',
      start_time: '10:00',
      end_time: '13:00',
      registration_deadline: '',
      capacity: 100,
      poster_url: '',
      eligibility: 'All students with college ID',
    });
    setAiTopic('');
  };

  const handleViewParticipants = async (ev) => {
    setSelectedEvent(ev);
    setShowParticipantsModal(true);
    setLoadingParticipants(true);
    try {
      const data = await api.getEventParticipants(ev.id);
      setParticipants(data);
    } catch (err) {
      addToast('Failed to load participants', 'error');
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleDeleteEvent = async (evId) => {
    if (!window.confirm('Are you sure you want to delete this event? This will also remove associated tickets.')) return;
    try {
      await api.deleteEvent(evId);
      addToast('Event deleted successfully', 'info');
      loadOrganizerEvents();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Metrics
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((sum, e) => sum + (e.registered_count || 0), 0);
  const totalAttended = events.reduce((sum, e) => sum + (e.attended_count || 0), 0);
  const avgUtilization = totalEvents > 0 
    ? Math.round(events.reduce((sum, e) => sum + ((e.registered_count || 0) / (e.capacity || 1)), 0) / totalEvents * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-orange-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Organizer Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish campus events, manage seating capacities, scan attendee QR codes, and track check-ins.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-500/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Create New Event
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Events</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{totalEvents}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered</div>
          <div className="mt-2 text-3xl font-extrabold text-orange-600">{totalRegistrations}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendees Checked-in</div>
          <div className="mt-2 text-3xl font-extrabold text-purple-600">{totalAttended}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Capacity Utilization</div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-600">{avgUtilization}%</div>
        </div>
      </div>

      {/* Events Table / Cards */}
      <div className="bg-white rounded-3xl border border-orange-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-orange-100 bg-orange-50/40 flex justify-between items-center">
          <h2 className="font-bold text-slate-900 text-sm">Managed Events</h2>
          <span className="text-xs text-slate-500">{events.length} records</span>
        </div>

        {loading ? (
          <div className="p-10 text-center animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-orange-50/50 rounded-xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <Calendar className="w-10 h-10 text-orange-400 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">You haven't hosted any events yet</h3>
            <p className="text-xs max-w-sm mx-auto">
              Click 'Create New Event' above to draft your first workshop, hackathon, or seminar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-orange-50/60 text-slate-700 font-bold border-b border-orange-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Event Title & Category</th>
                  <th className="px-6 py-3.5">Date & Venue</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Registrations</th>
                  <th className="px-6 py-3.5">Attendance</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{ev.title}</div>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        {ev.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-800">{ev.date}</div>
                      <div className="text-[11px] text-slate-500">{ev.venue}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ev.status} />
                      {ev.rejection_reason && (
                        <div className="text-[10px] text-rose-600 mt-1 max-w-xs">
                          Reason: {ev.rejection_reason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {ev.registered_count} / {ev.capacity}
                      </div>
                      {ev.waitlist_count > 0 && (
                        <div className="text-[10px] text-amber-600 font-semibold">
                          +{ev.waitlist_count} waitlisted
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-purple-700">
                        {ev.attended_count || 0} checked in
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setScanningEvent(ev)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-2xs"
                        title="Scan QR Tickets"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Scan
                      </button>
                      <button
                        onClick={() => handleViewParticipants(ev)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-orange-200 text-slate-700 hover:bg-orange-50 shadow-2xs"
                        title="View Attendees"
                      >
                        <Users className="w-3.5 h-3.5" /> Roster
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Host a New Campus Event"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          
          {/* AI Event Assistant Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-orange-600" /> AI Event Assistant (One-Click Drafter)
            </div>
            <p className="text-xs text-slate-600">
              Type your topic/idea, and our AI assistant will draft title, description, topic tags, and eligibility!
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 24h Web3 Hackathon or Autonomous Robotics Contest"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={generatingAi}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors shrink-0"
              >
                {generatingAi ? 'Generating...' : 'Auto-Draft'}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. CodeSprint 2026: Collegiate Hackathon"
                className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    setAiCategory(e.target.value);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Academic">Academic</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Competition">Competition</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Capacity Limit (Seats) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description *
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Event agenda, requirements, and highlights..."
                className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Venue / Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. Main Auditorium, Room 102"
                  className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Coding, AI, Python"
                  className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Poster Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.poster_url}
                onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-orange-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs"
              >
                {submitting ? 'Submitting...' : 'Submit for Admin Review'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Participants List Modal */}
      <Modal
        isOpen={showParticipantsModal}
        onClose={() => setShowParticipantsModal(false)}
        title={selectedEvent ? `Attendee Roster: ${selectedEvent.title}` : 'Attendees'}
        maxWidth="max-w-2xl"
      >
        <div>
          {loadingParticipants ? (
            <div className="p-8 text-center animate-pulse text-xs text-slate-500">Loading attendee roster...</div>
          ) : participants.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No students registered yet for this event.</div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-orange-50 text-xs">
              {participants.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{p.user_name}</div>
                    <div className="text-[11px] text-slate-500">{p.user_email}</div>
                    <div className="text-[10px] font-mono text-orange-600 mt-0.5">{p.ticket_code}</div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={p.status} type="registration" />
                    {p.attended_at && (
                      <div className="text-[10px] text-purple-700 font-mono mt-1">
                        Checked in: {p.attended_at.slice(11, 16)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Live QR Scanner Modal */}
      <QRScannerModal
        isOpen={!!scanningEvent}
        onClose={() => setScanningEvent(null)}
        event={scanningEvent}
        onCheckInSuccess={() => {
          loadOrganizerEvents();
        }}
      />

    </div>
  );
}
