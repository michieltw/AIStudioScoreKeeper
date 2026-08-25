import { describe, it, expect } from 'vitest';
import { defaultSettingsContract } from './settingsContract';

describe('defaultSettingsContract', () => {
  it('should have correct default team values', () => {
    expect(defaultSettingsContract.defaultHomeTeam).toBe('Home');
    expect(defaultSettingsContract.defaultAwayTeam).toBe('Away');
  });

  it('should have correct default score, SOG, and period values', () => {
    expect(defaultSettingsContract.defaultInitialScoreHome).toBe(0);
    expect(defaultSettingsContract.defaultInitialScoreAway).toBe(0);
    expect(defaultSettingsContract.defaultInitialSogHome).toBe(0);
    expect(defaultSettingsContract.defaultInitialSogAway).toBe(0);
    expect(defaultSettingsContract.defaultInitialPeriod).toBe(1);
    expect(defaultSettingsContract.defaultPeriodLength).toBe(20);
  });

  it('should have correct period block configurations', () => {
    expect(defaultSettingsContract.periodBlocks).toHaveLength(4);
    expect(defaultSettingsContract.periodBlocks[0]).toEqual({ id: 'p1', label: 'P1', defaultTime: '20:00' });
    expect(defaultSettingsContract.periodBlocks[1]).toEqual({ id: 'p2', label: 'P2', defaultTime: '20:00' });
    expect(defaultSettingsContract.periodBlocks[2]).toEqual({ id: 'p3', label: 'P3', defaultTime: '20:00' });
    expect(defaultSettingsContract.periodBlocks[3]).toEqual({ id: 'ot', label: 'OT', defaultTime: '05:00' });
  });

  it('should have correct penalty duration options', () => {
    expect(defaultSettingsContract.penaltyDurationOptions).toHaveLength(4);
    expect(defaultSettingsContract.penaltyDurationOptions).toContainEqual({ minutes: 2, label: 'Minor' });
    expect(defaultSettingsContract.penaltyDurationOptions).toContainEqual({ minutes: 4, label: 'Double Minor' });
    expect(defaultSettingsContract.penaltyDurationOptions).toContainEqual({ minutes: 5, label: 'Major' });
    expect(defaultSettingsContract.penaltyDurationOptions).toContainEqual({ minutes: 10, label: 'Misconduct' });
  });

  it('should have correct UI string labels', () => {
    expect(defaultSettingsContract.actionLogLabels.title).toBe('ACTIELOG');
    expect(defaultSettingsContract.scoreHeaderLabels.period).toBe('PERIODE');
    expect(defaultSettingsContract.gameSummaryLabels.title).toBe('WEDSTRIJD RESULTAAT & OVERZICHT');
    expect(defaultSettingsContract.rinkMapLabels.resumeGame).toBe('FACEOFF EN SPEL HERVATTEN');
  });

  it('should have correct default boolean values', () => {
    expect(defaultSettingsContract.defaultTrackIcing).toBe(true);
    expect(defaultSettingsContract.defaultOfficialGame).toBe(true);
  });
});
