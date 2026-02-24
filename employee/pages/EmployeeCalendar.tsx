import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/PageHeader';

const EmployeeCalendar = () => {
  const { data } = useData();
  const events = data.calendarEvents || [];

  const eventColors: Record<string, string> = {
    blue: 'border-l-blue-500 bg-blue-500/5',
    green: 'border-l-emerald-500 bg-emerald-500/5',
    purple: 'border-l-purple-500 bg-purple-500/5',
    red: 'border-l-red-500 bg-red-500/5',
    orange: 'border-l-orange-500 bg-orange-500/5',
  };

  return (
    <div className="space-y-8 fade-in">
      <PageHeader
        icon={Calendar}
        title="Training Calendar"
        description="Plan your learning schedule and never miss an important session."
      />

      {events.length === 0 ? (
        <div className="text-center py-24 bg-main-surface rounded-3xl border border-dashed border-main-border">
          <Calendar size={64} className="mx-auto text-slate-200 mb-4" />
          <p className="text-lg text-slate-500 font-bold">Your calendar is currently clear.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(event => (
            <div
              key={event.id}
              className={`bg-main-surface rounded-2xl border border-main-border shadow-sm p-6 border-l-4 transition-all hover:shadow-lg hover:border-brand-primary/20 ${
                eventColors[event.color] || 'border-l-slate-500 bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-6">
                <div className="bg-main-bg rounded-xl px-4 py-3 text-center min-w-[72px] border border-main-border shadow-sm">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{event.month}</p>
                  <p className="text-3xl font-black text-main-heading leading-none mt-1">{event.day}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-main-heading mb-2 leading-tight">{event.title}</h3>
                  {event.subtitle && (
                    <p className="text-sm text-slate-500 mb-4 font-medium">{event.subtitle}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 font-bold">
                    <span className="flex items-center gap-2 px-3 py-1 bg-main-surface rounded-lg border border-main-border">
                      <Clock size={16} className="text-slate-400" />
                      {event.time}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-2 px-3 py-1 bg-main-surface rounded-lg border border-main-border">
                        <MapPin size={16} className="text-slate-400" />
                        {event.location}
                      </span>
                    )}
                    <span className="flex items-center gap-2 px-3 py-1 bg-main-surface rounded-lg border border-main-border">
                      <Users size={16} className="text-slate-400" />
                      {event.attendees} Enrolled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeCalendar;
