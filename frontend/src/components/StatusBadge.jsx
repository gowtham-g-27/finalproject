import React from 'react';

export default function StatusBadge({ status, type = 'event' }) {
  const s = (status || '').toLowerCase();

  const eventStyles = {
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200 line-through',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const regStyles = {
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    waitlisted: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
    attended: 'bg-purple-50 text-purple-700 border-purple-200',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200 line-through',
  };

  const styles = type === 'event' ? eventStyles[s] : regStyles[s];
  const fallback = 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles || fallback
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

