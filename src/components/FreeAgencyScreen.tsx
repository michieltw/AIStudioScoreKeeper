import { ArrowLeft, RefreshCcw, Search, UserMinus } from 'lucide-react';

interface FreeAgencyScreenProps {
  onBack: () => void;
}

export default function FreeAgencyScreen({ onBack }: FreeAgencyScreenProps) {
  // Mock data for Phase 3 free agency visualization
  const freeAgents = [
    { id: 1, name: 'Sarah Williams', position: 'Goalie', age: 26, lastTeam: 'Ice Dogs' },
    { id: 2, name: 'Tom Hardy', position: 'Defense', age: 31, lastTeam: 'None' },
    { id: 3, name: 'Emma Davis', position: 'Center', age: 22, lastTeam: 'Lumberjacks' },
  ];

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
          <RefreshCcw className="w-5 h-5 text-tertiary" />
          Free Agency
        </h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 w-full max-w-4xl mx-auto flex flex-col gap-6">

        {/* Search & Filter Header */}
        <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search available players..."
                    className="w-full bg-[#050505] border border-[#2A2A2A] rounded pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-tertiary"
                />
            </div>
        </div>

        {/* Free Agents List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {freeAgents.map(agent => (
                <div key={agent.id} className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-5 flex flex-col gap-3 hover:border-tertiary/50 transition-colors group relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-tertiary/5 rounded-full blur-xl pointer-events-none group-hover:bg-tertiary/10 transition-colors"></div>

                    <div className="flex items-start justify-between z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-surface-container-high border border-[#2A2A2A] flex items-center justify-center text-on-surface-variant">
                                <UserMinus className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-white font-bold">{agent.name}</h3>
                                <span className="text-[10px] font-mono text-tertiary uppercase tracking-widest">{agent.position}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 z-10 text-xs font-mono text-on-surface-variant bg-surface-container-low p-2 rounded border border-[#2A2A2A]/50">
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase text-gray-500">Age</span>
                            <span className="text-white">{agent.age}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase text-gray-500">Last Team</span>
                            <span className="text-white">{agent.lastTeam}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
}
