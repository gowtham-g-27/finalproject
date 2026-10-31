const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear token if expired
    // localStorage.removeItem('token');
  }

  // Handle file downloads
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('application/pdf') || contentType.includes('text/calendar') || contentType.includes('text/csv'))) {
    if (!response.ok) throw new Error('File download failed');
    return response.blob();
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.detail || response.statusText || 'Request failed';
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (userData) => request('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updateProfile: (profile) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),

  // Events
  getEvents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/events${query ? `?${query}` : ''}`);
  },
  getEvent: (id) => request(`/events/${id}`),
  getRecommendations: () => request('/events/recommendations'),
  getOrganizerEvents: () => request('/events/organizer/my-events'),
  createEvent: (eventData) => request('/events', { method: 'POST', body: JSON.stringify(eventData) }),
  updateEvent: (id, eventData) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(eventData) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  broadcastEventUpdate: (eventId, payload) => request(`/events/${eventId}/broadcast`, { method: 'POST', body: JSON.stringify(payload) }),
  aiEventAssistant: (promptData) => request('/events/ai-assistant', { method: 'POST', body: JSON.stringify(promptData) }),
  downloadCalendarIcs: (eventId) => request(`/events/${eventId}/calendar-ics`),

  // Registrations
  registerForEvent: (eventId) => request('/registrations', { method: 'POST', body: JSON.stringify({ event_id: eventId }) }),
  cancelRegistration: (id) => request(`/registrations/${id}`, { method: 'DELETE' }),
  getMyRegistrations: () => request('/registrations/my'),
  getEventParticipants: (eventId) => request(`/registrations/event/${eventId}`),

  // Attendance
  checkInAttendee: (eventId, ticketCode) => request('/attendance/check-in', {
    method: 'POST',
    body: JSON.stringify({ event_id: eventId, ticket_code: ticketCode }),
  }),

  // Certificates
  getMyCertificates: () => request('/certificates/my'),
  verifyCertificate: (certNumber) => request(`/certificates/verify/${certNumber}`),
  downloadCertificatePdf: (certId) => request(`/certificates/download/${certId}`),

  // Feedback
  submitFeedback: (feedbackData) => request('/feedback', { method: 'POST', body: JSON.stringify(feedbackData) }),
  getEventFeedback: (eventId) => request(`/feedback/event/${eventId}`),
  deleteFeedback: (id) => request(`/feedback/${id}`, { method: 'DELETE' }),

  // Analytics
  getDashboardAnalytics: () => request('/analytics/dashboard'),
  exportReportsCsv: () => request('/analytics/export/csv'),

  // Admin
  listUsers: () => request('/admin/users'),
  updateUserRole: (userId, role) => request(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  toggleUserStatus: (userId, is_active) => request(`/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ is_active }) }),
  approveEvent: (eventId) => request(`/admin/events/${eventId}/approve`, { method: 'POST' }),
  rejectEvent: (eventId, reason) => request(`/admin/events/${eventId}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  getAuditLogs: () => request('/admin/audit-logs'),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/mark-all-read', { method: 'PUT' }),
};

