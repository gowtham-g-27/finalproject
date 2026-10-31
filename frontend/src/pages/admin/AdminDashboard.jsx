import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckCircle2, XCircle, ShieldCheck, 
  Download, BarChart3, TrendingUp, Clock, AlertCircle, FileText, 
  Search, Filter, ShieldAlert, Award, Building, UserCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('analytics'); // analytics, approvals, users, audit
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsData, usersData, allEvents, logsData] = await Promise.all([
        api.getDashboardAnalytics(),
        api.listUsers(),
        api.getEvents({ status: 'pending' }),
        api.getAuditLogs(),
      ]);

      setAnalytics(analyticsData);
      setUsersList(usersData);
      setPendingEvents(allEvents);
      setAuditLogs(logsData);
    } catch (err) {
      addToast('Failed to load administrative records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    setProcessing(true);
    try {
      await api.approveEvent(eventId);
      addToast('Event proposal approved and published to the student catalog.', 'success');
      loadAllAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setProcessing(true);
    try {
      await api.rejectEvent(rejectTarget.id, rejectReason || 'Event submission does not meet university activity guidelines.');
      addToast('Event rejected and organizer notified.', 'info');
      setRejectTarget(null);
      setRejectReason('');
      loadAllAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      addToast(`User role updated to ${newRole}.`, 'success');
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleUserStatus = async (userId, currentActive) => {
    try {
      await api.toggleUserStatus(userId, !currentActive);
      addToast(`Account ${!currentActive ? 'reactivated' : 'suspended'}.`, 'info');
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !currentActive } : u))
      );
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await api.exportReportsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `university_events_audit_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast('Official CSV Report exported successfully.', 'success');
    } catch (err) {
      addToast('CSV export failed', 'error');
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const s = userSearch.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.student_id?.toLowerCase().includes(s) ||
      u.department?.toLowerCase().includes(s)
    );
  });

  const COLORS = ['#F97316', '#EA580C', '#2563EB', '#059669', '#7C3AED', '#DB2777', '#475569'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-900 mb-1.5">
            Board of Student Affairs & Academic Oversight
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrative Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics, event proposal review queue, campus user authorization, and system audit logs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-white hover:bg-orange-50 border border-orange-200 shadow-2xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-orange-600" /> Export Term Report (CSV)
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-orange-100 gap-6 overflow-x-auto no-scrollbar text-sm font-semibold">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-orange-600 text-orange-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Platform Analytics & Utilization
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'approvals'
              ? 'border-orange-600 text-orange-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Event Approval Queue ({pendingEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-orange-600 text-orange-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Campus User Directory ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-orange-600 text-orange-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Audit & Compliance Log
        </button>
      </div>

      {/* Tab 1: Analytics & Metrics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Campus Events</div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">{analytics.summary.total_events}</div>
              <div className="mt-1 text-[11px] text-slate-500">Scheduled across campus</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Registered Accounts</div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-orange-600">{analytics.summary.total_users}</div>
              <div className="mt-1 text-[11px] text-slate-500">Students, faculty & coordinators</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Seat Bookings</div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">{analytics.summary.total_registrations}</div>
              <div className="mt-1 text-[11px] text-slate-500">Confirmed seats + waitlists</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gate Check-in Rate</div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-700">{analytics.summary.attendance_rate}%</div>
              <div className="mt-1 text-[11px] text-slate-500">Verified physical attendance</div>
            </div>
          </div>

          {/* Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category distribution pie chart */}
            <div className="p-6 bg-white rounded-2xl border border-orange-100 shadow-2xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Event Distribution by Category</h3>
                <p className="text-xs text-slate-500">Proportion of campus activities by discipline</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.category_distribution}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.category_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Event capacity utilization bar chart */}
            <div className="p-6 bg-white rounded-2xl border border-orange-100 shadow-2xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Seating Capacity Utilization (%)</h3>
                <p className="text-xs text-slate-500">Registration demand compared against venue limits</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.event_performance}>
                    <XAxis dataKey="title" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#F97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Event Approvals Queue */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 bg-orange-50/40 border-b border-orange-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Event Proposals Awaiting Decision</h2>
              <p className="text-xs text-slate-500">Review coordinator submissions before publishing to the student catalog</p>
            </div>
            <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded border border-orange-200">
              {pendingEvents.length} pending
            </span>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Review Queue Clear</h3>
              <p className="text-xs">All chapter and departmental proposals have been evaluated.</p>
            </div>
          ) : (
            <div className="divide-y divide-orange-50">
              {pendingEvents.map((ev) => (
                <div key={ev.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900">{ev.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-200">
                        {ev.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1 font-medium">
                      <span>Host: <strong className="text-slate-800">{ev.organizer_name}</strong></span>
                      <span>Date: <strong className="text-slate-800">{ev.date}</strong></span>
                      <span>Venue: <strong className="text-slate-800">{ev.venue}</strong></span>
                      <span>Capacity: <strong className="text-slate-800">{ev.capacity} seats</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleApprove(ev.id)}
                      disabled={processing}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
                    </button>
                    <button
                      onClick={() => setRejectTarget(ev)}
                      disabled={processing}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject with Reason
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-2xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Campus Directory & Role Permissions</h2>
              <p className="text-xs text-slate-500">Manage user roles (Student, Organizer, Admin) and enforce account standing</p>
            </div>

            {/* User Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, roll no, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-orange-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-orange-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-orange-50/60 text-slate-700 font-bold border-b border-orange-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Campus Member</th>
                  <th className="px-6 py-3.5">Department & ID</th>
                  <th className="px-6 py-3.5">Assigned Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-orange-50/20">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{u.full_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="font-medium text-slate-800">{u.department || 'General'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.student_id || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-orange-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 capitalize"
                      >
                        <option value="student">Student</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                            u.is_active
                              ? 'text-rose-600 hover:bg-rose-50 border-rose-200'
                              : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          {u.is_active ? 'Suspend Account' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 bg-orange-50/40 border-b border-orange-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">System Compliance & Audit Trail</h2>
              <p className="text-xs text-slate-500">Immutable record of approvals, registrations, QR check-ins, and cancellations</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">Last 100 logged actions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-orange-50/60 text-slate-700 font-bold border-b border-orange-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Actor</th>
                  <th className="px-6 py-3.5">Action Event</th>
                  <th className="px-6 py-3.5">Resource Target</th>
                  <th className="px-6 py-3.5">Audit Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50 font-mono text-[11px]">
                {auditLogs.map((log) => {
                  const isApproval = log.action.includes('APPROVE');
                  const isCheckin = log.action.includes('CHECK_IN');
                  const isCancel = log.action.includes('CANCEL');
                  const isCreate = log.action.includes('CREATE');

                  const badgeClass = isApproval
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isCheckin
                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                    : isCancel
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : isCreate
                    ? 'bg-orange-50 text-orange-800 border-orange-200'
                    : 'bg-slate-100 text-slate-800 border-slate-200';

                  return (
                    <tr key={log.id} className="hover:bg-orange-50/20">
                      <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                        {log.timestamp?.replace('T', ' ').slice(0, 19)}
                      </td>
                      <td className="px-6 py-3 font-sans">
                        <span className="font-bold text-slate-900">{log.user_name}</span>{' '}
                        <span className="text-[10px] text-orange-700 uppercase font-semibold">({log.user_role})</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {log.resource_type}:{log.resource_id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-3 text-slate-500 truncate max-w-xs font-sans text-xs">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Event Modal */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title={`Reject Proposal: ${rejectTarget?.title || ''}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Specify the institutional reason for declining this proposal (e.g. venue scheduling conflict or guideline mismatch). The faculty coordinator will be notified.
          </p>

          <textarea
            rows={3}
            placeholder="e.g. Schedule conflicts with College Convocation; please reschedule for the following weekend."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full p-3 rounded-xl border border-orange-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setRejectTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={processing}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs"
            >
              {processing ? 'Submitting...' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
