import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckCircle2, XCircle, ShieldAlert, 
  Download, BarChart3, TrendingUp, Clock, AlertCircle, FileText 
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
      addToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    setProcessing(true);
    try {
      await api.approveEvent(eventId);
      addToast('Event officially approved and published!', 'success');
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
      await api.rejectEvent(rejectTarget.id, rejectReason || 'Event submission does not satisfy requirements');
      addToast('Event marked as rejected', 'info');
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
      addToast(`User role updated to ${newRole}`, 'success');
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
      addToast(`User account ${!currentActive ? 'activated' : 'suspended'}`, 'info');
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
      a.download = `campus_events_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast('CSV Report exported successfully', 'success');
    } catch (err) {
      addToast('CSV export failed', 'error');
    }
  };

  const COLORS = ['#F97316', '#EA580C', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#64748B'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-orange-100">
        <div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 mb-2">
            Campus Oversight & Governance
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrative Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Platform metrics, event moderation queue, user authorization, and system audit logs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-white hover:bg-orange-50 border border-orange-200 shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-orange-600" /> Export CSV Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-orange-100 gap-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Platform Analytics
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'approvals'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Event Approvals ({pendingEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> User Management ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Audit Logs
        </button>
      </div>

      {/* Tab 1: Platform Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8 animate-fade-in">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Events</div>
              <div className="mt-2 text-3xl font-extrabold text-slate-900">{analytics.summary.total_events}</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Students</div>
              <div className="mt-2 text-3xl font-extrabold text-orange-600">{analytics.summary.total_users}</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registrations</div>
              <div className="mt-2 text-3xl font-extrabold text-slate-900">{analytics.summary.total_registrations}</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</div>
              <div className="mt-2 text-3xl font-extrabold text-emerald-600">{analytics.summary.attendance_rate}%</div>
            </div>
          </div>

          {/* Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category breakdown pie chart */}
            <div className="p-6 bg-white rounded-3xl border border-orange-100 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Events by Category</h3>
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
                      label
                    >
                      {analytics.category_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Event capacity utilization bar chart */}
            <div className="p-6 bg-white rounded-3xl border border-orange-100 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Capacity Utilization (%) by Event</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.event_performance}>
                    <XAxis dataKey="title" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#F97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Event Approvals Queue */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-3xl border border-orange-100 shadow-xs overflow-hidden animate-fade-in">
          <div className="px-6 py-4 bg-orange-50/40 border-b border-orange-100">
            <h2 className="font-bold text-slate-900 text-sm">Submitted Events Awaiting Decision</h2>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">Approval Queue is Clear</h3>
              <p className="text-xs">All submitted campus events have been reviewed.</p>
            </div>
          ) : (
            <div className="divide-y divide-orange-50">
              {pendingEvents.map((ev) => (
                <div key={ev.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900">{ev.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                        {ev.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                      <span>Organizer: <strong className="text-slate-800">{ev.organizer_name}</strong></span>
                      <span>Date: <strong className="text-slate-800">{ev.date}</strong></span>
                      <span>Venue: <strong className="text-slate-800">{ev.venue}</strong></span>
                      <span>Capacity: <strong className="text-slate-800">{ev.capacity}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleApprove(ev.id)}
                      disabled={processing}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve Event
                    </button>
                    <button
                      onClick={() => setRejectTarget(ev)}
                      disabled={processing}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
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
        <div className="bg-white rounded-3xl border border-orange-100 shadow-xs overflow-hidden animate-fade-in">
          <div className="px-6 py-4 bg-orange-50/40 border-b border-orange-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 text-sm">Platform Users</h2>
            <span className="text-xs text-slate-500">{usersList.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-orange-50/60 text-slate-700 font-bold border-b border-orange-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">User Details</th>
                  <th className="px-6 py-3.5">Department & ID</th>
                  <th className="px-6 py-3.5">Assigned Role</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-orange-50/30">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{u.full_name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>{u.department || 'General'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.student_id || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-orange-200 bg-white text-xs font-semibold uppercase text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                          {u.is_active ? 'Suspend' : 'Reactivate'}
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
        <div className="bg-white rounded-3xl border border-orange-100 shadow-xs overflow-hidden animate-fade-in">
          <div className="px-6 py-4 bg-orange-50/40 border-b border-orange-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 text-sm">Immutable System Audit Trail</h2>
            <span className="text-xs text-slate-500">Last 100 entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-orange-50/60 text-slate-700 font-bold border-b border-orange-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Actor</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Resource</th>
                  <th className="px-6 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-orange-50/30">
                    <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                      {log.timestamp?.replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="px-6 py-3 font-sans">
                      <span className="font-bold text-slate-900">{log.user_name}</span>{' '}
                      <span className="text-[10px] text-orange-600 uppercase">({log.user_role})</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title={`Reject Event: ${rejectTarget?.title}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please provide a constructive reason for rejecting this event submission. The organizer will be notified.
          </p>

          <textarea
            rows={3}
            placeholder="e.g. Schedule clashes with College Convocation; please reschedule."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full p-3 rounded-xl border border-orange-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
            >
              {processing ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
