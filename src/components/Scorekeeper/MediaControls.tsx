import { Play, Pause, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface MediaControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  filter: string;
  setFilter: (f: any) => void;
}

export default function MediaControls({ isRunning, onToggle, filter, setFilter }: MediaControlsProps) {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  return (
    <section className="p-2 shrink-0 bg-[#1a1a1a] flex flex-col gap-2 border-b border-[#333]">
      <div className="relative w-full flex items-center">
        <button
          className="w-full glossy-button py-4 rounded-lg flex items-center justify-center gap-4 text-3xl flex-1"
          onClick={onToggle}
        >
          {isRunning ? (
            <Pause className="w-8 h-8 text-gray-300 drop-shadow-lg" fill="currentColor" />
          ) : (
            <Play className="w-8 h-8 text-gray-300 drop-shadow-lg" fill="currentColor" />
          )}
        </button>
        <button
          className="absolute right-0 h-full px-4 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
        >
          {isFiltersExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isFiltersExpanded && (
        <div className="flex gap-1 text-xs justify-between">
          {['all', 'shot', 'goal', 'penalty'].map(f => (
            <button
              key={f}
              className={`glossy-button px-2 py-1 rounded flex-1 ${filter === f ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}
              onClick={() => setFilter(f as any)}
            >
              {f === 'all' ? 'Alles' : f === 'shot' ? 'Schoten' : f === 'goal' ? 'Doelp.' : 'Straffen'}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
