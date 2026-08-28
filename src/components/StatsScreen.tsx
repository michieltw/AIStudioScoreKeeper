import { dbSchema } from '../types';
import { getGasUrl } from '../utils/gasUrl';
import { fetchGasData } from '../utils/fetchGas';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

interface StatsScreenProps {
  onBack: () => void;
}

const ensure2DArray = (val: any): any[][] => {
  if (!val) return [];
  if (Array.isArray(val)) {
    if (val.length === 0) return [];
    if (Array.isArray(val[0])) return val;
    return [val];
  }
  if (val && Array.isArray(val.data)) {
    if (val.data.length === 0) return [];
    if (Array.isArray(val.data[0])) return val.data;
    return [val.data];
  }
  return [];
};

export default function StatsScreen({ onBack }: StatsScreenProps) {
  const [activeTab, setActiveTab] = useState<'skaters' | 'goalies' | 'teams'>('skaters');
  const [standings, setStandings] = useState<any[][]>([]);
  const [stats, setStats] = useState<any[][]>([]);
  const [goalies, setGoalies] = useState<any[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [seasonFilter, setSeasonFilter] = useState<string>('All');
  const [teamFilter, setTeamFilter] = useState<string>('All');

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: number, direction: 'asc' | 'desc' } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Reset pagination when filters or tabs change
  useEffect(() => {
    setCurrentPage(1);
    setSortConfig(null);
  }, [activeTab, seasonFilter, teamFilter]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const gasUrl = getGasUrl();

      if (!gasUrl) {
        setError('Geen database URL geconfigureerd. Ga naar Database instellingen.');
        setLoading(false);
        return;
      }

      try {
        const [standingsRes, statsRes, goaliesRes] = await Promise.all([
          fetchGasData(`${gasUrl}`, { action: 'getStandings' }),
          fetchGasData(`${gasUrl}`, { action: 'getStats' }),
          fetchGasData(`${gasUrl}`, { action: 'getGoalieStats' }).catch(() => null)
        ]);

        const standingsRaw = await standingsRes.json();
        const statsRaw = await statsRes.json();
        let goaliesRaw: any = [];
        if (goaliesRes && goaliesRes.ok) {
          goaliesRaw = await goaliesRes.json();
        }

        // The GAS script returns a 2D array representing rows, including the header.
        setStandings(ensure2DArray(standingsRaw));
        setStats(ensure2DArray(statsRaw));
        setGoalies(ensure2DArray(goaliesRaw));
      } catch (e: any) {
        setError('Fout bij het ophalen van gegevens: ' + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter derivation logic
  const getUniqueValues = (data: any[][], columnIndex: number) => {
    if (!Array.isArray(data) || data.length <= 1) return ['All'];
    const values = new Set<string>();
    data.slice(1).forEach(row => {
      if (Array.isArray(row) && row[columnIndex] !== undefined && row[columnIndex] !== null && String(row[columnIndex]).trim() !== '') {
        values.add(String(row[columnIndex]));
      }
    });
    return ['All', ...Array.from(values).sort()];
  };

  // Indexes based on dbSchema
  const statsHeaders = dbSchema['player_stats'] || (Array.isArray(stats[0]) ? stats[0] : []);
  const teamHeaders = dbSchema['standings'] || (Array.isArray(standings[0]) ? standings[0] : []);

  const seasonColIndexStats = statsHeaders.indexOf('season_id');
  const teamColIndexStats = statsHeaders.indexOf('team_name'); // using team_name if available, otherwise team_id

  const seasonColIndexStandings = teamHeaders.indexOf('season_id');

  // Currently active data based on tab to populate filter dropdowns
  let currentDataForFilters: any[][] = [];
  if (activeTab === 'skaters') currentDataForFilters = stats;
  if (activeTab === 'goalies') currentDataForFilters = goalies;
  if (activeTab === 'teams') currentDataForFilters = standings;

  const currentHeaders = (activeTab === 'skaters' ? statsHeaders : (activeTab === 'teams' ? teamHeaders : (dbSchema['goalie_stats'] || (Array.isArray(goalies[0]) ? goalies[0] : []))));
  const currentSeasonColIndex = currentHeaders.indexOf('season_id');
  const currentTeamColIndex = currentHeaders.indexOf('team_name') > -1 ? currentHeaders.indexOf('team_name') : currentHeaders.indexOf('team_id');

  const availableSeasons = currentSeasonColIndex > -1 ? getUniqueValues(currentDataForFilters, currentSeasonColIndex) : ['All'];
  const availableTeams = currentTeamColIndex > -1 && activeTab !== 'teams' ? getUniqueValues(currentDataForFilters, currentTeamColIndex) : ['All'];

  // Apply filters function
  const filterData = (data: any[][], seasonIndex: number, teamIndex: number) => {
    if (!Array.isArray(data) || data.length <= 1) return Array.isArray(data) ? data : [];
    const headers = data[0];
    const rows = data.slice(1).filter(row => {
      if (!Array.isArray(row)) return false;
      const matchSeason = seasonFilter === 'All' || (seasonIndex > -1 && String(row[seasonIndex]) === seasonFilter);
      const matchTeam = teamFilter === 'All' || (teamIndex > -1 && String(row[teamIndex]) === teamFilter) || activeTab === 'teams';
      return matchSeason && matchTeam;
    });
    return [headers, ...rows];
  };

  const sortData = (data: any[][]) => {
    if (!Array.isArray(data) || data.length <= 1 || !sortConfig) return Array.isArray(data) ? data : [];
    const headers = data[0];
    const rows = [...data.slice(1)].filter(r => Array.isArray(r));
    rows.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // Try numeric sort first
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
         return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // Fallback to string sort
      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return [headers, ...rows];
  };

  const handleSort = (columnIndex: number) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === columnIndex && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key: columnIndex, direction });
  };

  const filteredStats = sortData(filterData(stats, seasonColIndexStats, teamColIndexStats));
  const filteredGoalies = sortData(filterData(goalies, (dbSchema['goalie_stats'] || (Array.isArray(goalies[0]) ? goalies[0] : [])).indexOf('season_id'), (dbSchema['goalie_stats'] || (Array.isArray(goalies[0]) ? goalies[0] : [])).indexOf('team_name')));
  const filteredStandings = sortData(filterData(standings, seasonColIndexStandings, -1));

  const getCurrentPageData = (data: any[][]) => {
    if (!Array.isArray(data) || data.length <= 1) return Array.isArray(data) ? data : [];
    const headers = data[0];
    const rows = data.slice(1).filter(r => Array.isArray(r));
    const startIdx = (currentPage - 1) * rowsPerPage;
    const paginatedRows = rows.slice(startIdx, startIdx + rowsPerPage);
    return [headers, ...paginatedRows];
  };

  const displayStats = getCurrentPageData(filteredStats);
  const displayGoalies = getCurrentPageData(filteredGoalies);
  const displayStandings = getCurrentPageData(filteredStandings);

  const getTotalPages = (data: any[][]) => {
    if (!Array.isArray(data) || data.length <= 1) return 1;
    return Math.ceil((data.length - 1) / rowsPerPage);
  };

  // Leaderboards logic
  const getTopLeaders = (data: any[][], metricHeader: string, nameHeader: string, count: number = 3) => {
    if (!Array.isArray(data) || data.length <= 1) return [];
    const headers = data[0];
    if (!Array.isArray(headers)) return [];
    const metricIdx = headers.indexOf(metricHeader);
    const nameIdx = headers.indexOf(nameHeader);
    const teamIdx = headers.indexOf('team_name') > -1 ? headers.indexOf('team_name') : headers.indexOf('team_id');

    if (metricIdx === -1 || nameIdx === -1) return [];

    const rows = data.slice(1).filter(r => Array.isArray(r)).map(row => ({
      name: String(row[nameIdx] || 'Unknown'),
      team: teamIdx > -1 ? String(row[teamIdx] || '') : '',
      value: Number(row[metricIdx]) || 0
    }));

    // Sort descending
    rows.sort((a, b) => b.value - a.value);

    return rows.slice(0, count);
  };

  const skaterLeaders = [
    { title: 'Goals', data: getTopLeaders(filteredStats, 'goals', 'person_full_name') },
    { title: 'Assists', data: getTopLeaders(filteredStats, 'assists', 'person_full_name') },
    { title: 'Points', data: getTopLeaders(filteredStats, 'points', 'person_full_name') }
  ];

  const goalieLeaders = [
    { title: 'Wins', data: getTopLeaders(filteredGoalies, 'wins', 'person_full_name') },
    { title: 'Save %', data: getTopLeaders(filteredGoalies, 'save_percentage', 'person_full_name') },
    { title: 'GAA', data: getTopLeaders(filteredGoalies, 'goals_against_average', 'person_full_name') },
  ];

  // Custom logic for GAA to sort ascending (lower is better, assuming >= some games played)
  if (goalieLeaders[2] && Array.isArray(filteredGoalies) && filteredGoalies.length > 1) {
      const gHeaders = filteredGoalies[0];
      if (Array.isArray(gHeaders)) {
        const gaaIdx = gHeaders.indexOf('goals_against_average');
        const nameIdx = gHeaders.indexOf('person_full_name');
        const teamIdx = gHeaders.indexOf('team_name') > -1 ? gHeaders.indexOf('team_name') : gHeaders.indexOf('team_id');
        const gpIdx = gHeaders.indexOf('games_played');

        if (gaaIdx > -1 && nameIdx > -1) {
            const rows = filteredGoalies.slice(1)
              .filter(row => Array.isArray(row) && (gpIdx > -1 ? Number(row[gpIdx]) > 0 : true))
              .map(row => ({
                name: String(row[nameIdx] || 'Unknown'),
                team: teamIdx > -1 ? String(row[teamIdx] || '') : '',
                value: Number(row[gaaIdx]) || 0
            }));
            rows.sort((a, b) => a.value - b.value);
            goalieLeaders[2].data = rows.slice(0, 3);
        }
      }
  }


  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-surface-container-low/50 backdrop-blur-md border-b border-[#2A2A2A] sticky top-0 z-50">
        <button
          onClick={onBack}
          className="text-on-surface-variant hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-[18px] font-bold text-white uppercase tracking-wider">
          Statistieken
        </h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full flex flex-col gap-6 pt-6 pb-12">
        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-1 bg-[#050505] border border-[#2A2A2A] rounded-lg p-1">
          <button
            onClick={() => setActiveTab('skaters')}
            className={`flex-1 flex items-center justify-center py-2 rounded-md font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'skaters' ? 'bg-tertiary text-black' : 'text-gray-500 hover:text-white'
            }`}
          >
            Skaters
          </button>
          <button
            onClick={() => setActiveTab('goalies')}
            className={`flex-1 flex items-center justify-center py-2 rounded-md font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'goalies' ? 'bg-tertiary text-black' : 'text-gray-500 hover:text-white'
            }`}
          >
            Goalies
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 flex items-center justify-center py-2 rounded-md font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'teams' ? 'bg-tertiary text-black' : 'text-gray-500 hover:text-white'
            }`}
          >
            Teams
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-surface-container-low p-4 rounded-lg border border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-2 sm:mb-0 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-tertiary" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-on-surface-variant">Filters</span>
          </div>

          <div className="flex flex-1 gap-4 flex-wrap">
            {currentSeasonColIndex > -1 && (
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Season</label>
                <select
                  value={seasonFilter}
                  onChange={(e) => setSeasonFilter(e.target.value)}
                  className="bg-[#050505] text-white text-sm font-mono p-2 rounded border border-[#2A2A2A] focus:border-tertiary focus:outline-none min-w-[120px]"
                >
                  {availableSeasons.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {activeTab !== 'teams' && currentTeamColIndex > -1 && (
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Team</label>
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="bg-[#050505] text-white text-sm font-mono p-2 rounded border border-[#2A2A2A] focus:border-tertiary focus:outline-none min-w-[120px]"
                >
                  {availableTeams.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboards */}
        {!loading && !error && activeTab !== 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(activeTab === 'skaters' ? skaterLeaders : goalieLeaders).map((leaderGroup, idx) => (
              <div key={idx} className="bg-surface-container-lowest border border-[#2A2A2A] rounded-lg overflow-hidden flex flex-col">
                <div className="bg-surface-container-low px-4 py-2 border-b border-[#2A2A2A]">
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">{leaderGroup.title}</h3>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-3">
                  {leaderGroup.data.length > 0 ? leaderGroup.data.map((leader, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 text-center font-mono text-xs font-bold text-gray-500">{i + 1}</div>
                        <div>
                          <div className="font-bold text-sm text-white">{leader.name}</div>
                          <div className="text-xs text-on-surface-variant">{leader.team}</div>
                        </div>
                      </div>
                      <div className="font-mono text-base font-bold text-tertiary">
                        {leaderGroup.title === 'Save %' ? (leader.value.toFixed(3).replace(/^0+/, '')) : leader.value}
                      </div>
                    </div>
                  )) : (
                    <div className="text-xs text-gray-500 font-mono italic text-center py-4">Geen data</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && (
          <div className="flex items-center justify-between bg-surface-container-low px-4 py-2 rounded-lg border border-[#2A2A2A]">
            <div className="text-xs font-mono text-on-surface-variant">
              Page {currentPage} of {activeTab === 'skaters' ? Math.max(1, getTotalPages(filteredStats)) : activeTab === 'goalies' ? Math.max(1, getTotalPages(filteredGoalies)) : Math.max(1, getTotalPages(filteredStandings))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded bg-[#050505] border border-[#2A2A2A] text-on-surface-variant hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const maxPages = activeTab === 'skaters' ? getTotalPages(filteredStats) : activeTab === 'goalies' ? getTotalPages(filteredGoalies) : getTotalPages(filteredStandings);
                  setCurrentPage(prev => Math.min(maxPages, prev + 1));
                }}
                disabled={currentPage === (activeTab === 'skaters' ? Math.max(1, getTotalPages(filteredStats)) : activeTab === 'goalies' ? Math.max(1, getTotalPages(filteredGoalies)) : Math.max(1, getTotalPages(filteredStandings)))}
                className="p-1 rounded bg-[#050505] border border-[#2A2A2A] text-on-surface-variant hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-tertiary">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <span className="font-mono text-xs uppercase tracking-widest">Gegevens laden...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center text-red-400 text-sm font-mono">
            {error}
          </div>
        ) : (
          <div className="bg-surface-container-low metallic-border rounded-lg overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 inner-glow">
            {activeTab === 'teams' && displayStandings.length > 0 && (() => {
              const headers = displayStandings[0] || [];
              const displayColumns = [
                { key: 'position', label: 'POS' },
                { key: 'team_id', label: 'Team' },
                { key: 'games_played', label: 'GP' },
                { key: 'wins', label: 'W' },
                { key: 'losses', label: 'L' },
                { key: 'ties', label: 'T' },
                { key: 'points', label: 'PTS' }
              ];
              const colIndices = displayColumns.map(c => ({
                ...c,
                idx: headers.indexOf(c.key)
              })).filter(c => c.idx > -1);

              return (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#121414] border-b border-[#2A2A2A]">
                    {colIndices.map((col, i) => (
                      <th
                        key={i}
                        onClick={() => handleSort(col.idx)}
                        className="p-3 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {displayStandings.slice(1).map((row: any[], i: number) => (
                    <tr key={i} className="hover:bg-white/10 transition-colors">
                      {colIndices.map((col, j) => (
                        <td key={j} className={`p-3 text-sm whitespace-nowrap ${col.key === 'team_id' ? 'font-bold text-white' : 'text-gray-300 font-mono'}`}>
                          {row[col.idx]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              );
            })()}

            {activeTab === 'teams' && filteredStandings.length <= 1 && (
              <div className="p-8 text-center text-gray-500 font-mono text-sm">Geen standen gevonden.</div>
            )}

            {activeTab === 'skaters' && displayStats.length > 0 && (() => {
              const headers = displayStats[0] || [];
              const displayColumns = [
                { key: 'person_full_name', label: 'Player' },
                { key: 'team_name', label: 'Team' },
                { key: 'games_played', label: 'GP' },
                { key: 'goals', label: 'G' },
                { key: 'assists', label: 'A' },
                { key: 'points', label: 'PTS' },
                { key: 'penalties_in_minutes', label: 'PIM' }
              ];
              // Fallback to team_id if team_name is missing
              const colIndices = displayColumns.map(c => ({
                ...c,
                idx: headers.indexOf(c.key) > -1 ? headers.indexOf(c.key) : (c.key === 'team_name' ? headers.indexOf('team_id') : -1)
              })).filter(c => c.idx > -1);

              return (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#121414] border-b border-[#2A2A2A]">
                    {colIndices.map((col, i) => (
                      <th
                        key={i}
                        onClick={() => handleSort(col.idx)}
                        className="p-3 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {displayStats.slice(1).map((row: any[], i: number) => (
                    <tr key={i} className="hover:bg-white/10 transition-colors">
                      {colIndices.map((col, j) => (
                        <td key={j} className={`p-3 text-sm whitespace-nowrap ${col.key === 'person_full_name' ? 'font-bold text-white' : 'text-gray-300 font-mono'}`}>
                          {row[col.idx]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              );
            })()}

            {activeTab === 'skaters' && filteredStats.length <= 1 && (
              <div className="p-8 text-center text-gray-500 font-mono text-sm">Geen speler stats gevonden.</div>
            )}

            {activeTab === 'goalies' && displayGoalies.length > 0 && (() => {
              const headers = displayGoalies[0] || [];
              const displayColumns = [
                { key: 'person_full_name', label: 'Player' },
                { key: 'team_name', label: 'Team' },
                { key: 'games_played', label: 'GP' },
                { key: 'wins', label: 'W' },
                { key: 'losses', label: 'L' },
                { key: 'ties', label: 'T' },
                { key: 'goals_against_average', label: 'GAA' },
                { key: 'save_percentage', label: 'SV%' }
              ];
              // Fallback to team_id if team_name is missing
              const colIndices = displayColumns.map(c => ({
                ...c,
                idx: headers.indexOf(c.key) > -1 ? headers.indexOf(c.key) : (c.key === 'team_name' ? headers.indexOf('team_id') : -1)
              })).filter(c => c.idx > -1);

              return (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#121414] border-b border-[#2A2A2A]">
                    {colIndices.map((col, i) => (
                      <th
                        key={i}
                        onClick={() => handleSort(col.idx)}
                        className="p-3 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {displayGoalies.slice(1).map((row: any[], i: number) => (
                    <tr key={i} className="hover:bg-white/10 transition-colors">
                      {colIndices.map((col, j) => (
                        <td key={j} className={`p-3 text-sm whitespace-nowrap ${col.key === 'person_full_name' ? 'font-bold text-white' : 'text-gray-300 font-mono'}`}>
                          {col.key === 'save_percentage' ? Number(row[col.idx]).toFixed(3).replace(/^0+/, '') : row[col.idx]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              );
            })()}

            {activeTab === 'goalies' && filteredGoalies.length <= 1 && (
              <div className="p-8 text-center text-gray-500 font-mono text-sm">Geen goalie stats gevonden.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
