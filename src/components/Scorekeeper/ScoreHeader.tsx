import { PawPrint, Cat, Clock, ArrowLeft, X } from 'lucide-react';
import { GameState } from '../../types';
import { useState } from 'react';

// Ik heb een labels-contract toegevoegd zodat zelfs de teksten niet meer hardcoded zijn
export interface ScoreHeaderLabels {
  period: string;
  sog: string;
  penaltyBox: string;
  penaltiesDisabled: string;
  noPenalties: string;
  minutes: string;
  playerFallback: string;
}

interface ScoreHeaderProps {
  gameState: GameState;
  formatTime: (s: number) => string;
  onBack: () => void;
  homeTeam: string;
  awayTeam: string;
  homeColor?: string;
  awayColor?: string;
  homeLogo?: string;
  awayLogo?: string;
  trackPenalties?: boolean;
  onAdjustTime?: (seconds: number) => void;
  onStoppageCancel?: () => void;
  labels?: ScoreHeaderLabels; // <-- Nieuw: alle tekst komt nu van buitenaf
}

export default function ScoreHeader({
  gameState,
  formatTime,
  onBack,
  homeTeam,
  awayTeam,
  homeColor = '', // Geen Toronto blauw meer
  awayColor = '', // Geen Montreal rood meer
  homeLogo,
  awayLogo,
  trackPenalties = false, // Geen aannames meer over de regels
  onAdjustTime,
  onStoppageCancel,
  labels
}: ScoreHeaderProps) {
  const [initialY, setInitialY] = useState<number | null>(null);
  const [lastAccumulated, setLastAccumulated] = useState<number>(0);
  const [homeLogoError, setHomeLogoError] = useState(false);
  const [awayLogoError, setAwayLogoError] = useState(false);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    let clientY;
    if ('touches' in e) {
      clientY = e.touches[0].clientY;
    } else {
      clientY = (e as React.MouseEvent).clientY;
    }
    setInitialY(clientY);
    setLastAccumulated(0);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (initialY === null || !onAdjustTime) return;

    let clientY;
    if ('touches' in e) {
      clientY = e.touches[0].clientY;
    } else {
      clientY = (e as React.MouseEvent).clientY;
    }

    const diff = initialY - clientY;

    // Exponential scale for smoother precision at small swipes, and faster changes at long swipes
    const absDiff = Math.abs(diff);
    const sign = diff > 0 ? 1 : -1;

    let totalSeconds = 0;
    if (absDiff > 10) {
      totalSeconds = Math.floor(Math.pow(absDiff / 10, 1.5));
    }

    const currentAccumulated = totalSeconds * sign;
    const delta = currentAccumulated - lastAccumulated;

    if (delta !== 0) {
      onAdjustTime(delta);
      setLastAccumulated(currentAccumulated);
    }
  };

  const handleTouchEnd = () => {
    setInitialY(null);
    setLastAccumulated(0);
  };

  const homePenalties = (gameState.activePenalties || []).filter(
    p => p.team === homeTeam
  );
  const awayPenalties = (gameState.activePenalties || []).filter(
    p => p.team === awayTeam
  );

  return (
    <header className="flex flex-col glossy-dark pt-2 pb-2 px-2 shrink-0 z-10 relative shadow-xl">
      <button onClick={onBack} className="absolute top-3 left-2 text-gray-400 hover:text-white z-20">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="flex justify-between items-center relative z-10 pt-2 px-2">
        {/* Team 1: Home */}
        <div className="flex items-center gap-1 sm:gap-3 w-[30%] min-w-0">
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 overflow-hidden shrink-0 border-2 border-white/20 shadow-lg bg-[#222]">
              {homeLogo && !homeLogoError ? (
                <img src={homeLogo} alt={homeTeam} className="w-full h-full object-cover" onError={() => setHomeLogoError(true)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: homeColor }}>
                  <PawPrint className="text-white w-5 h-5 sm:w-7 sm:h-7 drop-shadow-md" fill="currentColor" />
                </div>
              )}
            </div>
            <span className="font-bold text-xs sm:text-lg truncate w-full text-center" style={{ color: homeColor }}>{homeTeam}</span>
          </div>
          <div className="flex flex-col items-center shrink-0">
            <div className="text-4xl sm:text-5xl font-bold leading-none">{gameState.scoreHome}</div>
            <div className="text-[10px] text-gray-400 font-bold mt-1">
              {labels?.sog || ''} <span>{gameState.sogHome}</span>
            </div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center justify-center w-1/3 relative">
          {!gameState.isRunning && gameState.stoppageTime > 0 && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              <span className="text-gray-400 font-mono text-xs">{formatTime(gameState.stoppageTime)}</span>
              <button
                onClick={onStoppageCancel}
                className="text-gray-500 hover:text-gray-300 transition-colors"
                title="Negeer onderbreking"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div
            className="timer-bg text-4xl mb-1 mt-1 shadow-inner text-white tracking-wider touch-none cursor-ns-resize"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
          >
            {formatTime(gameState.timeRemaining)}
          </div>
          <div className="text-[10px] text-gray-400 font-bold tracking-wider cursor-pointer select-none">
            {gameState.period === 4 ? 'OT' : gameState.period >= 5 ? 'SO' : `${labels?.period || ''} ${gameState.period}`}
          </div>
        </div>

        {/* Team 2: Away */}
        <div className="flex items-center justify-end gap-1 sm:gap-3 w-[30%] min-w-0">
          <div className="flex flex-col items-center shrink-0">
            <div className="text-4xl sm:text-5xl font-bold leading-none">{gameState.scoreAway}</div>
            <div className="text-[10px] text-gray-400 font-bold mt-1">
              {labels?.sog || ''} <span>{gameState.sogAway}</span>
            </div>
          </div>
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 overflow-hidden shrink-0 border-2 border-white/20 shadow-lg bg-[#222]">
              {awayLogo && !awayLogoError ? (
                <img src={awayLogo} alt={awayTeam} className="w-full h-full object-cover" onError={() => setAwayLogoError(true)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: awayColor }}>
                  <Cat className="text-white w-5 h-5 sm:w-7 sm:h-7 drop-shadow-md" fill="currentColor" />
                </div>
              )}
            </div>
            <span className="font-bold text-xs sm:text-lg truncate w-full text-center" style={{ color: awayColor }}>{awayTeam}</span>
          </div>
        </div>
      </div>

      {/* Penalty Boxes */}
      <div className="flex justify-between mt-4 px-1 gap-2 text-xs">
        {/* Home Penalty Box */}
        <div className="flex-1 bg-black/40 rounded p-1 flex flex-col border border-gray-700 min-h-[30px] max-h-28 overflow-y-auto">
          {!trackPenalties ? (
            <div className="text-center text-[10px] text-gray-500 py-1 font-mono italic">{labels?.penaltiesDisabled || ''}</div>
          ) : homePenalties.length === 0 ? (
            <div className="text-center text-[10px] text-gray-500 py-1 font-mono">{labels?.noPenalties || ''}</div>
          ) : (
            homePenalties.map(p => (
              <div key={p.id} className="flex justify-between items-center px-1 font-mono py-0.5 border-b border-gray-800/40 last:border-0">
                <span className="text-gray-200 font-bold truncate max-w-[90px]" title={p.player}>
                  {p.player || labels?.playerFallback || ''}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 font-bold text-[11px]">
                    {formatTime(p.secondsRemaining)} <span className="text-[8px] text-gray-500">{labels?.minutes || ''}</span>
                  </span>
                  <Clock className={`w-3 h-3 ${gameState.isRunning ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Away Penalty Box */}
        <div className="flex-1 bg-black/40 rounded p-1 flex flex-col border border-gray-700 min-h-[30px] max-h-28 overflow-y-auto">
          {!trackPenalties ? (
            <div className="text-center text-[10px] text-gray-500 py-1 font-mono italic">{labels?.penaltiesDisabled || ''}</div>
          ) : awayPenalties.length === 0 ? (
            <div className="text-center text-[10px] text-gray-500 py-1 font-mono">{labels?.noPenalties || ''}</div>
          ) : (
            awayPenalties.map(p => (
              <div key={p.id} className="flex justify-between items-center px-1 font-mono py-0.5 border-b border-gray-800/40 last:border-0">
                <span className="text-gray-200 font-bold truncate max-w-[90px]" title={p.player}>
                  {p.player || labels?.playerFallback || ''}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 font-bold text-[11px]">
                    {formatTime(p.secondsRemaining)} <span className="text-[8px] text-gray-500">{labels?.minutes || ''}</span>
                  </span>
                  <Clock className={`w-3 h-3 ${gameState.isRunning ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </header>
  );
}