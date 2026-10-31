import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function EventCard({ event }) {
  const isFull = (event.registered_count || 0) >= (event.capacity || 1);
  const spotsLeft = Math.max(0, (event.capacity || 0) - (event.registered_count || 0));

  // Date formatting
  const eventDate = new Date(event.date);
  const formattedDate = !isNaN(eventDate)
    ? eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : event.date;

  return (
    <Link 
      to={`/events/${event.id}`}
      className="group block text-left transition-all duration-200"
    >
      {/* 1. Minimalist Soft Image Container (Exact Lezada Card Aesthetic from User Image 2) */}
      <div className="relative aspect-[4/3] w-full rounded-2xl bg-[#F8F9FA] border border-slate-100 overflow-hidden flex items-center justify-center p-3 transition-all duration-300 group-hover:shadow-sm">
        
        {/* Event Poster */}
        <img
          src={event.poster_url || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"}
          alt={event.title}
          className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Circular Tag Badges (Matching circular badges in User Image 2) */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
          {isFull ? (
            <span className="w-8 h-8 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center justify-center shadow-xs">
              Wait
            </span>
          ) : (
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center justify-center shadow-xs">
              Open
            </span>
          )}

          {event.category === 'Technical' && (
            <span className="w-8 h-8 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider flex items-center justify-center shadow-xs">
              Tech
            </span>
          )}
        </div>

        {/* Category Chip (Top Right) */}
        <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-slate-800 backdrop-blur-xs border border-slate-200 shadow-2xs">
          {event.category}
        </span>
      </div>

      {/* 2. Clean Typography Below Image (Exact Lezada Layout) */}
      <div className="pt-3 pb-1 space-y-1">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1 tracking-tight">
          {event.title}
        </h3>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <span>{formattedDate}</span>
          <span>•</span>
          <span className="truncate">{event.venue}</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-0.5">
          <span>{event.registered_count || 0} / {event.capacity} seats</span>
          <span className="text-emerald-700 font-sans font-semibold">Free Entry</span>
        </div>
      </div>
    </Link>
  );
}
