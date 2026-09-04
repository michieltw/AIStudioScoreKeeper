import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Filter, RefreshCw, Loader2, Image as ImageIcon } from 'lucide-react';
import { getGasUrl } from '../utils/gasUrl';
import { fetchGasData } from '../utils/fetchGas';
import CountryFlag from './CountryFlag';

interface PlayersScreenProps {
  onViewPerson?: (person: any) => void;
  onBack: () => void;
}

export default function PlayersScreen({ onBack, onViewPerson }: PlayersScreenProps) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);

  // Default fallback mock data
  const defaultPlayers = [
    { id: 'p1', name: 'John Doe', status: 'Active', nationality: 'Netherlands', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
    { id: 'p2', name: 'Jane Smith', status: 'Inactive', nationality: 'Canada', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
    { id: 'p4', name: 'Sarah Williams', status: 'Active', nationality: 'Sweden', photo_url: '' },
  ];

  const fetchPlayersFromDb = async (force = false) => {
    setLoading(true);
    try {
      const url = getGasUrl();
      if (!url) {
        setPlayers(defaultPlayers);
        return;
      }

      // Fetch persons
      const res = await fetchGasData(url, { action: 'getEcosystemData', sheetName: 'persons' }, force);
      const json = await res.json();

      if (json.status === 'Success' && Array.isArray(json.data) && json.data.length > 1) {
        const headers: string[] = json.data[0];
        const rows: any[][] = json.data.slice(1);

        const idIdx = headers.indexOf('id');
        const firstIdx = headers.indexOf('first_name');
        const lastIdx = headers.indexOf('last_name');
        const codeIdx = headers.indexOf('person_code');
        const photoIdx = headers.indexOf('photo_url');
        const coverIdx = headers.indexOf('cover_url');
        const natIdx = headers.indexOf('nationality');
        const statusIdx = headers.indexOf('status');

        const loadedPlayers = rows.map((r, i) => {
          const id = idIdx !== -1 ? r[idIdx] : `person-${i}`;
          const firstName = firstIdx !== -1 ? r[firstIdx] : '';
          const lastName = lastIdx !== -1 ? r[lastIdx] : '';
          const fullName = `${firstName} ${lastName}`.trim() || (codeIdx !== -1 ? r[codeIdx] : `Person ${i + 1}`);
          const photoUrl = photoIdx !== -1 ? r[photoIdx] : '';
          const coverUrl = coverIdx !== -1 ? r[coverIdx] : '';
          const nationality = natIdx !== -1 ? r[natIdx] : '';
          let status = statusIdx !== -1 ? r[statusIdx] : 'Active';
          if (!status || status.trim() === '') status = 'Active';

          return {
            id,
            name: fullName,
            photo_url: photoUrl,
            cover_url: coverUrl,
            first_name: firstName,
            last_name: lastName,
            nationality: nationality,
            status: status
          };
        });

        if (loadedPlayers.length > 0) {
          setPlayers(loadedPlayers);
          return;
        }
      }
      setPlayers(defaultPlayers);
    } catch {
      setPlayers(defaultPlayers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayersFromDb();
  }, []);

  const filteredPlayers = players.filter(p => {
    if (filterStatus !== 'All' && p.status?.toLowerCase() !== filterStatus.toLowerCase()) return false;
    return true;
  });

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
        <h1 className="font-display text-[18px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-5 h-5 text-tertiary" />
          Players
        </h1>
        <button
          onClick={() => fetchPlayersFromDb(true)}
          disabled={loading}
          className="text-on-surface-variant hover:text-white transition-colors p-2 -mr-2 rounded-full hover:bg-white/5 disabled:opacity-50"
          title="Refresh from Database"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-tertiary' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto w-full flex flex-col">
        {/* Banner Section */}
        <div className="w-full h-48 bg-surface-container-low border-b border-[#2A2A2A] relative flex items-center justify-center overflow-hidden">
             {/* Placeholder for banner image */}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10" />
             <ImageIcon className="w-16 h-16 text-on-surface-variant/20 absolute z-0" />
             <div className="relative z-20 text-center p-4">
                 <h2 className="text-2xl font-display font-bold text-white tracking-widest uppercase mb-1 shadow-black/50 drop-shadow-md">Players List</h2>
                 <p className="text-sm font-mono text-tertiary shadow-black/50 drop-shadow-md">Discover our athletes</p>
             </div>
        </div>

        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-6">
            {/* Filters */}
            <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-mono text-on-surface-variant uppercase">Status:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-[#050505] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-tertiary"
                    >
                        <option value="All">All</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Players List */}
            {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-tertiary" />
                <span className="text-sm font-mono">Loading players from database...</span>
            </div>
            ) : (
            <div className="flex flex-col gap-2">
                {filteredPlayers.map(player => (
                    <div key={player.id} onClick={() => onViewPerson && onViewPerson(player)} className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-4 flex items-center justify-between hover:border-tertiary/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface-container-high border border-[#2A2A2A] flex items-center justify-center text-on-surface-variant group-hover:text-tertiary transition-colors overflow-hidden shrink-0">
                                {player.photo_url ? (
                                    <img
                                    src={player.photo_url}
                                    alt={player.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                        (e.currentTarget.style.display = 'none');
                                    }}
                                    />
                                ) : (
                                    <Users className="w-5 h-5" />
                                )}
                            </div>
                            <h3 className="text-white font-bold group-hover:text-tertiary transition-colors text-lg">{player.name}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            {player.nationality && (
                                <CountryFlag nationality={player.nationality} size="sm" />
                            )}
                            <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded uppercase tracking-widest ${player.status?.toLowerCase() === 'inactive' ? 'bg-error/20 text-error' : 'bg-tertiary/10 text-tertiary'}`}>
                                {player.status || 'Active'}
                            </span>
                        </div>
                    </div>
                ))}

                {filteredPlayers.length === 0 && (
                    <div className="w-full text-center py-10 text-gray-500 font-mono text-sm border border-dashed border-[#2A2A2A] rounded-lg">
                        No players found matching filters.
                    </div>
                )}
            </div>
            )}
        </div>
      </div>
    </div>
  );
}
