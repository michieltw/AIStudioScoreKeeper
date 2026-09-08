import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Calendar as CalendarIcon, MapPin, Search } from 'lucide-react';
import { fetchGasData } from '../utils/fetchGas';
import { getGasUrl } from '../utils/gasUrl';
import { EcosystemEvent } from '../types';
import { format } from 'date-fns';

interface ScoresScreenProps {
  onBack: () => void;
}

export default function ScoresScreen({ onBack }: ScoresScreenProps) {
  const [games, setGames] = useState<EcosystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Derive available teams from completed games
  const teams = Array.from(new Set(games.flatMap(g => [g.homeTeamName, g.awayTeamName]))).filter(Boolean).sort();

  const filteredGames = games.filter(g => {
    if (selectedTeam !== 'all' && g.homeTeamName !== selectedTeam && g.awayTeamName !== selectedTeam) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchHome = g.homeTeamName?.toLowerCase().includes(q);
      const matchAway = g.awayTeamName?.toLowerCase().includes(q);
      const matchVenue = g.venueName?.toLowerCase().includes(q);
      if (!matchHome && !matchAway && !matchVenue) return false;
    }

    return true;
  });

  // Sort games by date descending (most recent first)
  const sortedGames = [...filteredGames].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return b.time.localeCompare(a.time);
  });

  useEffect(() => {
    const fetchScoresData = async () => {
      const url = getGasUrl();
      if (!url) {
        setError('Geen database URL geconfigureerd. Ga naar Database instellingen.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [gamesRes, teamsRes, venuesRes] = await Promise.all([
          fetchGasData(url, { action: 'getEcosystemData', sheetName: 'games' }),
          fetchGasData(url, { action: 'getEcosystemData', sheetName: 'teams' }),
          fetchGasData(url, { action: 'getEcosystemData', sheetName: 'venues' })
        ]);

        const [gamesData, teamsData, venuesData] = await Promise.all([
          gamesRes.json(),
          teamsRes.json(),
          venuesRes.json()
        ]);

        let mappedTeams: Record<string, {name: string, logoUrl: string}> = {};
        if (teamsData.status === 'Success' && Array.isArray(teamsData.data) && teamsData.data.length > 1) {
          const headers = teamsData.data[0];
          const idIdx = headers.indexOf('id');
          const nameIdx = headers.indexOf('name');
          const logoIdx = headers.indexOf('logo_url');
          if (idIdx !== -1) {
            mappedTeams = teamsData.data.slice(1).reduce((acc: any, row: any[]) => {
              if (row[idIdx]) {
                acc[row[idIdx]] = {
                  name: nameIdx !== -1 ? row[nameIdx] : undefined,
                  logoUrl: logoIdx !== -1 ? row[logoIdx] : undefined
                };
              }
              return acc;
            }, {});
          }
        }

        let mappedVenues: Record<string, string> = {};
        if (venuesData.status === 'Success' && Array.isArray(venuesData.data) && venuesData.data.length > 1) {
          const headers = venuesData.data[0];
          const idIdx = headers.indexOf('id');
          const nameIdx = headers.indexOf('name');
          if (idIdx !== -1) {
            mappedVenues = venuesData.data.slice(1).reduce((acc: any, row: any[]) => {
               if (row[idIdx]) {
                  acc[row[idIdx]] = nameIdx !== -1 ? row[nameIdx] : undefined;
               }
               return acc;
            }, {});
          }
        }

        const fetchedGames: EcosystemEvent[] = [];

        if (gamesData.status === 'Success' && Array.isArray(gamesData.data) && gamesData.data.length > 1) {
           const headers = gamesData.data[0];
           const idIdx = headers.indexOf('id');
           const homeTeamIdx = headers.indexOf('home_team_id');
           const awayTeamIdx = headers.indexOf('away_team_id');
           const venueIdx = headers.indexOf('venue_id');
           const scheduledAtIdx = headers.indexOf('scheduled_at');
           const homeScoreIdx = headers.indexOf('home_score');
           const awayScoreIdx = headers.indexOf('away_score');
           const statusIdx = headers.indexOf('status');

           if (idIdx !== -1) {
             gamesData.data.slice(1).forEach((row: any[]) => {
                if (row[idIdx]) {
                   const status = statusIdx !== -1 ? row[statusIdx] : undefined;
                   // Only include completed games
                   if (status === 'Completed' || (row[homeScoreIdx] !== undefined && row[homeScoreIdx] !== '' && row[awayScoreIdx] !== undefined && row[awayScoreIdx] !== '')) {
                     const hTeamId = homeTeamIdx !== -1 ? row[homeTeamIdx] : undefined;
                     const aTeamId = awayTeamIdx !== -1 ? row[awayTeamIdx] : undefined;
                     const vId = venueIdx !== -1 ? row[venueIdx] : undefined;
                     const sDate = scheduledAtIdx !== -1 ? row[scheduledAtIdx] : undefined;

                     fetchedGames.push({
                       id: row[idIdx],
                       eventType: 'Game',
                       date: sDate ? format(new Date(sDate), 'yyyy-MM-dd') : '',
                       time: sDate ? format(new Date(sDate), 'HH:mm') : '',
                       homeTeamName: hTeamId ? mappedTeams[hTeamId]?.name || hTeamId : undefined,
                       awayTeamName: aTeamId ? mappedTeams[aTeamId]?.name || aTeamId : undefined,
                       homeTeamLogo: hTeamId ? mappedTeams[hTeamId]?.logoUrl : undefined,
                       awayTeamLogo: aTeamId ? mappedTeams[aTeamId]?.logoUrl : undefined,
                       venueName: vId ? mappedVenues[vId] || 'TBD' : 'TBD',
                       homeScore: homeScoreIdx !== -1 ? row[homeScoreIdx] : undefined,
                       awayScore: awayScoreIdx !== -1 ? row[awayScoreIdx] : undefined,
                       status: status
                     } as any);
                   }
                }
             });
           }
        }

        setGames(fetchedGames);

      } catch (err: any) {
        console.error('Failed to fetch scores', err);
        setError('Failed to fetch scores data');
      } finally {
        setLoading(false);
      }
    };

    fetchScoresData();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-tertiary/10 via-background to-background pointer-events-none" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex-none p-4 md:p-6 pb-0 flex flex-col gap-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Ga terug"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-on-surface to-on-surface-variant">
              Scores
            </h1>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-on-surface-variant/50" />
            </div>
            <input
              type="text"
              placeholder="Search team or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container border border-primary/20 rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full sm:w-48 bg-surface-container border border-primary/20 rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="all">All Teams</option>
            {teams.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 p-4 md:p-6 overflow-hidden flex flex-col max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-tertiary" />
            <p className="text-lg">Loading scores...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-error p-8 text-center bg-error/10 rounded-xl border border-error/20">
            <p>{error}</p>
          </div>
        ) : sortedGames.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-container-lowest border border-primary/20 rounded-xl">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4 border border-primary/10">
              <CalendarIcon className="w-8 h-8 text-on-surface-variant/50" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">No scores found</h3>
            <p className="text-on-surface-variant text-center max-w-md">
              There are no completed games matching your filters.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {sortedGames.map((game) => (
              <div
                key={game.id}
                className="bg-surface-container-low border border-primary/20 rounded-xl overflow-hidden hover:border-primary/50 transition-colors metallic-surface"
              >
                <div className="flex flex-col sm:flex-row items-stretch">
                  {/* Match Info & Teams */}
                  <div className="flex-1 p-4 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-primary/20">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{game.date} • {game.time}</span>
                      </div>
                      {game.status && game.status !== 'Completed' && (
                        <span className="text-xs px-2 py-0.5 bg-surface-container rounded-full text-on-surface-variant">
                          {game.status}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 w-1/3 justify-start">
                        {game.homeTeamLogo ? (
                          <img src={game.homeTeamLogo} alt={game.homeTeamName} className="w-10 h-10 object-contain drop-shadow-md" />
                        ) : (
                          <div className="w-10 h-10 bg-surface border border-primary/20 rounded-full flex items-center justify-center text-sm font-bold shadow-inner flex-shrink-0">
                            {game.homeTeamName?.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-lg hidden sm:block truncate" title={game.homeTeamName}>{game.homeTeamName || 'Unknown'}</span>
                        <span className="font-bold text-lg sm:hidden truncate" title={game.homeTeamName}>{game.homeTeamName?.substring(0,3).toUpperCase() || 'UNK'}</span>
                      </div>

                      <div className="flex flex-col items-center justify-center px-4 font-display font-bold text-2xl md:text-3xl tracking-wider text-tertiary drop-shadow-sm whitespace-nowrap">
                        <span>{game.homeScore} - {game.awayScore}</span>
                      </div>

                      <div className="flex items-center gap-3 w-1/3 justify-end">
                        <span className="font-bold text-lg hidden sm:block truncate text-right" title={game.awayTeamName}>{game.awayTeamName || 'Unknown'}</span>
                        <span className="font-bold text-lg sm:hidden truncate text-right" title={game.awayTeamName}>{game.awayTeamName?.substring(0,3).toUpperCase() || 'UNK'}</span>
                        {game.awayTeamLogo ? (
                          <img src={game.awayTeamLogo} alt={game.awayTeamName} className="w-10 h-10 object-contain drop-shadow-md" />
                        ) : (
                          <div className="w-10 h-10 bg-surface border border-primary/20 rounded-full flex items-center justify-center text-sm font-bold shadow-inner flex-shrink-0">
                            {game.awayTeamName?.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Venue Info */}
                  <div className="sm:w-1/4 p-4 flex flex-col items-center justify-center gap-2 bg-surface-container-lowest/50 text-on-surface-variant text-sm">
                     <MapPin className="w-5 h-5 opacity-70" />
                     <span className="text-center font-medium">{game.venueName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
