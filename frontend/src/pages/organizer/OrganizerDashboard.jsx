import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Calendar, Users, QrCode, Edit3, Trash2, 
  Clock, MapPin, Eye, FileText, CheckCircle2, AlertCircle, 
  ExternalLink, Search, Filter, BookOpen, ChevronRight, Wand2,
  Megaphone, BarChart2, Download, Send
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
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [scanningEvent, setScanningEvent] = useState(null);

  // Send Event Update state
  const [broadcastTarget, setBroadcastTarget] = useState(null);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Event Report state
  const [reportEvent, setReportEvent] = useState(null);

  // Proposal drafting assistant state
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
    eligibility: 'All registered college students with valid ID',
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
      addToast('Please enter an event theme or title to auto-draft', 'warning');
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

      addToast('Proposal draft filled. Review and adjust details below.', 'success');
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

      addToast('Event proposal submitted to the Academic Affairs Board for approval.', 'success');
      setShowCreateModal(false);
      resetForm();
      loadOrganizerEvents();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (ev) => {
    setEditingEvent(ev);
    setFormData({
      title: ev.title,
      description: ev.description,
      category: ev.category,
      tags: Array.isArray(ev.tags) ? ev.tags.join(', ') : '',
      venue: ev.venue,
      date: ev.date,
      start_time: ev.start_time,
      end_time: ev.end_time,
      registration_deadline: ev.registration_deadline || '',
      capacity: ev.capacity,
      poster_url: ev.poster_url || '',
      eligibility: ev.eligibility || 'All registered college students with valid ID',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    setSubmitting(true);
    try {
      const tagsList = formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      await api.updateEvent(editingEvent.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: tagsList,
        venue: formData.venue,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        registration_deadline: formData.registration_deadline,
        capacity: Number(formData.capacity),
        poster_url: formData.poster_url,
        eligibility: formData.eligibility,
      });

      addToast('Event details updated successfully.', 'success');
      setShowEditModal(false);
      setEditingEvent(null);
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
      eligibility: 'All registered college students with valid ID',
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
    if (!window.confirm('Are you sure you want to withdraw this event? All active registrations will be removed.')) return;
    try {
      await api.deleteEvent(evId);
      addToast('Event withdrawn and removed.', 'info');
      loadOrganizerEvents();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTarget || !broadcastMsg.trim()) return;
    setSendingBroadcast(true);
    try {
      const res = await api.broadcastEventUpdate(broadcastTarget.id, {
        title: broadcastTitle.trim() || `Event Announcement: ${broadcastTarget.title}`,
        message: broadcastMsg.trim(),
      });
      addToast(res.message || 'Announcement broadcast to all registered students!', 'success');
      setBroadcastTarget(null);
      setBroadcastTitle('');
      setBroadcastMsg('');
    } catch (err) {
      addToast(err.message || 'Failed to broadcast update', 'error');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleExportRosterCSV = () => {
    if (!selectedEvent || participants.length === 0) return;
    const headers = ["Ticket Code", "Student Name", "Email", "Status", "Gate Checked-In At"];
    const rows = participants.map(p => [
      `"${p.ticket_code}"`,
      `"${p.user_name}"`,
      `"${p.user_email}"`,
      `"${p.status}"`,
      `"${p.attended_at || 'Not Checked In'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedEvent.title.replace(/[^a-zA-Z0-9]/g, '_')}_attendance_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    addToast("Attendee report exported as CSV", "success");
  };

  // Filtered Events
  const filteredEvents = statusFilter === 'all'
    ? events
    : events.filter((e) => e.status === statusFilter);

  // Key Metrics
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((sum, e) => sum + (e.registered_count || 0), 0);
  const totalAttended = events.reduce((sum, e) => sum + (e.attended_count || 0), 0);
  const totalCapacity = events.reduce((sum, e) => sum + (e.capacity || 0), 0);
  const avgUtilization = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Institutional Header Banner */}
      <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-900 mb-1.5">
            Faculty & Chapter Coordinator Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Organizer Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit event proposals, manage seating allotments, conduct gate QR ticket check-ins, and export attendee rosters.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-orange-600 hover:bg-orange-700 shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Propose New Event
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Events</div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">{totalEvents}</div>
          <div className="mt-1 text-[11px] text-slate-500">Across your campus chapter</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-orange-600">{totalRegistrations}</div>
          <div className="mt-1 text-[11px] text-slate-500">Confirmed & waitlisted seats</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gate Check-Ins</div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-purple-700">{totalAttended}</div>
          <div className="mt-1 text-[11px] text-slate-500">Verified through QR scan</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Seat Utilization</div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-700">{avgUtilization}%</div>
          <div className="mt-1 text-[11px] text-slate-500">Capacity efficiency</div>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-2xs overflow-hidden">
        
        {/* Table Top Controls */}
        <div className="px-6 py-4 border-b border-orange-100 bg-orange-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 text-sm">Managed Events Roster</h2>
            <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-orange-100">
              {filteredEvents.length} items
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-orange-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved & Active</option>
              <option value="pending">Pending Board Review</option>
              <option value="rejected">Rejected / Clashing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table List */}
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-500 animate-pulse">Loading event records...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <Calendar className="w-10 h-10 text-orange-400 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">No events found matching criteria</h3>
            <p className="text-xs max-w-sm mx-auto">
              Click 'Propose New Event' above to draft your first academic workshop or competition.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-orange-50/60 text-slate-700 font-bold border-b border-orange-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Event Title & Discipline</th>
                  <th className="px-6 py-3.5">Date & Venue</th>
                  <th className="px-6 py-3.5">Workflow Status</th>
                  <th className="px-6 py-3.5">Registrations</th>
                  <th className="px-6 py-3.5">Verified Turnout</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-orange-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{ev.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-orange-800 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          {ev.category}
                        </span>
                        {ev.status === 'approved' && (
                          <Link
                            to={`/events/${ev.id}`}
                            className="text-[10px] font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-0.5"
                            title="View public event portal"
                          >
                            <ExternalLink className="w-3 h-3" /> View Public Page
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="font-semibold text-slate-800">{ev.date}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-500" /> {ev.venue}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ev.status} />
                      {ev.rejection_reason && (
                        <div className="text-[10px] text-rose-600 mt-1 max-w-xs font-sans">
                          Feedback: {ev.rejection_reason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {ev.registered_count} / {ev.capacity}
                      </div>
                      {ev.waitlist_count > 0 && (
                        <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                          +{ev.waitlist_count} waitlisted
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-purple-700">
                        {ev.attended_count || 0} checked in
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setScanningEvent(ev)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-2xs"
                        title="Scan Gate QR Tickets (Camera)"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Check-in
                      </button>

                      <button
                        onClick={() => handleViewParticipants(ev)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-orange-200 text-slate-700 hover:bg-orange-50"
                        title="View Roster & Attendance"
                      >
                        <Users className="w-3.5 h-3.5 text-slate-500" /> Roster
                      </button>

                      <button
                        onClick={() => {
                          setBroadcastTarget(ev);
                          setBroadcastTitle(`Update: ${ev.title}`);
                          setBroadcastMsg('');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 border border-orange-200 text-orange-900 hover:bg-orange-100"
                        title="Send Event Update / Announcement"
                      >
                        <Megaphone className="w-3.5 h-3.5 text-orange-600" /> Update
                      </button>

                      <button
                        onClick={() => setReportEvent(ev)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                        title="View Event Report"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-slate-600" /> Report
                      </button>

                      <button
                        onClick={() => handleOpenEdit(ev)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        title="Edit Event Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Withdraw Event"
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

      {/* Propose / Create Event Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Propose Official Campus Event"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          
          {/* Proposal Drafting Helper */}
          <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-950 uppercase tracking-wider">
              <Wand2 className="w-4 h-4 text-orange-600" />
              Event Description & Requirements Assistant
            </div>
            <p className="text-xs text-slate-600">
              Enter your event theme or title. The drafting assistant will suggest title conventions, a detailed agenda description, and prerequisite tags.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 24-Hour Autonomous Robotics Hackathon or Post-Quantum Cryptography Talk"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={generatingAi}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-2xs transition-colors shrink-0"
              >
                {generatingAi ? 'Drafting...' : 'Auto-Draft Details'}
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
                placeholder="e.g. VIT-AP TechSummit 2026: Hands-on Cloud Native Workshop"
                className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  Seating Capacity (Max Attendees) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Event Description & Agenda *
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detail event schedule, keynote speakers, deliverables, and prerequisites..."
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
                  className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Venue / Room *
                </label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. Science Auditorium, Hall 4"
                  className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  placeholder="Python, Docker, HandsOn"
                  className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Eligibility & Student Requirements
              </label>
              <input
                type="text"
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                placeholder="e.g. Open to all second and third-year engineering students"
                className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-2xs"
              >
                {submitting ? 'Submitting...' : 'Submit Proposal for Approval'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Edit Event Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingEvent(null);
        }}
        title={`Edit Event: ${editingEvent?.title || ''}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                Seating Capacity
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Venue
            </label>
            <input
              type="text"
              required
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-orange-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-orange-100">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setEditingEvent(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-2xs"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Attendee Roster Modal */}
      <Modal
        isOpen={showParticipantsModal}
        onClose={() => setShowParticipantsModal(false)}
        title={selectedEvent ? `Attendee Roster: ${selectedEvent.title}` : 'Registered Students'}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          {/* Quick Roster Stats */}
          {selectedEvent && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 bg-orange-50/60 rounded-xl border border-orange-100 font-semibold">
              <div>
                <span className="text-slate-500">Confirmed: </span>
                <strong className="text-slate-900">{participants.filter(p => p.status === 'confirmed').length}</strong>
              </div>
              <div>
                <span className="text-slate-500">Checked In: </span>
                <strong className="text-purple-700">{participants.filter(p => p.status === 'attended').length}</strong>
              </div>
              <div>
                <span className="text-slate-500">Waitlist: </span>
                <strong className="text-amber-700">{participants.filter(p => p.status === 'waitlisted').length}</strong>
              </div>
            </div>
          )}

          {/* Roster Controls & Export */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">
              Verified physical check-in passes
            </span>
            <button
              onClick={handleExportRosterCSV}
              disabled={participants.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-orange-200 text-slate-700 hover:bg-orange-50 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-orange-600" /> Export Roster (CSV)
            </button>
          </div>

          {loadingParticipants ? (
            <div className="p-8 text-center animate-pulse text-xs text-slate-500">Loading attendee records...</div>
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
                        Gate scan: {p.attended_at.slice(11, 16)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Broadcast Event Announcement Modal (Fixed Organiser Role Permission) */}
      <Modal
        isOpen={!!broadcastTarget}
        onClose={() => setBroadcastTarget(null)}
        title={broadcastTarget ? `Send Update: ${broadcastTarget.title}` : 'Send Event Announcement'}
        maxWidth="max-w-md"
      >
        {broadcastTarget && (
          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <p className="text-xs text-slate-600">
              Dispatches an immediate in-app bulletin to all students registered or waitlisted for this event.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Announcement Subject *
              </label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Venue Room Update or Materials to Bring"
                className="w-full px-3 py-2 rounded-xl border border-orange-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Announcement Message *
              </label>
              <textarea
                rows={3}
                required
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Detail any room revisions, agenda shifts, or preparation instructions..."
                className="w-full p-3 rounded-xl border border-orange-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBroadcastTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingBroadcast}
                className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {sendingBroadcast ? 'Dispatching...' : 'Broadcast to Attendees'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Event Report Modal (Fixed Organiser Role Permission) */}
      <Modal
        isOpen={!!reportEvent}
        onClose={() => setReportEvent(null)}
        title={reportEvent ? `Event Performance Report: ${reportEvent.title}` : 'Event Report'}
        maxWidth="max-w-lg"
      >
        {reportEvent && (
          <div className="space-y-5 text-xs">
            <div className="p-3 bg-orange-50/70 rounded-2xl border border-orange-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Category & Venue</span>
                <strong className="text-slate-900">{reportEvent.category} • {reportEvent.venue}</strong>
              </div>
              <StatusBadge status={reportEvent.status} />
            </div>

            {/* Turnout KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-white rounded-xl border border-orange-100 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Max Seats</span>
                <div className="text-lg font-black text-slate-900 mt-1">{reportEvent.capacity}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-orange-100 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Enrolled</span>
                <div className="text-lg font-black text-orange-600 mt-1">{reportEvent.registered_count}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-orange-100 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Turnout</span>
                <div className="text-lg font-black text-purple-700 mt-1">{reportEvent.attended_count || 0}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-orange-100 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fill Rate</span>
                <div className="text-lg font-black text-emerald-700 mt-1">
                  {reportEvent.capacity > 0 ? Math.round((reportEvent.registered_count / reportEvent.capacity) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              <div className="flex justify-between">
                <span>Registration Deadline:</span>
                <strong className="font-mono">{reportEvent.registration_deadline || reportEvent.date}</strong>
              </div>
              <div className="flex justify-between">
                <span>Waitlisted Candidates:</span>
                <strong>{reportEvent.waitlist_count || 0} students queued</strong>
              </div>
              <div className="flex justify-between">
                <span>Turnout Efficiency:</span>
                <strong className="text-purple-700">
                  {reportEvent.registered_count > 0 ? Math.round(((reportEvent.attended_count || 0) / reportEvent.registered_count) * 100) : 0}% attended
                </strong>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  handleViewParticipants(reportEvent);
                  setReportEvent(null);
                }}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                Inspect Attendee Roster <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReportEvent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close Report
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* QR Code Scanner Gate Modal */}
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
