import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Shield, Loader2, Users, Calendar, ArrowUpRight } from 'lucide-react';
import { getGasUrl } from '../utils/gasUrl';
import { fetchGasData } from '../utils/fetchGas';

interface TeamDirectoryScreenProps {
  onBack: () => void;
  onViewTeam?: (teamId: string, teamName: string) => void;
}

export default function TeamDirectoryScreen({ onBack, onViewTeam }: TeamDirectoryScreenProps) {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = getGasUrl();
        if (!url) {
          console.warn('GAS URL not set');
          setLoading(false);
          return;
        }

        const [teamsRes, compsRes, tiersRes] = await Promise.all<any>([
          fetchGasData(url, { action: 'getEcosystemData', sheetName: 'teams' }).then(r => r.json()),
          fetchGasData(url, { action: 'getEcosystemData', sheetName: 'competitions' }).then(r => r.json()),
          fetchGasData(url, { action: 'getEcosystemData', sheetName: 'tiers' }).then(r => r.json())
        ]);

        if (teamsRes.status === 'Success') {
          setTeams(Array.isArray(teamsRes.data) && teamsRes.data.length > 0 ? teamsRes.data.slice(1) : []);
        }
        if (compsRes.status === 'Success') {
          setCompetitions(Array.isArray(compsRes.data) && compsRes.data.length > 0 ? compsRes.data.slice(1) : []);
        }
        if (tiersRes.status === 'Success') {
          setTiers(Array.isArray(tiersRes.data) && tiersRes.data.length > 0 ? tiersRes.data.slice(1) : []);
        }
      } catch (err) {
        console.error('Failed to fetch team data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupedData = useMemo(() => {
    const compMap = new Map();
    competitions.forEach(c => {
      if (c[0]) compMap.set(c[0].toString(), c[3]);
    });

    const tierMap = new Map();
    tiers.forEach(t => {
      if (t[0]) tierMap.set(t[0].toString(), t[2]);
    });

    const groups: Record<string, Record<string, any[]>> = {};

    teams.forEach(team => {
      const compId = team[2]?.toString();
      const tierId = team[5]?.toString();

      const compName = compId && compMap.has(compId) ? compMap.get(compId) : 'Other Competitions';
      const tierName = tierId && tierMap.has(tierId) ? tierMap.get(tierId) : 'Other Divisions';

      if (!groups[compName]) {
        groups[compName] = {};
      }
      if (!groups[compName][tierName]) {
        groups[compName][tierName] = [];
      }

      groups[compName][tierName].push({
        id: team[0],
        name: team[4] || 'Unknown Team',
        logo_url: team[9],
      });
    });

    return groups;
  }, [teams, competitions, tiers]);

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-surface-container-low/50 backdrop-blur-md border-b border-[#2A2A2A] sticky top-0 z-50">
        <button
          onClick={onBack}
          className="text-on-surface-variant hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-[18px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-5 h-5 text-tertiary" />
          Teams
        </h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 w-full max-w-7xl mx-auto flex flex-col gap-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-tertiary" />
            <p className="font-mono text-sm tracking-widest uppercase">Loading Teams...</p>
          </div>
        ) : (
          Object.keys(groupedData).length > 0 ? (
            Object.entries(groupedData).map(([compName, tiers]) => (
              <div key={compName} className="flex flex-col gap-6">
                <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider border-b-2 border-tertiary/30 pb-2">
                  {compName}
                </h2>

                <div className="flex flex-col gap-8 pl-0 md:pl-4">
                  {Object.entries(tiers).map(([tierName, tierTeams]) => (
                    <div key={tierName} className="flex flex-col gap-4">
                      <h3 className="text-xl font-mono font-bold text-on-surface-variant uppercase tracking-widest">
                        {tierName}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {tierTeams.map(team => (
                          <div
                            key={team.id}
                            className="metallic-surface metallic-border rounded-lg p-5 flex flex-col hover:border-tertiary/50 transition-colors group soft-glow"
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-16 h-16 bg-surface-container-highest border border-[#2A2A2A] rounded-full flex items-center justify-center text-tertiary shadow-lg overflow-hidden shrink-0 group-hover:scale-105 transition-transform inner-glow">
                                {team.logo_url ? (
                                  <img src={team.logo_url} alt={`${team.name} Logo`} className="w-12 h-12 object-contain" />
                                ) : (
                                  <Shield className="w-8 h-8 opacity-50" />
                                )}
                              </div>
                              <h4 className="text-lg font-bold text-white group-hover:text-tertiary transition-colors leading-tight">
                                {team.name}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[#2A2A2A]">
                              <button
                                onClick={() => onViewTeam && onViewTeam(team.id, team.name)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-mono font-bold text-on-surface-variant hover:text-white bg-[#050505] rounded border border-[#2A2A2A] hover:border-outline-variant transition-colors"
                                title="Profile"
                              >
                                PROFILE <ArrowUpRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onViewTeam && onViewTeam(team.id, team.name)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-mono font-bold text-on-surface-variant hover:text-white bg-[#050505] rounded border border-[#2A2A2A] hover:border-outline-variant transition-colors"
                                title="Roster"
                              >
                                ROSTER <Users className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onViewTeam && onViewTeam(team.id, team.name)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-mono font-bold text-on-surface-variant hover:text-white bg-[#050505] rounded border border-[#2A2A2A] hover:border-outline-variant transition-colors"
                                title="Schedule"
                              >
                                SCHED <Calendar className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
              <Shield className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-mono text-sm tracking-widest uppercase">No Teams Found</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
