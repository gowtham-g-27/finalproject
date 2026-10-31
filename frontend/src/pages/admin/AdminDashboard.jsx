import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckCircle2, XCircle, ShieldCheck, 
  Download, BarChart3, TrendingUp, Clock, AlertCircle, FileText, 
  Search, Filter, ShieldAlert, Award, Building, UserCheck, 
  RefreshCw, LayoutDashboard, ChevronRight, Activity, Database,
  ArrowUpRight, Check, X
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
  const [auditSearch, setAuditSearch] = useState('');
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
      a.download = `vitap_university_events_audit_${new Date().toISOString().slice(0, 10)}.csv`;
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

  const filteredLogs = auditLogs.filter((log) => {
    const s = auditSearch.toLowerCase();
    return (
      log.action?.toLowerCase().includes(s) ||
      log.user_name?.toLowerCase().includes(s) ||
      log.resource_type?.toLowerCase().includes(s)
    );
  });

  const COLORS = ['#F97316', '#EA580C', '#2563EB', '#059669', '#7C3AED', '#DB2777', '#475569'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. MUI DASHBOARD TOP APP BAR */}
      <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>VIT-AP University</span>
            <span>/</span>
            <span className="text-orange-700 font-bold">Board Review Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-orange-600" />
            Directorate of Student Welfare Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Executive oversight, event approval queue, RBAC user directory, and immutable compliance audit logs.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadAllAdminData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-orange-200 bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-2xs"
            title="Refresh All Records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition-colors shrink-0"
          >
            <Download className="w-4 h-4" /> Export Audit CSV
          </button>
        </div>
      </div>

      {/* 2. MUI-STYLE DRAWER / SIDEBAR & CANVAS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Drawer Navigation (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-orange-100 p-3 shadow-2xs space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Admin Navigation
            </div>

            {/* Nav Item 1: Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-orange-50 hover:text-orange-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Overview & Analytics</span>
              </span>
              <Activity className={`w-3.5 h-3.5 ${activeTab === 'analytics' ? 'text-white' : 'text-slate-400'}`} />
            </button>

            {/* Nav Item 2: Approvals Queue */}
            <button
              onClick={() => setActiveTab('approvals')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'approvals'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-orange-50 hover:text-orange-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4" />
                <span>Event Proposals</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                activeTab === 'approvals'
                  ? 'bg-white text-orange-700'
                  : pendingEvents.length > 0 
                  ? 'bg-orange-100 text-orange-900' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {pendingEvents.length}
              </span>
            </button>

            {/* Nav Item 3: Users */}
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-orange-50 hover:text-orange-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Campus User Directory</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                activeTab === 'users' ? 'bg-white text-orange-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {usersList.length}
              </span>
            </button>

            {/* Nav Item 4: Audit */}
            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'audit'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-orange-50 hover:text-orange-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Audit & Compliance</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                activeTab === 'audit' ? 'bg-white text-orange-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {auditLogs.length}
              </span>
            </button>
          </div>

          {/* System Health Card (MUI Sidebar Footer) */}
          <div className="bg-orange-50/60 rounded-2xl border border-orange-200/80 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-orange-600" />
                Core System Status
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                Online
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>FastAPI Backend:</span>
                <strong className="text-slate-800">Port 8000</strong>
              </div>
              <div className="flex justify-between">
                <span>Database Engine:</span>
                <strong className="text-slate-800">Thread-safe RLock</strong>
              </div>
              <div className="flex justify-between">
                <span>Accreditation:</span>
                <strong className="text-emerald-700">Verifiable PDF</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Content Canvas (lg:col-span-9) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: ANALYTICS & UTILIZATION */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              
              {/* MUI Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs hover:border-orange-200 transition-all">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Events</span>
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                    {analytics.summary.total_events}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                    <TrendingUp className="w-3 h-3" />
                    <span>+100% active roster</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs hover:border-orange-200 transition-all">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Active Users</span>
                    <Users className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-black text-orange-600">
                    {analytics.summary.total_users}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Students & faculty
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs hover:border-orange-200 transition-all">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Seat Bookings</span>
                    <FileText className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                    {analytics.summary.total_registrations}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Fair-queue transactions
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-orange-100 shadow-2xs hover:border-orange-200 transition-all">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Attendance Rate</span>
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-700">
                    {analytics.summary.attendance_rate}%
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-700 font-semibold">
                    Gate verified passes
                  </div>
                </div>

              </div>

              {/* Visual Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Chart 1: Category Distribution */}
                <div className="p-6 bg-white rounded-2xl border border-orange-100 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Event Breakdown by Category</h3>
                      <p className="text-xs text-slate-500">Proportion of campus activities</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200">
                      Active
                    </span>
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

                {/* Chart 2: Capacity Utilization */}
                <div className="p-6 bg-white rounded-2xl border border-orange-100 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Seating Capacity Demand (%)</h3>
                      <p className="text-xs text-slate-500">Registration volume vs venue limits</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200">
                      Real-time
                    </span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.event_performance}>
                        <XAxis dataKey="title" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={45} />
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

          {/* TAB 2: EVENT APPROVALS QUEUE */}
          {activeTab === 'approvals' && (
            <div className="bg-white rounded-2xl border border-orange-100 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 bg-orange-50/40 border-b border-orange-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Proposals Awaiting Administrative Decision</h2>
                  <p className="text-xs text-slate-500">Review coordinator submissions before publishing to the official catalog</p>
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
                    <div key={ev.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-orange-50/20 transition-colors">
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

          {/* TAB 3: USER MANAGEMENT & RBAC */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-orange-100 shadow-2xs overflow-hidden space-y-4 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Campus Directory & Role Permissions</h2>
                  <p className="text-xs text-slate-500">Manage user roles (Student, Organizer, Admin) and enforce account standing</p>
                </div>

                {/* Search */}
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

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-2xl border border-orange-100 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 bg-orange-50/40 border-b border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">System Compliance & Audit Trail</h2>
                  <p className="text-xs text-slate-500">Immutable ledger of approvals, QR gate scans, cancellations and security events</p>
                </div>
                
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter audit logs..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-orange-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-orange-50/60 text-slate-700 font-bold border-b border-orange-100 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Timestamp</th>
                      <th className="px-6 py-3.5">Actor</th>
                      <th className="px-6 py-3.5">Action Event</th>
                      <th className="px-6 py-3.5">Target</th>
                      <th className="px-6 py-3.5">Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-50 font-mono text-[11px]">
                    {filteredLogs.map((log) => {
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

        </div>
      </div>

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
