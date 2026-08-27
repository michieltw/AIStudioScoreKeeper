import { ArrowLeft, Loader2, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchGasData } from '../utils/fetchGas';
import { getGasUrl } from '../utils/gasUrl';
import { dbSchema } from '../types';

interface FreeAgencyScreenProps {
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

export default function FreeAgencyScreen({ onBack }: FreeAgencyScreenProps) {
  const [activeTab, setActiveTab] = useState<'signed' | 'available'>('available');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [freeAgents, setFreeAgents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const gasUrl = getGasUrl();
        if (!gasUrl) {
          throw new Error('Database connection not configured');
        }

        const [agentsRes, personsRes, teamsRes] = await Promise.all([
          fetchGasData(gasUrl, { action: 'getEcosystemData', sheetName: 'free_agents' }),
          fetchGasData(gasUrl, { action: 'getEcosystemData', sheetName: 'persons' }),
          fetchGasData(gasUrl, { action: 'getEcosystemData', sheetName: 'teams' })
        ]);

        if (!isMounted) return;

        const agentsData = ensure2DArray(await agentsRes.json());
        const personsData = ensure2DArray(await personsRes.json());
        const teamsData = ensure2DArray(await teamsRes.json());

        // Process Persons
        const personsHeaders = personsData[0] || dbSchema['persons'];
        const personIdIdx = personsHeaders.indexOf('id');
        const personCodeIdx = personsHeaders.indexOf('person_code');
        const firstNameIdx = personsHeaders.indexOf('first_name');
        const lastNameIdx = personsHeaders.indexOf('last_name');
        const dobIdx = personsHeaders.indexOf('date_of_birth');
        const positionIdx = personsHeaders.indexOf('plays_position');

        const personsMap = new Map();
        for (let i = 1; i < personsData.length; i++) {
          const row = personsData[i];
          if (row[personIdIdx]) {
             personsMap.set(row[personIdIdx], {
               firstName: row[firstNameIdx] || '',
               lastName: row[lastNameIdx] || '',
               dob: row[dobIdx] || '',
               position: row[positionIdx] || '',
               personCode: row[personCodeIdx] || ''
             });
          }
        }

        // Process Teams
        const teamsHeaders = teamsData[0] || dbSchema['teams'];
        const teamIdIdx = teamsHeaders.indexOf('id');
        const teamCodeIdx = teamsHeaders.indexOf('team_code');

        const teamsMap = new Map();
        for (let i = 1; i < teamsData.length; i++) {
          const row = teamsData[i];
          if (row[teamIdIdx]) {
            teamsMap.set(row[teamIdIdx], row[teamCodeIdx] || 'UNK');
          }
        }

        // Process Free Agents
        const agentsHeaders = agentsData[0] || dbSchema['free_agents'];
        const agentIdIdx = agentsHeaders.indexOf('id');
        const personFkIdx = agentsHeaders.indexOf('person_id');
        const statusIdx = agentsHeaders.indexOf('status');
        const prevTeamIdx = agentsHeaders.indexOf('previous_team_id');
        const prevAavIdx = agentsHeaders.indexOf('previous_aav');
        const yoeIdx = agentsHeaders.indexOf('years_of_experience');
        const isSignedIdx = agentsHeaders.indexOf('is_signed');

        const processedAgents = [];
        for (let i = 1; i < agentsData.length; i++) {
           const row = agentsData[i];
           const pId = row[personFkIdx];
           if (!pId) continue;

           const person = personsMap.get(pId);
           if (!person) continue;

           let age = 'N/A';
           if (person.dob) {
             const birthDate = new Date(person.dob);
             if (!isNaN(birthDate.getTime())) {
               const ageDifMs = Date.now() - birthDate.getTime();
               const ageDate = new Date(ageDifMs);
               age = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
             }
           }

           const previousTeamCode = teamsMap.get(row[prevTeamIdx]) || 'FA';

           processedAgents.push({
             id: row[agentIdIdx],
             name: `${person.firstName} ${person.lastName}`.trim(),
             position: person.position,
             status: row[statusIdx] || 'UFA',
             yoe: row[yoeIdx] || 0,
             age: age,
             previousTeam: previousTeamCode,
             previousAav: row[prevAavIdx] ? Number(row[prevAavIdx]) : null,
             isSigned: row[isSignedIdx] === 'true' || row[isSignedIdx] === true || row[isSignedIdx] === 'TRUE' || row[isSignedIdx] === 1,
           });
        }

        setFreeAgents(processedAgents);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load free agents');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => { isMounted = false; };
  }, []);

  // Filter Agents
  const filteredAgents = freeAgents.filter(agent => {
    if (activeTab === 'signed' && !agent.isSigned) return false;
    if (activeTab === 'available' && agent.isSigned) return false;

    if (searchQuery) {
       return agent.name.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  const formatCurrency = (value: number | null) => {
    if (value == null) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

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
          Free Agency
        </h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 w-full max-w-4xl mx-auto flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex border-b border-[#2A2A2A]">
           <button
             className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'signed' ? 'text-white border-b-2 border-tertiary bg-surface-container-low' : 'text-gray-500 hover:text-gray-300'}`}
             onClick={() => setActiveTab('signed')}
           >
             SIGNED
           </button>
           <button
             className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'available' ? 'text-white border-b-2 border-tertiary bg-surface-container-low' : 'text-gray-500 hover:text-gray-300'}`}
             onClick={() => setActiveTab('available')}
           >
             AVAILABLE
           </button>
        </div>

        {/* Search */}
        <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search players..."
                    className="w-full bg-[#050505] border border-[#2A2A2A] rounded pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-tertiary font-mono"
                />
            </div>
        </div>

        {/* Content */}
        {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 text-tertiary animate-spin" />
            </div>
        ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center text-red-400 text-sm font-mono">
              {error}
            </div>
        ) : (
           <div className="bg-surface-container-low metallic-border rounded-lg overflow-x-auto scrollbar-none inner-glow">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-[#121414] border-b border-[#2A2A2A]">
                       <th className="p-3 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Players</th>
                       <th className="p-3 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider text-right">Previous AAV</th>
                    </tr>
                 </thead>
                 <tbody>
                    {filteredAgents.length === 0 ? (
                       <tr>
                          <td colSpan={2} className="p-8 text-center text-sm font-mono text-gray-500 uppercase tracking-wider">
                             No free agents found
                          </td>
                       </tr>
                    ) : (
                       filteredAgents.map((agent) => (
                          <tr key={agent.id} className="border-b border-[#2A2A2A]/50 hover:bg-white/5 transition-colors">
                             <td className="p-4">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded bg-tertiary flex items-center justify-center font-bold text-white text-sm font-mono shadow-[0_0_10px_rgba(var(--color-tertiary-rgb),0.3)] shrink-0">
                                      {agent.status}
                                   </div>
                                   <div className="flex flex-col">
                                      <div className="flex items-baseline gap-1">
                                          <span className="font-bold text-white text-lg">{agent.name}</span>
                                          <span className="text-gray-400 text-sm font-mono">, {agent.position}</span>
                                      </div>
                                      <div className="flex items-center gap-4 mt-1 text-xs font-mono text-gray-500 uppercase">
                                          <div className="flex items-center gap-1">
                                              <div className="w-4 h-4 rounded-full bg-surface-container-high flex items-center justify-center border border-[#2A2A2A] text-[8px] font-bold">
                                                  {agent.previousTeam.charAt(0)}
                                              </div>
                                              <span>{agent.previousTeam}</span>
                                          </div>
                                          <span>YOE: {agent.yoe}</span>
                                          <span>Age: {agent.age}</span>
                                      </div>
                                   </div>
                                </div>
                             </td>
                             <td className="p-4 text-right">
                                <span className="font-mono text-white text-sm">{formatCurrency(agent.previousAav)}</span>
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        )}
      </div>
    </div>
  );
}
