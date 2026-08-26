import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { EcosystemEvent } from '../types';
import { addDays, subDays, format, isSameDay } from 'date-fns';
import { fetchGasData } from '../utils/fetchGas';
import { getGasUrl } from '../utils/gasUrl';

interface CalendarScreenProps {
  onBack: () => void;
}

export default function CalendarScreen({ onBack }: CalendarScreenProps) {
  const [events, setEvents] = useState<EcosystemEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Derive available teams, months, and types from events
  const teams = Array.from(new Set(events.flatMap(e => [e.homeTeamName, e.awayTeamName]))).filter(Boolean).sort();
  const months = Array.from(new Set(events.map(e => e.date.substring(0, 7)))).filter(Boolean).sort();
  const types = Array.from(new Set(events.map(e => e.eventType))).filter(Boolean).sort();

  const isListMode = selectedTeam !== 'all' || selectedMonth !== 'all' || selectedType !== 'all';

  const filteredEvents = events.filter(e => {
    if (selectedTeam !== 'all' && e.homeTeamName !== selectedTeam && e.awayTeamName !== selectedTeam) return false;
    if (selectedMonth !== 'all' && !e.date.startsWith(selectedMonth)) return false;
    if (selectedType !== 'all' && e.eventType !== selectedType) return false;
    return true;
  });

  const displayEvents = isListMode ? filteredEvents.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)) : events.filter(e => e.date === format(selectedDate, 'yyyy-MM-dd')).sort((a, b) => a.time.localeCompare(b.time));

  useEffect(() => {
    const fetchScheduleData = async () => {
      const url = getGasUrl();
      if (!url) return;

      setLoading(true);
      try {
        const [gamesRes, eventsRes, teamsRes, venuesRes] = await Promise.all([
          fetchGasData(url, { action: 'getEcosystemData', sheetName: 'games' }),
          fetchGasData(url, { action: 'getEcosystemData', sheetName: 'events' }),
          fetchGasData(url, { action: 'getEcosystemData', sheetName: 'teams' }),
          fetchGasData(url, { action: 'getEcosystemData', sheetName: 'venues' })
        ]);

        const [gamesData, eventsData, teamsData, venuesData] = await Promise.all([
          gamesRes.json(),
          eventsRes.json(),
          teamsRes.json(),
          venuesRes.json()
        ]);

        const mappedTeams = (teamsData.status === 'Success' && Array.isArray(teamsData.data)) ? teamsData.data.slice(1).reduce((acc: any, row: any[]) => {
          if(row[0]) {
             acc[row[0]] = { name: row[4], logoUrl: row[9] }; // id: 0, name: 4, logoUrl: 9 based on types.ts and usual indices. We'll map them carefully.
             // Actually, dbSchema teams: ["id", "club_id", "competition_id", "team_code", "name", "tier_id", "coach_id", "general_manager_id", "founded_year", "logo_url", ... ]
             // id=0, name=4, logo_url=9
          }
          return acc;
        }, {}) : {};

        const mappedVenues = (venuesData.status === 'Success' && Array.isArray(venuesData.data)) ? venuesData.data.slice(1).reduce((acc: any, row: any[]) => {
           if(row[0]) {
              acc[row[0]] = row[1]; // id=0, name=1
           }
           return acc;
        }, {}) : {};

        const fetchedEvents: EcosystemEvent[] = [];

        if (gamesData.status === 'Success' && Array.isArray(gamesData.data) && gamesData.data.length > 1) {
           // games: ["id", "season_id", "home_team_id", "away_team_id", "venue_id", "scheduled_at", "started_at", "ended_at", "home_score", "away_score", "status", "attendance", "notes", "created_at", "updated_at"]
           gamesData.data.slice(1).forEach((row: any[]) => {
              if (row[0]) {
                 fetchedEvents.push({
                   id: row[0],
                   eventType: 'Game',
                   homeTeamId: row[2],
                   awayTeamId: row[3],
                   venueId: row[4],
                   date: row[5] ? format(new Date(row[5]), 'yyyy-MM-dd') : '',
                   time: row[5] ? format(new Date(row[5]), 'HH:mm') : '',
                   // attach names for convenience
                   homeTeamName: mappedTeams[row[2]]?.name || row[2],
                   awayTeamName: mappedTeams[row[3]]?.name || row[3],
                   homeTeamLogo: mappedTeams[row[2]]?.logoUrl,
                   awayTeamLogo: mappedTeams[row[3]]?.logoUrl,
                   venueName: mappedVenues[row[4]] || 'TBD',
                   homeScore: row[8],
                   awayScore: row[9],
                   status: row[10]
                 } as any);
              }
           });
        }

        if (eventsData.status === 'Success' && Array.isArray(eventsData.data) && eventsData.data.length > 1) {
            // events: ["id", "team_id", "event_type", "scheduled_at", "venue_id", "notes", "created_at", "updated_at"]
            eventsData.data.slice(1).forEach((row: any[]) => {
               if(row[0]) {
                  fetchedEvents.push({
                     id: row[0],
                     eventType: row[2] || 'Event',
                     venueId: row[4],
                     date: row[3] ? format(new Date(row[3]), 'yyyy-MM-dd') : '',
                     time: row[3] ? format(new Date(row[3]), 'HH:mm') : '',
                     venueName: mappedVenues[row[4]] || 'TBD',
                     notes: row[5]
                  } as any);
               }
            });
        }

        setEvents(fetchedEvents);

      } catch (e) {
        console.error("Failed to fetch schedule data", e);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

  // Generate date ribbon items
  const generateDateRibbon = () => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      dates.push(addDays(selectedDate, i));
    }
    return dates;
  };

  const dateRibbon = generateDateRibbon();

  return (
    <div className="w-full h-screen flex flex-col bg-background text-on-background">
      {/* Header */}
      <div className="flex-none bg-surface/50 border-b border-primary/20 p-4">
        <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-display font-bold text-primary tracking-wide uppercase">Schedule</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-none bg-surface/80 border-b border-primary/20 p-4 flex flex-wrap gap-4 items-center justify-center">
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="bg-background border border-primary/20 rounded p-2 text-primary focus:outline-none focus:border-primary"
        >
          <option value="all">All Teams</option>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-background border border-primary/20 rounded p-2 text-primary focus:outline-none focus:border-primary"
        >
          <option value="all">All Months</option>
          {months.map(m => {
            const [year, month] = m.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            return <option key={m} value={m}>{format(date, 'MMMM yyyy')}</option>;
          })}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-background border border-primary/20 rounded p-2 text-primary focus:outline-none focus:border-primary"
        >
          <option value="all">All Event Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Date Ribbon Navigation (Only visible if no filters applied) */}
      {!isListMode && (
      <div className="flex-none bg-surface border-b border-primary/20 p-2 flex items-center justify-center space-x-2 md:space-x-4 overflow-x-auto">
        <button
          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          className="p-2 text-primary hover:bg-primary/20 rounded-full transition-colors shrink-0"
          aria-label="Previous Day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {dateRibbon.map((date, idx) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center justify-center p-2 min-w-[60px] md:min-w-[80px] rounded-lg transition-colors shrink-0 ${
                isSelected ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-gray-400 hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <span className="text-xs uppercase">{format(date, 'EEE')}</span>
              <span className={`text-lg md:text-xl ${isSelected ? 'font-bold' : ''}`}>{format(date, 'd')}</span>
              <span className="text-xs">{format(date, 'MMM')}</span>
            </button>
          );
        })}

        <button
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          className="p-2 text-primary hover:bg-primary/20 rounded-full transition-colors shrink-0"
          aria-label="Next Day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {!isListMode && (
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">
               {format(selectedDate, 'EEEE, MMMM do, yyyy')}
            </h2>
          </div>
          )}

          <div className="space-y-4">
            {displayEvents.length === 0 && !loading ? (
              <div className="text-center py-8 bg-surface border border-primary/20 rounded-xl">
                 <p className="text-gray-400 italic">{isListMode ? "No games or events found matching your filters." : "No games or events scheduled for this day."}</p>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                 <p className="text-gray-400 italic">Loading schedule...</p>
              </div>
            ) : (
              displayEvents.map((event, index) => {
                const showDateHeader = isListMode && (index === 0 || displayEvents[index - 1].date !== event.date);
                const dateHeader = showDateHeader ? (
                   <div className="py-2 border-b border-primary/20 mt-6 mb-4">
                      <h3 className="text-lg font-bold text-primary">{event.date ? format(new Date(event.date), 'EEEE, MMMM do, yyyy') : 'Unknown Date'}</h3>
                   </div>
                ) : null;

                return (
                <div key={event.id}>
                  {dateHeader}
                  <div className="bg-surface-container-low border border-primary/20 rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
                  {event.eventType === 'Game' ? (
                    <div className="flex flex-col sm:flex-row items-stretch">
                      <div className="flex-1 p-4 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-primary/20">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">{event.time} {event.status && event.status !== 'Scheduled' && `• ${event.status}`}</span>
                         </div>
                         <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-3">
                             {event.homeTeamLogo ? (
                               <img src={event.homeTeamLogo} alt={event.homeTeamName} className="w-8 h-8 object-contain" />
                             ) : (
                               <div className="w-8 h-8 bg-surface border border-primary/20 rounded-full flex items-center justify-center text-xs font-bold">{event.homeTeamName?.substring(0, 2).toUpperCase()}</div>
                             )}
                             <span className="font-bold text-lg">{event.homeTeamName || 'Unknown Home Team'}</span>
                           </div>
                           <span className="font-display font-bold text-xl">{event.homeScore !== undefined ? event.homeScore : '-'}</span>
                         </div>
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             {event.awayTeamLogo ? (
                               <img src={event.awayTeamLogo} alt={event.awayTeamName} className="w-8 h-8 object-contain" />
                             ) : (
                               <div className="w-8 h-8 bg-surface border border-primary/20 rounded-full flex items-center justify-center text-xs font-bold">{event.awayTeamName?.substring(0, 2).toUpperCase()}</div>
                             )}
                             <span className="font-bold text-lg">{event.awayTeamName || 'Unknown Away Team'}</span>
                           </div>
                           <span className="font-display font-bold text-xl">{event.awayScore !== undefined ? event.awayScore : '-'}</span>
                         </div>
                      </div>
                      <div className="p-4 bg-background/30 flex flex-col justify-center min-w-[200px]">
                        <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Venue</div>
                        <div className="font-bold text-primary">{event.venueName || 'TBD'}</div>
                        {event.notes && (
                           <div className="mt-2 text-xs text-gray-400 italic">{event.notes}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 flex flex-col sm:flex-row items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                             <CalendarIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-primary">{event.eventType}</h3>
                            <div className="text-sm text-gray-400">{event.time} • {event.venueName || 'TBD'}</div>
                          </div>
                       </div>
                       {event.notes && (
                         <div className="mt-2 sm:mt-0 text-sm text-gray-400 max-w-sm text-right">
                           {event.notes}
                         </div>
                       )}
                    </div>
                  )}
                  </div>
                </div>
              )})
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
