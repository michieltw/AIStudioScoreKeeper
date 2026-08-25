import React from 'react';
import { Users } from 'lucide-react';
import { Section, Row, Select } from './SettingsUI';
import { SettingsContract } from '../SettingsScreen';

interface TeamsSectionProps {
  contract: SettingsContract;
  teamSelection: string;
  setTeamSelection: (val: string) => void;
  homeTeam: string;
  setHomeTeam: (val: string) => void;
  homeColor: string;
  setHomeColor: (val: string) => void;
  homeLogo: string;
  setHomeLogo: (val: string) => void;
  homeRosterLength: number;
  awayTeam: string;
  setAwayTeam: (val: string) => void;
  awayColor: string;
  setAwayColor: (val: string) => void;
  awayLogo: string;
  setAwayLogo: (val: string) => void;
  awayRosterLength: number;
  setActiveRosterModal: (modal: { isHome: boolean }) => void;
}

export const TeamsSection: React.FC<TeamsSectionProps> = ({
  contract,
  teamSelection,
  setTeamSelection,
  homeTeam,
  setHomeTeam,
  homeColor,
  setHomeColor,
  homeLogo,
  setHomeLogo,
  homeRosterLength,
  awayTeam,
  setAwayTeam,
  awayColor,
  setAwayColor,
  awayLogo,
  setAwayLogo,
  awayRosterLength,
  setActiveRosterModal,
}) => {
  return (
    <Section title="TEAMS & ROSTER">
      <Row label="Team Selection" border={false}>
        <Select
          options={contract.teamSelectionOptions}
          value={teamSelection}
          onChange={(e) => setTeamSelection(e.target.value)}
          className="w-48"
        />
      </Row>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {/* Home Team */}
        <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 flex flex-col gap-2">
          <label className="font-mono text-[12px] font-bold text-on-surface-variant tracking-widest uppercase">
            HOME TEAM
          </label>
          {teamSelection === contract.customTeamSelectionMode ? (
            <input
              className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background font-display font-bold uppercase outline-none input-focus"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
            />
          ) : (
            <Select
              options={contract.homeTeamOptions}
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              className="w-full font-display font-bold uppercase"
            />
          )}
          <div className="flex gap-2 items-center mt-2">
            <input
              type="color"
              className="w-8 h-8 rounded p-0 border-0 bg-transparent shrink-0 cursor-pointer"
              value={homeColor}
              onChange={(e) => setHomeColor(e.target.value)}
            />
            <input
              className="flex-1 bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-sm outline-none input-focus"
              placeholder="Logo URL"
              type="text"
              value={homeLogo}
              onChange={(e) => setHomeLogo(e.target.value)}
            />
          </div>
          <button
            onClick={() => setActiveRosterModal({ isHome: true })}
            className="mt-2 w-full bg-surface-container-high border border-outline-variant text-primary py-2 rounded flex items-center justify-between px-3 hover:bg-surface-container-highest transition-colors text-xs font-bold"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" /> Open Roster
            </span>
            <span className="bg-blue-500/20 text-blue-300 font-mono text-[10px] px-2 py-0.5 rounded-full">
              {homeRosterLength} spelers
            </span>
          </button>
        </div>

        {/* Away Team */}
        <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 flex flex-col gap-2">
          <label className="font-mono text-[12px] font-bold text-on-surface-variant tracking-widest uppercase">
            AWAY TEAM
          </label>
          {teamSelection === contract.customTeamSelectionMode ? (
            <input
              className="w-full bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background font-display font-bold uppercase outline-none input-focus"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
            />
          ) : (
            <Select
              options={contract.awayTeamOptions}
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              className="w-full font-display font-bold uppercase"
            />
          )}
          <div className="flex gap-2 items-center mt-2">
            <input
              type="color"
              className="w-8 h-8 rounded p-0 border-0 bg-transparent shrink-0 cursor-pointer"
              value={awayColor}
              onChange={(e) => setAwayColor(e.target.value)}
            />
            <input
              className="flex-1 bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-sm outline-none input-focus"
              placeholder="Logo URL"
              type="text"
              value={awayLogo}
              onChange={(e) => setAwayLogo(e.target.value)}
            />
          </div>
          <button
            onClick={() => setActiveRosterModal({ isHome: false })}
            className="mt-2 w-full bg-surface-container-high border border-outline-variant text-primary py-2 rounded flex items-center justify-between px-3 hover:bg-surface-container-highest transition-colors text-xs font-bold"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-red-400" /> Open Roster
            </span>
            <span className="bg-red-500/20 text-red-300 font-mono text-[10px] px-2 py-0.5 rounded-full">
              {awayRosterLength} spelers
            </span>
          </button>
        </div>
      </div>
    </Section>
  );
};
