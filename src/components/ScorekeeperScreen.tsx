import { GameState, GameEvent, GameConfig, ActivePenalty } from '../types';
import ScoreHeader from './Scorekeeper/ScoreHeader';
import MediaControls from './Scorekeeper/MediaControls';
import RinkMap from './Scorekeeper/RinkMap';
import ActionLog from './Scorekeeper/ActionLog';
import GoalModal from './Scorekeeper/GoalModal';
import PenaltyModal from './Scorekeeper/PenaltyModal';
import GameSummaryModal from './Scorekeeper/GameSummaryModal';
import PeriodEndModal from './Scorekeeper/PeriodEndModal';
import { SettingsContract } from '../settingsContract';
import { useScorekeeperState } from '../hooks/useScorekeeperState';

export default function ScorekeeperScreen({ contract, onBack }: { contract: SettingsContract; onBack: () => void }) {
  const {
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
  } = useScorekeeperState({ contract, onBack });

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto scrollbar-none bg-[#1a1a1a] relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-xs shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {toastMessage}
        </div>
      )}

      <ScoreHeader
        gameState={gameState}
        formatTime={formatTime}
        onBack={onBack}
        homeTeam={config.homeTeam}
        awayTeam={config.awayTeam}
        homeColor={config.homeColor}
        awayColor={config.awayColor}
        homeLogo={config.homeLogo}
        awayLogo={config.awayLogo}
        trackPenalties={config.settings?.trackPenalties}
        onStoppageCancel={handleStoppageCancel}
        onAdjustTime={(seconds: number) => {
          setGameState(prev => ({
            ...prev,
            timeRemaining: Math.max(0, prev.timeRemaining + seconds)
          }));
        }}
        labels={contract.scoreHeaderLabels}
      />
      <MediaControls isRunning={gameState.isRunning} onToggle={handleTogglePlayPause} filter={filter} setFilter={setFilter} />
      <RinkMap
          rotation={rinkRotation}
          onRotate={(deg) => setRinkRotation(prev => (prev + deg) % 360)}
          isRunning={gameState.isRunning}
        stoppageTime={gameState.stoppageTime}
        isFaceoffMode={isFaceoffMode}
        setIsFaceoffMode={setIsFaceoffMode}
        onStoppageCancel={handleStoppageCancel}
        formatTime={formatTime}
        onAddShot={handleAddShot}
        onFaceoff={handleFaceoff}
        onIcing={handleIcing}
        onOffside={handleOffside}
        onOpenGoalModal={() => setIsGoalModalOpen(true)}
        onOpenPenaltyModal={() => {
          if (config.settings?.trackPenalties === false) {
            showToast('Straffen bijhouden is uitgeschakeld in instellingen');
          } else {
            setIsPenaltyModalOpen(true);
          }
        }}
        onSaveGame={handleSaveGame}
        onEndGame={() => setIsGameSummaryOpen(true)}
        events={gameState.events}
        homeTeam={config.homeTeam}
        awayTeam={config.awayTeam}
        homeColor={config.homeColor}
        awayColor={config.awayColor}
        labels={contract.rinkMapLabels}
      />
      <ActionLog
        events={gameState.events}
        filter={filter}
        onUndo={handleUndo}
        homeTeam={config.homeTeam}
        awayTeam={config.awayTeam}
        homeColor={config.homeColor}
        awayColor={config.awayColor}
        labels={contract.actionLogLabels}
      />

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleGoalSubmit}
        homeTeam={config.homeTeam}
        awayTeam={config.awayTeam}
        homeRoster={config.homeRoster}
        awayRoster={config.awayRoster}
        labels={contract.goalModalLabels}
      />

      {/* Penalty Modal */}
      <PenaltyModal
        isOpen={isPenaltyModalOpen}
        onClose={() => setIsPenaltyModalOpen(false)}
        onSubmit={handlePenaltySubmit}
        homeTeam={config.homeTeam}
        awayTeam={config.awayTeam}
        homeRoster={config.homeRoster}
        awayRoster={config.awayRoster}
        penaltyOptions={contract.penaltyReasonOptions}
        durationOptions={contract.penaltyDurationOptions}
        labels={contract.penaltyModalLabels}
      />

      {showPeriodEndModal && (
        <PeriodEndModal
          gameState={gameState}
          homeTeam={config.homeTeam}
          awayTeam={config.awayTeam}
          homeColor={config.homeColor}
          awayColor={config.awayColor}
          homeLogo={config.homeLogo}
          awayLogo={config.awayLogo}
          onResumeGame={(switchEnds) => {
            if (switchEnds) {
               setRinkRotation(prev => (prev + 180) % 360);
            }
            setGameState(prev => {
              const nextPeriod = prev.period + 1;
              let nextTime = config.settings?.periodLength || 20 * 60;
              if (nextPeriod === 4) nextTime = 5 * 60; // OT is usually 5 mins
              if (nextPeriod >= 5) nextTime = 0; // Shootout has no time
              return {
               ...prev,
               period: nextPeriod,
               timeRemaining: nextTime,
               stoppageTime: 0
              };
            });
            setShowPeriodEndModal(false);
            setIsFaceoffMode(true);
          }}
        />
      )}

      {/* Game Summary / End Game Modal */}
      <GameSummaryModal
        isOpen={isGameSummaryOpen}
        onClose={() => setIsGameSummaryOpen(false)}
        gameState={gameState}
        eventId={config.eventId}
        isOfficialGame={config.settings.officialGame}
        onUpdateEvents={(newEvents) => {
          setGameState(prev => {
            const validIds = new Set(newEvents.map(e => e.id));
            return {
              ...prev,
              events: newEvents,
              activePenalties: (prev.activePenalties || []).filter(p => !p.eventId || validIds.has(p.eventId))
            };
          });
        }}
        onFinishGame={handleFinishGame}
        homeTeam={config.homeTeam}
        awayTeam={config.awayTeam}
        homeColor={config.homeColor}
        awayColor={config.awayColor}
        homeLogo={config.homeLogo}
        awayLogo={config.awayLogo}
        location={config.location}
        competition={config.competition}
        matchType={config.matchType}
        officials={config.officials}
        linesmen={config.linesmen}
        date={config.date}
        time={config.time}
        settings={config.settings}
        labels={contract.gameSummaryLabels}
      />
    </div>
  );
}