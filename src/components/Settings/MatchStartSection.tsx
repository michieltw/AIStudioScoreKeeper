import React from 'react';
import { Section, Row, Select } from './SettingsUI';
import { SettingsContract } from '../SettingsScreen';

interface MatchStartSectionProps {
  contract: SettingsContract;
  initialScoreHome: number;
  setInitialScoreHome: (val: number | ((prev: number) => number)) => void;
  initialScoreAway: number;
  setInitialScoreAway: (val: number | ((prev: number) => number)) => void;
  initialSogHome: number;
  setInitialSogHome: (val: number | ((prev: number) => number)) => void;
  initialSogAway: number;
  setInitialSogAway: (val: number | ((prev: number) => number)) => void;
  initialPeriod: number;
  setInitialPeriod: (val: number) => void;
}

export const MatchStartSection: React.FC<MatchStartSectionProps> = ({
  contract,
  initialScoreHome,
  setInitialScoreHome,
  initialScoreAway,
  setInitialScoreAway,
  initialSogHome,
  setInitialSogHome,
  initialSogAway,
  setInitialSogAway,
  initialPeriod,
  setInitialPeriod,
}) => {
  return (
    <Section title="BEGINWAARDEN WEDSTRIJD" defaultExpanded={false}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
        {/* Score */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[12px] font-bold text-on-surface-variant tracking-widest uppercase">
            SCORE BIJ START
          </span>
          <div className="flex gap-4 items-center bg-[#050505] border border-[#2A2A2A] rounded-lg p-3 justify-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] text-on-surface-variant font-semibold">HOME</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInitialScoreHome((prev: number) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                >
                  -
                </button>
                <input
                  type="number"
                  value={initialScoreHome}
                  onChange={(e) => setInitialScoreHome(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 bg-transparent text-center font-display font-bold text-[20px] text-on-background outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setInitialScoreHome((prev: number) => prev + 1)}
                  className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                >
                  +
                </button>
              </div>
            </div>
            <span className="text-on-surface-variant font-display font-bold text-xl px-1">-</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] text-on-surface-variant font-semibold">AWAY</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInitialScoreAway((prev: number) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                >
                  -
                </button>
                <input
                  type="number"
                  value={initialScoreAway}
                  onChange={(e) => setInitialScoreAway(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 bg-transparent text-center font-display font-bold text-[20px] text-on-background outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setInitialScoreAway((prev: number) => prev + 1)}
                  className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shots on Goal */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[12px] font-bold text-on-surface-variant tracking-widest uppercase">
            SOG BIJ START
          </span>
          <div className="flex gap-4 items-center bg-[#050505] border border-[#2A2A2A] rounded-lg p-3 justify-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] text-on-surface-variant font-semibold">HOME</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInitialSogHome((prev: number) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                >
                  -
                </button>
                <input
                  type="number"
                  value={initialSogHome}
                  onChange={(e) => setInitialSogHome(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 bg-transparent text-center font-display font-bold text-[20px] text-on-background outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setInitialSogHome((prev: number) => prev + 1)}
                  className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                >
                  +
                </button>
              </div>
            </div>
            <span className="text-on-surface-variant font-display font-bold text-xl px-1">-</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] text-on-surface-variant font-semibold">AWAY</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInitialSogAway((prev: number) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                >
                  -
                </button>
                <input
                  type="number"
                  value={initialSogAway}
                  onChange={(e) => setInitialSogAway(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 bg-transparent text-center font-display font-bold text-[20px] text-on-background outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setInitialSogAway((prev: number) => prev + 1)}
                  className="w-8 h-8 rounded bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center font-bold text-lg text-primary transition-colors select-none active:scale-90"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Row label="Start Periode" border={false}>
        <Select
          options={contract.initialPeriodOptions}
          value={contract.initialPeriodOptions[initialPeriod - 1] || contract.initialPeriodOptions[0]}
          onChange={(e) => {
            const selectedIndex = contract.initialPeriodOptions.indexOf(e.target.value);
            setInitialPeriod(selectedIndex !== -1 ? selectedIndex + 1 : contract.defaultInitialPeriod);
          }}
          className="w-48 font-semibold"
        />
      </Row>
    </Section>
  );
};
