import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { EcosystemEvent } from '../types';

interface CalendarScreenProps {
  onBack: () => void;
}

export default function CalendarScreen({ onBack }: CalendarScreenProps) {
  const [events, setEvents] = useState<EcosystemEvent[]>([]);

  return (
    <div className="w-full h-screen flex flex-col bg-background text-on-background">
      <div className="flex-none bg-surface/50 border-b border-primary/20 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-primary/20 rounded-full transition-colors text-primary"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-primary tracking-wide uppercase">Calendar</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-surface border border-primary/20 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary">Upcoming Events</h2>
              <button className="bg-primary/20 text-primary px-4 py-2 rounded font-bold uppercase text-sm hover:bg-primary/30 transition-colors">Schedule Event</button>
            </div>

            {events.length === 0 ? (
              <p className="text-gray-400 italic">No events scheduled.</p>
            ) : (
              <ul className="space-y-4">
                {events.map((event) => (
                  <li key={event.id} className="p-4 border border-primary/20 rounded bg-background/50">
                    <div className="font-bold text-primary">{event.eventType} - {event.date} {event.time}</div>
                    <div className="text-sm text-gray-400">Venue: {event.venueId || 'TBD'}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
