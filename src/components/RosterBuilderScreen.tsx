import { ArrowLeft, Wrench, Users, Plus, Minus } from 'lucide-react';

interface RosterBuilderScreenProps {
  onBack: () => void;
}

export default function RosterBuilderScreen({ onBack }: RosterBuilderScreenProps) {
  // Mock data for visualizing Phase 3 roster building
  const teamRoster = [
    { id: 1, name: 'John Doe', position: 'C' },
    { id: 2, name: 'Mike Smith', position: 'D' },
  ];

  const availablePlayers = [
    { id: 4, name: 'Alex Johnson', position: 'LW' },
    { id: 5, name: 'David Brown', position: 'RW' },
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
          <Wrench className="w-5 h-5 text-tertiary" />
          Roster Builder
        </h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Available Players (Left Side) */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4">
            <h2 className="text-white font-bold flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-on-surface-variant" />
              Available Players
            </h2>
            <div className="flex flex-col gap-2">
              {availablePlayers.map(player => (
                <div key={player.id} className="bg-[#050505] border border-[#2A2A2A] rounded p-3 flex items-center justify-between group hover:border-tertiary/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-bold">{player.name}</span>
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase">{player.position}</span>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-surface-container-highest border border-[#2A2A2A] flex items-center justify-center text-tertiary hover:bg-tertiary hover:text-black transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Roster (Right Side) */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 border-t-4 border-t-tertiary">
            <h2 className="text-white font-bold flex items-center gap-2 mb-4">
              <Wrench className="w-4 h-4 text-tertiary" />
              Blackout HC Roster
            </h2>
            <div className="flex flex-col gap-2">
              {teamRoster.map(player => (
                <div key={player.id} className="bg-[#050505] border border-[#2A2A2A] rounded p-3 flex items-center justify-between group hover:border-error/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-bold">{player.name}</span>
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase">{player.position}</span>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-surface-container-highest border border-[#2A2A2A] flex items-center justify-center text-error hover:bg-error hover:text-white transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
