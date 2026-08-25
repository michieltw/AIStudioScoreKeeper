import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Search, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { getGasUrl } from '../utils/gasUrl';
import { fetchGasData } from '../utils/fetchGas';

interface PeopleDirectoryScreenProps {
  onViewPerson?: (person: any) => void;
  onBack: () => void;
}

export default function PeopleDirectoryScreen({ onBack, onViewPerson }: PeopleDirectoryScreenProps) {
  const [filterJob, setFilterJob] = useState('All');
  const [filterRole, setFilterRole] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState<any[]>([]);

  // Default fallback mock data
  const defaultPeople = [
    { id: 'p1', name: 'John Doe', role: 'Player', job: 'Center', club: 'Blackout HC', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
    { id: 'p2', name: 'Jane Smith', role: 'Manager', job: 'General Manager', club: 'Blackout HC', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
    { id: 'p3', name: 'Mike Johnson', role: 'Coach', job: 'Head Coach', club: 'Ice Dogs', photo_url: '' },
    { id: 'p4', name: 'Sarah Williams', role: 'Player', job: 'Goalie', club: 'Free Agent', photo_url: '' },
  ];

  const fetchPeopleFromDb = async (force = false) => {
    setLoading(true);
    try {
      const url = getGasUrl();
      if (!url) {
        setPeople(defaultPeople);
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
        const posIdx = headers.indexOf('plays_position');
        const photoIdx = headers.indexOf('photo_url');
        const coverIdx = headers.indexOf('cover_url');

        // Fetch jobs to associate with club/role if available
        let jobsMap: Record<string, any> = {};
        try {
          const jobsRes = await fetchGasData(url, { action: 'getEcosystemData', sheetName: 'jobs' }, force);
          const jobsJson = await jobsRes.json();
          if (jobsJson.status === 'Success' && Array.isArray(jobsJson.data) && jobsJson.data.length > 1) {
            const jHeaders = jobsJson.data[0];
            const pIdIdx = jHeaders.indexOf('person_id');
            const jobTypeIdx = jHeaders.indexOf('job_type');
            const orgIdx = jHeaders.indexOf('organization_id');
            jobsJson.data.slice(1).forEach((jRow: any[]) => {
              const pid = jRow[pIdIdx];
              if (pid && !jobsMap[pid]) {
                jobsMap[pid] = { job: jRow[jobTypeIdx], org: jRow[orgIdx] };
              }
            });
          }
        } catch {
          // Ignore jobs fetch error
        }

        const loadedPeople = rows.map((r, i) => {
          const id = idIdx !== -1 ? r[idIdx] : `person-${i}`;
          const firstName = firstIdx !== -1 ? r[firstIdx] : '';
          const lastName = lastIdx !== -1 ? r[lastIdx] : '';
          const fullName = `${firstName} ${lastName}`.trim() || (codeIdx !== -1 ? r[codeIdx] : `Person ${i + 1}`);
          const position = posIdx !== -1 ? r[posIdx] : 'Player';
          const photoUrl = photoIdx !== -1 ? r[photoIdx] : '';
          const coverUrl = coverIdx !== -1 ? r[coverIdx] : '';
          const jobInfo = jobsMap[id];

          return {
            id,
            name: fullName,
            role: position ? 'Player' : 'Staff',
            job: jobInfo?.job || position || 'Center',
            club: jobInfo?.org || 'Blackout HC',
            photo_url: photoUrl,
            cover_url: coverUrl,
            first_name: firstName,
            last_name: lastName,
            plays_position: position
          };
        });

        if (loadedPeople.length > 0) {
          setPeople(loadedPeople);
          return;
        }
      }
      setPeople(defaultPeople);
    } catch {
      setPeople(defaultPeople);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeopleFromDb();
  }, []);

  const filteredPeople = people.filter(p => {
    if (filterJob !== 'All' && !p.job?.toLowerCase().includes(filterJob.toLowerCase())) return false;
    if (filterRole !== 'All' && p.role !== filterRole) return false;
    if (searchQuery.trim() && !p.name?.toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;
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
          People Directory
        </h1>
        <button
          onClick={() => fetchPeopleFromDb(true)}
          disabled={loading}
          className="text-on-surface-variant hover:text-white transition-colors p-2 -mr-2 rounded-full hover:bg-white/5 disabled:opacity-50"
          title="Refresh from Database"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-tertiary' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 w-full max-w-4xl mx-auto flex flex-col gap-6">

        {/* Filters */}
        <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search people by name..."
                    className="w-full bg-[#050505] border border-[#2A2A2A] rounded pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-tertiary"
                />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="bg-[#050505] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-tertiary"
                >
                    <option value="All">All Roles</option>
                    <option value="Player">Players</option>
                    <option value="Manager">Managers</option>
                    <option value="Coach">Coaches</option>
                </select>
                <select
                    value={filterJob}
                    onChange={(e) => setFilterJob(e.target.value)}
                    className="bg-[#050505] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-tertiary"
                >
                    <option value="All">All Jobs</option>
                    <option value="Center">Center</option>
                    <option value="Goalie">Goalie</option>
                    <option value="General Manager">General Manager</option>
                    <option value="Head Coach">Head Coach</option>
                </select>
            </div>
        </div>

        {/* Directory List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-tertiary" />
            <span className="text-sm font-mono">Loading directory from database...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPeople.map(person => (
                  <div key={person.id} onClick={() => onViewPerson && onViewPerson(person)} className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-4 flex items-center gap-4 hover:border-tertiary/50 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 rounded-full bg-surface-container-high border border-[#2A2A2A] flex items-center justify-center text-on-surface-variant group-hover:text-tertiary transition-colors overflow-hidden shrink-0">
                          {person.photo_url ? (
                            <img
                              src={person.photo_url}
                              alt={person.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget.style.display = 'none');
                              }}
                            />
                          ) : (
                            <Users className="w-6 h-6" />
                          )}
                      </div>
                      <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold group-hover:text-tertiary transition-colors truncate">{person.name}</h3>
                          <div className="flex flex-col gap-0.5 mt-1">
                              <span className="text-xs text-on-surface-variant font-mono">Role: {person.role}</span>
                              <span className="text-xs text-on-surface-variant font-mono truncate">Job: {person.job}</span>
                          </div>
                      </div>
                      <div className="text-right shrink-0">
                          <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded uppercase tracking-widest ${person.club === 'Free Agent' ? 'bg-error/20 text-error' : 'bg-tertiary/10 text-tertiary'}`}>
                              {person.club}
                          </span>
                      </div>
                  </div>
              ))}

              {filteredPeople.length === 0 && (
                  <div className="col-span-1 md:col-span-2 text-center py-10 text-gray-500 font-mono text-sm border border-dashed border-[#2A2A2A] rounded-lg">
                      No people found matching filters.
                  </div>
              )}
          </div>
        )}

      </div>
    </div>
  );
}
