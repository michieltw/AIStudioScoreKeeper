import { getGasUrl } from '../../utils/gasUrl';
import { clearGasCache } from '../../utils/fetchGas';
import { useState, useEffect } from 'react';
import { GameState, GameEvent, GameSettings } from '../../types';
import { Award, Download, Trash2, X, CheckCircle, RefreshCw, MapPin, Users, Tag } from 'lucide-react';

// CONTRACT: Alle teksten, headers en knop-labels
export interface GameSummaryModalLabels {
  title: string;
  attendanceSuffix: string; // bijv. "Toeschouwers"
  finalScoreLabel: string; // "EINDESTAND"
  periodPrefix: string; // "Periode "
  sogPrefix: string; // "SOG: "
  eventsTitle: string; // "GEBEURTENISSEN CORRIGEREN"
  eventsSubtitle: string; // "Klik op de prullenbak om een event te verwijderen"
  noEventsText: string; // "Geen gebeurtenissen geregistreerd."
  deleteEventTooltip: string; // "Verwijder event"
  successMessage: string; // "Wedstrijd is definitief gemaakt en CSV-rapport is gedownload!"
  backButton: string; // "Terug naar Wedstrijd"
  exportButton: string; // "Definitief Maken & CSV Exporteren"
  reDownloadButton: string; // "Her-download CSV"
  closeGameButton: string; // "Sluit Wedstrijd"

  // CSV Specifieke labels
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
  csvFilenamePrefix: string; // bijv. "wedstrijd_rapport"
}

interface GameSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  isOfficialGame?: boolean;
  onUpdateEvents: (newEvents: GameEvent[]) => void;
  onFinishGame: () => void;
  homeTeam?: string;
  awayTeam?: string;
  homeColor?: string;
  awayColor?: string;
  homeLogo?: string;
  awayLogo?: string;
  location?: string;
  competition?: string;
  matchType?: string;
  officials?: string[];
  linesmen?: string[];
  date?: string;
  time?: string;
  eventId?: string;
  settings?: GameSettings;
  labels?: GameSummaryModalLabels; // <-- HIER KOMEN ALLE TEKSTEN BINNEN
}

export default function GameSummaryModal({
  isOpen,
  onClose,
  gameState,
  isOfficialGame,
  onUpdateEvents,
  onFinishGame,
  homeTeam = '',
  awayTeam = '',
  homeColor = '',
  awayColor = '',
  homeLogo,
  awayLogo,
  location,
  competition,
  matchType,
  officials,
  linesmen,
  date,
  time,
  eventId,
  settings,
  labels
}: GameSummaryModalProps) {
  const [events, setEvents] = useState<GameEvent[]>(gameState.events);
  const [isFinalized, setIsFinalized] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEvents(gameState.events);
    }
  }, [isOpen, gameState.events]);

  if (!isOpen) return null;

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    onUpdateEvents(updated);
  };

  const handleExportCSV = async () => {
    const now = new Date().toISOString().split('T')[0];

    // Bouw de CSV dynamisch op met de contract labels
    let csvContent = `Game ID,${labels?.csvHeaderDate || 'Date'},${labels?.csvHeaderHome || 'Home Team'},${labels?.csvHeaderAway || 'Away Team'},${labels?.csvHeaderHomeScore || 'Home Score'},${labels?.csvHeaderAwayScore || 'Away Score'},${labels?.csvHeaderHomeSOG || 'Home SOG'},${labels?.csvHeaderAwaySOG || 'Away SOG'},${labels?.csvLocationLabel || 'Location'},${labels?.csvCompetitionLabel || 'Competition'},${labels?.csvMatchTypeLabel || 'Match Type'},Period,Clock Time,Situation,Player,Assist 1,Assist 2,Penalty Reason,Penalty Minutes,${labels?.csvEventsHeaderTimestamp || 'Timestamp'},${labels?.csvEventsHeaderType || 'Event Type'},${labels?.csvEventsHeaderTeam || 'Team'},${labels?.csvEventsHeaderDesc || 'Description'},${labels?.csvEventsHeaderX || 'X'},${labels?.csvEventsHeaderY || 'Y'}\n`;

    const activeEvents = events.filter(e => !e.isUndone);
    const chronologicalEvents = [...activeEvents].reverse();
    const gameId = `${now}_${homeTeam}_${awayTeam}`.replace(/\s+/g, '_');

    if (chronologicalEvents.length === 0) {
      csvContent += `"${gameId}","${date || now}","${homeTeam}","${awayTeam}",${gameState.scoreHome},${gameState.scoreAway},${gameState.sogHome},${gameState.sogAway},"${location || ''}","${competition || ''}","${matchType || ''}",,,,,,,,,,,,,\n`;
    } else {
      // Calculate initial scores by subtracting all event impacts from the final score
      let runScoreHome = gameState.scoreHome;
      let runScoreAway = gameState.scoreAway;
      let runSogHome = gameState.sogHome;
      let runSogAway = gameState.sogAway;

      activeEvents.forEach(e => {
        if (e.type === 'goal') {
          if (e.team === homeTeam) runScoreHome--;
          if (e.team === awayTeam) runScoreAway--;
        } else if (e.type === 'shot') {
          if (e.team === homeTeam) runSogHome--;
          if (e.team === awayTeam) runSogAway--;
        }
      });

      chronologicalEvents.forEach(e => {
        if (e.type === 'goal') {
          if (e.team === homeTeam) runScoreHome++;
          if (e.team === awayTeam) runScoreAway++;
        } else if (e.type === 'shot') {
          if (e.team === homeTeam) runSogHome++;
          if (e.team === awayTeam) runSogAway++;
        }

        const cleanText = e.text.replace(/"/g, '""');
        const xVal = e.x !== undefined ? Math.round(e.x) : '';
        const yVal = e.y !== undefined ? Math.round(e.y) : '';
        const period = e.period || '';
        const clockTime = e.clockTime || '';
        const situation = e.situation || '';
        const player = e.player || '';
        const assist1 = e.assist1 || '';
        const assist2 = e.assist2 || '';
        const penaltyReason = e.penaltyReason || '';
        const penaltyMinutes = e.penaltyMinutes || '';

        csvContent += `"${gameId}","${date || now}","${homeTeam}","${awayTeam}",${runScoreHome},${runScoreAway},${runSogHome},${runSogAway},"${location || ''}","${competition || ''}","${matchType || ''}","${period}","${clockTime}","${situation}","${player}","${assist1}","${assist2}","${penaltyReason}","${penaltyMinutes}","${e.time}","${e.type}","${e.team}","${cleanText}","${xVal}","${yVal}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const cleanHome = homeTeam.replace(/\s+/g, '_');
    const cleanAway = awayTeam.replace(/\s+/g, '_');
    link.setAttribute('download', `${now}_${cleanHome}_${cleanAway}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Push to Google Sheets database if configured
    const gasUrl = localStorage.getItem('blackout_gas_url');
    const gasToken = localStorage.getItem('blackout_gas_token') || '';
    if (gasUrl && !isFinalized) {
      try {
        const gameId = `${now}_${cleanHome}_${cleanAway}_${Date.now()}`;
        const logs = activeEvents.map(e => ({
          GameID: gameId,
          EventID: eventId || '',
          Date: date || now,
          HomeTeam: homeTeam,
          AwayTeam: awayTeam,
          Timestamp: e.time,
          EventType: e.type,
          Team: e.team,
          Description: e.text,
          X: e.x !== undefined ? Math.round(e.x) : '',
          Y: e.y !== undefined ? Math.round(e.y) : '',
          Player: e.player || '',
          Assist1: e.assist1 || '',
          Assist2: e.assist2 || '',
          PenaltyReason: e.penaltyReason || '',
          PenaltyMinutes: e.penaltyMinutes || ''
        }));

        // Default to blank/unassigned if not explicitly captured during game setup.
        // In a full implementation, these would be captured in Settings/Setup wizard.
        const game = {
          GameID: gameId,
          EventID: eventId || '',
          Date: date || now,
          HomeTeam: homeTeam,
          AwayTeam: awayTeam,
          HomeScore: gameState.scoreHome,
          AwayScore: gameState.scoreAway,
          HomeSOG: gameState.sogHome,
          AwaySOG: gameState.sogAway,
          Location: location || '',
          IsOfficial: !!isOfficialGame,
          Season: 'Unassigned',
          Division: 'Unassigned'
        };

        await fetch(gasUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({ action: 'saveGame', logs, game, newSchema: { games: [{ id: game.GameID || Date.now().toString(), season_id: "current", home_team_id: game.HomeTeam, away_team_id: game.AwayTeam, home_score: game.HomeScore, away_score: game.AwayScore, status: "completed" }], game_events: logs.map(l => ({ id: Date.now().toString() + Math.random(), game_id: game.GameID || Date.now().toString(), period: "1", time_elapsed: l.Timestamp, trigger_event_type: l.EventType, trigger_team_id: l.Team, description: l.Description, x_coordinate: l.X, y_coordinate: l.Y })) }, token: import.meta.env.VITE_GAS_TOKEN })
        });

        // Clear cache so that Stats and Standings update with the new game
        clearGasCache();
      } catch (err) {
        console.error("Failed to push to database:", err);
      }
    }

    setIsFinalized(true);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl w-full max-w-2xl p-5 md:p-6 shadow-2xl text-white my-auto flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#333] pb-4 mb-4">
          <div className="flex items-center gap-2.5 text-yellow-400 font-bold text-xl">
            <Award className="w-6 h-6" />
            <span>{labels?.title || ''}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* Game Details Banner */}
          <div className="flex flex-wrap gap-4 bg-[#181818] rounded-xl p-3 text-xs font-mono text-gray-400 border border-[#2a2a2a]">
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                <span>{location}</span>
              </div>
            )}
            {settings?.attendance ? (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                <span>{settings.attendance.toLocaleString()} {labels?.attendanceSuffix || ''}</span>
              </div>
            ) : null}
            {competition && (
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-gray-500" />
                <span>{competition}</span>
              </div>
            )}
            {matchType && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                <span>{matchType}</span>
              </div>
            )}
          </div>
          {/* Match Score Card */}
          <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-around text-center shadow-inner">
            {/* Home */}
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black tracking-wider" style={{ color: homeColor }}>{homeTeam}</span>
              <span className="text-4xl font-extrabold text-white mt-1">{gameState.scoreHome}</span>
              <span className="text-[11px] font-mono text-gray-500 mt-1">{labels?.sogPrefix || ''}{gameState.sogHome}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-mono text-yellow-400 uppercase tracking-widest font-bold">{labels?.finalScoreLabel || ''}</span>
              <span className="text-2xl font-bold text-gray-500 my-1">-</span>
              <span className="text-xs font-mono text-gray-400">{labels?.periodPrefix || ''}{gameState.period}</span>
            </div>

            {/* Away */}
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black tracking-wider" style={{ color: awayColor }}>{awayTeam}</span>
              <span className="text-4xl font-extrabold text-white mt-1">{gameState.scoreAway}</span>
              <span className="text-[11px] font-mono text-gray-500 mt-1">{labels?.sogPrefix || ''}{gameState.sogAway}</span>
            </div>
          </div>

          {/* Event Corrections List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider">
                {labels?.eventsTitle || ''} ({events.length})
              </h3>
              <span className="text-[11px] text-gray-500">{labels?.eventsSubtitle || ''}</span>
            </div>

            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl divide-y divide-[#222] max-h-60 overflow-y-auto">
              {events.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500 font-mono">{labels?.noEventsText || ''}</div>
              ) : (
                events.map(e => (
                  <div key={e.id} className="p-2.5 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-gray-500 w-16 shrink-0">{e.time}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        e.type === 'goal' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        e.type === 'penalty' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        e.type === 'icing' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        e.type === 'offside' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        e.type === 'shot' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-gray-700/30 text-gray-300'
                      }`}>
                        {e.type}
                      </span>
                      <span className={`font-semibold ${e.isUndone ? 'line-through text-gray-500' : 'text-gray-200'}`}>{e.text}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(e.id)}
                      className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors"
                      title={labels?.deleteEventTooltip || ''}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {isFinalized && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-3 text-emerald-400 text-xs font-mono">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{labels?.successMessage || ''}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#333] mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-[#444] text-gray-300 font-bold text-sm hover:bg-[#333] transition-colors"
          >
            {labels?.backButton || ''}
          </button>

          <button
            onClick={handleExportCSV}
            className="flex-1 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <Download className="w-4 h-4" />
            {isFinalized ? labels?.reDownloadButton || '' : labels?.exportButton || ''}
          </button>

          {isFinalized && (
            <button
              onClick={onFinishGame}
              className="py-3 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              {labels?.closeGameButton || ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}