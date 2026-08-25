import { ArrowLeft, Users } from 'lucide-react';
import { useState } from 'react';
import { Lineup } from '../types';

interface LineupBuilderScreenProps {
  onBack: () => void;
}

export default function LineupBuilderScreen({ onBack }: LineupBuilderScreenProps) {
  const [lineups, setLineups] = useState<Lineup[]>([]);

  return (
    <div className="w-full h-screen flex flex-col bg-background text-on-background">
      <div className="flex-none bg-surface/50 border-b border-primary/20 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-primary/20 rounded-full transition-colors text-primary"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-primary tracking-wide uppercase">Lineup Builder</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-surface border border-primary/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Event Lineups</h2>
            <p className="text-gray-400 mb-4 text-sm">Select an event and assign players to specific units.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="border border-primary/20 rounded p-4">
                 <h3 className="font-bold text-secondary mb-2">Even Strength</h3>
                 <p className="text-gray-500 text-sm italic">No players assigned</p>
               </div>
               <div className="border border-primary/20 rounded p-4">
                 <h3 className="font-bold text-secondary mb-2">Power Play (PP1)</h3>
                 <p className="text-gray-500 text-sm italic">No players assigned</p>
               </div>
               <div className="border border-primary/20 rounded p-4">
                 <h3 className="font-bold text-secondary mb-2">Penalty Kill (PK1)</h3>
                 <p className="text-gray-500 text-sm italic">No players assigned</p>
               </div>
               <div className="border border-primary/20 rounded p-4">
                 <h3 className="font-bold text-secondary mb-2">Goaltending</h3>
                 <p className="text-gray-500 text-sm italic">No players assigned</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
