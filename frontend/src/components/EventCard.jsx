import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Sparkles } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function EventCard({ event }) {
  const isFull = event.registered_count >= event.capacity;
  const percentFilled = Math.min(100, Math.round((event.registered_count / event.capacity) * 100));
  const spotsLeft = Math.max(0, event.capacity - event.registered_count);

  return (
    <div className="group bg-white rounded-2xl border border-orange-100 hover:border-orange-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Poster image */}
      <div className="relative h-48 w-full overflow-hidden bg-orange-100">
        <img
          src={event.poster_url || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        
        {/* Category tag */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm">
            {event.category}
          </span>
          {event.is_featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500 text-white flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
        </div>

        {/* Status badge if not normal approved */}
        {event.status !== 'approved' && (
          <div className="absolute top-3 right-3">
            <StatusBadge status={event.status} />
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center gap-3 text-xs text-orange-200">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {event.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {event.start_time}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
            {event.title}
          </h3>
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">
            {event.description}
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Capacity status bar */}
        <div className="mt-5 pt-4 border-t border-orange-50">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Capacity
            </span>
            {isFull ? (
              <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Full ({event.waitlist_count || 0} waitlisted)
              </span>
            ) : (
              <span className="font-semibold text-emerald-600">
                {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} left
              </span>
            )}
          </div>

          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull ? 'bg-amber-500' : 'bg-orange-500'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>

          {/* Action Button */}
          <div className="mt-4">
            <Link
              to={`/events/${event.id}`}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold text-sm transition-all text-white bg-orange-600 hover:bg-orange-700 shadow-sm shadow-orange-500/20 active:scale-[0.99]"
            >
              View Event & Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
