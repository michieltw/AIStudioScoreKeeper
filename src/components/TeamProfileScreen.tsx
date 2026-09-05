import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Users, Calendar, MapPin, Trophy, Shield, ExternalLink, Loader2 } from 'lucide-react';
import { getGasUrl } from '../utils/gasUrl';
import { fetchGasData } from '../utils/fetchGas';

interface TeamProfileScreenProps {
  teamId: string;
  teamName: string;
  onBack: () => void;
  onViewPerson?: (person: any) => void;
}

export default function TeamProfileScreen({ teamId, teamName, onBack, onViewPerson }: TeamProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'schedule'>('overview');
  const [loading, setLoading] = useState(true);

  const [teamData, setTeamData] = useState<any>(null);
  const [rosterData, setRosterData] = useState<any[]>([]);
  const [scheduleData, setScheduleData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = getGasUrl();
        if (!url) {
          setLoading(false);
          return;
        }

        // Fetch teams
        const teamsRes = await fetchGasData(url, { action: 'getEcosystemData', sheetName: 'teams' });
        const teamsJson = await teamsRes.json();

        if (teamsJson.status === 'Success' && teamsJson.data.length > 1) {
            const headers = teamsJson.data[0];
            const idIdx = headers.indexOf('id');
            const rows = teamsJson.data.slice(1);
            const teamRow = rows.find((r: any[]) => r[idIdx] === teamId);

            if (teamRow) {
                const mappedTeam = headers.reduce((acc: any, curr: string, idx: number) => {
                    acc[curr] = teamRow[idx];
                    return acc;
                }, {});
                setTeamData(mappedTeam);
            }
        }

        // Fetch Roster Members
        const rosterRes = await fetchGasData(url, { action: 'getEcosystemData', sheetName: 'roster_members' });
        const rosterJson = await rosterRes.json();

        // Fetch Persons (to join for photos/details)
        const personsRes = await fetchGasData(url, { action: 'getEcosystemData', sheetName: 'persons' });
        const personsJson = await personsRes.json();

        let personsMap: Record<string, any> = {};
        if (personsJson.status === 'Success' && personsJson.data.length > 1) {
             const pHeaders = personsJson.data[0];
             const pIdIdx = pHeaders.indexOf('id');
             personsJson.data.slice(1).forEach((r: any[]) => {
                 if (pIdIdx !== -1 && r[pIdIdx]) {
                     personsMap[r[pIdIdx]] = pHeaders.reduce((acc: any, curr: string, idx: number) => {
                        acc[curr] = r[idx];
                        return acc;
                     }, {});
                 }
             });
        }

        // Check if 'rosters' sheet exists to map roster_id -> team_id
        const rostersRes = await fetchGasData(url, { action: 'getEcosystemData', sheetName: 'rosters' });
        const rostersJson = await rostersRes.json();

        let validRosterIds = new Set();
        if (rostersJson.status === 'Success' && rostersJson.data.length > 1) {
            const rHeaders = rostersJson.data[0];
            const rIdIdx = rHeaders.indexOf('id');
            const tIdIdx = rHeaders.indexOf('team_id');

            rostersJson.data.slice(1).forEach((r: any[]) => {
                if (tIdIdx !== -1 && r[tIdIdx] === teamId && rIdIdx !== -1) {
                    validRosterIds.add(r[rIdIdx]);
                }
            });
        }

        if (rosterJson.status === 'Success' && rosterJson.data.length > 1) {
             const rmHeaders = rosterJson.data[0];
             const rmRosterIdIdx = rmHeaders.indexOf('roster_id');
             const rmPersonIdIdx = rmHeaders.indexOf('person_id');
             const rmPositionIdx = rmHeaders.indexOf('position');
             const rmJerseyIdx = rmHeaders.indexOf('jersey_number');

             const mappedRoster = rosterJson.data.slice(1)
                .filter((r: any[]) => rmRosterIdIdx !== -1 && validRosterIds.has(r[rmRosterIdIdx]))
                .map((r: any[]) => {
                    const personId = r[rmPersonIdIdx];
                    const personDetails = personsMap[personId] || {};
                    return {
                        id: personId,
                        name: r[rmHeaders.indexOf('person_full_name')] || `${personDetails.first_name || ''} ${personDetails.last_name || ''}`.trim() || 'Unknown Player',
                        position: r[rmPositionIdx] || personDetails.plays_position || 'Player',
                        jersey_number: r[rmJerseyIdx] || personDetails.jersey_number || '-',
                        photo_url: personDetails.photo_url || null,
                        nationality: personDetails.nationality || null
                    }
                });
             setRosterData(mappedRoster);
        }

        // Fetch Games/Schedule
        const gamesRes = await fetchGasData(url, { action: 'getEcosystemData', sheetName: 'games' });
        const gamesJson = await gamesRes.json();

        if (gamesJson.status === 'Success' && gamesJson.data.length > 1) {
            const gHeaders = gamesJson.data[0];
            const gHomeTeamIdx = gHeaders.indexOf('home_team_id');
            const gAwayTeamIdx = gHeaders.indexOf('away_team_id');
            const gStatusIdx = gHeaders.indexOf('status');
            const gScheduledAtIdx = gHeaders.indexOf('scheduled_at');
            const gHomeScoreIdx = gHeaders.indexOf('home_score');
            const gAwayScoreIdx = gHeaders.indexOf('away_score');
            const gIdIdx = gHeaders.indexOf('id');

            // Map team IDs to Names for display
            let teamNameMap: Record<string, string> = { [teamId]: teamData?.name || teamName };
            if (teamsJson.status === 'Success') {
                const th = teamsJson.data[0];
                const tidIdx = th.indexOf('id');
                const tnameIdx = th.indexOf('name');
                teamsJson.data.slice(1).forEach((tr: any[]) => {
                    if (tidIdx !== -1 && tnameIdx !== -1) {
                        teamNameMap[tr[tidIdx]] = tr[tnameIdx];
                    }
                });
            }

            const mappedGames = gamesJson.data.slice(1)
                .filter((g: any[]) => (gHomeTeamIdx !== -1 && g[gHomeTeamIdx] === teamId) || (gAwayTeamIdx !== -1 && g[gAwayTeamIdx] === teamId))
                .map((g: any[]) => {
                    return {
                        id: gIdIdx !== -1 ? g[gIdIdx] : Math.random().toString(),
                        homeTeamId: g[gHomeTeamIdx],
                        awayTeamId: g[gAwayTeamIdx],
                        homeTeamName: teamNameMap[g[gHomeTeamIdx]] || 'Unknown Home',
                        awayTeamName: teamNameMap[g[gAwayTeamIdx]] || 'Unknown Away',
                        status: g[gStatusIdx] || 'Scheduled',
                        date: g[gScheduledAtIdx] ? String(g[gScheduledAtIdx]).substring(0, 10) : 'TBD',
                        homeScore: g[gHomeScoreIdx] || 0,
                        awayScore: g[gAwayScoreIdx] || 0
                    }
                });

            // Sort by date (descending)
            mappedGames.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setScheduleData(mappedGames);
        }

      } catch (err) {
        console.error('Failed to fetch team profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId, teamName]);

  const displayTeamName = teamData?.name || teamName || 'Unknown Team';
  const logoUrl = teamData?.logo_url;

  // Dummy stats for overview
  const stats = {
      wins: scheduleData.filter(g => g.status?.toLowerCase() === 'completed' && ((g.homeTeamId === teamId && g.homeScore > g.awayScore) || (g.awayTeamId === teamId && g.awayScore > g.homeScore))).length,
      losses: scheduleData.filter(g => g.status?.toLowerCase() === 'completed' && ((g.homeTeamId === teamId && g.homeScore < g.awayScore) || (g.awayTeamId === teamId && g.awayScore < g.homeScore))).length,
      ties: scheduleData.filter(g => g.status?.toLowerCase() === 'completed' && g.homeScore === g.awayScore).length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4 bg-surface-container-low/50 backdrop-blur-md sticky top-0 z-50">
        <button
          onClick={onBack}
          className="text-on-surface-variant hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-white uppercase tracking-wider">{displayTeamName}</span>
        <div className="w-9" />
      </div>

      {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-tertiary" />
              <span className="font-mono text-sm tracking-widest uppercase">Loading Profile...</span>
          </div>
      ) : (
          <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto flex flex-col bg-background pb-8">

            {/* Banner & Header Profile */}
            <div className="relative">
                <div className="w-full h-40 md:h-52 bg-gradient-to-tr from-surface-container-high to-tertiary/20 overflow-hidden relative">
                     {/* Decorative background element */}
                     <div className="absolute -bottom-10 -right-10 opacity-10">
                         <Shield className="w-64 h-64" />
                     </div>
                </div>

                <div className="px-4 pb-4 border-b border-[#2A2A2A] relative -mt-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 relative z-20">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl border-4 border-background bg-surface-container-highest flex items-center justify-center shrink-0 shadow-2xl overflow-hidden p-2">
                                {logoUrl ? (
                                    <img src={logoUrl} alt={displayTeamName} className="w-full h-full object-contain" />
                                ) : (
                                    <Shield className="w-16 h-16 text-tertiary/50" />
                                )}
                            </div>

                            <div className="text-center md:text-left pb-2">
                                <h1 className="text-3xl font-bold text-white uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
                                    {displayTeamName}
                                </h1>
                                <p className="text-tertiary font-mono font-bold mt-1 text-sm flex items-center justify-center md:justify-start gap-1">
                                    EST. {teamData?.founded_year || '2024'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 justify-center pb-2">
                            <button onClick={() => alert(`You are now following ${displayTeamName}`)} className="bg-tertiary text-black hover:brightness-110 px-6 py-2 rounded-md font-bold text-sm tracking-wide uppercase transition-colors shadow-lg active:scale-95">
                                Follow Team
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pt-2">
                        {['overview', 'roster', 'schedule'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`py-2 px-6 font-bold text-sm tracking-wider rounded-md transition-colors whitespace-nowrap uppercase font-mono ${
                                    activeTab === tab ? 'bg-surface-container-low text-tertiary border border-[#3A3A3A]' : 'text-on-surface-variant hover:bg-surface-container-lowest border border-transparent'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 bg-transparent min-h-[400px]">

                {/* TAB: Overview */}
                {activeTab === 'overview' && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-card-gradient metallic-border rounded-lg p-4 flex flex-col items-center justify-center text-center gap-1 shadow-sm soft-glow">
                                <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Wins</span>
                                <span className="text-2xl font-bold text-emerald-400 glow-text">{stats.wins}</span>
                            </div>
                            <div className="bg-card-gradient metallic-border rounded-lg p-4 flex flex-col items-center justify-center text-center gap-1 shadow-sm soft-glow">
                                <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Losses</span>
                                <span className="text-2xl font-bold text-red-400 glow-text">{stats.losses}</span>
                            </div>
                            <div className="bg-card-gradient metallic-border rounded-lg p-4 flex flex-col items-center justify-center text-center gap-1 shadow-sm soft-glow">
                                <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Ties</span>
                                <span className="text-2xl font-bold text-gray-300 glow-text">{stats.ties}</span>
                            </div>
                             <div className="bg-card-gradient metallic-border rounded-lg p-4 flex flex-col items-center justify-center text-center gap-1 shadow-sm soft-glow">
                                <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Roster Size</span>
                                <span className="text-2xl font-bold text-white glow-text">{rosterData.length}</span>
                            </div>
                        </div>

                        <div className="bg-card-gradient metallic-border rounded-lg p-5 shadow-sm mt-2">
                            <h3 className="text-white font-bold text-lg border-b border-[#2A2A2A] pb-3 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-tertiary" />
                                Team Info
                            </h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-24 shrink-0 text-sm font-mono text-gray-500 uppercase tracking-wider">Description</div>
                                    <div className="text-sm text-gray-300 leading-relaxed">{teamData?.description || 'No description available for this team.'}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 shrink-0 text-sm font-mono text-gray-500 uppercase tracking-wider">Coach</div>
                                    <div className="text-sm text-white font-medium">{teamData?.coach_id || 'TBD'}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 shrink-0 text-sm font-mono text-gray-500 uppercase tracking-wider">Est.</div>
                                    <div className="text-sm text-white font-medium">{teamData?.founded_year || 'Unknown'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: Roster */}
                {activeTab === 'roster' && (
                    <div className="bg-card-gradient metallic-border rounded-lg p-5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3 mb-4">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-tertiary" />
                                Active Roster
                            </h3>
                            <span className="text-xs font-mono text-gray-500 bg-[#050505] px-2 py-1 rounded">{rosterData.length} Players</span>
                        </div>

                        {rosterData.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {rosterData.map(player => (
                                    <div
                                      key={player.id}
                                      onClick={() => onViewPerson && onViewPerson({id: player.id, name: player.name, plays_position: player.position, jersey_number: player.jersey_number, photo_url: player.photo_url})}
                                      className="bg-surface-container-lowest border border-[#2A2A2A] rounded-lg p-3 flex items-center gap-4 hover:border-tertiary/50 transition-colors cursor-pointer group"
                                    >
                                        <div className="w-12 h-12 bg-surface-container-high rounded-full overflow-hidden shrink-0 border border-[#2A2A2A] flex items-center justify-center group-hover:border-tertiary transition-colors">
                                             {player.photo_url ? (
                                                 <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                                             ) : (
                                                 <Users className="w-5 h-5 text-gray-500" />
                                             )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-bold text-sm truncate group-hover:text-tertiary transition-colors">{player.name}</h4>
                                            <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mt-0.5">
                                                <span>{player.position}</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-lg font-bold text-gray-300 opacity-50 group-hover:opacity-100 group-hover:text-white transition-all">#{player.jersey_number}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-gray-500 font-mono text-sm border border-dashed border-[#2A2A2A] rounded-lg">
                                No players currently assigned to this team's roster.
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: Schedule */}
                {activeTab === 'schedule' && (
                    <div className="bg-card-gradient metallic-border rounded-lg p-5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3 mb-4">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-tertiary" />
                                Schedule & Results
                            </h3>
                        </div>

                        {scheduleData.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {scheduleData.map(game => (
                                    <div key={game.id} className="bg-surface-container-lowest border border-[#2A2A2A] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{game.date} • {game.status}</span>
                                            <div className="flex items-center gap-3 text-sm font-bold text-white mt-1">
                                                <span className={game.homeTeamId === teamId ? 'text-tertiary' : ''}>{game.homeTeamName}</span>
                                                <span className="text-gray-500 font-mono text-xs px-2 py-0.5 bg-[#050505] rounded">VS</span>
                                                <span className={game.awayTeamId === teamId ? 'text-tertiary' : ''}>{game.awayTeamName}</span>
                                            </div>
                                        </div>
                                        {game.status?.toLowerCase() === 'completed' && (
                                            <div className="flex items-center gap-3 shrink-0 bg-[#050505] px-4 py-2 rounded-md border border-[#2A2A2A]">
                                                <span className={`text-lg font-bold ${game.homeScore > game.awayScore ? 'text-white' : 'text-gray-500'}`}>{game.homeScore}</span>
                                                <span className="text-gray-600">-</span>
                                                <span className={`text-lg font-bold ${game.awayScore > game.homeScore ? 'text-white' : 'text-gray-500'}`}>{game.awayScore}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-gray-500 font-mono text-sm border border-dashed border-[#2A2A2A] rounded-lg">
                                No games scheduled for this team.
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>
      )}
    </div>
  );
}
