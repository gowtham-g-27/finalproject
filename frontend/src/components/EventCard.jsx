import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Building, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function EventCard({ event }) {
  const isFull = (event.registered_count || 0) >= (event.capacity || 1);
  const percentFilled = Math.min(100, Math.round(((event.registered_count || 0) / (event.capacity || 1)) * 100));
  const spotsLeft = Math.max(0, (event.capacity || 0) - (event.registered_count || 0));

  // Date parsing for institutional calendar box
  const eventDate = new Date(event.date);
  const month = !isNaN(eventDate) ? eventDate.toLocaleString('default', { month: 'short' }).toUpperCase() : 'OCT';
  const day = !isNaN(eventDate) ? eventDate.getDate() : '28';

  return (
    <div className="bg-white rounded-2xl border border-orange-100 hover:border-orange-300 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      
      {/* Poster Image Container */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        <img
          src={event.poster_url || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent" />

        {/* Date Badge Box */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs rounded-xl border border-orange-200/80 shadow-xs px-2.5 py-1 text-center min-w-[44px]">
          <span className="block text-[10px] font-bold text-orange-700 leading-none">{month}</span>
          <span className="block text-base font-extrabold text-slate-900 leading-tight">{day}</span>
        </div>

        {/* Category & Status */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-xs border border-orange-100 shadow-2xs">
            {event.category}
          </span>
          {event.status !== 'approved' && (
            <StatusBadge status={event.status} />
          )}
        </div>

        {/* Quick Time & Venue Overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white text-[11px] flex items-center justify-between">
          <span className="flex items-center gap-1 text-orange-200 font-medium">
            <Clock className="w-3.5 h-3.5" />
            {event.start_time} - {event.end_time}
          </span>
          <span className="text-[10px] text-slate-200 truncate max-w-[140px]">
            {event.organizer_name}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
            {event.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="mt-3.5 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Capacity status bar */}
        <div className="pt-3 border-t border-orange-100/70 space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Seats
            </span>
            {isFull ? (
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                Capacity Full ({event.waitlist_count || 0} in waitlist)
              </span>
            ) : (
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                {spotsLeft} seat{spotsLeft === 1 ? '' : 's'} available
              </span>
            )}
          </div>

          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull ? 'bg-amber-500' : 'bg-orange-500'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Link
              to={`/events/${event.id}`}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white bg-orange-600 hover:bg-orange-700 shadow-2xs active:scale-[0.99] transition-all"
            >
              Event Details & Registration <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
