import { useState } from 'react';
import { Users, X, Plus, Trash2, Check, UserPlus } from 'lucide-react';
import { Player } from '../types';

interface RosterModalProps {
  isOpen: boolean;
  teamName: string;
  isHome: boolean;
  initialRoster?: Player[];
  onClose: () => void;
  onSave: (roster: Player[]) => void;
}

const DEFAULT_POSITIONS = ['Aanvaller (F)', 'Verdediger (D)', 'Goalie (G)'];

export default function RosterModal({
  isOpen,
  teamName,
  isHome,
  initialRoster = [],
  onClose,
  onSave,
}: RosterModalProps) {
  const [roster, setRoster] = useState<Player[]>(initialRoster);
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState(DEFAULT_POSITIONS[0]);

  if (!isOpen) return null;

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlayer: Player = {
      id: Date.now().toString(),
      number: number.trim() ? (number.startsWith('#') ? number : `#${number}`) : '#--',
      name: name.trim(),
      position,
    };

    setRoster(prev => [...prev, newPlayer]);
    setNumber('');
    setName('');
  };

  const handleRemovePlayer = (id: string) => {
    setRoster(prev => prev.filter(p => p.id !== id));
  };

  const handleSave = () => {
    onSave(roster);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl w-full max-w-lg p-5 shadow-2xl text-white flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#333] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Users className={`w-5 h-5 ${isHome ? 'text-blue-400' : 'text-red-400'}`} />
            <div>
              <h3 className="font-bold text-base md:text-lg">
                ROSTER {isHome ? '(THUISTEAM)' : '(UITTEAM)'}
              </h3>
              <p className="text-xs text-gray-400 font-mono">{teamName || 'Geen teamnaam'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Player Form */}
        <form onSubmit={handleAddPlayer} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 mb-4 flex flex-col gap-2.5">
          <span className="text-xs font-mono font-bold text-yellow-400 uppercase flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5" /> Speler Toevoegen
          </span>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3">
              <input
                type="text"
                placeholder="Rugnr (#)"
                value={number}
                onChange={e => setNumber(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#333] focus:border-yellow-400 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none"
              />
            </div>
            <div className="col-span-5">
              <input
                type="text"
                required
                placeholder="Naam speler *"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#333] focus:border-yellow-400 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none"
              />
            </div>
            <div className="col-span-4">
              <select
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#333] focus:border-yellow-400 text-white rounded-lg px-2 py-1.5 text-xs outline-none"
              >
                {DEFAULT_POSITIONS.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Speler Toevoegen Aan Roster
          </button>
        </form>

        {/* Roster List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
            <span>SPELERSLIJST ({roster.length})</span>
          </div>

          {roster.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-gray-500 bg-[#141414] rounded-xl border border-[#2a2a2a]">
              Nog geen spelers in dit roster. Voeg hierboven spelers toe.
            </div>
          ) : (
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl divide-y divide-[#222]">
              {roster.map(p => (
                <div key={p.id} className="p-2.5 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-yellow-400 w-8">{p.number}</span>
                    <span className="font-semibold text-gray-200">{p.name}</span>
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono">
                      {p.position}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemovePlayer(p.id)}
                    className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                    title="Verwijder speler"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-3 border-t border-[#333]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-[#444] text-gray-300 font-bold text-xs hover:bg-[#333] transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
          >
            <Check className="w-4 h-4" />
            Roster Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
