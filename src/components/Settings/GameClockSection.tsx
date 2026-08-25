import React from 'react';
import { Section, Row, Toggle, Select } from './SettingsUI';
import { SettingsContract } from '../SettingsScreen';

interface GameClockSectionProps {
  contract: SettingsContract;
  gameClock: boolean;
  setGameClock: (val: boolean) => void;
  clockPauseBehavior: string;
  setClockPauseBehavior: (val: string) => void;
  autoStopAtPeriodEnd: string;
  setAutoStopAtPeriodEnd: (val: string) => void;
  p1Input: string;
  setP1Input: (val: string) => void;
  setPeriodLength: (val: number) => void;
}

export const GameClockSection: React.FC<GameClockSectionProps> = ({
  contract,
  gameClock,
  setGameClock,
  clockPauseBehavior,
  setClockPauseBehavior,
  autoStopAtPeriodEnd,
  setAutoStopAtPeriodEnd,
  p1Input,
  setP1Input,
  setPeriodLength,
}) => {
  return (
    <Section title="GAME CLOCK">
      <Row label="Game Clock">
        <Toggle checked={gameClock} onChange={() => setGameClock(!gameClock)} />
      </Row>
      <Row label="Clock Pause Behavior" disabled={!gameClock}>
        <Select
          disabled={!gameClock}
          options={contract.clockBehaviorOptions}
          value={clockPauseBehavior}
          onChange={(e) => setClockPauseBehavior(e.target.value)}
          className="w-40"
        />
      </Row>
      <Row label="Auto Stop at Period End" border={false} disabled={!gameClock}>
        <Select
          disabled={!gameClock}
          options={contract.yesNoOptions}
          value={autoStopAtPeriodEnd}
          onChange={(e) => setAutoStopAtPeriodEnd(e.target.value)}
          className="w-32"
        />
      </Row>

      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 py-2 ${!gameClock ? 'opacity-50 pointer-events-none' : ''}`}>
        {contract.periodBlocks.map((block: any) => (
          <div key={block.id} className="flex flex-col gap-1">
            <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase">
              {block.label}
            </label>
            {block.id === 'p1' ? (
              <input
                className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-center font-display font-bold text-[24px] input-focus outline-none"
                type="text"
                value={p1Input}
                onChange={(e) => {
                  const val = e.target.value;
                  setP1Input(val);
                  const parts = val.split(':');
                  if (parts.length > 0) {
                    const mins = parseInt(parts[0], 10);
                    if (!isNaN(mins)) {
                      setPeriodLength(mins);
                    }
                  }
                }}
              />
            ) : (
              <input
                className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-center font-display font-bold text-[24px] input-focus outline-none"
                type="text"
                defaultValue={block.defaultTime}
              />
            )}
          </div>
        ))}
      </div>
    </Section>
  );
};
