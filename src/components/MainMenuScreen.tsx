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
  const [videoPlaying, setVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      Promise.resolve(videoRef.current.play()).catch(() => {
        // Autoplay might fail, fallback to skip
        setVideoPlaying(false);
      });
    }

    const fetchScheduledGames = async () => {
      const gasUrl = getGasUrl();
      if (gasUrl) {
        try {
          const res = await fetchGasData(gasUrl, { action: 'getScheduledGames' });
          const data = await res.json();
          if (Array.isArray(data) && data.length > 1) {
            const mapped = data.slice(1).map((row, i) => ({
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
              return; // Successfully loaded from GAS
            }
          }
        } catch (e) {}
      }

      // Fallback to local storage
      const saved = localStorage.getItem('blackout_scheduled_games');
      if (saved) {
        try {
          setScheduledGames(JSON.parse(saved));
        } catch (e) {}
      }
    };
    fetchScheduledGames();
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
        <div className="scorekeeper-banner relative w-full max-w-md mx-auto h-44 md:h-56 overflow-hidden flex items-center justify-center mb-6">
          <img
            src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/scorekeeper.png?v=1786003535"
            alt="Scorekeeper"
            className={`w-full h-full object-contain transition-all duration-300 ${!isDarkMode ? 'invert' : ''}`}
            style={
              isDarkMode
                ? {
                    WebkitMaskImage: 'radial-gradient(ellipse 88% 85% at 50% 50%, black 45%, transparent 100%)',
                    maskImage: 'radial-gradient(ellipse 88% 85% at 50% 50%, black 45%, transparent 100%)',
                  }
                : undefined
            }
          />
          {isDarkMode && (
            <div
              className="glassmorphism-overlay absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 85% 80% at 50% 50%, rgba(18, 20, 20, 0) 30%, rgba(18, 20, 20, 0.5) 70%, #121414 98%)'
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

          {scheduledGames.length > 0 && (
            <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-2 max-h-48 overflow-y-auto flex flex-col gap-2 shadow-md">
              <span className="text-[10px] font-mono text-gray-500 uppercase px-2 font-bold tracking-widest sticky top-0 bg-[#050505] z-10 py-1 border-b border-[#2A2A2A] mb-1">Upcoming Games</span>
              {scheduledGames.map(game => (
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
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
