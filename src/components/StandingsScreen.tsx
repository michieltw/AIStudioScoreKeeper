import { getGasUrl } from '../utils/gasUrl';
import { fetchGasData } from '../utils/fetchGas';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Filter, ArrowUpDown } from 'lucide-react';

interface StandingsScreenProps {
  onBack: () => void;
}

export default function StandingsScreen({ onBack }: StandingsScreenProps) {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Layout & Filtering State
  const [activeDivisionTab, setActiveDivisionTab] = useState<string>('League');
  const [seasonFilter, setSeasonFilter] = useState<string>('All');

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: number, direction: 'asc' | 'desc' } | null>(null);

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
        const standingsRes = await fetchGasData(`${gasUrl}`, { action: 'getStandings' });
        const standingsData = await standingsRes.json();

        // GAS returns array of arrays including header
        setStandings(standingsData);
      } catch (e: any) {
        setError('Fout bij het ophalen van gegevens: ' + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helpers to get specific indexes
  const headers = standings.length > 0 ? standings[0] : [];
  const getColIndex = (colName: string) => headers.indexOf(colName);

  const seasonColIndex = getColIndex('Season');
  const divisionColIndex = getColIndex('Division');

  // Get unique divisions and seasons
  const getUniqueValues = (data: any[][], columnIndex: number) => {
    if (data.length <= 1 || columnIndex === -1) return ['All'];
    const values = new Set<string>();
    data.slice(1).forEach(row => {
      if (row[columnIndex] !== undefined && row[columnIndex] !== null && row[columnIndex] !== '') {
        values.add(String(row[columnIndex]));
      }
    });
    const result = Array.from(values).sort();
    if (columnIndex === seasonColIndex && !result.includes('All')) {
      return ['All', ...result];
    }
    return result;
  };

  const availableSeasons = seasonColIndex > -1 ? getUniqueValues(standings, seasonColIndex) : ['All'];
  const availableDivisions = divisionColIndex > -1 ? getUniqueValues(standings, divisionColIndex).filter(v => v !== 'All') : [];
  const divisionTabs = ['League', ...availableDivisions];

  // Reset sort when changing tabs or filters
  useEffect(() => {
    setSortConfig(null);
  }, [activeDivisionTab, seasonFilter]);

  // Apply Filters
  const filterData = (data: any[][]) => {
    if (data.length <= 1) return data;
    const rows = data.slice(1).filter(row => {
      const matchSeason = seasonFilter === 'All' || (seasonColIndex > -1 && String(row[seasonColIndex]) === seasonFilter);
      const matchDivision = activeDivisionTab === 'League' || (divisionColIndex > -1 && String(row[divisionColIndex]) === activeDivisionTab);
      return matchSeason && matchDivision;
    });
    return [headers, ...rows];
  };

  // Sort Data
  const sortData = (data: any[][]) => {
    if (data.length <= 1 || !sortConfig) return data;
    const headerRow = data[0];
    const rows = [...data.slice(1)];
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
    return [headerRow, ...rows];
  };

  const handleSort = (columnIndex: number) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === columnIndex && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key: columnIndex, direction });
  };

  const filteredAndSortedStandings = sortData(filterData(standings));
  // Filter out internal columns from display if needed. Let's just show all except maybe Division if we're on a Division tab, but NHL shows it anyway or groups by it. Let's show all that GAS returns to be safe.

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
          Standings
        </h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-5xl mx-auto w-full flex flex-col gap-6 pt-6 pb-12">
        {/* Tabs */}
        {divisionTabs.length > 1 && (
          <div className="flex overflow-x-auto no-scrollbar gap-1 bg-[#050505] border border-[#2A2A2A] rounded-lg p-1">
            {divisionTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveDivisionTab(tab)}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md font-mono text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                  activeDivisionTab === tab ? 'bg-tertiary text-black' : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-surface-container-low p-4 rounded-lg border border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-2 sm:mb-0 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-tertiary" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-on-surface-variant">Filters</span>
          </div>

          <div className="flex flex-1 gap-4 flex-wrap">
            {seasonColIndex > -1 && availableSeasons.length > 0 && (
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
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-tertiary">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <span className="font-mono text-xs uppercase tracking-widest">Loading Standings...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center text-red-400 text-sm font-mono">
            {error}
          </div>
        ) : (
          <div className="bg-surface-container-low metallic-border rounded-lg overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 inner-glow">
            {filteredAndSortedStandings.length > 1 ? (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#121414] border-b border-[#2A2A2A]">
                    {headers.map((header: string, i: number) => (
                      <th
                        key={i}
                        onClick={() => handleSort(i)}
                        className="p-3 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-white/5 transition-colors sticky top-0"
                      >
                        <div className="flex items-center gap-1">
                          {header}
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {filteredAndSortedStandings.slice(1).map((row: any[], i: number) => (
                    <tr key={i} className="hover:bg-white/10 transition-colors">
                      {row.map((cell: any, j: number) => {
                        const isTeamColumn = headers[j]?.toLowerCase() === 'team';
                        return (
                          <td key={j} className={`p-3 text-sm whitespace-nowrap ${isTeamColumn ? 'font-bold text-white' : 'text-gray-300 font-mono'}`}>
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500 font-mono text-sm">
                No standings data found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
