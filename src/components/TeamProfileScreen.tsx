import { ArrowLeft, Shield, Users, Star } from 'lucide-react';
import { Sponsor } from '../types';

interface TeamProfileScreenProps {
  onBack: () => void;
}

export default function TeamProfileScreen({ onBack }: TeamProfileScreenProps) {
  // Mock data for visualizing Phase 3 features
  const mockTeam = {
    name: 'Green Grizzly',
    division: 'Division 1',
    club: 'House League'
  };

  const mockRoster = [
    { id: 1, name: 'John Doe', number: '10', position: 'C' },
    { id: 2, name: 'Mike Smith', number: '27', position: 'D' },
    { id: 3, name: 'Sarah Williams', number: '31', position: 'G' },
  ];

  const mockSponsors: Sponsor[] = [
    { id: 's1', name: 'HockeyStore', tier: 'Gold' },
    { id: 's2', name: 'IceRink Inc.', tier: 'Silver' },
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
          <Shield className="w-5 h-5 text-tertiary" />
          Team Profile
        </h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 w-full max-w-3xl mx-auto flex flex-col gap-6">
        {/* Team Details Header */}
        <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-6 flex items-center gap-6">
          <div className="w-20 h-20 bg-surface-container-highest border border-[#2A2A2A] rounded-full flex items-center justify-center text-tertiary shadow-lg">
            <img src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/HLGreenGrizzly.png?v=1783799596" alt="Team Logo" className="w-16 h-16 object-contain" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-white">{mockTeam.name}</h2>
            <p className="text-on-surface-variant font-mono text-sm">{mockTeam.club} • {mockTeam.division}</p>
          </div>
        </div>

        {/* Sponsors Section */}
        {mockSponsors.length > 0 && (
          <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-tertiary" />
              <h3 className="text-white font-bold text-lg">Team Sponsors</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              {mockSponsors.map(sponsor => (
                <div key={sponsor.id} className="bg-surface-container-low border border-[#2A2A2A] rounded p-4 flex items-center justify-center gap-2 w-32 h-20 shadow">
                   <div className="flex flex-col items-center">
                     <span className="text-white font-bold text-sm text-center truncate w-full">{sponsor.name}</span>
                     <span className="text-[10px] font-mono font-bold text-tertiary uppercase tracking-widest">{sponsor.tier} Partner</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Roster List */}
        <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-tertiary" />
            <h3 className="text-white font-bold text-lg">Active Roster</h3>
          </div>

          <div className="flex flex-col gap-2">
            {mockRoster.map(player => (
              <div key={player.id} className="bg-surface-container-low border border-[#2A2A2A] rounded p-4 flex items-center justify-between hover:border-tertiary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-tertiary font-mono font-bold text-xl w-8 text-center">#{player.number}</span>
                  <span className="text-white font-bold">{player.name}</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-1 bg-[#2A2A2A] text-on-surface-variant rounded uppercase tracking-widest">
                  {player.position}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
