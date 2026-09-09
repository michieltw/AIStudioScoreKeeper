import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Calendar as CalendarIcon, Clock, MapPin, Users, Info } from 'lucide-react';
import { fetchGasData } from '../utils/fetchGas';
import { getGasUrl } from '../utils/gasUrl';
import { User, DbTeam, Venue, DbPerson, Season } from '../types';

interface EventPlannerScreenProps {
  currentUser: User | null;
  onBack: () => void;
}

export default function EventPlannerScreen({ currentUser, onBack }: EventPlannerScreenProps) {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Data for dropdowns
  const [teams, setTeams] = useState<DbTeam[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [persons, setPersons] = useState<DbPerson[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);

  // Form State
  const [eventType, setEventType] = useState<'Meeting' | 'Training' | 'Invite-Only' | 'Game'>('Training');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venueId, setVenueId] = useState('');
  const [notes, setNotes] = useState('');

  // Specific fields
  const [teamId, setTeamId] = useState(''); // For training/meeting
  const [homeTeamId, setHomeTeamId] = useState(''); // For games
  const [awayTeamId, setAwayTeamId] = useState(''); // For games
  const [seasonId, setSeasonId] = useState(''); // For games
  const [selectedPersons, setSelectedPersons] = useState<string[]>([]); // For invite-only

  // Role permissions
  const isAdminOrLeagueManager = currentUser?.role === 'Admin' || currentUser?.role === 'League Manager';
  const isTeamManager = currentUser?.role === 'Team Manager' || isAdminOrLeagueManager;

  useEffect(() => {
    // Determine default event type based on role
    if (!isAdminOrLeagueManager && !isTeamManager) {
      setEventType('Invite-Only');
    } else if (!isAdminOrLeagueManager && isTeamManager) {
      setEventType('Training');
    }
  }, [currentUser, isAdminOrLeagueManager, isTeamManager]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      const url = getGasUrl();
      if (!url) {
        setError('Geen database URL geconfigureerd.');
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      try {
        const [teamsRes, venuesRes, personsRes, seasonsRes] = await Promise.all([
          fetchGasData(url, { action: 'getEcosystemData', sheetName: 'teams' }),
          fetchGasData(url, { action: 'getEcosystemData', sheetName: 'venues' }),
          fetchGasData(url, { action: 'getEcosystemData', sheetName: 'persons' }),
          fetchGasData(url, { action: 'getEcosystemData', sheetName: 'seasons' })
        ]);

        const [teamsData, venuesData, personsData, seasonsData] = await Promise.all([
          teamsRes.json(),
          venuesRes.json(),
          personsRes.json(),
          seasonsRes.json()
        ]);

        const mapData = (resData: any) => {
          if (resData.status === 'Success' && Array.isArray(resData.data) && resData.data.length > 1) {
            const headers = resData.data[0];
            return resData.data.slice(1).map((row: any[]) => {
              const obj: any = {};
              headers.forEach((h: string, i: number) => {
                obj[h] = row[i];
              });
              return obj;
            });
          }
          return [];
        };

        setTeams(mapData(teamsData));
        setVenues(mapData(venuesData));
        setPersons(mapData(personsData));
        setSeasons(mapData(seasonsData));

      } catch (err: any) {
        console.error('Failed to fetch dropdown data', err);
        setError('Kon gegevens niet laden.');
      } finally {
        setDataLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handlePersonToggle = (personId: string) => {
    setSelectedPersons(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    if (!date || !time) {
      setError('Vul ten minste de datum en tijd in.');
      return;
    }

    if (eventType === 'Game') {
      if (!homeTeamId || !awayTeamId || !seasonId || !venueId) {
        setError('Vul alle velden in voor een wedstrijd (Thuis, Uit, Seizoen, Locatie).');
        return;
      }
      if (homeTeamId === awayTeamId) {
        setError('Thuis- en uitteam kunnen niet hetzelfde zijn.');
        return;
      }
    }

    if ((eventType === 'Training' || eventType === 'Meeting') && !teamId) {
      setError('Selecteer een team voor dit evenement.');
      return;
    }

    setLoading(true);
    const url = getGasUrl();
    if (!url) {
      setError('Database URL niet gevonden.');
      setLoading(false);
      return;
    }

    try {
      const generatedId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const datetime = `${date}T${time}:00`;

      if (eventType === 'Game') {
        // Save to games table
        // We'll use saveGame action to easily append
        const gameRow = {
           id: generatedId,
           season_id: seasonId,
           home_team_id: homeTeamId,
           away_team_id: awayTeamId,
           venue_id: venueId,
           scheduled_at: datetime,
           status: 'scheduled',
           notes: notes,
           created_at: new Date().toISOString()
        };

        await fetchGasData(url, {
           action: 'saveGame',
           newSchema: {
              games: [gameRow]
           }
        });
      } else {
        // Save to events table using updateRow with empty ID to force append (or saveEcosystemData)
        // Let's use saveEcosystemData directly by constructing an array matching headers.

        // Let's fetch headers first, but we know them from types:
        // "events": ["id", "team_id", "event_type", "scheduled_at", "venue_id", "notes", "created_at", "updated_at"]
        const eventsRow = [
           generatedId,
           eventType === 'Invite-Only' ? '' : teamId,
           eventType,
           datetime,
           venueId,
           notes,
           new Date().toISOString(),
           new Date().toISOString()
        ];

        await fetchGasData(url, {
           action: 'saveEcosystemData',
           sheetName: 'events',
           rowData: eventsRow
        });

        // If Invite-Only, save RSVPs
        if (eventType === 'Invite-Only' && selectedPersons.length > 0) {
           for (const pId of selectedPersons) {
             const rsvpId = `rsvp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
             // "event_rsvps": ["id", "event_id", "person_id", "rsvp_status", "responded_at", "created_at"]
             const rsvpRow = [
                rsvpId,
                generatedId,
                pId,
                'not_responded',
                '',
                new Date().toISOString()
             ];
             await fetchGasData(url, {
               action: 'saveEcosystemData',
               sheetName: 'event_rsvps',
               rowData: rsvpRow
             });
           }
        }
      }

      setSuccess(true);
      // Reset form
      setDate('');
      setTime('');
      setNotes('');
      setHomeTeamId('');
      setAwayTeamId('');
      setVenueId('');
      setTeamId('');
      setSelectedPersons([]);

    } catch (err: any) {
      console.error('Failed to save event', err);
      setError('Fout bij opslaan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-tertiary" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-tertiary/10 via-background to-background pointer-events-none" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex-none p-4 md:p-6 pb-0 flex flex-col gap-4 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-on-surface to-on-surface-variant">
            Evenementen Planner
          </h1>
        </div>
      </div>

      <div className="relative z-10 flex-1 p-4 md:p-6 overflow-y-auto w-full max-w-3xl mx-auto custom-scrollbar">
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm flex items-start gap-3">
             <Info className="w-5 h-5 shrink-0 mt-0.5" />
             <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-start gap-3">
             <Info className="w-5 h-5 shrink-0 mt-0.5" />
             <p>Evenement succesvol ingepland!</p>
          </div>
        )}

        <div className="bg-surface-container-low border border-primary/20 rounded-xl p-6 metallic-surface flex flex-col gap-6">
          {/* Event Type Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Type Evenement</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                disabled={!isAdminOrLeagueManager}
                onClick={() => setEventType('Game')}
                className={`p-3 rounded-xl border text-sm font-bold transition-all ${eventType === 'Game' ? 'bg-tertiary/20 border-tertiary text-tertiary' : 'bg-surface-container border-primary/10 text-on-surface-variant hover:border-primary/30'} ${!isAdminOrLeagueManager ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!isAdminOrLeagueManager ? "Alleen League Managers kunnen wedstrijden inplannen" : ""}
              >
                Wedstrijd
              </button>
              <button
                disabled={!isTeamManager}
                onClick={() => setEventType('Training')}
                className={`p-3 rounded-xl border text-sm font-bold transition-all ${eventType === 'Training' ? 'bg-tertiary/20 border-tertiary text-tertiary' : 'bg-surface-container border-primary/10 text-on-surface-variant hover:border-primary/30'} ${!isTeamManager ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Training
              </button>
              <button
                disabled={!isTeamManager}
                onClick={() => setEventType('Meeting')}
                className={`p-3 rounded-xl border text-sm font-bold transition-all ${eventType === 'Meeting' ? 'bg-tertiary/20 border-tertiary text-tertiary' : 'bg-surface-container border-primary/10 text-on-surface-variant hover:border-primary/30'} ${!isTeamManager ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Meeting
              </button>
              <button
                onClick={() => setEventType('Invite-Only')}
                className={`p-3 rounded-xl border text-sm font-bold transition-all ${eventType === 'Invite-Only' ? 'bg-tertiary/20 border-tertiary text-tertiary' : 'bg-surface-container border-primary/10 text-on-surface-variant hover:border-primary/30'}`}
              >
                Invite-Only
              </button>
            </div>
            {!isAdminOrLeagueManager && (
              <p className="text-xs text-on-surface-variant mt-1 italic">Je rechten beperken welke type evenementen je kan aanmaken.</p>
            )}
          </div>

          <hr className="border-primary/10" />

          {/* Common Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> Datum
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="bg-surface-container border border-primary/20 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                />
             </div>
             <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Tijd
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="bg-surface-container border border-primary/20 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                />
             </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Locatie (Optioneel voor meetings)
            </label>
            <select
              value={venueId}
              onChange={e => setVenueId(e.target.value)}
              className="bg-surface-container border border-primary/20 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
            >
               <option value="">Selecteer locatie...</option>
               {venues.map(v => (
                 <option key={v.id} value={v.id}>{v.name} {v.city ? `(${v.city})` : ''}</option>
               ))}
            </select>
          </div>

          {/* Conditional Fields based on Event Type */}

          {eventType === 'Game' && (
            <div className="flex flex-col gap-4 p-4 border border-primary/20 rounded-xl bg-surface-container-lowest/30">
               <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Seizoen</label>
                  <select
                    value={seasonId}
                    onChange={e => setSeasonId(e.target.value)}
                    className="bg-surface-container border border-primary/20 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                  >
                     <option value="">Selecteer seizoen...</option>
                     {seasons.map(s => (
                       <option key={s.id} value={s.id}>{s.year} {s.start_date ? `(${s.start_date})` : ''}</option>
                     ))}
                  </select>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Thuis Team</label>
                    <select
                      value={homeTeamId}
                      onChange={e => setHomeTeamId(e.target.value)}
                      className="bg-surface-container border border-primary/20 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                    >
                       <option value="">Selecteer thuis team...</option>
                       {teams.map(t => (
                         <option key={t.id} value={t.id}>{t.name}</option>
                       ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Uit Team</label>
                    <select
                      value={awayTeamId}
                      onChange={e => setAwayTeamId(e.target.value)}
                      className="bg-surface-container border border-primary/20 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                    >
                       <option value="">Selecteer uit team...</option>
                       {teams.map(t => (
                         <option key={t.id} value={t.id}>{t.name}</option>
                       ))}
                    </select>
                  </div>
               </div>
            </div>
          )}

          {(eventType === 'Training' || eventType === 'Meeting') && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Selecteer Team</label>
              <select
                value={teamId}
                onChange={e => setTeamId(e.target.value)}
                className="bg-surface-container border border-primary/20 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
              >
                 <option value="">Selecteer team...</option>
                 {teams.map(t => (
                   <option key={t.id} value={t.id}>{t.name}</option>
                 ))}
              </select>
            </div>
          )}

          {eventType === 'Invite-Only' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                 <Users className="w-4 h-4" /> Genodigden
              </label>
              <div className="border border-primary/20 rounded-lg p-2 max-h-48 overflow-y-auto bg-surface-container-lowest/50 custom-scrollbar">
                 {persons.length === 0 ? (
                    <p className="text-sm text-on-surface-variant p-2">Geen personen gevonden.</p>
                 ) : (
                   <div className="flex flex-col gap-1">
                      {persons.map(p => (
                         <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-surface-container rounded-md cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedPersons.includes(p.id)}
                              onChange={() => handlePersonToggle(p.id)}
                              className="w-4 h-4 rounded border-primary/30 text-tertiary focus:ring-tertiary/50 bg-background"
                            />
                            <div className="flex items-center gap-2">
                              {p.photo_url ? (
                                <img src={p.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-surface border border-primary/20 flex items-center justify-center text-[10px] font-bold">
                                  {p.first_name?.[0] || ''}{p.last_name?.[0] || ''}
                                </div>
                              )}
                              <span className="text-sm">{p.first_name} {p.last_name}</span>
                            </div>
                         </label>
                      ))}
                   </div>
                 )}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">{selectedPersons.length} geselecteerd</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Notities / Beschrijving</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="bg-surface-container border border-primary/20 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors min-h-[100px] resize-y"
              placeholder="Extra informatie over dit evenement..."
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full mt-4 py-4 rounded-xl bg-tertiary text-black font-display font-bold text-lg hover:bg-tertiary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-tertiary/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Opslaan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Evenement Inplannen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
