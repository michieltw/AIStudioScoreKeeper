import { useState, useEffect, useRef } from 'react';
import { GameState, GameEvent, GameConfig, ActivePenalty } from '../types';
import { SettingsContract } from '../settingsContract';

export function useScorekeeperState({ contract, onBack }: { contract: SettingsContract; onBack: () => void }) {

  // VOLLEDIG SCHONE START: Geen aannames, geen hardcoded text, geen verzonnen getallen.
  const [config, setConfig] = useState<GameConfig>({
    homeTeam: contract.defaultHomeTeam,
    awayTeam: contract.defaultAwayTeam,
    homeColor: contract.defaultHomeColor,
    awayColor: contract.defaultAwayColor,
    homeLogo: contract.defaultHomeLogo,
    awayLogo: contract.defaultAwayLogo,
    homeRoster: contract.defaultHomeRoster,
    awayRoster: contract.defaultAwayRoster,
    settings: {
      periodLength: contract.defaultPeriodLength * 60,
      trackIcing: contract.defaultTrackIcing,
      trackOffside: contract.defaultTrackOffside,
      trackSOG: contract.defaultTrackSOG,
      officialGame: contract.defaultOfficialGame,
      gameType: 'League',
      attendance: contract.defaultAttendance,
      ticketsSold: contract.defaultTicketsSold,
      liveGame: true,
      teamSelection: 'Custom',
      allowFillInPlayers: false,
      gameClock: contract.defaultGameClock,
      clockPauseBehavior: contract.defaultClockPauseBehavior,
      autoStopAtPeriodEnd: contract.defaultAutoStopAtPeriodEnd,
      periodFormat: contract.defaultPeriodFormat,
      shootout: contract.defaultShootout,
      soRules: contract.defaultSoRules,
      trackSOGLocation: contract.defaultTrackSOGLocation,
      trackFOW: contract.defaultTrackFOW,
      faceoffLocation: contract.defaultFaceoffLocation,
      goalscorer: contract.defaultGoalscorer,
      assists: contract.defaultAssists,
      trackPenalties: contract.defaultTrackPenalties,
      penaltyClock: contract.defaultPenaltyClock,
      durationTypes: contract.defaultDurationTypes,
      officialsMode: contract.defaultOfficialsMode,
      linesmenMode: contract.defaultLinesmenMode,
      venueMode: contract.defaultVenueMode,
      capacity: contract.defaultCapacity,
      avgPrice: contract.defaultAvgPrice,
      haptics: false,
      stayAwake: false,
      autosave: false,
      localStorageEnabled: false,
      autogenerateCSV: false
    }
  });

  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    period: contract.defaultInitialPeriod,
    timeRemaining: contract.defaultPeriodLength * 60,
    stoppageTime: 0,
    sogHome: contract.defaultInitialSogHome,
    sogAway: contract.defaultInitialSogAway,
    scoreHome: contract.defaultInitialScoreHome,
    scoreAway: contract.defaultInitialScoreAway,
    events: []
  });

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('blackout_hockey_current_config');
      let loadedConfig: GameConfig | null = null;

      if (savedConfig) {
        const parsed = JSON.parse(savedConfig) as GameConfig;

        // Geen hardcoded 'Home' of 'Away' fallbacks meer
        if (!parsed.homeTeam || !parsed.homeTeam.trim()) {
          parsed.homeTeam = contract.defaultHomeTeam;
        }
        if (!parsed.awayTeam || !parsed.awayTeam.trim()) {
          parsed.awayTeam = contract.defaultAwayTeam;
        }
        setConfig(parsed);
        loadedConfig = parsed;
      }

      const savedGame = localStorage.getItem('blackout_hockey_saved_game');
      if (savedGame) {
        setGameState(JSON.parse(savedGame));
      } else if (loadedConfig) {
        setGameState(prev => ({
          ...prev,
          // Geen hardcoded (20 * 60) meer, pakt domweg wat er in config zit of start op 0
          timeRemaining: loadedConfig?.settings?.periodLength !== undefined ? loadedConfig.settings.periodLength : contract.defaultPeriodLength * 60,
          scoreHome: loadedConfig?.initialScoreHome !== undefined ? loadedConfig.initialScoreHome : contract.defaultInitialScoreHome,
          scoreAway: loadedConfig?.initialScoreAway !== undefined ? loadedConfig.initialScoreAway : contract.defaultInitialScoreAway,
          sogHome: loadedConfig?.initialSogHome !== undefined ? loadedConfig.initialSogHome : contract.defaultInitialSogHome,
          sogAway: loadedConfig?.initialSogAway !== undefined ? loadedConfig.initialSogAway : contract.defaultInitialSogAway,
          period: loadedConfig?.initialPeriod !== undefined ? loadedConfig.initialPeriod : contract.defaultInitialPeriod,
        }));
      }
    } catch(e) {}
  }, [contract]);

  const [isFaceoffMode, setIsFaceoffMode] = useState(false);
  const [filter, setFilter] = useState<'all' | 'shot' | 'goal' | 'penalty'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPeriodEndModal, setShowPeriodEndModal] = useState(false);
  const prevTimeRef = useRef(gameState.timeRemaining);
  const [rinkRotation, setRinkRotation] = useState(0);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [isGameSummaryOpen, setIsGameSummaryOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 2500);
  };

  useEffect(() => {
    let interval: any;
    const isContinuousPenalty = config.settings?.penaltyClock === 'Continuous';

    if (gameState.isRunning) {
      interval = setInterval(() => {
        setGameState(prev => {
          const newTime = Math.max(0, prev.timeRemaining - 1);
          const updatedPenalties = (prev.activePenalties || [])
            .map(p => ({ ...p, secondsRemaining: p.secondsRemaining - 1 }))
            .filter(p => p.secondsRemaining > 0);

          let newIsRunning = prev.isRunning;
          if (newTime === 0 && config.settings?.autoStopAtPeriodEnd === 'Yes') {
             newIsRunning = false;
          }
          if (newTime === 0 && prev.timeRemaining > 0) {
             setTimeout(() => {
                setShowPeriodEndModal(true);
             }, 2000);
          }

          return {
            ...prev,
            isRunning: newIsRunning,
            timeRemaining: newTime,
            activePenalties: updatedPenalties
          };
        });
      }, 1000);
    } else {
      interval = setInterval(() => {
        setGameState(prev => {
          let updatedPenalties = prev.activePenalties || [];
          if (isContinuousPenalty && updatedPenalties.length > 0) {
            updatedPenalties = updatedPenalties
              .map(p => ({ ...p, secondsRemaining: p.secondsRemaining - 1 }))
              .filter(p => p.secondsRemaining > 0);
          }

          return {
            ...prev,
            stoppageTime: prev.stoppageTime + 1,
            activePenalties: updatedPenalties
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.isRunning, config.settings?.penaltyClock, config.settings?.autoStopAtPeriodEnd]);

  const handleTogglePlayPause = () => {
    if (gameState.isRunning) {
      setGameState(prev => ({ ...prev, isRunning: false }));
    } else {
      if (config.settings.trackFOW) {
        setIsFaceoffMode(true);
      } else {
        setGameState(prev => ({ ...prev, isRunning: true, stoppageTime: 0 }));
      }
    }
  };

  const handleStoppageCancel = () => {
    const isContinuousPenalty = config.settings?.penaltyClock === 'Continuous';
    setGameState(prev => {
      let updatedPenalties = prev.activePenalties || [];
      if (!isContinuousPenalty && updatedPenalties.length > 0) {
        updatedPenalties = updatedPenalties
          .map(p => ({ ...p, secondsRemaining: p.secondsRemaining - prev.stoppageTime }))
          .filter(p => p.secondsRemaining > 0);
      }
      return {
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - prev.stoppageTime),
        activePenalties: updatedPenalties,
        isRunning: true,
        stoppageTime: 0
      };
    });
    setIsFaceoffMode(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timeString = `${formatTime(gameState.timeRemaining)} P${gameState.period}`;

  const getPeriodString = () => {
    return gameState.period === 4 ? 'OT' : gameState.period >= 5 ? 'SO' : `P${gameState.period}`;
  };

  const getClockString = () => formatTime(gameState.timeRemaining);

  const getSituationString = (eventTeam: string) => {
    const homePenalties = (gameState.activePenalties || []).filter(p => p.team === config.homeTeam).length;
    const awayPenalties = (gameState.activePenalties || []).filter(p => p.team === config.awayTeam).length;
    const homeSkaters = Math.max(3, 5 - homePenalties);
    const awaySkaters = Math.max(3, 5 - awayPenalties);

    if (homeSkaters === awaySkaters) return 'EV';

    if (eventTeam === config.homeTeam) {
      return homeSkaters > awaySkaters ? 'PP' : 'SH';
    } else {
      return awaySkaters > homeSkaters ? 'PP' : 'SH';
    }
  };

  const handleAddShot = (team: 'home' | 'away', x: number, y: number) => {
    if (!config.settings.trackSOG) {
      showToast('Shots on goal tracking is disabled in defaults');
      return;
    }
    const realTeam = team === 'home' ? config.homeTeam : config.awayTeam;
    const newEvent: GameEvent = {
      id: Date.now().toString(),
      eventId: config.eventId,
      type: 'shot',
      team: realTeam,
      time: timeString,
      text: `SOG ${realTeam}`,
      x, y,
      period: getPeriodString(),
      clockTime: getClockString(),
      situation: getSituationString(realTeam)
    };
    setGameState(prev => ({
      ...prev,
      events: [newEvent, ...prev.events],
      sogHome: team === 'home' ? prev.sogHome + 1 : prev.sogHome,
      sogAway: team === 'away' ? prev.sogAway + 1 : prev.sogAway,
    }));
  };

  const handleFaceoff = (team: 'home' | 'away', x?: number, y?: number) => {
    const realTeam = team === 'home' ? config.homeTeam : config.awayTeam;
    const newEvent: GameEvent = {
      id: Date.now().toString(),
      eventId: config.eventId,
      type: 'faceoff',
      team: realTeam,
      time: timeString,
      text: `FOW: ${realTeam}`,
      period: getPeriodString(),
      clockTime: getClockString(),
      situation: getSituationString(realTeam),
      x,
      y
    };

    if (config.settings.trackFOW) {
      setGameState(prev => ({
        ...prev,
        events: [newEvent, ...prev.events],
        isRunning: true,
        stoppageTime: 0
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        isRunning: true,
        stoppageTime: 0
      }));
    }
    setIsFaceoffMode(false);
  };

  const handleIcing = () => {
    if (!config.settings.trackIcing) {
      showToast('Icing tracking is disabled in defaults');
      return;
    }
    const newEvent: GameEvent = {
      id: Date.now().toString(),
      eventId: config.eventId,
      type: 'icing',
      team: config.homeTeam,
      time: timeString,
      text: 'ICING',
      period: getPeriodString(),
      clockTime: getClockString(),
      situation: 'EV' // standard
    };
    setGameState(prev => ({ ...prev, events: [newEvent, ...prev.events] }));
    showToast('Icing geregistreerd');
  };

  const handleOffside = () => {
    if (!config.settings.trackOffside) {
      showToast('Offside tracking is disabled in defaults');
      return;
    }
    const newEvent: GameEvent = {
      id: Date.now().toString(),
      eventId: config.eventId,
      type: 'offside',
      team: config.homeTeam,
      time: timeString,
      text: 'OFFSIDE',
      period: getPeriodString(),
      clockTime: getClockString(),
      situation: 'EV'
    };
    setGameState(prev => ({ ...prev, events: [newEvent, ...prev.events] }));
    showToast('Offside geregistreerd');
  };

  const handleGoalSubmit = (data: { team: 'home' | 'away'; scorer: string; assist1: string; assist2: string }) => {
    const realTeam = data.team === 'home' ? config.homeTeam : config.awayTeam;
    let text = `DOELPUNT ${realTeam} ${data.scorer}`;
    const assists = [data.assist1, data.assist2].filter(Boolean);
    if (assists.length > 0) {
      text += ` (Assists: ${assists.join(', ')})`;
    }

    const newEvent: GameEvent = {
      id: Date.now().toString(),
      eventId: config.eventId,
      type: 'goal',
      team: realTeam,
      time: timeString,
      text,
      scorer: data.scorer,
      assist1: data.assist1,
      assist2: data.assist2,
      period: getPeriodString(),
      clockTime: getClockString(),
      situation: getSituationString(realTeam),
      player: data.scorer
    };

    setGameState(prev => ({
      ...prev,
      events: [newEvent, ...prev.events],
      scoreHome: data.team === 'home' ? prev.scoreHome + 1 : prev.scoreHome,
      scoreAway: data.team === 'away' ? prev.scoreAway + 1 : prev.scoreAway,
    }));
    showToast(`Doelpunt ${realTeam} geregistreerd!`);

    if (config.settings?.haptics && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const handlePenaltySubmit = (data: { team: 'home' | 'away'; player: string; reason: string; minutes: number }) => {
    if (config.settings?.trackPenalties === false) {
      showToast('Straffen bijhouden is uitgeschakeld in instellingen');
      return;
    }

    const realTeam = data.team === 'home' ? config.homeTeam : config.awayTeam;
    const playerText = data.player || 'Speler';
    const text = `PEN ${realTeam} ${playerText} (${data.minutes} MIN - ${data.reason})`;
    const eventId = Date.now().toString();

    const newEvent: GameEvent = {
      id: eventId,
      eventId: config.eventId,
      type: 'penalty',
      team: realTeam,
      time: timeString,
      text,
      penaltyReason: data.reason,
      penaltyMinutes: data.minutes,
      period: getPeriodString(),
      clockTime: getClockString(),
      situation: getSituationString(realTeam),
      player: playerText
    };

    const newActivePenalty: ActivePenalty = {
      id: eventId,
      eventId,
      team: realTeam,
      player: playerText,
      reason: data.reason,
      minutes: data.minutes,
      secondsRemaining: (data.minutes || 0) * 60
    };

    setGameState(prev => ({
      ...prev,
      events: [newEvent, ...prev.events],
      activePenalties: [...(prev.activePenalties || []), newActivePenalty]
    }));
    showToast(`Straf ${realTeam} geregistreerd!`);

    if (config.settings?.haptics && "vibrate" in navigator) {
      navigator.vibrate([300]);
    }
  };

  const handleFinishGame = () => {
    try {
      const savedPlayed = localStorage.getItem('blackout_played_games');
      const playedGames = savedPlayed ? JSON.parse(savedPlayed) : [];
      playedGames.push({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        homeTeam: config.homeTeam,
        awayTeam: config.awayTeam,
        scoreHome: gameState.scoreHome,
        scoreAway: gameState.scoreAway,
        events: gameState.events
      });
      localStorage.setItem('blackout_played_games', JSON.stringify(playedGames));
      // Remove from saved game since it's finished
      localStorage.removeItem('blackout_hockey_saved_game');
    } catch (e) {
      console.error(e);
    }
    onBack();
  };

  const handleSaveGame = () => {
    try {
      localStorage.setItem('blackout_hockey_saved_game', JSON.stringify(gameState));
      showToast('Wedstrijd opgeslagen in local storage!');
    } catch (e) {
      showToast('Opslaan mislukt');
    }
  };

  const handleUndo = (id: string) => {
    setGameState(prev => {
      const eventToUndo = prev.events.find(e => e.id === id);
      if (!eventToUndo) return prev;

      const isCurrentlyUndone = !!eventToUndo.isUndone;

      let newSogHome = prev.sogHome;
      let newSogAway = prev.sogAway;
      let newScoreHome = prev.scoreHome;
      let newScoreAway = prev.scoreAway;
      let activePenalties = prev.activePenalties || [];

      if (!isCurrentlyUndone) {
        // We UNDO this event
        if (eventToUndo.type === 'shot') {
          if (eventToUndo.team === config.homeTeam) newSogHome = Math.max(0, newSogHome - 1);
          if (eventToUndo.team === config.awayTeam) newSogAway = Math.max(0, newSogAway - 1);
        } else if (eventToUndo.type === 'goal') {
          if (eventToUndo.team === config.homeTeam) newScoreHome = Math.max(0, newScoreHome - 1);
          if (eventToUndo.team === config.awayTeam) newScoreAway = Math.max(0, newScoreAway - 1);
        } else if (eventToUndo.type === 'penalty') {
          activePenalties = activePenalties.filter(p => p.eventId !== id && p.id !== id);
        }
      } else {
        // We REDO this event
        if (eventToUndo.type === 'shot') {
          if (eventToUndo.team === config.homeTeam) newSogHome++;
          if (eventToUndo.team === config.awayTeam) newSogAway++;
        } else if (eventToUndo.type === 'goal') {
          if (eventToUndo.team === config.homeTeam) newScoreHome++;
          if (eventToUndo.team === config.awayTeam) newScoreAway++;
        } else if (eventToUndo.type === 'penalty') {
          const playerText = eventToUndo.scorer || 'Speler';
          const readdedPenalty: ActivePenalty = {
            id,
            eventId: id,
            team: eventToUndo.team,
            player: playerText,
            reason: eventToUndo.penaltyReason || '',
            minutes: eventToUndo.penaltyMinutes || 2,
            secondsRemaining: (eventToUndo.penaltyMinutes || 2) * 60
          };
          activePenalties = [...activePenalties, readdedPenalty];
        }
      }

      const updatedEvents = prev.events.map(e => e.id === id ? { ...e, isUndone: !isCurrentlyUndone } : e);

      return {
        ...prev,
        events: updatedEvents,
        sogHome: newSogHome,
        sogAway: newSogAway,
        scoreHome: newScoreHome,
        scoreAway: newScoreAway,
        activePenalties
      };
    });
  };


  return {
    config,
    gameState,
    setGameState,
    isFaceoffMode,
    setIsFaceoffMode,
    filter,
    setFilter,
    toastMessage,
    showPeriodEndModal,
    setShowPeriodEndModal,
    rinkRotation,
    setRinkRotation,
    isGoalModalOpen,
    setIsGoalModalOpen,
    isPenaltyModalOpen,
    setIsPenaltyModalOpen,
    isGameSummaryOpen,
    setIsGameSummaryOpen,
    handleTogglePlayPause,
    handleStoppageCancel,
    formatTime,
    handleAddShot,
    handleFaceoff,
    handleIcing,
    handleOffside,
    handleGoalSubmit,
    handlePenaltySubmit,
    handleFinishGame,
    handleSaveGame,
    handleUndo,
    showToast,
    timeString,
    getPeriodString,
    getClockString,
    getSituationString
  };
}
