import { dbSchema } from '../types';
import { getGasUrl } from '../utils/gasUrl';
import { fetchGasData } from '../utils/fetchGas';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface StatsScreenProps {
  onBack: () => void;
}

export default function StatsScreen({ onBack }: StatsScreenProps) {
  const [activeTab, setActiveTab] = useState<'standings' | 'stats' | 'goalies'>('standings');
  const [standings, setStandings] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const [standingsRes, statsRes] = await Promise.all([
          fetchGasData(`${gasUrl}`, { action: 'getStandings' }),
          fetchGasData(`${gasUrl}`, { action: 'getStats' })
        ]);

        const standingsData = await standingsRes.json();
        const statsData = await statsRes.json();

        // The GAS script returns a 2D array representing rows, including the header.
        setStandings(standingsData);
        setStats(statsData);
      } catch (e: any) {
        setError('Fout bij het ophalen van gegevens: ' + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
            onClick={() => setActiveTab('standings')}
            className={`flex-1 flex items-center justify-center py-2 rounded-md font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'standings' ? 'bg-tertiary text-black' : 'text-gray-500 hover:text-white'
            }`}
          >
            Standen
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 flex items-center justify-center py-2 rounded-md font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'stats' ? 'bg-tertiary text-black' : 'text-gray-500 hover:text-white'
            }`}
          >
            Speler Stats
          </button>
          <button
            onClick={() => setActiveTab('goalies')}
            className={`flex-1 flex items-center justify-center py-2 rounded-md font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'goalies' ? 'bg-tertiary text-black' : 'text-gray-500 hover:text-white'
            }`}
          >
            Goalie Stats
          </button>
        </div>

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
            {activeTab === 'standings' && standings.length > 0 && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#121414] border-b border-[#2A2A2A]">
                    {(dbSchema['standings'] || standings[0]).map((header: string, i: number) => (
                      <th key={i} className="p-3 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {standings.slice(1).map((row: any[], i: number) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      {row.map((cell: any, j: number) => (
                        <td key={j} className={`p-3 text-sm whitespace-nowrap ${j === 0 ? 'font-bold text-white' : 'text-gray-300 font-mono'}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'standings' && standings.length <= 1 && (
              <div className="p-8 text-center text-gray-500 font-mono text-sm">Geen standen gevonden.</div>
            )}

            {activeTab === 'stats' && stats.length > 0 && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#121414] border-b border-[#2A2A2A]">
                    {(dbSchema['player_stats'] || stats[0]).map((header: string, i: number) => (
                      <th key={i} className="p-3 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {stats.slice(1).map((row: any[], i: number) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      {row.map((cell: any, j: number) => (
                        <td key={j} className={`p-3 text-sm whitespace-nowrap ${j === 0 ? 'font-bold text-white' : 'text-gray-300 font-mono'}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'stats' && stats.length <= 1 && (
              <div className="p-8 text-center text-gray-500 font-mono text-sm">Geen speler stats gevonden.</div>
            )}

            {activeTab === 'goalies' && (
              <div className="p-8 text-center text-gray-500 font-mono text-sm">Geen goalie stats gevonden (Phase 6 placeholder).</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
