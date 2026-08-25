import { useState, useEffect } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import { Player } from '../../types';

// CONTRACT: Dit definieert wat er dynamisch moet worden aangeleverd
export interface PenaltyDurationOption {
  minutes: number;
  label: string; // bijv. "Minor", "Major"
}

export interface PenaltyModalLabels {
  title: string; // "STRAF REGISTREREN"
  teamSelectLabel: string; // "Team met straf"
  playerInputLabel: string; // "Speler (# of Naam)"
  playerInputPlaceholder: string; // "bijv. #24"
  reasonSelectLabel: string; // "Type Straf / Reden"
  durationSelectLabel: string; // "Tijdsduur (Minuten)"
  cancelButton: string; // "Annuleren"
  submitButton: string; // "Straf Opslaan"
  minutesSuffix: string; // "Min"
}

interface PenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (penaltyData: {
    team: 'home' | 'away';
    player: string;
    reason: string;
    minutes: number;
  }) => void;
  homeTeam?: string;
  awayTeam?: string;
  homeRoster?: Player[];
  awayRoster?: Player[];

  // Nieuwe dynamische props
  penaltyOptions: string[];
  durationOptions: PenaltyDurationOption[];
  labels: PenaltyModalLabels;
}

export default function PenaltyModal({
  isOpen,
  onClose,
  onSubmit,
  homeTeam = '',
  awayTeam = '',
  homeRoster = [],
  awayRoster = [],
  penaltyOptions = [],
  durationOptions = [],
  labels
}: PenaltyModalProps) {
  const [team, setTeam] = useState<'home' | 'away'>('home');
  const [player, setPlayer] = useState('');

  // Startwaarden gebaseerd op de dynamische arrays
  const [reason, setReason] = useState(penaltyOptions.length > 0 ? penaltyOptions[0] : '');
  const [minutes, setMinutes] = useState<number>(durationOptions.length > 0 ? durationOptions[0].minutes : 0);

  // Zorg dat de velden netjes gereset worden als de modal opent
  useEffect(() => {
    if (isOpen) {
      setTeam('home');
      setPlayer('');
      setReason(penaltyOptions.length > 0 ? penaltyOptions[0] : '');
      setMinutes(durationOptions.length > 0 ? durationOptions[0].minutes : 0);
    }
  }, [isOpen, penaltyOptions, durationOptions]);

  if (!isOpen) return null;

  const activeRoster = team === 'home' ? homeRoster : awayRoster;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      team,
      player: player.trim(),
      reason,
      minutes,
    });
    setPlayer('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#222222] border border-[#333] rounded-2xl w-full max-w-md p-5 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#333] pb-3 mb-4">
          <div className="flex items-center gap-2 text-red-400 font-bold text-lg">
            <AlertTriangle className="w-5 h-5" />
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

          {/* Player */}
          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase mb-1 font-bold">
              {labels?.playerInputLabel || ''} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={labels?.playerInputPlaceholder || ''}
              value={player}
              onChange={e => setPlayer(e.target.value)}
              className="w-full bg-[#181818] border border-[#333] focus:border-red-400 text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors"
            />
            {activeRoster.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {activeRoster.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlayer(`${p.number} ${p.name}`)}
                    className="text-[10px] bg-[#2a2a2a] hover:bg-red-500 hover:text-white text-gray-300 px-2 py-0.5 rounded transition-colors"
                  >
                    {p.number} {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Penalty Reason */}
          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase mb-1 font-bold">
              {labels?.reasonSelectLabel || ''}
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-[#181818] border border-[#333] focus:border-red-400 text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors"
            >
              {penaltyOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Penalty Duration */}
          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase mb-1.5 font-bold">
              {labels?.durationSelectLabel || ''}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {durationOptions.map(option => (
                <button
                  key={option.minutes}
                  type="button"
                  className={`py-2 rounded-lg font-bold text-xs transition-all border ${
                    minutes === option.minutes
                      ? 'bg-red-500/20 text-red-400 border-red-500 font-extrabold'
                      : 'bg-[#181818] text-gray-400 border-[#333] hover:text-white'
                  }`}
                  onClick={() => setMinutes(option.minutes)}
                >
                  {option.minutes} {labels?.minutesSuffix || ''} ({option.label})
                </button>
              ))}
            </div>
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
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
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