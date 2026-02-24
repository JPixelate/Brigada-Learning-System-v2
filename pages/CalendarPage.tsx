import React, { useState } from 'react';
import { CalendarDays, Clock, MapPin, Users, ChevronLeft, ChevronRight, List, LayoutGrid, ArrowRight, Calendar } from 'lucide-react';
import PageHeader from '../components/PageHeader';

import { DBStructure, CalendarEvent } from '../types';
import { useData } from '../context/DataContext';

const daysInMonth = 28; // Feb 2026
const startDayOfWeek = 0; // Feb 1, 2026 is Sunday (0)

// Pre-generated images for days (just random nature/abstract from Unsplash)
const dayImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1501854140884-074bf86ee91c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", 
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", 
  // Add enough to cycle through
];

const CalendarPage = () => {
  const { data } = useData();
  const events: CalendarEvent[] = data.calendarEvents;
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDayOfWeek }, (_, i) => i);

  return (
    <div className="relative space-y-4 h-full flex flex-col">
      <PageHeader 
        title="Calendar"
        description="Upcoming training sessions, deadlines, and corporate events."
        icon={Calendar}
        stats={[
          { label: 'Upcoming Events', value: events.length },
          { label: 'Next Event', value: 'Today, 2:00 PM' }
        ]}
        actions={[
          {
            label: 'View Toggle',
            icon: viewMode === 'calendar' ? List : LayoutGrid,
            variant: 'secondary',
            onClick: () => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')
          },
          {
            label: 'February 2026',
            icon: CalendarDays,
            variant: 'secondary'
          }
        ]}
      />

      {viewMode === 'list' ? (
        <div className="bg-main-surface rounded-xl border border-main-border shadow-sm overflow-hidden transition-colors">
          <div className="divide-y divide-main-border">
            {events.map(event => {
              const [month, dayStr] = event.date.split(' ');
              const dayNumber = dayStr.replace(',', '');

              return (
                <div key={event.id} className="group flex items-center justify-between p-4 hover:bg-main-bg transition-colors cursor-pointer">
                  {/* Left: Date & Time */}
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-main-bg border border-main-border group-hover:bg-main-surface group-hover:shadow-sm transition-all shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{month}</span>
                      <span className="text-xl font-bold text-main-heading leading-none mt-0.5">{dayNumber}</span>
                    </div>

                    <div>
                       <h3 className="text-sm font-bold text-main-heading mb-1 transition-colors">{event.title}</h3>
                       <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1"><Clock size={12} /> {event.time}</span>
                          <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                       </div>
                    </div>
                  </div>

                  {/* Right: Attendees & Status */}
                  <div className="flex items-center gap-6">
                     <div className="hidden md:flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                           {[1,2,3].map(i => (
                              <div key={i} className="w-6 h-6 rounded-full border border-white bg-slate-200" />
                           ))}
                        </div>
                        <span className="text-xs font-medium text-slate-500">+{event.attendees}</span>
                     </div>
                     
                     <div className={`w-2.5 h-2.5 rounded-full ${event.color}`} />
                     
                     <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-main-surface rounded-xl border border-main-border shadow-sm p-4 overflow-hidden flex flex-col transition-colors">
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs font-semibold text-slate-400 uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
            {blanks.map(blank => (
              <div key={`blank-${blank}`} className="bg-transparent" />
            ))}
            {days.map(day => {
              const dayEvents = events.filter(e => e.day === day);
              const hasEvents = dayEvents.length > 0;
              const bgImage = dayImages[(day - 1) % dayImages.length];
              
              return (
                <div 
                  key={day} 
                  className={`relative group rounded-xl overflow-hidden border border-main-border shadow-sm transition-all h-full min-h-[100px] flex flex-col justify-between ${
                    hasEvents ? 'hover:shadow-md' : 'bg-main-bg/50 hover:bg-main-surface transition-colors'
                  }`}
                >
                  {/* Background Image - Only if events exist */}
                  {hasEvents && (
                    <div className="absolute inset-0">
                      <img 
                        src={bgImage} 
                        alt="" 
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Faded Color Overlay */}
                      <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-slate-900/40 transition-colors" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 p-3 flex flex-col h-full justify-between">
                    <span className={`text-lg font-bold shadow-sm ${hasEvents ? 'text-white' : 'text-slate-400'}`}>
                      {day}
                    </span>
                    
                    <div className="space-y-1">
                      {dayEvents.map(event => (
                        <div 
                          key={event.id}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-primary text-brand-primary-text truncate shadow-sm backdrop-blur-sm border border-white/10"
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
