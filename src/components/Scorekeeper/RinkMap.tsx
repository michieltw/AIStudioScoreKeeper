import { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { GameEvent } from '../../types';

// CONTRACT: Alle teksten en fallbacks voor de IJsbaan
export interface RinkMapLabels {
  rotate: string;
  resumeGame: string;
  icing: string;
  offside: string;
  goal: string;
  penalty: string;
  save: string;
  endGame: string;
  homeFallback: string;
  awayFallback: string;
}

interface RinkMapProps {
  rotation: number;
  onRotate: (deg: number) => void;
  isRunning: boolean;
  stoppageTime: number;
  isFaceoffMode: boolean;
  setIsFaceoffMode: (v: boolean) => void;
  onStoppageCancel: () => void;
  formatTime: (s: number) => string;
  onAddShot: (team: 'home' | 'away', x: number, y: number) => void;
  onFaceoff: (team: 'home' | 'away', x?: number, y?: number) => void;
  onIcing: () => void;
  onOffside: () => void;
  onOpenGoalModal: () => void;
  onOpenPenaltyModal: () => void;
  onSaveGame: () => void;
  onEndGame: () => void;
  events: GameEvent[];
  homeTeam?: string;
  awayTeam?: string;
  homeColor?: string;
  awayColor?: string;
  labels?: RinkMapLabels; // <-- Nieuw: alle tekst komt van buitenaf
}

export default function RinkMap({
  rotation,
  onRotate,
  isRunning,
  stoppageTime,
  isFaceoffMode,
  setIsFaceoffMode,
  onStoppageCancel,
  formatTime,
  onAddShot,
  onFaceoff,
  onIcing,
  onOffside,
  onOpenGoalModal,
  onOpenPenaltyModal,
  onSaveGame,
  onEndGame,
  events,
  homeTeam = '', // Geen hardcoded 'Home'
  awayTeam = '', // Geen hardcoded 'Away'
  homeColor = '', // Geen hardcoded '#ffffff'
  awayColor = '', // Geen hardcoded '#ef4444'
  labels
}: RinkMapProps) {
  const [zoom, setZoom] = useState(1);
  const [faceoffPopup, setFaceoffPopup] = useState<{ x: number, y: number, rinkXPct?: number, rinkYPct?: number } | null>(null);

  const rinkContainerRef = useRef<HTMLDivElement>(null);

  const handleInteractiveClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isRunning || isFaceoffMode) return;
    if (!rinkContainerRef.current) return;

    // Get the unscaled/unrotated bounding box of the rink section container
    const rect = rinkContainerRef.current.getBoundingClientRect();

    // Center of the unrotated rink in viewport pixels
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Offset of click from center in screen pixels
    const dxScreen = e.clientX - centerX;
    const dyScreen = e.clientY - centerY;

    // Un-scale by current zoom level
    const dxScaled = dxScreen / zoom;
    const dyScaled = dyScreen / zoom;

    // Un-rotate by current rotation angle (in radians)
    const rad = -rotation * (Math.PI / 180);
    const dxLocal = dxScaled * Math.cos(rad) - dyScaled * Math.sin(rad);
    const dyLocal = dxScaled * Math.sin(rad) + dyScaled * Math.cos(rad);

    // Convert local offsets to percentages relative to unrotated rink dimensions
    const xPct = ((dxLocal / rect.width) + 0.5) * 100;
    const yPct = ((dyLocal / rect.height) + 0.5) * 100;

    // Clamp percentages between 0% and 100%
    const clampedX = Math.max(0, Math.min(100, xPct));
    const clampedY = Math.max(0, Math.min(100, yPct));

    // Determine attacking team based on field side (left half vs right half)
    const isLeftSide = clampedX < 50;
    const team = isLeftSide ? 'away' : 'home';

    onAddShot(team, clampedX, clampedY);
  };

  const faceoffDots = [
    { top: '50%', left: '50%' },
    { top: '25%', left: '20%' },
    { top: '75%', left: '20%' },
    { top: '25%', left: '80%' },
    { top: '75%', left: '80%' },
    { top: '25%', left: '43%' },
    { top: '75%', left: '43%' },
    { top: '25%', left: '57%' },
    { top: '75%', left: '57%' },
  ];

  return (
    <>
      <section className="flex bg-[#1a1a1a] px-2 pt-2 gap-2 shrink-0 justify-between items-center text-gray-400 text-xs z-10">
        <div className="flex gap-2">
          <button className="glossy-button w-8 h-8 rounded-full flex items-center justify-center" onClick={() => setZoom(z => Math.max(1, z - 0.25))}><ZoomOut className="w-4 h-4" /></button>
          <button className="glossy-button w-8 h-8 rounded-full flex items-center justify-center" onClick={() => setZoom(z => Math.min(2.5, z + 0.25))}><ZoomIn className="w-4 h-4" /></button>
          <span className="flex items-center w-10 justify-center">{Math.round(zoom * 100)}%</span>
        </div>
        <button className="glossy-button px-3 py-1.5 rounded flex items-center gap-2" onClick={() => onRotate(90)}>
          <RotateCw className="w-4 h-4" /> {labels?.rotate || ''}
        </button>
      </section>

      <section ref={rinkContainerRef} className="relative bg-white mx-2 mt-2 mb-2 rounded-[40px] shrink-0 h-[280px] border-4 border-black shadow-lg overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-300 transform-origin-center"
          style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
        >
          {/* Rink Lines */}
          <div className="w-full h-full relative pointer-events-none">
            {/* Center Red Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[3px] bg-red-600 -translate-x-1/2 z-10"></div>

            {/* Center Blue Circle */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-blue-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>

            {/* Blue Lines */}
            <div className="absolute top-0 bottom-0 left-[37%] w-[3.5px] bg-blue-600 z-10"></div>
            <div className="absolute top-0 bottom-0 right-[37%] w-[3.5px] bg-blue-600 z-10"></div>

            {/* Goal Lines */}
            <div className="absolute top-0 bottom-0 left-[8%] w-[2px] bg-red-600 z-10"></div>
            <div className="absolute top-0 bottom-0 right-[8%] w-[2px] bg-red-600 z-10"></div>

            {/* Goal Creases */}
            <div className="absolute top-1/2 left-[8%] w-5 h-10 border-2 border-red-600 bg-blue-200/50 rounded-r-full -translate-y-1/2 z-10">
              <div className="absolute inset-0 rounded-r-full opacity-30 blur-sm pointer-events-none" style={{ backgroundColor: homeColor || '#ffffff' }}></div>
            </div>
            <div className="absolute top-1/2 right-[8%] w-5 h-10 border-2 border-red-600 bg-blue-200/50 rounded-l-full -translate-y-1/2 z-10">
              <div className="absolute inset-0 rounded-l-full opacity-30 blur-sm pointer-events-none" style={{ backgroundColor: awayColor || '#ef4444' }}></div>
            </div>

            {/* Four End-Zone Faceoff Circles */}
            <div className="absolute top-[25%] left-[20%] w-16 h-16 border-2 border-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[75%] left-[20%] w-16 h-16 border-2 border-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[25%] left-[80%] w-16 h-16 border-2 border-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[75%] left-[80%] w-16 h-16 border-2 border-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>

            {/* All 9 Faceoff Dots */}
            {/* Center Ice Dot */}
            <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-blue-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>

            {/* Mock Sponsor Logo at Center Ice */}
            <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 z-0 flex items-center justify-center opacity-50 border border-white/20 pointer-events-none">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest rotate-[-45deg]">Sponsor</span>
            </div>

            {/* End Zone Dots */}
            <div className="absolute top-[25%] left-[20%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[75%] left-[20%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[25%] left-[80%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[75%] left-[80%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>

            {/* Neutral Zone Dots */}
            <div className="absolute top-[25%] left-[43%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[75%] left-[43%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[25%] left-[57%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div className="absolute top-[75%] left-[57%] w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>

            {/* Event markers */}
            {events.filter(e => !e.isUndone && e.x !== undefined && e.y !== undefined && (e.type === 'shot' || e.type === 'faceoff')).map(e => (
              <div
                key={e.id}
                className={`absolute rounded-full z-30 shadow-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none border border-black/60 flex items-center justify-center font-bold text-[8px] text-white ${e.type === 'faceoff' ? 'w-4 h-4' : 'w-3 h-3'}`}
                style={{
                  left: `${e.x}%`,
                  top: `${e.y}%`,
                  backgroundColor: e.team === homeTeam ? homeColor : awayColor
                }}
              >
                {e.type === 'faceoff' ? 'F' : ''}
              </div>
            ))}
          </div>

          {/* Interactive Layer */}
          <div className="absolute inset-0 z-20 cursor-crosshair" onClick={handleInteractiveClick}></div>

          {/* Faceoff Dots Layer */}
          {isFaceoffMode && (
            <div className="absolute inset-0 z-40 pointer-events-none">
              {faceoffDots.map((pos, i) => (
                <div
                  key={i}
                  className="faceoff-dot pointer-events-auto"
                  style={pos}
                  onClick={(e) => {
                    e.stopPropagation();
                    const xPct = parseFloat(pos.left);
                    const yPct = parseFloat(pos.top);
                    setFaceoffPopup({ x: e.clientX, y: e.clientY, rinkXPct: xPct, rinkYPct: yPct });
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stoppage Overlay */}
        {!isRunning && !isFaceoffMode && (
          <div className="absolute inset-0 bg-black/75 z-40 flex flex-col items-center justify-center p-2 text-center">
            {/* Grid of buttons */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-md px-2">
              {/* Icing */}
              <button
                onClick={onIcing}
                title={labels?.icing || ''}
                aria-label={labels?.icing || ''}
                className="glossy-button py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 hover:brightness-110 border border-[#333] shrink-0 transition-all active:scale-95 bg-[#1a1a1a]/90 shadow-lg"
              >
                <img src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/puckicon.png?v=1786143386" alt="Icing" className="w-8 h-8 object-contain drop-shadow-md" />
                <span className="text-white text-[9px] font-bold uppercase tracking-wider truncate max-w-full px-0.5">{labels?.icing || ''}</span>
              </button>

              {/* Offside */}
              <button
                onClick={onOffside}
                title={labels?.offside || ''}
                aria-label={labels?.offside || ''}
                className="glossy-button py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 hover:brightness-110 border border-[#333] shrink-0 transition-all active:scale-95 bg-[#1a1a1a]/90 shadow-lg"
              >
                <img src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/skateicon.png?v=1786143386" alt="Offside" className="w-8 h-8 object-contain drop-shadow-md" />
                <span className="text-white text-[9px] font-bold uppercase tracking-wider truncate max-w-full px-0.5">{labels?.offside || ''}</span>
              </button>

              {/* Doelpunt */}
              <button
                onClick={onOpenGoalModal}
                title={labels?.goal || ''}
                aria-label={labels?.goal || ''}
                className="glossy-button py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 hover:brightness-110 border border-[#333] shrink-0 transition-all active:scale-95 bg-[#1a1a1a]/90 shadow-lg"
              >
                <img src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/lampicon.png?v=1786143386" alt="Goal" className="w-8 h-8 object-contain drop-shadow-md" />
                <span className="text-white text-[9px] font-bold uppercase tracking-wider truncate max-w-full px-0.5">{labels?.goal || ''}</span>
              </button>

              {/* Straf */}
              <button
                onClick={onOpenPenaltyModal}
                title={labels?.penalty || ''}
                aria-label={labels?.penalty || ''}
                className="glossy-button py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 hover:brightness-110 border border-[#333] shrink-0 transition-all active:scale-95 bg-[#1a1a1a]/90 shadow-lg"
              >
                <img src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/reficon.png?v=1786143386" alt="Penalty" className="w-8 h-8 object-contain drop-shadow-md" />
                <span className="text-white text-[9px] font-bold uppercase tracking-wider truncate max-w-full px-0.5">{labels?.penalty || ''}</span>
              </button>

              {/* Opslaan */}
              <button
                onClick={onSaveGame}
                title={labels?.save || ''}
                aria-label={labels?.save || ''}
                className="glossy-button py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 hover:brightness-110 border border-[#333] shrink-0 transition-all active:scale-95 bg-[#1a1a1a]/90 shadow-lg"
              >
                <img src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/saveicon.png?v=1786143386" alt="Save" className="w-8 h-8 object-contain drop-shadow-md" />
                <span className="text-white text-[9px] font-bold uppercase tracking-wider truncate max-w-full px-0.5">{labels?.save || ''}</span>
              </button>

              {/* End Game */}
              <button
                onClick={onEndGame}
                title={labels?.endGame || ''}
                aria-label={labels?.endGame || ''}
                className="glossy-button py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 hover:brightness-110 border border-[#333] shrink-0 transition-all active:scale-95 bg-[#1a1a1a]/90 shadow-lg"
              >
                <img src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/finalicon.png?v=1786143386" alt="End Game" className="w-8 h-8 object-contain drop-shadow-md" />
                <span className="text-white text-[9px] font-bold uppercase tracking-wider truncate max-w-full px-0.5">{labels?.endGame || ''}</span>
              </button>
            </div>
          </div>
        )}

        {/* Faceoff Popup */}
        {faceoffPopup && (
          <div
            className="fixed bg-[#222] border border-[#555] rounded-lg p-2 z-[60] flex gap-2 shadow-xl transform -translate-x-1/2 -translate-y-full mt-[-10px]"
            style={{ left: faceoffPopup.x, top: faceoffPopup.y }}
          >
            <button className="glossy-button px-4 py-2 rounded text-white font-bold text-xs" onClick={() => { onFaceoff('home', faceoffPopup.rinkXPct, faceoffPopup.rinkYPct); setFaceoffPopup(null); setIsFaceoffMode(false); }}>
              {homeTeam || labels?.homeFallback || ''}
            </button>
            <button className="glossy-button px-4 py-2 rounded text-white font-bold text-xs" onClick={() => { onFaceoff('away', faceoffPopup.rinkXPct, faceoffPopup.rinkYPct); setFaceoffPopup(null); setIsFaceoffMode(false); }}>
              {awayTeam || labels?.awayFallback || ''}
            </button>
          </div>
        )}
      </section>
    </>
  );
}