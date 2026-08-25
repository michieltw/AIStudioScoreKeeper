import React from 'react';
import { Section, Row, Toggle, Select } from './SettingsUI';
import { SettingsContract } from '../SettingsScreen';

interface PenaltiesSectionProps {
  contract: SettingsContract;
  trackPenalties: boolean;
  setTrackPenalties: (val: boolean) => void;
  gameClock: boolean;
  penaltyClock: string;
  setPenaltyClock: (val: string) => void;
}

export const PenaltiesSection: React.FC<PenaltiesSectionProps> = ({
  contract,
  trackPenalties,
  setTrackPenalties,
  gameClock,
  penaltyClock,
  setPenaltyClock,
}) => {
  return (
    <Section title="PENALTIES">
      <Row label="Penalties">
        <Toggle checked={trackPenalties} onChange={() => setTrackPenalties(!trackPenalties)} />
      </Row>
      <Row label="Penalty Clock" border={false} disabled={!trackPenalties || !gameClock}>
        <Select
          disabled={!trackPenalties || !gameClock}
          options={contract.penaltyClockOptions}
          value={penaltyClock}
          onChange={(e) => setPenaltyClock(e.target.value)}
          className="w-36"
        />
      </Row>
    </Section>
  );
};
