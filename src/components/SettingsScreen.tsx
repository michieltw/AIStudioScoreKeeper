import { getGasUrl } from '../utils/gasUrl';
import { fetchGasData } from '../utils/fetchGas';
import { useState, useEffect } from 'react';
import { Play, ArrowLeft } from 'lucide-react';
import { GameConfig, Player } from '../types';
import RosterModal from './RosterModal';
import { Row, Toggle } from './Settings/SettingsUI';
import { TeamsSection } from './Settings/TeamsSection';
import { MatchStartSection } from './Settings/MatchStartSection';
import { GameClockSection } from './Settings/GameClockSection';
import { TrackingStatsSection } from './Settings/TrackingStatsSection';
import { PenaltiesSection } from './Settings/PenaltiesSection';

// 1. HET CONTRACT (Hierin staan alle definities en beginwaarden)
export interface SettingsContract {
  // Standaard beginwaarden
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

  // Logica sleutels
  customOfficialsMode: string;
  customLinesmenMode: string;
  customVenueMode: string;
  customTeamSelectionMode: string;
  fallbackHomeTeamCustom: string;
  fallbackHomeTeamList: string;
  fallbackAwayTeamCustom: string;
  fallbackAwayTeamList: string;
  defaultTime: string;

  // Optielijsten (Dropdowns & Mappen)
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

  // Periodes en Straffen
  periodBlocks: { id: string; label: string; defaultTime: string }[];
  minorPenaltyTime: string;
  majorPenaltyTime: string;
}

interface SettingsScreenProps {
  scheduledGameData?: {
    id?: string;
    homeTeam: string;
    awayTeam: string;
    homeRoster?: Player[];
    awayRoster?: Player[];
    date?: string;
    time?: string;
    location?: string;
    competition?: string;
    matchType?: string;
    officials?: string[];
    linesmen?: string[];
  } | null;
  contract: SettingsContract; // <-- Het component is nu 100% afhankelijk van dit contract
  onStart: () => void;
  onBack: () => void;
}

export default function SettingsScreen({ scheduledGameData, contract, onStart, onBack }: SettingsScreenProps) {

  // GEHEUGEN: Alles komt nu uit `contract` in plaats van hardcoded waarden
  const [homeTeam, setHomeTeam] = useState(scheduledGameData?.homeTeam || contract.defaultHomeTeam);
  const [awayTeam, setAwayTeam] = useState(scheduledGameData?.awayTeam || contract.defaultAwayTeam);

  const [homeColor, setHomeColor] = useState(contract.defaultHomeColor);
  const [awayColor, setAwayColor] = useState(contract.defaultAwayColor);

  const [homeLogo, setHomeLogo] = useState(contract.defaultHomeLogo);
  const [awayLogo, setAwayLogo] = useState(contract.defaultAwayLogo);

  const [homeRoster, setHomeRoster] = useState<Player[]>(scheduledGameData?.homeRoster || contract.defaultHomeRoster);
  const [awayRoster, setAwayRoster] = useState<Player[]>(scheduledGameData?.awayRoster || contract.defaultAwayRoster);

  const [initialScoreHome, setInitialScoreHome] = useState(contract.defaultInitialScoreHome);
  const [initialScoreAway, setInitialScoreAway] = useState(contract.defaultInitialScoreAway);
  const [initialSogHome, setInitialSogHome] = useState(contract.defaultInitialSogHome);
  const [initialSogAway, setInitialSogAway] = useState(contract.defaultInitialSogAway);
  const [initialPeriod, setInitialPeriod] = useState(contract.defaultInitialPeriod);

  const [activeRosterModal, setActiveRosterModal] = useState<{ isHome: boolean } | null>(null);

  // Auto-update rosters when teams change if we have remote team data
  useEffect(() => {
    const teamMap = (window as any)._remoteTeamMap;
    if (teamMap) {
      if (teamMap[homeTeam]) setHomeRoster(teamMap[homeTeam]);
    }
  }, [homeTeam]);

  useEffect(() => {
    const teamMap = (window as any)._remoteTeamMap;
    if (teamMap) {
      if (teamMap[awayTeam]) setAwayRoster(teamMap[awayTeam]);
    }
  }, [awayTeam]);

  const [periodLength, setPeriodLength] = useState(contract.defaultPeriodLength);
  const [p1Input, setP1Input] = useState(`${contract.defaultPeriodLength.toString().padStart(2, '0')}:00`);
  const [trackIcing, setTrackIcing] = useState(contract.defaultTrackIcing);
  const [trackOffside, setTrackOffside] = useState(contract.defaultTrackOffside);
  const [trackSOG, setTrackSOG] = useState(contract.defaultTrackSOG);

  const [officialGame, setOfficialGame] = useState(contract.defaultOfficialGame);
  const [gameType, setGameType] = useState('League');
  const [attendance, setAttendance] = useState(contract.defaultAttendance);
  const [ticketsSold, setTicketsSold] = useState(contract.defaultTicketsSold);

  const [liveGame, setLiveGame] = useState(true);
  const [teamSelection, setTeamSelection] = useState('Custom');
  const [allowFillInPlayers, setAllowFillInPlayers] = useState(false);

  const [gameClock, setGameClock] = useState(contract.defaultGameClock);
  const [clockPauseBehavior, setClockPauseBehavior] = useState(contract.defaultClockPauseBehavior);
  const [autoStopAtPeriodEnd, setAutoStopAtPeriodEnd] = useState(contract.defaultAutoStopAtPeriodEnd);
  const [periodFormat, setPeriodFormat] = useState(contract.defaultPeriodFormat);
  const [shootout, setShootout] = useState(contract.defaultShootout);
  const [soRules, setSoRules] = useState(contract.defaultSoRules);

  const [trackSOGLocation, setTrackSOGLocation] = useState(contract.defaultTrackSOGLocation);
  const [trackFOW, setTrackFOW] = useState(contract.defaultTrackFOW);
  const [faceoffLocation, setFaceoffLocation] = useState(contract.defaultFaceoffLocation);
  const [goalscorer, setGoalscorer] = useState(contract.defaultGoalscorer);
  const [assists, setAssists] = useState(contract.defaultAssists);

  const [trackPenalties, setTrackPenalties] = useState(contract.defaultTrackPenalties);
  const [penaltyClock, setPenaltyClock] = useState(contract.defaultPenaltyClock);
  const [durationTypes, setDurationTypes] = useState(contract.defaultDurationTypes);

  const [officialsMode, setOfficialsMode] = useState(scheduledGameData?.officials ? contract.customOfficialsMode : contract.defaultOfficialsMode);
  const [linesmenMode, setLinesmenMode] = useState(scheduledGameData?.linesmen ? contract.customLinesmenMode : contract.defaultLinesmenMode);
  const [venueMode, setVenueMode] = useState(scheduledGameData?.location ? contract.customVenueMode : contract.defaultVenueMode);
  const [customVenue, setCustomVenue] = useState(scheduledGameData?.location || contract.defaultCustomVenue);
  const [customOfficials, setCustomOfficials] = useState(scheduledGameData?.officials?.join(', ') || contract.defaultCustomOfficials);
  const [customLinesmen, setCustomLinesmen] = useState(scheduledGameData?.linesmen?.join(', ') || contract.defaultCustomLinesmen);

  const [capacity, setCapacity] = useState(contract.defaultCapacity);
  const [avgPrice, setAvgPrice] = useState(contract.defaultAvgPrice);

  const [localBackup, setLocalBackup] = useState(contract.defaultLocalBackup);

  useEffect(() => {
    try {
      const fetchRemoteConfig = async () => {
        const gasUrl = getGasUrl();
        if (gasUrl) {
          try {
            // Fetch teams and settings concurrently
            const teamsPromise = fetchGasData(gasUrl, { action: 'getTeams' }).then(r => r.json()).catch(console.error);
            const settingsPromise = fetchGasData(gasUrl, { action: 'getSettings' }).then(r => r.json()).catch(console.error);

            const [teamsData, data] = await Promise.all([teamsPromise, settingsPromise]);

            if (teamsData && Array.isArray(teamsData) && teamsData.length > 1) {
              const teamMap: Record<string, Player[]> = {};
              for (let i = 1; i < teamsData.length; i++) {
                const row = teamsData[i];
                if (!row || row.length < 5) continue;
                const [tName, pId, pName, pNum, pPos] = [row[0] /* roster_id or team mapping */, row[2] /* person_id */, row[3] /* person_full_name */, row[4] /* jersey_number */, row[5] /* position */];
                if (!tName) continue;
                if (!teamMap[tName]) teamMap[tName] = [];
                teamMap[tName].push({ id: pId || Date.now().toString() + i, number: pNum || '', name: pName || '', position: pPos || '' });
              }

              // If the selected homeTeam is in the map, and we haven't overridden it yet from savedConfig, set it
              setHomeRoster(prev => {
                const ht = scheduledGameData?.homeTeam || contract.defaultHomeTeam;
                return teamMap[ht] || prev;
              });
              setAwayRoster(prev => {
                const at = scheduledGameData?.awayTeam || contract.defaultAwayTeam;
                return teamMap[at] || prev;
              });

              // Keep teamMap around if we want to auto-update when team changes
              (window as any)._remoteTeamMap = teamMap;
            }

            // Data is expected to be [["SettingName", "SettingValue"], ["periodLength", "1200"], ...]
            if (data && Array.isArray(data) && data.length > 1) {
              const remoteDefaults: any = {};
              for (let i = 1; i < data.length; i++) {
                if (data[i] && data[i].length >= 2) {
                  let val = data[i][1];
                  if (val === 'TRUE' || val === 'true') val = true;
                  else if (val === 'FALSE' || val === 'false') val = false;
                  else if (!isNaN(Number(val))) val = Number(val);
                  remoteDefaults[data[i][0]] = val;
                }
              }
              // Apply remote defaults
              if (remoteDefaults.periodLength !== undefined) {
                 const mins = Math.round(remoteDefaults.periodLength / 60);
                 setPeriodLength(mins);
                 setP1Input(`${mins.toString().padStart(2, '0')}:00`);
              }
              if (remoteDefaults.trackIcing !== undefined) setTrackIcing(remoteDefaults.trackIcing);
              if (remoteDefaults.trackOffside !== undefined) setTrackOffside(remoteDefaults.trackOffside);
              if (remoteDefaults.trackSOG !== undefined) setTrackSOG(remoteDefaults.trackSOG);
              if (remoteDefaults.officialGame !== undefined) setOfficialGame(remoteDefaults.officialGame);
              if (remoteDefaults.gameType) setGameType(remoteDefaults.gameType);
              if (remoteDefaults.attendance !== undefined) setAttendance(remoteDefaults.attendance);
              if (remoteDefaults.ticketsSold !== undefined) setTicketsSold(remoteDefaults.ticketsSold);
              if (remoteDefaults.liveGame !== undefined) setLiveGame(remoteDefaults.liveGame);
              if (remoteDefaults.teamSelection) setTeamSelection(remoteDefaults.teamSelection);
              if (remoteDefaults.allowFillInPlayers !== undefined) setAllowFillInPlayers(remoteDefaults.allowFillInPlayers);
              if (remoteDefaults.gameClock !== undefined) setGameClock(remoteDefaults.gameClock);
              if (remoteDefaults.clockPauseBehavior) setClockPauseBehavior(remoteDefaults.clockPauseBehavior);
              if (remoteDefaults.autoStopAtPeriodEnd) setAutoStopAtPeriodEnd(remoteDefaults.autoStopAtPeriodEnd);
              if (remoteDefaults.periodFormat) setPeriodFormat(remoteDefaults.periodFormat);
              if (remoteDefaults.shootout !== undefined) setShootout(remoteDefaults.shootout);
              if (remoteDefaults.soRules) setSoRules(remoteDefaults.soRules);
              if (remoteDefaults.trackSOGLocation !== undefined) setTrackSOGLocation(remoteDefaults.trackSOGLocation);
              if (remoteDefaults.trackFOW !== undefined) setTrackFOW(remoteDefaults.trackFOW);
              if (remoteDefaults.faceoffLocation !== undefined) setFaceoffLocation(remoteDefaults.faceoffLocation);
              if (remoteDefaults.goalscorer !== undefined) setGoalscorer(remoteDefaults.goalscorer);
              if (remoteDefaults.assists) setAssists(remoteDefaults.assists);
              if (remoteDefaults.trackPenalties !== undefined) setTrackPenalties(remoteDefaults.trackPenalties);
              if (remoteDefaults.penaltyClock) setPenaltyClock(remoteDefaults.penaltyClock);
              if (remoteDefaults.durationTypes) setDurationTypes(remoteDefaults.durationTypes);
              if (remoteDefaults.officialsMode) setOfficialsMode(remoteDefaults.officialsMode);
              if (remoteDefaults.linesmenMode) setLinesmenMode(remoteDefaults.linesmenMode);
              if (remoteDefaults.venueMode) setVenueMode(remoteDefaults.venueMode);
              if (remoteDefaults.capacity !== undefined) setCapacity(remoteDefaults.capacity);
              if (remoteDefaults.avgPrice !== undefined) setAvgPrice(remoteDefaults.avgPrice);
            }
          } catch(e) {}
        }
      };
      fetchRemoteConfig();

      const savedConfig = localStorage.getItem('blackout_hockey_current_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig) as GameConfig;
        if (parsed.homeTeam !== undefined) setHomeTeam(parsed.homeTeam);
        if (parsed.awayTeam !== undefined) setAwayTeam(parsed.awayTeam);
        if (parsed.homeColor !== undefined) setHomeColor(parsed.homeColor);
        if (parsed.awayColor !== undefined) setAwayColor(parsed.awayColor);
        if (parsed.homeLogo !== undefined) setHomeLogo(parsed.homeLogo);
        if (parsed.awayLogo !== undefined) setAwayLogo(parsed.awayLogo);
        if (parsed.homeRoster !== undefined) setHomeRoster(parsed.homeRoster);
        if (parsed.awayRoster !== undefined) setAwayRoster(parsed.awayRoster);
        if (parsed.initialScoreHome !== undefined) setInitialScoreHome(parsed.initialScoreHome);
        if (parsed.initialScoreAway !== undefined) setInitialScoreAway(parsed.initialScoreAway);
        if (parsed.initialSogHome !== undefined) setInitialSogHome(parsed.initialSogHome);
        if (parsed.initialSogAway !== undefined) setInitialSogAway(parsed.initialSogAway);
        if (parsed.initialPeriod !== undefined) setInitialPeriod(parsed.initialPeriod);

        const defaults = parsed.settings;
        if (defaults) {
          if (defaults.periodLength !== undefined) {
             const mins = Math.round(defaults.periodLength / 60);
             setPeriodLength(mins);
             setP1Input(`${mins.toString().padStart(2, '0')}:00`);
          }
          if (defaults.trackIcing !== undefined) setTrackIcing(defaults.trackIcing);
          if (defaults.trackOffside !== undefined) setTrackOffside(defaults.trackOffside);
          if (defaults.trackSOG !== undefined) setTrackSOG(defaults.trackSOG);
          if (defaults.officialGame !== undefined) setOfficialGame(defaults.officialGame);
          if (defaults.gameType) setGameType(defaults.gameType);
          if (defaults.attendance !== undefined) setAttendance(defaults.attendance);
          if (defaults.ticketsSold !== undefined) setTicketsSold(defaults.ticketsSold);

          if (defaults.liveGame !== undefined) setLiveGame(defaults.liveGame);
          if (defaults.teamSelection) setTeamSelection(defaults.teamSelection);
          if (defaults.allowFillInPlayers !== undefined) setAllowFillInPlayers(defaults.allowFillInPlayers);

          if (defaults.gameClock !== undefined) setGameClock(defaults.gameClock);
          if (defaults.clockPauseBehavior) setClockPauseBehavior(defaults.clockPauseBehavior);
          if (defaults.autoStopAtPeriodEnd) setAutoStopAtPeriodEnd(defaults.autoStopAtPeriodEnd);
          if (defaults.periodFormat) setPeriodFormat(defaults.periodFormat);
          if (defaults.shootout !== undefined) setShootout(defaults.shootout);
          if (defaults.soRules) setSoRules(defaults.soRules);

          if (defaults.trackSOGLocation !== undefined) setTrackSOGLocation(defaults.trackSOGLocation);
          if (defaults.trackFOW !== undefined) setTrackFOW(defaults.trackFOW);
          if (defaults.faceoffLocation !== undefined) setFaceoffLocation(defaults.faceoffLocation);
          if (defaults.goalscorer !== undefined) setGoalscorer(defaults.goalscorer);
          if (defaults.assists) setAssists(defaults.assists);

          if (defaults.trackPenalties !== undefined) setTrackPenalties(defaults.trackPenalties);
          if (defaults.penaltyClock) setPenaltyClock(defaults.penaltyClock);
          if (defaults.durationTypes) setDurationTypes(defaults.durationTypes);

          if (defaults.officialsMode) setOfficialsMode(defaults.officialsMode);
          if (defaults.linesmenMode) setLinesmenMode(defaults.linesmenMode);
          if (defaults.venueMode) setVenueMode(defaults.venueMode);
          if (defaults.capacity !== undefined) setCapacity(defaults.capacity);
          if (defaults.avgPrice !== undefined) setAvgPrice(defaults.avgPrice);
        }
      } else {
        const defaultsStr = localStorage.getItem('blackout_hockey_defaults');
        if (defaultsStr) {
          const defaults = JSON.parse(defaultsStr);
          if (defaults.periodLength !== undefined) {
             setPeriodLength(defaults.periodLength);
             setP1Input(`${defaults.periodLength.toString().padStart(2, '0')}:00`);
          }
          if (defaults.trackIcing !== undefined) setTrackIcing(defaults.trackIcing);
          if (defaults.trackOffside !== undefined) setTrackOffside(defaults.trackOffside);
          if (defaults.trackSOG !== undefined) setTrackSOG(defaults.trackSOG);
          if (defaults.officialGame !== undefined) setOfficialGame(defaults.officialGame);
          if (defaults.gameType) setGameType(defaults.gameType);
          if (defaults.attendance !== undefined) setAttendance(defaults.attendance);
          if (defaults.ticketsSold !== undefined) setTicketsSold(defaults.ticketsSold);

          if (defaults.liveGame !== undefined) setLiveGame(defaults.liveGame);
          if (defaults.teamSelection) setTeamSelection(defaults.teamSelection);
          if (defaults.allowFillInPlayers !== undefined) setAllowFillInPlayers(defaults.allowFillInPlayers);

          if (defaults.gameClock !== undefined) setGameClock(defaults.gameClock);
          if (defaults.clockPauseBehavior) setClockPauseBehavior(defaults.clockPauseBehavior);
          if (defaults.autoStopAtPeriodEnd) setAutoStopAtPeriodEnd(defaults.autoStopAtPeriodEnd);
          if (defaults.periodFormat) setPeriodFormat(defaults.periodFormat);
          if (defaults.shootout !== undefined) setShootout(defaults.shootout);
          if (defaults.soRules) setSoRules(defaults.soRules);

          if (defaults.trackSOGLocation !== undefined) setTrackSOGLocation(defaults.trackSOGLocation);
          if (defaults.trackFOW !== undefined) setTrackFOW(defaults.trackFOW);
          if (defaults.faceoffLocation !== undefined) setFaceoffLocation(defaults.faceoffLocation);
          if (defaults.goalscorer !== undefined) setGoalscorer(defaults.goalscorer);
          if (defaults.assists) setAssists(defaults.assists);

          if (defaults.trackPenalties !== undefined) setTrackPenalties(defaults.trackPenalties);
          if (defaults.penaltyClock) setPenaltyClock(defaults.penaltyClock);
          if (defaults.durationTypes) setDurationTypes(defaults.durationTypes);

          if (defaults.officialsMode) setOfficialsMode(defaults.officialsMode);
          if (defaults.linesmenMode) setLinesmenMode(defaults.linesmenMode);
          if (defaults.venueMode) setVenueMode(defaults.venueMode);
          if (defaults.capacity !== undefined) setCapacity(defaults.capacity);
          if (defaults.avgPrice !== undefined) setAvgPrice(defaults.avgPrice);
        }
      }
    } catch(e) {}
  }, []);

  const handleStart = () => {
    // Dynamische fallback logic op basis van contract
    const finalHome = homeTeam.trim() || (teamSelection === contract.customTeamSelectionMode ? contract.fallbackHomeTeamCustom : contract.fallbackHomeTeamList);
    const finalAway = awayTeam.trim() || (teamSelection === contract.customTeamSelectionMode ? contract.fallbackAwayTeamCustom : contract.fallbackAwayTeamList);

    const config: GameConfig = {
      eventId: scheduledGameData?.id,
      homeTeam: finalHome,
      awayTeam: finalAway,
      homeColor,
      awayColor,
      homeLogo,
      awayLogo,
      homeRoster,
      awayRoster,
      date: scheduledGameData?.date || new Date().toISOString().split('T')[0],
      time: scheduledGameData?.time || contract.defaultTime,
      location: venueMode === contract.customVenueMode ? customVenue : venueMode,
      competition: scheduledGameData?.competition || contract.defaultCustomVenue, // Lege fallback vanuit contract
      matchType: scheduledGameData?.matchType || contract.defaultCustomVenue,
      officials: officialsMode === contract.customOfficialsMode ? customOfficials.split(',').map(s => s.trim()) : [],
      linesmen: linesmenMode === contract.customLinesmenMode ? customLinesmen.split(',').map(s => s.trim()) : [],
      initialScoreHome,
      initialScoreAway,
      initialSogHome,
      initialSogAway,
      initialPeriod,
      settings: {
        periodLength: periodLength * 60,
        trackIcing,
        trackOffside,
        trackSOG,
        officialGame,
        gameType,
        attendance,
        ticketsSold,
        liveGame,
        teamSelection,
        allowFillInPlayers,
        gameClock,
        clockPauseBehavior,
        autoStopAtPeriodEnd,
        periodFormat,
        shootout,
        soRules,
        trackSOGLocation,
        trackFOW,
        faceoffLocation,
        goalscorer,
        assists,
        trackPenalties,
        penaltyClock,
        durationTypes,
        officialsMode,
        linesmenMode,
        venueMode,
        capacity,
        avgPrice,
        haptics: true,
        stayAwake: true,
        autosave: true,
        localStorageEnabled: true,
        autogenerateCSV: false
      }
    };
    localStorage.setItem('blackout_hockey_current_config', JSON.stringify(config));
    localStorage.removeItem('blackout_hockey_saved_game');
    onStart();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-surface-container-low border-b border-outline-variant w-full top-0 flex items-center justify-between px-4 h-16 z-50 sticky">
        <button
          onClick={onBack}
          className="text-primary hover:bg-surface-container-high transition-colors active:scale-95 duration-100 p-2 rounded flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-display text-[24px] font-bold text-primary tracking-tight">PRE-GAME SETTINGS</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-12 py-6 flex flex-col gap-10">

        <TeamsSection
          contract={contract}
          teamSelection={teamSelection}
          setTeamSelection={setTeamSelection}
          homeTeam={homeTeam}
          setHomeTeam={setHomeTeam}
          homeColor={homeColor}
          setHomeColor={setHomeColor}
          homeLogo={homeLogo}
          setHomeLogo={setHomeLogo}
          homeRosterLength={homeRoster.length}
          awayTeam={awayTeam}
          setAwayTeam={setAwayTeam}
          awayColor={awayColor}
          setAwayColor={setAwayColor}
          awayLogo={awayLogo}
          setAwayLogo={setAwayLogo}
          awayRosterLength={awayRoster.length}
          setActiveRosterModal={setActiveRosterModal}
        />

        <MatchStartSection
          contract={contract}
          initialScoreHome={initialScoreHome}
          setInitialScoreHome={setInitialScoreHome}
          initialScoreAway={initialScoreAway}
          setInitialScoreAway={setInitialScoreAway}
          initialSogHome={initialSogHome}
          setInitialSogHome={setInitialSogHome}
          initialSogAway={initialSogAway}
          setInitialSogAway={setInitialSogAway}
          initialPeriod={initialPeriod}
          setInitialPeriod={setInitialPeriod}
        />

        <GameClockSection
          contract={contract}
          gameClock={gameClock}
          setGameClock={setGameClock}
          clockPauseBehavior={clockPauseBehavior}
          setClockPauseBehavior={setClockPauseBehavior}
          autoStopAtPeriodEnd={autoStopAtPeriodEnd}
          setAutoStopAtPeriodEnd={setAutoStopAtPeriodEnd}
          p1Input={p1Input}
          setP1Input={setP1Input}
          setPeriodLength={setPeriodLength}
        />

        <TrackingStatsSection
          trackIcing={trackIcing}
          setTrackIcing={setTrackIcing}
          trackOffside={trackOffside}
          setTrackOffside={setTrackOffside}
          trackSOG={trackSOG}
          setTrackSOG={setTrackSOG}
          trackSOGLocation={trackSOGLocation}
          setTrackSOGLocation={setTrackSOGLocation}
          trackFOW={trackFOW}
          setTrackFOW={setTrackFOW}
          faceoffLocation={faceoffLocation}
          setFaceoffLocation={setFaceoffLocation}
        />

        <PenaltiesSection
          contract={contract}
          trackPenalties={trackPenalties}
          setTrackPenalties={setTrackPenalties}
          gameClock={gameClock}
          penaltyClock={penaltyClock}
          setPenaltyClock={setPenaltyClock}
        />

            {/* System */}
            <section className="flex flex-col gap-4">
              <h2 className="font-mono text-[12px] font-bold text-tertiary tracking-widest uppercase">SYSTEM</h2>
              <div className="bg-surface-container-low metallic-border rounded-lg p-4 inner-glow flex flex-col gap-2">
                <Row label="Local Backup" border={false}><Toggle checked={localBackup} onChange={() => setLocalBackup(!localBackup)} /></Row>
              </div>
            </section>

        {/* Start Game Action */}
        <div className="pt-2 pb-8">
          <button
            className="w-full bg-tertiary text-black font-display text-[24px] font-bold py-4 rounded-lg raised-element bg-button-gradient hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(233,196,0,0.3)]"
            onClick={handleStart}
          >
            <Play fill="currentColor" className="w-6 h-6" />
            START GAME
          </button>
        </div>

        {/* Roster Modal */}
        {activeRosterModal && (
          <RosterModal
            isOpen={true}
            teamName={activeRosterModal.isHome ? homeTeam : awayTeam}
            isHome={activeRosterModal.isHome}
            initialRoster={activeRosterModal.isHome ? homeRoster : awayRoster}
            onClose={() => setActiveRosterModal(null)}
            onSave={(updatedRoster) => {
              if (activeRosterModal.isHome) {
                setHomeRoster(updatedRoster);
              } else {
                setAwayRoster(updatedRoster);
              }
            }}
          />
        )}

      </main>
    </div>
  );
}