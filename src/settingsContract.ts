import { Player } from './types';

export interface SettingsContract {
  defaultHomeTeam: string;
  defaultAwayTeam: string;
  defaultHomeColor: string;
  defaultAwayColor: string;
  defaultHomeLogo: string;
  defaultAwayLogo: string;
  defaultHomeRoster: Player[];
  defaultAwayRoster: Player[];

  defaultInitialScoreHome: number;
  defaultInitialScoreAway: number;
  defaultInitialSogHome: number;
  defaultInitialSogAway: number;
  defaultInitialPeriod: number;

  defaultPeriodLength: number;
  defaultTrackIcing: boolean;
  defaultTrackOffside: boolean;
  defaultTrackSOG: boolean;

  defaultOfficialGame: boolean;
  defaultAttendance: number;
  defaultTicketsSold: number;

  defaultGameClock: boolean;
  defaultClockPauseBehavior: string;
  defaultAutoStopAtPeriodEnd: string;
  defaultPeriodFormat: string;
  defaultShootout: boolean;
  defaultSoRules: string;

  defaultTrackSOGLocation: boolean;
  defaultTrackFOW: boolean;
  defaultFaceoffLocation: boolean;
  defaultGoalscorer: boolean;
  defaultAssists: string;

  defaultTrackPenalties: boolean;
  defaultPenaltyClock: string;
  defaultDurationTypes: string;

  defaultOfficialsMode: string;
  defaultLinesmenMode: string;
  defaultVenueMode: string;
  defaultCustomVenue: string;
  defaultCustomOfficials: string;
  defaultCustomLinesmen: string;

  defaultCapacity: number;
  defaultAvgPrice: number;
  defaultLocalBackup: boolean;

  customOfficialsMode: string;
  customLinesmenMode: string;
  customVenueMode: string;
  customTeamSelectionMode: string;
  fallbackHomeTeamCustom: string;
  fallbackHomeTeamList: string;
  fallbackAwayTeamCustom: string;
  fallbackAwayTeamList: string;
  defaultTime: string;

  teamSelectionOptions: string[];
  homeTeamOptions: string[];
  awayTeamOptions: string[];
  initialPeriodOptions: string[];
  clockBehaviorOptions: string[];
  yesNoOptions: string[];
  periodFormatOptions: string[];
  soRulesOptions: string[];
  assistOptions: string[];
  penaltyClockOptions: string[];
  durationOptions: string[];

  periodBlocks: { id: string; label: string; defaultTime: string }[];
  minorPenaltyTime: string;
  majorPenaltyTime: string;

  actionLogLabels: {
    title: string;
    undoButton: string;
  };
  goalModalLabels: {
    title: string;
    teamSelectLabel: string;
    scorerInputLabel: string;
    scorerInputPlaceholder: string;
    assist1InputLabel: string;
    assist1InputPlaceholder: string;
    assist2InputLabel: string;
    assist2InputPlaceholder: string;
    cancelButton: string;
    submitButton: string;
  };
  penaltyModalLabels: {
    title: string;
    teamSelectLabel: string;
    playerInputLabel: string;
    playerInputPlaceholder: string;
    reasonSelectLabel: string;
    durationSelectLabel: string;
    cancelButton: string;
    submitButton: string;
    minutesSuffix: string;
  };
  penaltyDurationOptions: {
    minutes: number;
    label: string;
  }[];
  penaltyReasonOptions: string[];
  rinkMapLabels: {
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
  };
  gameSummaryLabels: {
    title: string;
    attendanceSuffix: string;
    finalScoreLabel: string;
    periodPrefix: string;
    sogPrefix: string;
    eventsTitle: string;
    eventsSubtitle: string;
    noEventsText: string;
    deleteEventTooltip: string;
    successMessage: string;
    backButton: string;
    exportButton: string;
    reDownloadButton: string;
    closeGameButton: string;
    csvHeaderDate: string;
    csvHeaderHome: string;
    csvHeaderAway: string;
    csvHeaderHomeScore: string;
    csvHeaderAwayScore: string;
    csvHeaderHomeSOG: string;
    csvHeaderAwaySOG: string;
    csvGameDetailsTitle: string;
    csvDateLabel: string;
    csvTimeLabel: string;
    csvLocationLabel: string;
    csvCompetitionLabel: string;
    csvMatchTypeLabel: string;
    csvAttendanceLabel: string;
    csvOfficialsLabel: string;
    csvLinesmenLabel: string;
    csvEventsHeaderTimestamp: string;
    csvEventsHeaderType: string;
    csvEventsHeaderTeam: string;
    csvEventsHeaderDesc: string;
    csvEventsHeaderX: string;
    csvEventsHeaderY: string;
    csvFilenamePrefix: string;
  };
  scoreHeaderLabels: {
    period: string;
    sog: string;
    penaltyBox: string;
    penaltiesDisabled: string;
    noPenalties: string;
    minutes: string;
    playerFallback: string;
  };
}

export const defaultSettingsContract: SettingsContract = {
  defaultHomeTeam: 'Home',
  defaultAwayTeam: 'Away',
  defaultHomeColor: '#000000',
  defaultAwayColor: '#FFFFFF',
  defaultHomeLogo: '',
  defaultAwayLogo: '',
  defaultHomeRoster: [],
  defaultAwayRoster: [],

  defaultInitialScoreHome: 0,
  defaultInitialScoreAway: 0,
  defaultInitialSogHome: 0,
  defaultInitialSogAway: 0,
  defaultInitialPeriod: 1,

  defaultPeriodLength: 20,
  defaultTrackIcing: true,
  defaultTrackOffside: true,
  defaultTrackSOG: true,

  defaultOfficialGame: true,
  defaultAttendance: 0,
  defaultTicketsSold: 0,

  defaultGameClock: true,
  defaultClockPauseBehavior: 'Freeze Clock',
  defaultAutoStopAtPeriodEnd: 'Yes',
  defaultPeriodFormat: 'P1 P2 P3 OT SO',
  defaultShootout: true,
  defaultSoRules: 'NHL',

  defaultTrackSOGLocation: true,
  defaultTrackFOW: true,
  defaultFaceoffLocation: true,
  defaultGoalscorer: true,
  defaultAssists: 'Standard',

  defaultTrackPenalties: true,
  defaultPenaltyClock: 'Continuous',
  defaultDurationTypes: 'Standard',

  defaultOfficialsMode: 'List',
  defaultLinesmenMode: 'List',
  defaultVenueMode: 'Kardinge',
  defaultCustomVenue: '',
  defaultCustomOfficials: '',
  defaultCustomLinesmen: '',

  defaultCapacity: 1100,
  defaultAvgPrice: 15,
  defaultLocalBackup: true,

  customOfficialsMode: 'Custom',
  customLinesmenMode: 'Custom',
  customVenueMode: 'Custom',
  customTeamSelectionMode: 'Custom',
  fallbackHomeTeamCustom: 'Home',
  fallbackHomeTeamList: 'Home Team',
  fallbackAwayTeamCustom: 'Away',
  fallbackAwayTeamList: 'Away Team',
  defaultTime: '20:00',

  teamSelectionOptions: ['Custom', 'Choose from list'],
  homeTeamOptions: ['Home Team', 'Blue', 'Red', 'Green', 'Orange', 'White', 'Black'],
  awayTeamOptions: ['Away Team', 'Blue', 'Red', 'Green', 'Orange', 'White', 'Black'],
  initialPeriodOptions: ['Periode 1', 'Periode 2', 'Periode 3', 'Overtime (OT)', 'Shootout (SO)'],
  clockBehaviorOptions: ['Freeze Clock', 'Running Clock'],
  yesNoOptions: ['Yes', 'No'],
  periodFormatOptions: ['P1 P2 P3 OT SO'],
  soRulesOptions: ['NHL', 'IIHF'],
  assistOptions: ['Standard', 'Custom'],
  penaltyClockOptions: ['Continuous', 'Freeze'],
  durationOptions: ['Standard', 'Custom'],

  periodBlocks: [
    { id: 'p1', label: 'P1', defaultTime: '20:00' },
    { id: 'p2', label: 'P2', defaultTime: '20:00' },
    { id: 'p3', label: 'P3', defaultTime: '20:00' },
    { id: 'ot', label: 'OT', defaultTime: '05:00' },
  ],
  minorPenaltyTime: '2:00',
  majorPenaltyTime: '5:00',

  actionLogLabels: {
    title: 'ACTIELOG',
    undoButton: 'UNDO'
  },
  goalModalLabels: {
    title: 'DOELPUNT',
    teamSelectLabel: 'Team',
    scorerInputLabel: 'Doelpuntenmaker',
    scorerInputPlaceholder: 'bijv. #12 Matthews',
    assist1InputLabel: '1e Assist',
    assist1InputPlaceholder: 'bijv. #16 Marner',
    assist2InputLabel: '2e Assist',
    assist2InputPlaceholder: 'bijv. #88 Nylander',
    cancelButton: 'Annuleren',
    submitButton: 'Opslaan'
  },
  penaltyModalLabels: {
    title: 'STRAF',
    teamSelectLabel: 'Team',
    playerInputLabel: 'Speler',
    playerInputPlaceholder: 'bijv. #24',
    reasonSelectLabel: 'Type Straf',
    durationSelectLabel: 'Tijdsduur (Minuten)',
    cancelButton: 'Annuleren',
    submitButton: 'Opslaan',
    minutesSuffix: 'Min'
  },
  penaltyDurationOptions: [
    { minutes: 2, label: 'Minor' },
    { minutes: 4, label: 'Double Minor' },
    { minutes: 5, label: 'Major' },
    { minutes: 10, label: 'Misconduct' }
  ],
  penaltyReasonOptions: [
    'Tripping',
    'Hooking',
    'Slashing',
    'High Sticking',
    'Roughing',
    'Boarding',
    'Interference',
    'Cross-Checking',
    'Delay of Game',
    'Misconduct',
    'Andere straf'
  ],
  rinkMapLabels: {
    rotate: 'Roteer',
    resumeGame: 'FACEOFF EN SPEL HERVATTEN',
    icing: 'Icing',
    offside: 'Offside',
    goal: 'Goal',
    penalty: 'Straf',
    save: 'Opslaan',
    endGame: 'End Game',
    homeFallback: 'Home',
    awayFallback: 'Away'
  },
  gameSummaryLabels: {
    title: 'WEDSTRIJD RESULTAAT & OVERZICHT',
    attendanceSuffix: 'Toeschouwers',
    finalScoreLabel: 'EINDESTAND',
    periodPrefix: 'Periode ',
    sogPrefix: 'SOG: ',
    eventsTitle: 'GEBEURTENISSEN CORRIGEREN',
    eventsSubtitle: 'Klik op de prullenbak om een event te verwijderen',
    noEventsText: 'Geen gebeurtenissen geregistreerd.',
    deleteEventTooltip: 'Verwijder event',
    successMessage: 'CSV-rapport is gedownload',
    backButton: 'Terug naar Wedstrijd',
    exportButton: 'CSV Exporteren',
    reDownloadButton: 'Her-download CSV',
    closeGameButton: 'Sluit Wedstrijd',
    csvHeaderDate: 'Match Date',
    csvHeaderHome: 'Home Team',
    csvHeaderAway: 'Away Team',
    csvHeaderHomeScore: 'Home Score',
    csvHeaderAwayScore: 'Away Score',
    csvHeaderHomeSOG: 'Home SOG',
    csvHeaderAwaySOG: 'Away SOG',
    csvGameDetailsTitle: 'Game Details',
    csvDateLabel: 'Date',
    csvTimeLabel: 'Time',
    csvLocationLabel: 'Location',
    csvCompetitionLabel: 'Competition',
    csvMatchTypeLabel: 'Match Type',
    csvAttendanceLabel: 'Attendance',
    csvOfficialsLabel: 'Officials',
    csvLinesmenLabel: 'Linesmen',
    csvEventsHeaderTimestamp: 'Timestamp',
    csvEventsHeaderType: 'Event Type',
    csvEventsHeaderTeam: 'Team',
    csvEventsHeaderDesc: 'Description',
    csvEventsHeaderX: 'X Coord',
    csvEventsHeaderY: 'Y Coord',
    csvFilenamePrefix: 'wedstrijd_rapport'
  },
  scoreHeaderLabels: {
    period: 'PERIODE',
    sog: 'SOG:',
    penaltyBox: '',
    penaltiesDisabled: 'Straffen uitgeschakeld',
    noPenalties: 'Geen straffen',
    minutes: 'MIN',
    playerFallback: 'Speler'
  }
};
