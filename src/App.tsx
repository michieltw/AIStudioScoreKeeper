import { useState } from 'react';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import MainMenuScreen from './components/MainMenuScreen';
import SettingsScreen from './components/SettingsScreen';
import ScorekeeperScreen from './components/ScorekeeperScreen';
import DatabaseScreen from './components/DatabaseScreen';
import StatsScreen from './components/StatsScreen';
import EcosystemScreen from './components/Ecosystem/EcosystemScreen';
import MyProfileScreen from './components/MyProfileScreen';
import PeopleDirectoryScreen from './components/PeopleDirectoryScreen';
import TeamProfileScreen from './components/TeamProfileScreen';
import RosterBuilderScreen from './components/RosterBuilderScreen';
import FreeAgencyScreen from './components/FreeAgencyScreen';
import CalendarScreen from './components/CalendarScreen';
import LineupBuilderScreen from './components/LineupBuilderScreen';
import DraftModeScreen from './components/DraftModeScreen';
import SetupWizardScreen from './components/SetupWizardScreen';
import { Screen, Player, User } from './types';
import { defaultSettingsContract } from './settingsContract';

export default function App() {
  const [viewedPerson, setViewedPerson] = useState<any>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const toggleTheme = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsDarkMode(prev => !prev);
      setIsFading(false);
    }, 1500);
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scheduledGameData, setScheduledGameData] = useState<{
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
  } | null>(null);

  const handleStartScheduledGame = (gameData: any) => {
    if (currentUser?.role === 'Guest') return;
    setScheduledGameData(gameData);
    setCurrentScreen('settings');
    setIsSidebarOpen(false);
  };

  const handleNewGame = () => {
    if (currentUser?.role === 'Guest') return;
    setScheduledGameData(null);
    setCurrentScreen('settings');
    setIsSidebarOpen(false);
  };

  const isGuest = currentUser?.role === 'Guest';
  const isAdmin = currentUser && currentUser.role === 'Admin';
  const isTeamManagerPlus = currentUser && ['Admin', 'League Manager', 'Team Manager'].includes(currentUser.role);
  const isPlayerPlus = currentUser && ['Admin', 'League Manager', 'Team Manager', 'Player'].includes(currentUser.role);
  const isLeagueManagerPlus = currentUser && ['Admin', 'League Manager'].includes(currentUser.role);

  const navigateTo = (screen: Screen) => {
    if (screen === 'database' && !isLeagueManagerPlus) {
      return;
    }
    if ((screen === 'settings' || screen === 'scorekeeper') && isGuest) {
      return;
    }
    if (screen === 'my-profile') setViewedPerson(null);
    setCurrentScreen(screen);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('splash');
    setIsSidebarOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#050505] text-on-surface-variant p-4 w-80 sm:w-96 max-w-[92vw] border-r border-[#2A2A2A]">
      <div className="flex items-center justify-between mb-6">
        <img
          src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/house_league.png?v=1783714846"
          alt="House League Logo"
          className="h-10 object-contain cursor-pointer"
          onClick={() => alert("Coming soon")}
        />
        <button 
          onClick={() => setIsSidebarOpen(false)} 
          className="p-1 rounded text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto font-mono text-[11px] sm:text-[12px] font-bold tracking-wider uppercase pr-1">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => navigateTo('main-menu')} 
            className={`flex items-center justify-start p-2.5 rounded hover:bg-white/5 transition-colors ${currentScreen === 'main-menu' ? 'bg-white/10 text-white border border-white/20' : 'border border-transparent'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => isPlayerPlus && handleNewGame()} 
            disabled={!isPlayerPlus} 
            className={`flex items-center justify-start p-2.5 rounded transition-colors ${!isPlayerPlus ? 'opacity-50 cursor-not-allowed border border-transparent' : 'hover:bg-white/5 border border-transparent'}`}
          >
            New Game
          </button>

          <div className="col-span-2 my-1 border-t border-[#2A2A2A]"></div>

          {isLeagueManagerPlus && (
            <button 
              onClick={() => navigateTo('database')} 
              className={`flex items-center justify-start p-2.5 rounded hover:bg-white/5 transition-colors ${currentScreen === 'database' ? 'bg-white/10 text-white border border-white/20' : 'border border-transparent'}`}
            >
              Database
            </button>
          )}
          <button 
            onClick={() => navigateTo('stats')} 
            className={`flex items-center justify-start p-2.5 rounded hover:bg-white/5 transition-colors ${currentScreen === 'stats' ? 'bg-white/10 text-white border border-white/20' : 'border border-transparent'}`}
          >
            Stats
          </button>
          <button 
            onClick={() => isLeagueManagerPlus && navigateTo('ecosystem')} 
            disabled={!isLeagueManagerPlus} 
            className={`flex items-center justify-start p-2.5 rounded transition-colors ${!isLeagueManagerPlus ? 'opacity-50 cursor-not-allowed border border-transparent' : 'hover:bg-white/5 border border-transparent'} ${currentScreen === 'ecosystem' ? 'bg-white/10 text-white border border-white/20' : ''}`}
          >
            Ecosystem
          </button>
          <button 
            onClick={() => navigateTo('people-directory')} 
            className={`flex items-center justify-start p-2.5 rounded hover:bg-white/5 transition-colors ${currentScreen === 'people-directory' ? 'bg-white/10 text-white border border-white/20' : 'border border-transparent'}`}
          >
            People Directory
          </button>

          <div className="col-span-2 my-1 border-t border-[#2A2A2A]"></div>

          <button
            onClick={() => isTeamManagerPlus && navigateTo('team-profile')}
            disabled={!isTeamManagerPlus}
            className={`flex items-center justify-start p-2.5 rounded transition-colors ${!isTeamManagerPlus ? 'opacity-50 cursor-not-allowed border border-transparent' : 'hover:bg-white/5 border border-transparent'} ${currentScreen === 'team-profile' ? 'bg-white/10 text-white border border-white/20' : ''}`}
          >
            Teams
          </button>
          <button
            onClick={() => isTeamManagerPlus && navigateTo('roster-builder')}
            disabled={!isTeamManagerPlus}
            className={`flex items-center justify-start p-2.5 rounded transition-colors ${!isTeamManagerPlus ? 'opacity-50 cursor-not-allowed border border-transparent' : 'hover:bg-white/5 border border-transparent'} ${currentScreen === 'roster-builder' ? 'bg-white/10 text-white border border-white/20' : ''}`}
          >
            Rosters
          </button>
          <button
            onClick={() => isTeamManagerPlus && navigateTo('calendar')}
            disabled={!isTeamManagerPlus}
            className={`flex items-center justify-start p-2.5 rounded transition-colors ${!isTeamManagerPlus ? 'opacity-50 cursor-not-allowed border border-transparent' : 'hover:bg-white/5 border border-transparent'} ${currentScreen === 'calendar' ? 'bg-white/10 text-white border border-white/20' : ''}`}
          >
            Calendar
          </button>
          <button
            onClick={() => isTeamManagerPlus && navigateTo('lineup-builder')}
            disabled={!isTeamManagerPlus}
            className={`flex items-center justify-start p-2.5 rounded transition-colors ${!isTeamManagerPlus ? 'opacity-50 cursor-not-allowed border border-transparent' : 'hover:bg-white/5 border border-transparent'} ${currentScreen === 'lineup-builder' ? 'bg-white/10 text-white border border-white/20' : ''}`}
          >
            Lineups
          </button>

          <div className="col-span-2 my-1 border-t border-[#2A2A2A]"></div>

          <button
            onClick={() => isLeagueManagerPlus && navigateTo('free-agency')}
            disabled={!isLeagueManagerPlus}
            className={`flex items-center justify-start p-2.5 rounded transition-colors ${!isLeagueManagerPlus ? 'opacity-50 cursor-not-allowed border border-transparent' : 'hover:bg-white/5 border border-transparent'} ${currentScreen === 'free-agency' ? 'bg-white/10 text-white border border-white/20' : ''}`}
          >
            Free Agency
          </button>
          <button
            onClick={() => isLeagueManagerPlus && navigateTo('draft-mode')}
            disabled={!isLeagueManagerPlus}
            className={`flex items-center justify-start p-2.5 rounded transition-colors ${!isLeagueManagerPlus ? 'opacity-50 cursor-not-allowed border border-transparent' : 'hover:bg-white/5 border border-transparent'} ${currentScreen === 'draft-mode' ? 'bg-white/10 text-white border border-white/20' : ''}`}
          >
            Draft
          </button>

          {isLeagueManagerPlus && (
            <>
              <div className="col-span-2 my-1 border-t border-[#2A2A2A]"></div>
              <button
                onClick={() => navigateTo('setup-wizard')}
                className={`col-span-2 flex items-center justify-start p-2.5 rounded transition-colors hover:bg-white/5 ${currentScreen === 'setup-wizard' ? 'bg-white/10 text-white border border-white/20' : 'text-tertiary border border-transparent'}`}
              >
                Setup Wizard
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
        <div className="flex justify-center mb-4">
          <img
            src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/BOLOGOBLACK.png?v=1784323868"
            alt="Blackout Logo"
            className="h-8 object-contain"
          />
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 p-3 w-full text-left rounded hover:bg-error/10 hover:text-error transition-colors font-mono text-[12px] font-bold tracking-widest uppercase">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className={`w-full min-h-screen font-body overflow-x-hidden selection:bg-tertiary selection:text-on-tertiary flex relative ${isDarkMode ? 'bg-background text-on-background' : 'bg-white text-black light-mode'}`}>
      {/* Theme Transition Overlay */}
      <div
        className={`fixed inset-0 bg-black z-[100] pointer-events-none transition-opacity duration-1500 ease-in-out ${isFading ? 'opacity-100' : 'opacity-0'}`}
      />
      {currentScreen === 'splash' && <LoginScreen onLogin={(user) => {
        setCurrentUser(user);
        setCurrentScreen('main-menu');
      }} />}

      {currentScreen !== 'splash' && (
        <>
          {/* Sidebar Overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar Navigation */}
          <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Sidebar Background Layer */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03] z-[-1]"
              style={{
                backgroundImage: 'url(https://cdn.shopify.com/s/files/1/1038/7203/7203/files/hlalternate_background.png?v=1784150190)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            {renderSidebarContent()}
          </div>

          <div className="flex-1 flex flex-col min-h-screen relative w-full transition-all duration-300">
            {/* Top Bar */}
            {currentScreen !== 'scorekeeper' && (
            <div className="flex items-center justify-between p-4 z-30 sticky top-0 bg-background/80 backdrop-blur-md border-b border-white/5 pointer-events-auto">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="w-10 h-10 rounded bg-[#050505] border border-[#2A2A2A] hover:border-tertiary/60 flex items-center justify-center text-on-surface-variant hover:text-tertiary transition-all shadow-md pointer-events-auto active:scale-95"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex-1 flex justify-center pointer-events-auto items-center">
                 <img
                  src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/BOLOGOBLACK.png?v=1784323868"
                  alt="Blackout Logo"
                  className={`h-8 object-contain cursor-pointer transition-all duration-300 ${isDarkMode ? 'invert' : ''}`}
                  onClick={toggleTheme}
                />
              </div>

              <div className="flex gap-3 pointer-events-auto items-center">
                {import.meta.env.DEV && currentUser && (
                  <select
                    value={currentUser.role}
                    onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as any })}
                    className="bg-[#050505] text-white border border-[#2A2A2A] rounded px-2 py-1 text-sm focus:outline-none focus:border-tertiary h-10"
                  >
                    <option value="Admin">Admin</option>
                    <option value="League Manager">League Manager</option>
                    <option value="Team Manager">Team Manager</option>
                    <option value="Player">Player</option>
                    <option value="Guest">Guest</option>
                  </select>
                )}
                <button
                  onClick={() => navigateTo('my-profile')}
                  className="w-10 h-10 rounded-full bg-[#050505] border border-[#2A2A2A] hover:border-tertiary/60 flex items-center justify-center text-on-surface-variant hover:text-tertiary transition-all shadow-md active:scale-95 group relative"
                  title="My Profile"
                >
                  <UserIcon className="w-5 h-5 text-tertiary" />
                  {currentUser && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-tertiary rounded-full flex items-center justify-center">
                      <span className="text-[8px] font-bold text-black">{currentUser.role[0]}</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
            )}

            {/* Main Content Area */}
            <div className={`flex-1 w-full flex flex-col relative z-10 pb-8`}>
              {currentScreen === 'main-menu' && (
                <MainMenuScreen
                  currentUser={currentUser}
                  onStartScheduledGame={handleStartScheduledGame}
                  onNewGame={handleNewGame}
                  isDarkMode={isDarkMode}
                />
              )}

              {currentScreen === 'calendar' && (
                <CalendarScreen onBack={() => setCurrentScreen('main-menu')} />
              )}

              {currentScreen === 'lineup-builder' && (
                <LineupBuilderScreen onBack={() => setCurrentScreen('main-menu')} />
              )}

              {currentScreen === 'draft-mode' && (
                <DraftModeScreen onBack={() => setCurrentScreen('main-menu')} />
              )}

              {currentScreen === 'team-profile' && (
                <TeamProfileScreen onBack={() => setCurrentScreen('main-menu')} />
              )}

              {currentScreen === 'roster-builder' && (
                <RosterBuilderScreen onBack={() => setCurrentScreen('main-menu')} />
              )}

              {currentScreen === 'free-agency' && (
                <FreeAgencyScreen onBack={() => setCurrentScreen('main-menu')} />
              )}

              {currentScreen === 'my-profile' && (
                <MyProfileScreen currentUser={currentUser} viewedPerson={viewedPerson} onBack={() => { setViewedPerson(null); setCurrentScreen('main-menu'); }} />
              )}

              {currentScreen === 'people-directory' && (
                <PeopleDirectoryScreen onBack={() => setCurrentScreen('main-menu')} onViewPerson={(person) => { setViewedPerson(person); setCurrentScreen('my-profile'); }} />
              )}

              {currentScreen === 'ecosystem' && (
                <EcosystemScreen onBack={() => setCurrentScreen('main-menu')} />
              )}

              {currentScreen === 'database' && (
                isLeagueManagerPlus ? (
                  <DatabaseScreen onBack={() => setCurrentScreen('main-menu')} />
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
                    <h2 className="text-xl font-bold text-error font-display uppercase tracking-wider">Access Restricted</h2>
                    <p className="text-sm text-on-surface-variant max-w-md">
                      You are not authorized to view or edit database configuration. Please log in with a League Manager or Admin account.
                    </p>
                    <button
                      onClick={() => setCurrentScreen('main-menu')}
                      className="bg-tertiary text-black font-bold px-4 py-2 rounded font-mono text-xs uppercase"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                )
              )}

              {currentScreen === 'stats' && (
                <StatsScreen onBack={() => setCurrentScreen('main-menu')} />
              )}

              {currentScreen === 'settings' && (
                !isGuest ? (
                  <SettingsScreen
                    scheduledGameData={scheduledGameData}
                    contract={defaultSettingsContract}
                    onStart={() => setCurrentScreen('scorekeeper')}
                    onBack={() => setCurrentScreen('main-menu')}
                  />
                ) : (
                  <MainMenuScreen
                    currentUser={currentUser}
                    onStartScheduledGame={handleStartScheduledGame}
                    onNewGame={handleNewGame}
                    isDarkMode={isDarkMode}
                  />
                )
              )}

              {currentScreen === 'scorekeeper' && (
                !isGuest ? (
                  <ScorekeeperScreen contract={defaultSettingsContract} onBack={() => setCurrentScreen('settings')} />
                ) : (
                  <MainMenuScreen
                    currentUser={currentUser}
                    onStartScheduledGame={handleStartScheduledGame}
                    onNewGame={handleNewGame}
                    isDarkMode={isDarkMode}
                  />
                )
              )}

              {currentScreen === 'setup-wizard' && <SetupWizardScreen onCancel={() => setCurrentScreen('main-menu')} onFinish={() => setCurrentScreen('main-menu')} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
