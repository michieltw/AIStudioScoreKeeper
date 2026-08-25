import { ArrowLeft, Users, Zap } from 'lucide-react';
import { useState } from 'react';

interface DraftModeScreenProps {
  onBack: () => void;
}

export default function DraftModeScreen({ onBack }: DraftModeScreenProps) {
  const [activeTab, setActiveTab] = useState<'board' | 'pool'>('board');

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
          <Zap className="w-5 h-5 text-tertiary" />
          Draft Mode
        </h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-5xl mx-auto w-full flex flex-col gap-6 pt-6 pb-12">
        <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-xl font-bold text-white">Live Draft Simulator</h2>
                <p className="text-sm text-gray-400">Select players from the free agency pool to assign to teams.</p>
            </div>
            <div className="flex bg-[#050505] border border-[#2A2A2A] rounded-lg p-1">
              <button
                onClick={() => setActiveTab('board')}
                className={`px-4 py-2 rounded-md font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeTab === 'board' ? 'bg-tertiary text-black' : 'text-gray-500 hover:text-white'
                }`}
              >
                Draft Board
              </button>
              <button
                onClick={() => setActiveTab('pool')}
                className={`px-4 py-2 rounded-md font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeTab === 'pool' ? 'bg-tertiary text-black' : 'text-gray-500 hover:text-white'
                }`}
              >
                Player Pool
              </button>
            </div>
        </div>

        {activeTab === 'board' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Placeholder for Draft Board */}
                 <div className="bg-[#050505] border border-tertiary/30 rounded-lg p-4 col-span-2">
                     <h3 className="font-mono text-tertiary text-sm font-bold uppercase mb-4 tracking-widest">Round 1</h3>
                     <div className="space-y-2">
                         <div className="flex items-center gap-4 p-3 border border-[#2A2A2A] rounded bg-white/5">
                             <span className="font-bold text-white w-8">1.</span>
                             <span className="flex-1 font-bold text-tertiary">Blackout HC</span>
                             <span className="text-sm text-gray-400 italic flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>On the clock...</span>
                             </span>
                         </div>
                         <div className="flex items-center gap-4 p-3 border border-[#2A2A2A] rounded opacity-50">
                             <span className="font-bold text-white w-8">2.</span>
                             <span className="flex-1 font-bold text-white">Spartans</span>
                             <span className="text-sm text-gray-400">Waiting</span>
                         </div>
                     </div>
                 </div>
                 <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-4">
                     <h3 className="font-mono text-white text-sm font-bold uppercase mb-4 tracking-widest">Recent Picks</h3>
                     <p className="text-sm text-gray-500 italic">No picks made yet.</p>
                 </div>
             </div>
        )}

        {activeTab === 'pool' && (
             <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-6">
                 <h3 className="font-mono text-white text-sm font-bold uppercase mb-4 tracking-widest">Available Players</h3>
                 <p className="text-sm text-gray-500 italic">Fetch players from Free Agency here.</p>
             </div>
        )}
      </div>
    </div>
  );
}
