import { getGasUrl } from '../utils/gasUrl';
import { fetchGasData } from '../utils/fetchGas';
import { useState, useEffect, useRef } from 'react';
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
          const scheduledRes = await fetchGasData(gasUrl, { action: 'getScheduledGames' });
          const scheduledData = await scheduledRes.json();
          if (Array.isArray(scheduledData) && scheduledData.length > 1) {
            const mapped = scheduledData.slice(1).map((row, i) => ({
              id: row[0] || Date.now().toString() + i,
              homeTeam: row[1] || '',
              awayTeam: row[2] || '',
              date: row[3] || '',
              time: row[4] || '',
              location: row[5] || '',
              competition: row[6] || '',
              matchType: row[7] || ''
            })).filter(g => g.homeTeam && g.awayTeam);
            if (mapped.length > 0) {
              setScheduledGames(mapped);
            }
          }

          // Fetch past games
          const gamesRes = await fetchGasData(gasUrl, { action: 'getGames' });
          const gamesData = await gamesRes.json();
          if (Array.isArray(gamesData) && gamesData.length > 1) {
             const mappedGames = gamesData.slice(1).map((row, i) => ({
                id: row[0] || `past-${Date.now()}-${i}`,
                date: row[1] || '',
                homeTeam: row[2] || '',
                awayTeam: row[3] || '',
                homeScore: row[4] !== undefined ? row[4] : '',
                awayScore: row[5] !== undefined ? row[5] : '',
                location: row[8] || ''
             })).filter(g => g.homeTeam && g.awayTeam);
             if (mappedGames.length > 0) {
                setPastGames(mappedGames);
             }
          }

        } catch (e) {}
      } else {
        // Fallback to local storage
        const saved = localStorage.getItem('blackout_scheduled_games');
        if (saved) {
          try {
            setScheduledGames(JSON.parse(saved));
          } catch (e) {}
        }
      }
    };
    fetchGamesData();
  }, []);

  const handleVideoEnd = () => {
    setVideoPlaying(false);
  };

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

      {/* Main Menu Content */}
      <div className="flex-1 w-full flex flex-col py-6 px-4 md:px-0 max-w-lg mx-auto z-10">

        {/* Banner image with rounded edge fades in dark mode, clean reversed-color image in light mode */}
        <div className="scorekeeper-banner relative w-full max-w-md mx-auto h-44 md:h-56 overflow-hidden flex items-center justify-center mb-6 rounded-lg">
          <img
            src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/kardinge2.png?v=1784547269"
            alt="Dashboard Banner"
            className={`w-full h-full object-cover transition-all duration-300`}
            style={
              isDarkMode
                ? {
                    WebkitMaskImage: 'radial-gradient(ellipse 95% 95% at 50% 50%, black 50%, transparent 100%)',
                    maskImage: 'radial-gradient(ellipse 95% 95% at 50% 50%, black 50%, transparent 100%)',
                  }
                : {
                    WebkitMaskImage: 'radial-gradient(ellipse 95% 95% at 50% 50%, black 50%, transparent 100%)',
                    maskImage: 'radial-gradient(ellipse 95% 95% at 50% 50%, black 50%, transparent 100%)',
                  }
            }
          />
          {isDarkMode && (
            <div
              className="glassmorphism-overlay absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 90% 90% at 50% 50%, rgba(18, 20, 20, 0) 40%, rgba(18, 20, 20, 0.6) 80%, #121414 100%)'
              }}
            />
          )}
        </div>

        {/* Action Buttons & Info */}
        <div className="w-full flex flex-col gap-4">

          <button
            onClick={onNewGame}
            className="w-full bg-tertiary text-black font-display text-[20px] md:text-[22px] font-bold py-4 rounded-lg raised-element bg-button-gradient hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(233,196,0,0.2)]"
          >
            <Play fill="currentColor" className="w-6 h-6" />
            NEW GAME
          </button>

          {/* Announcements Section */}
          <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-4 flex flex-col gap-2 shadow-md mb-4">
            <span className="text-[12px] font-mono text-tertiary uppercase font-bold tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              Announcements
            </span>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Welcome back to Blackout Scorekeeper, {currentUser?.email || 'User'}! Ensure you verify team rosters before beginning official matches. Check out the new Calendar view in the sidebar to keep track of upcoming games.
            </p>
          </div>

          {/* Dashboard Tabs */}
          <div className="flex gap-2 mb-4">
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
              <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-2 max-h-48 overflow-y-auto flex flex-col gap-2 shadow-md">
                <span className="text-[10px] font-mono text-gray-500 uppercase px-2 font-bold tracking-widest sticky top-0 bg-[#050505] z-10 py-1 border-b border-[#2A2A2A] mb-1">Recent Results</span>
                {pastGames.length > 0 ? (
                  pastGames.slice(-2).map(game => (
                    <div key={game.id} className="w-full text-left bg-surface-container-low border border-outline-variant/30 rounded p-4 md:p-3 flex items-center justify-between">
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

              {/* Upcoming Games (Next 2 games) */}
              <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-2 max-h-48 overflow-y-auto flex flex-col gap-2 shadow-md">
                <span className="text-[10px] font-mono text-gray-500 uppercase px-2 font-bold tracking-widest sticky top-0 bg-[#050505] z-10 py-1 border-b border-[#2A2A2A] mb-1">Upcoming Games</span>
                {scheduledGames.length > 0 ? (
                  scheduledGames.slice(0, 2).map(game => (
                    <button
                      key={game.id}
                      onClick={() => onStartScheduledGame(game)}
                      className="w-full text-left bg-surface-container-low hover:bg-white/5 border border-outline-variant/30 rounded p-4 md:p-3 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-tertiary transition-colors">{game.homeTeam} vs {game.awayTeam}</span>
                        <span className="text-[10px] font-mono text-gray-400">{game.date} • {game.time} • {game.location}</span>
                      </div>
                      <Play className="w-4 h-4 text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
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
             <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-4 flex flex-col gap-4 shadow-md h-96">
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

        </div>

      </div>
    </div>
  );
}
