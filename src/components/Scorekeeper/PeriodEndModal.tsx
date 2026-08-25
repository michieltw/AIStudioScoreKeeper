import React, { useState } from 'react';
import { GameState } from '../../types';

interface PeriodEndModalProps {
  gameState: GameState;
  homeTeam: string;
  awayTeam: string;
  homeColor: string;
  awayColor: string;
  homeLogo?: string;
  awayLogo?: string;
  onResumeGame: (switchEnds: boolean) => void;
}

export default function PeriodEndModal({
  gameState,
  homeTeam,
  awayTeam,
  homeColor,
  awayColor,
  homeLogo,
  awayLogo,
  onResumeGame
}: PeriodEndModalProps) {
  const [switchEnds, setSwitchEnds] = useState(false);

  // Calculate stats
  const sogHome = gameState.sogHome;
  const sogAway = gameState.sogAway;
  const totalSog = sogHome + sogAway || 1; // avoid div 0

  const goalsHome = gameState.scoreHome;
  const goalsAway = gameState.scoreAway;
  const totalGoals = goalsHome + goalsAway || 1;

  // Render a stat bar
  const StatBar = ({ left, right, total, leftColor, rightColor }: any) => {
    const leftPct = (left / total) * 100;
    const rightPct = (right / total) * 100;
    return (
      <div className="flex w-full h-3 rounded-full overflow-hidden bg-[#222]">
        <div style={{ width: `${leftPct}%`, backgroundColor: leftColor }} className="h-full transition-all duration-500" />
        <div style={{ width: `${rightPct}%`, backgroundColor: rightColor }} className="h-full transition-all duration-500" />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in duration-300">

        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-white uppercase tracking-wider">EINDE {gameState.period === 4 ? 'OT' : gameState.period >= 5 ? 'SHOOTOUT' : `PERIODE ${gameState.period}`}</h2>
          <p className="text-gray-400 text-sm mt-1">Overzicht & Statistieken</p>
        </div>

        {/* Score & Logos */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2 w-1/3">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 bg-[#222] flex items-center justify-center shrink-0 shadow-lg">
              {homeLogo ? (
                <img src={homeLogo} alt={homeTeam} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ backgroundColor: homeColor }} />
              )}
            </div>
            <span className="font-bold text-white uppercase text-center text-sm">{homeTeam}</span>
            <span className="text-4xl font-display font-bold text-white">{goalsHome}</span>
          </div>

          <div className="text-gray-500 font-display text-2xl font-bold">-</div>

          <div className="flex flex-col items-center gap-2 w-1/3">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 bg-[#222] flex items-center justify-center shrink-0 shadow-lg">
              {awayLogo ? (
                <img src={awayLogo} alt={awayTeam} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ backgroundColor: awayColor }} />
              )}
            </div>
            <span className="font-bold text-white uppercase text-center text-sm">{awayTeam}</span>
            <span className="text-4xl font-display font-bold text-white">{goalsAway}</span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex flex-col gap-4 mt-2 bg-[#1a1a1a] rounded-xl p-4 border border-[#222]">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
              <span className="text-white">{sogHome}</span>
              <span>SHOTS ON GOAL</span>
              <span className="text-white">{sogAway}</span>
            </div>
            <StatBar left={sogHome} right={sogAway} total={totalSog} leftColor={homeColor || '#888'} rightColor={awayColor || '#666'} />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
              <span className="text-white">{goalsHome}</span>
              <span>GOALS</span>
              <span className="text-white">{goalsAway}</span>
            </div>
            <StatBar left={goalsHome} right={goalsAway} total={totalGoals} leftColor={homeColor || '#888'} rightColor={awayColor || '#666'} />
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-xl border border-[#222] mt-2">
          <span className="text-sm font-bold text-gray-300 uppercase">Speelveld spiegelen</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={switchEnds} onChange={(e) => setSwitchEnds(e.target.checked)} />
            <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Action */}
        <button
          onClick={() => onResumeGame(switchEnds)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl uppercase tracking-wider transition-all active:scale-95 mt-2"
        >
          Wedstrijd Hervatten
        </button>

      </div>
    </div>
  );
}
