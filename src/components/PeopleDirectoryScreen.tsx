import { useState } from 'react';
import { ArrowLeft, Users, Search, Filter } from 'lucide-react';

interface PeopleDirectoryScreenProps {
  onViewPerson?: (person: any) => void;
  onBack: () => void;
}

export default function PeopleDirectoryScreen({ onBack, onViewPerson }: PeopleDirectoryScreenProps) {
  const [filterJob, setFilterJob] = useState('All');
  const [filterRole, setFilterRole] = useState('All');

  // Mock data for Phase 2 visualization
  const mockPeople = [
    { id: 1, name: 'John Doe', role: 'Player', job: 'Center', club: 'Blackout HC' },
    { id: 2, name: 'Jane Smith', role: 'Manager', job: 'General Manager', club: 'Blackout HC' },
    { id: 3, name: 'Mike Johnson', role: 'Coach', job: 'Head Coach', club: 'Ice Dogs' },
    { id: 4, name: 'Sarah Williams', role: 'Player', job: 'Goalie', club: 'Free Agent' },
  ];

  const filteredPeople = mockPeople.filter(p => {
    if (filterJob !== 'All' && !p.job.includes(filterJob)) return false;
    if (filterRole !== 'All' && p.role !== filterRole) return false;
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
        <div className="w-9" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 w-full max-w-4xl mx-auto flex flex-col gap-6">

        {/* Filters */}
        <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search people..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPeople.map(person => (
                <div key={person.id} onClick={() => onViewPerson && onViewPerson(person)} className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-4 flex items-center gap-4 hover:border-tertiary/50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high border border-[#2A2A2A] flex items-center justify-center text-on-surface-variant group-hover:text-tertiary transition-colors">
                        <Users className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-bold group-hover:text-tertiary transition-colors">{person.name}</h3>
                        <div className="flex flex-col gap-0.5 mt-1">
                            <span className="text-xs text-on-surface-variant font-mono">Role: {person.role}</span>
                            <span className="text-xs text-on-surface-variant font-mono">Job: {person.job}</span>
                        </div>
                    </div>
                    <div className="text-right">
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

      </div>
    </div>
  );
}
