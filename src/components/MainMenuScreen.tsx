import { getGasUrl } from '../utils/gasUrl';
import { fetchGasData } from '../utils/fetchGas';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play } from 'lucide-react';
import { User } from '../types';

interface MainMenuScreenProps {
  currentUser?: User | null;
  onNewGame?: () => void;
  onStartScheduledGame: (game: any) => void;
  isDarkMode?: boolean;
}

export default function MainMenuScreen({
  currentUser,
  onNewGame,
  onStartScheduledGame,
  isDarkMode = true,
}: MainMenuScreenProps) {
  const [scheduledGames, setScheduledGames] = useState<any[]>([]);
  const [pastGames, setPastGames] = useState<any[]>([]);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<'schedule' | 'calendar'>('schedule');
  const [calendarFilter, setCalendarFilter] = useState<'week' | 'month' | 'season'>('week');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      Promise.resolve(videoRef.current.play()).catch(() => {
        // Autoplay might fail, fallback to skip
        setVideoPlaying(false);
      });
    }

    const fetchGamesData = async () => {
      const gasUrl = getGasUrl();
      if (gasUrl) {
        try {
          // Fetch scheduled games
          const gamesRes = await fetchGasData(gasUrl, { action: 'getEcosystemData', sheetName: 'games' });
          const gamesResData = await gamesRes.json();
          const gamesData = gamesResData.data || gamesResData;
          const headers = gamesData[0] || [];
          const statusIdx = headers.indexOf('status');

          if (gamesData.length > 1) {
            const rows = gamesData.slice(1);

            const idIdx = headers.indexOf('id');
            const homeTeamIdx = headers.indexOf('home_team_id');
            const awayTeamIdx = headers.indexOf('away_team_id');
            const scheduledAtIdx = headers.indexOf('scheduled_at');
            const venueIdx = headers.indexOf('venue_id');
            const homeScoreIdx = headers.indexOf('home_score');
            const awayScoreIdx = headers.indexOf('away_score');

            const scheduled = rows.filter((r: any) => r[statusIdx] === 'scheduled').map((row: any[]) => ({
              id: row[idIdx],
              homeTeam: row[homeTeamIdx],
              awayTeam: row[awayTeamIdx],
              date: row[scheduledAtIdx] ? row[scheduledAtIdx].toString().split('T')[0] : '',
              time: row[scheduledAtIdx] ? row[scheduledAtIdx].toString().split('T')[1]?.substring(0,5) || '' : '',
              location: row[venueIdx],
              competition: '',
              matchType: 'Game'
            }));

            const completed = rows.filter((r: any) => r[statusIdx] === 'completed').map((row: any[]) => ({
              id: row[idIdx],
              date: row[scheduledAtIdx] ? row[scheduledAtIdx].toString().split('T')[0] : '',
              homeTeam: row[homeTeamIdx],
              awayTeam: row[awayTeamIdx],
              homeScore: row[homeScoreIdx],
              awayScore: row[awayScoreIdx],
              location: row[venueIdx]
            }));

            setScheduledGames(scheduled);
            setPastGames(completed);
          }

        } catch (e) {}
      }
    };
    fetchGamesData();
  }, []);

  const handleVideoEnd = useCallback(() => {
    setVideoPlaying(false);
  }, []);

  const isGuest = currentUser?.role === 'Guest';
  const isPlayerPlus = !isGuest && (!currentUser || ['Admin', 'League Manager', 'Team Manager', 'Player'].includes(currentUser.role));

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background Outline Player */}
      <div
        className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-20"
      >
        <img
          src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/blackoutoutlineplayer.png?v=1786630623"
          alt="Background Player Outline"
          className="w-full h-full object-cover md:object-contain"
        />
      </div>

      {/* Video Transition Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black transition-opacity duration-1000 flex items-center justify-center ${
          videoPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {videoPlaying && (
          <video
            ref={videoRef}
            src="https://cdn.shopify.com/videos/c/o/v/3e51447def85482cbd9434b59757f97e.mp4"
            className="w-full h-full object-cover"
            onEnded={handleVideoEnd}
            playsInline
            muted
          />
        )}
        {videoPlaying && (
          <button
            className="absolute bottom-10 right-10 text-white/60 hover:text-white font-mono text-[12px] font-bold tracking-widest z-50 uppercase bg-black/40 px-3 py-1.5 rounded border border-white/20"
            onClick={handleVideoEnd}
          >
            SKIP
          </button>
        )}
      </div>

      {/* Edge-to-edge Dashboard Banner */}
      <div className="scorekeeper-banner relative w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden flex items-center justify-center z-10 shrink-0">
        <img
          src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/kardinge2.png?v=1784547269"
          alt="Dashboard Banner"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Main Menu Content */}
      <div className="flex-1 w-full flex flex-col py-6 px-4 md:px-0 max-w-lg mx-auto z-10">

        {/* Action Buttons & Info */}
        <div className="w-full flex flex-col gap-4">

          {/* Announcements Section */}
          <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-4 flex flex-col gap-2 shadow-md mb-2">
            <span className="text-[12px] font-mono text-tertiary uppercase font-bold tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              Announcements
            </span>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Welcome back to Blackout Scorekeeper, {currentUser?.email || 'User'}! Ensure you verify team rosters before beginning official matches. Check out the new Calendar view in the sidebar to keep track of upcoming games.
            </p>
          </div>

          {/* Dashboard Tabs */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-2 text-sm font-bold font-mono tracking-wider rounded transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-tertiary text-black'
                  : 'bg-[#050505] text-on-surface-variant border border-[#2A2A2A] hover:text-white'
              }`}
            >
              SCHEDULE
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 py-2 text-sm font-bold font-mono tracking-wider rounded transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-tertiary text-black'
                  : 'bg-[#050505] text-on-surface-variant border border-[#2A2A2A] hover:text-white'
              }`}
            >
              CALENDAR
            </button>
          </div>

          {/* Schedule View */}
          {activeTab === 'schedule' && (
            <div className="flex flex-col gap-4">
              {/* Recent Results (Past 2 games) */}
              <div className="bg-card-gradient metallic-border rounded-lg p-2 max-h-48 overflow-y-auto flex flex-col gap-2 shadow-md">
                <span className="text-[10px] font-mono text-gray-500 uppercase px-2 font-bold tracking-widest sticky top-0 bg-[#050505]/80 backdrop-blur-sm z-10 py-1 border-b border-[#2A2A2A] mb-1">Recent Results</span>
                {pastGames.length > 0 ? (
                  pastGames.slice(-2).map(game => (
                    <div key={game.id} className="w-full text-left bg-surface-container-low border border-outline-variant/30 rounded p-4 md:p-3 flex items-center justify-between transition-colors">
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-bold text-white">{game.homeTeam} vs {game.awayTeam}</span>
                        <span className="text-[10px] font-mono text-gray-400">{game.date} • {game.location}</span>
                      </div>
                      <div className="flex flex-col items-end pl-4 font-mono font-bold">
                         <span className="text-white text-sm">{game.homeScore} - {game.awayScore}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 px-2">No recent results found.</p>
                )}
              </div>

              {/* Upcoming Games */}
              <div className="bg-card-gradient metallic-border rounded-lg p-2 max-h-48 overflow-y-auto flex flex-col gap-2 shadow-md">
                <span className="text-[10px] font-mono text-gray-500 uppercase px-2 font-bold tracking-widest sticky top-0 bg-[#050505]/80 backdrop-blur-sm z-10 py-1 border-b border-[#2A2A2A] mb-1">Upcoming Games</span>
                {scheduledGames.length > 0 ? (
                  scheduledGames.map(game => (
                    <button
                      key={game.id}
                      onClick={() => isPlayerPlus && onStartScheduledGame(game)}
                      disabled={!isPlayerPlus}
                      className={`w-full text-left bg-surface-container-low border border-outline-variant/30 rounded p-4 md:p-3 transition-colors flex items-center justify-between group ${
                        isPlayerPlus ? 'hover:bg-white/5 cursor-pointer hover:border-tertiary/30 soft-glow' : 'opacity-60 cursor-not-allowed'
                      }`}
                      title={!isPlayerPlus ? 'Guest accounts cannot start games' : undefined}
                    >
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${isPlayerPlus ? 'text-white group-hover:text-tertiary' : 'text-gray-400'} transition-colors`}>{game.homeTeam} vs {game.awayTeam}</span>
                        <span className="text-[10px] font-mono text-gray-400">{game.date} • {game.time} • {game.location}</span>
                      </div>
                      {isPlayerPlus && (
                        <Play className="w-4 h-4 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 px-2">No upcoming games scheduled.</p>
                )}
              </div>
            </div>
          )}

          {/* Calendar View */}
          {activeTab === 'calendar' && (
             <div className="bg-card-gradient metallic-border rounded-lg p-4 flex flex-col gap-4 shadow-md h-96">
                <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-2">
                  <span className="text-sm font-bold text-white">Filter By:</span>
                  <div className="flex gap-2">
                    {['week', 'month', 'season'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setCalendarFilter(filter as any)}
                        className={`px-3 py-1 text-xs font-mono font-bold tracking-widest uppercase rounded transition-colors ${
                          calendarFilter === filter
                            ? 'bg-tertiary/20 text-tertiary border border-tertiary/50'
                            : 'bg-surface-container-low text-gray-400 border border-outline-variant/30 hover:text-white'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
                  {(() => {
                    const now = new Date();
                    let filteredGames = scheduledGames;

                    if (calendarFilter === 'week') {
                      const nextWeek = new Date(now);
                      nextWeek.setDate(now.getDate() + 7);
                      filteredGames = scheduledGames.filter(game => {
                         const gameDate = new Date(game.date);
                         // If invalid date, include it for safety or exclude it, let's include if date parsing fails but mostly try to filter
                         if (isNaN(gameDate.getTime())) return true;
                         return gameDate >= now && gameDate <= nextWeek;
                      });
                    } else if (calendarFilter === 'month') {
                      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                      filteredGames = scheduledGames.filter(game => {
                         const gameDate = new Date(game.date);
                         if (isNaN(gameDate.getTime())) return true;
                         return gameDate >= now && gameDate <= endOfMonth;
                      });
                    }

                    if (filteredGames.length === 0) {
                      return <div className="text-sm text-gray-500 py-4 text-center">No games found for the selected {calendarFilter}.</div>;
                    }

                    return filteredGames.map(game => (
                      <div key={game.id} className="w-full text-left bg-surface-container-low border border-outline-variant/30 rounded p-3 flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-tertiary">{game.homeTeam} vs {game.awayTeam}</span>
                          <span className="text-xs font-mono text-gray-400 bg-black/50 px-2 py-0.5 rounded">{game.matchType || 'Game'}</span>
                        </div>
                        <span className="text-[11px] font-mono text-gray-300">{game.date} • {game.time}</span>
                        <span className="text-[11px] font-mono text-gray-500">{game.location}</span>
                      </div>
                    ));
                  })()}
                </div>
             </div>
          )}

          {/* New Game Button (Positioned below Schedule & Calendar section) */}
          <div className="flex flex-col gap-2 mt-2">
            <button
              onClick={() => isPlayerPlus && onNewGame?.()}
              disabled={!isPlayerPlus}
              className={`w-full font-display text-[20px] md:text-[22px] font-bold py-4 rounded-lg raised-element transition-all flex items-center justify-center gap-3 ${
                isPlayerPlus
                  ? 'bg-tertiary text-black bg-button-gradient hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(233,196,0,0.2)] cursor-pointer'
                  : 'bg-surface-container-high text-gray-500 opacity-50 cursor-not-allowed'
              }`}
              title={!isPlayerPlus ? 'Guest accounts cannot start games' : undefined}
            >
              <Play fill="currentColor" className="w-6 h-6" />
              NEW GAME
            </button>
            {!isPlayerPlus && (
              <p className="text-[11px] font-mono text-center text-gray-500">
                Guest mode: Log in with a player or manager account to start new games.
              </p>
            )}
          </div>

          {/* Footer Disclaimer Text Section */}
          <div className="mt-4 px-2 py-3 border-t border-[#222222]/80 text-center">
            <p className="text-[11px] leading-relaxed text-gray-500 font-sans">
              The Scorekeeper WebApp is the official digital application adjacent to the Blackout Hockey website. <a href="https://www.blackouthockey.nl" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-tertiary transition-colors underline underline-offset-2">www.blackouthockey.nl</a> is the official website of Blackout Hockey. Third party trademarks, logo&apos;s, emblems or copyrights are the property of their respective owners. All rights reserved.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
