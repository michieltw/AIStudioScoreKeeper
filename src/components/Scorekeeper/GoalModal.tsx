import { useState, useEffect } from 'react';
import { Trophy, X, Check } from 'lucide-react';
import { Player } from '../../types';

// CONTRACT: Definieer alle teksten die dit component nodig heeft
export interface GoalModalLabels {
  title: string; // "DOELPUNT REGISTREREN"
  teamSelectLabel: string; // "Team dat scoorde"
  scorerInputLabel: string; // "Doelpuntenmaker (# of Naam)"
  scorerInputPlaceholder: string; // "bijv. #12 Matthews"
  assist1InputLabel: string; // "Eerste Assist (optioneel)"
  assist1InputPlaceholder: string; // "bijv. #16 Marner"
  assist2InputLabel: string; // "Tweede Assist (optioneel)"
  assist2InputPlaceholder: string; // "bijv. #88 Nylander"
  cancelButton: string; // "Annuleren"
  submitButton: string; // "Doelpunt Opslaan"
}

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goalData: {
    team: 'home' | 'away';
    scorer: string;
    assist1: string;
    assist2: string;
  }) => void;
  homeTeam?: string;
  awayTeam?: string;
  homeRoster?: Player[];
  awayRoster?: Player[];
  labels?: GoalModalLabels; // <-- Nieuw: contract voor teksten
}

export default function GoalModal({
  isOpen,
  onClose,
  onSubmit,
  homeTeam = '',
  awayTeam = '',
  homeRoster = [],
  awayRoster = [],
  labels
}: GoalModalProps) {
  const [team, setTeam] = useState<'home' | 'away'>('home');
  const [scorer, setScorer] = useState('');
  const [assist1, setAssist1] = useState('');
  const [assist2, setAssist2] = useState('');

  // Zorg dat de velden leeg zijn elke keer als de modal opent
  useEffect(() => {
    if (isOpen) {
      setTeam('home');
      setScorer('');
      setAssist1('');
      setAssist2('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeRoster = team === 'home' ? homeRoster : awayRoster;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      team,
      scorer: scorer.trim(),
      assist1: assist1.trim(),
      assist2: assist2.trim(),
    });
    setScorer('');
    setAssist1('');
    setAssist2('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#222222] border border-[#333] rounded-2xl w-full max-w-md p-5 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#333] pb-3 mb-4">
          <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg">
            <Trophy className="w-5 h-5" />
            <span>{labels?.title || ''}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Team Selection */}
          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase mb-1.5 font-bold">
              {labels?.teamSelectLabel || ''}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`py-2.5 rounded-lg font-bold text-sm transition-all border ${
                  team === 'home'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md scale-[1.02]'
                    : 'bg-[#181818] text-gray-400 border-[#333] hover:text-white'
                }`}
                onClick={() => setTeam('home')}
              >
                {homeTeam}
              </button>
              <button
                type="button"
                className={`py-2.5 rounded-lg font-bold text-sm transition-all border ${
                  team === 'away'
                    ? 'bg-red-600 text-white border-red-400 shadow-md scale-[1.02]'
                    : 'bg-[#181818] text-gray-400 border-[#333] hover:text-white'
                }`}
                onClick={() => setTeam('away')}
              >
                {awayTeam}
              </button>
            </div>
          </div>

          {/* Scorer */}
          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase mb-1 font-bold">
              {labels?.scorerInputLabel || ''} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={labels?.scorerInputPlaceholder || ''}
              value={scorer}
              onChange={e => setScorer(e.target.value)}
              className="w-full bg-[#181818] border border-[#333] focus:border-yellow-400 text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors"
            />
            {activeRoster.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {activeRoster.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setScorer(`${p.number} ${p.name}`)}
                    className="text-[10px] bg-[#2a2a2a] hover:bg-yellow-500 hover:text-black text-gray-300 px-2 py-0.5 rounded transition-colors"
                  >
                    {p.number} {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assist 1 */}
          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase mb-1 font-bold">
              {labels?.assist1InputLabel || ''}
            </label>
            <input
              type="text"
              placeholder={labels?.assist1InputPlaceholder || ''}
              value={assist1}
              onChange={e => setAssist1(e.target.value)}
              className="w-full bg-[#181818] border border-[#333] focus:border-yellow-400 text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors"
            />
            {activeRoster.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {activeRoster.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAssist1(`${p.number} ${p.name}`)}
                    className="text-[10px] bg-[#2a2a2a] hover:bg-yellow-500 hover:text-black text-gray-300 px-2 py-0.5 rounded transition-colors"
                  >
                    {p.number} {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assist 2 */}
          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase mb-1 font-bold">
              {labels?.assist2InputLabel || ''}
            </label>
            <input
              type="text"
              placeholder={labels?.assist2InputPlaceholder || ''}
              value={assist2}
              onChange={e => setAssist2(e.target.value)}
              className="w-full bg-[#181818] border border-[#333] focus:border-yellow-400 text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors"
            />
            {activeRoster.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {activeRoster.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAssist2(`${p.number} ${p.name}`)}
                    className="text-[10px] bg-[#2a2a2a] hover:bg-yellow-500 hover:text-black text-gray-300 px-2 py-0.5 rounded transition-colors"
                  >
                    {p.number} {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2 border-t border-[#333] mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-[#444] text-gray-300 font-bold text-sm hover:bg-[#333] transition-colors"
            >
              {labels?.cancelButton || ''}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
            >
              <Check className="w-4 h-4" />
              {labels?.submitButton || ''}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}