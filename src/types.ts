export type Screen = 'splash' | 'main-menu' | 'settings' | 'scorekeeper' | 'database' | 'stats' | 'ecosystem' | 'my-profile' | 'people-directory' | 'team-profile' | 'roster-builder' | 'free-agency' | 'calendar' | 'lineup-builder' | 'draft-mode' | 'setup-wizard';

export interface Team {
  id: string;
  clubId: string;
  divisionId: string;
  seasonId: string;
  parentTeamId?: string;
  name?: string;
}

export interface Roster {
  id: string;
  personId: string;
  teamId: string;
  seasonId: string;
}

export interface User {
  id: string;
  email: string;
  role: 'Admin' | 'League Manager' | 'Team Manager' | 'Player' | 'Guest';
  personId?: string;
}

export interface Person {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  birthdate?: string;
  email?: string;
  phone?: string;
}

export interface PersonJob {
  id: string;
  personId: string;
  clubId: string;
  title: string;
  role: string; // e.g. Coach, Manager
}

export interface Award {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface PlayerProfile {
  id: string;
  personId: string;
  height?: string;
  weight?: string;
  handedness?: 'Left' | 'Right';
  status?: string; // e.g. Active, Free Agent
  badges?: Achievement[];
  awards?: Award[];
}

export interface Retailer {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  tier?: 'Gold' | 'Silver' | 'Bronze' | string;
}

export interface PlayerEquipment {
  id: string;
  personId: string;
  stickBrand?: string;
  stickModel?: string;
  stickFlex?: string;
  stickCurve?: string;
  skateBrand?: string;
  helmetBrand?: string;
  retailer?: string;
}

export interface Player {
  id: string;
  number: string;
  name: string;
  position?: string;
}

export interface ScheduledGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  location?: string;
  competition?: string;
  matchType?: string;
  homeRoster?: Player[];
  awayRoster?: Player[];
}

export interface EcosystemEvent {
  id: string;
  venueId?: string;
  seasonId?: string;
  phaseId?: string;
  eventType: 'Game' | 'Practice' | 'Event';
  homeTeamId?: string;
  awayTeamId?: string;
  tournamentMode?: boolean;
  date: string;
  time: string;
}

export interface RSVP {
  eventId: string;
  personId: string;
  status: 'Attending' | 'Not Attending' | 'Maybe';
}

export interface Lineup {
  eventId: string;
  personId: string;
  teamId: string;
  unitType: 'Even Strength' | 'PK1' | 'PK2' | 'PP1' | 'PP2' | 'Starting Goalie' | 'Backup Goalie' | string;
}

export interface DraftPick {
  teamId: string;
  originalTeamId?: string;
  year: number;
  round: number;
  pickNumber: number;
  personId: string;
}

export interface GameSettings {
  periodLength: number; // in seconds
  trackIcing: boolean;
  trackOffside: boolean;
  trackSOG: boolean;

  officialGame: boolean;
  gameType: string;
  attendance: number;
  ticketsSold: number;

  liveGame: boolean;
  teamSelection: string;
  allowFillInPlayers: boolean;

  gameClock: boolean;
  clockPauseBehavior: string;
  autoStopAtPeriodEnd: string;
  periodFormat: string;
  shootout: boolean;
  soRules: string;

  trackSOGLocation: boolean;
  trackFOW: boolean;
  faceoffLocation: boolean;
  goalscorer: boolean;
  assists: string;

  trackPenalties: boolean;
  penaltyClock: string;
  durationTypes: string;

  officialsMode: string;
  linesmenMode: string;
  venueMode: string;
  capacity: number;
  avgPrice: number;

  haptics: boolean;
  stayAwake: boolean;
  autosave: boolean;
  localStorageEnabled: boolean;
  autogenerateCSV: boolean;
}

export interface GameConfig {
  eventId?: string;
  homeTeam: string;
  awayTeam: string;
  homeColor?: string;
  awayColor?: string;
  homeLogo?: string;
  awayLogo?: string;
  homeRoster?: Player[];
  awayRoster?: Player[];
  date?: string;
  time?: string;
  location?: string;
  competition?: string;
  matchType?: string;
  officials?: string[];
  linesmen?: string[];
  initialScoreHome?: number;
  initialScoreAway?: number;
  initialSogHome?: number;
  initialSogAway?: number;
  initialPeriod?: number;
  settings: GameSettings;
}

export type EventType = 'shot' | 'goal' | 'penalty' | 'faceoff' | 'icing' | 'offside';

export interface GameEvent {
  id: string;
  eventId?: string;
  type: EventType;
  team: string;
  time: string;
  text: string;
  x?: number;
  y?: number;
  isHistorical?: boolean;
  isUndone?: boolean;
  scorer?: string;
  assist1?: string;
  assist2?: string;
  penaltyReason?: string;
  penaltyMinutes?: number;
  period?: string;
  clockTime?: string;
  situation?: string;
  player?: string;
}

export interface ActivePenalty {
  id: string;
  eventId?: string;
  team: string;
  player: string;
  reason: string;
  minutes: number;
  secondsRemaining: number;
}

export interface GameState {
  isRunning: boolean;
  period: number;
  timeRemaining: number;
  stoppageTime: number;
  sogHome: number;
  sogAway: number;
  scoreHome: number;
  scoreAway: number;
  events: GameEvent[];
  activePenalties?: ActivePenalty[];
  isOfficial?: boolean;
}

// ==========================================
// DB SCHEMA INTERFACES
// ==========================================
export interface DbUser {
  id: string;
  username?: string;
  email?: string;
  passwordHash?: string;
  role?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  activeFrom?: string;
  activeTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbPerson {
  id: string;
  personCode?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  heightCm?: number;
  weightKg?: number;
  jerseyNumber?: number;
  playsPosition?: string;
  photoUrl?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Job {
  id: string;
  personId?: string;
  jobType?: string;
  organizationId?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Organization {
  id: string;
  name?: string;
  country?: number;
  foundedYear?: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  activeFrom?: string;
  activeTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Club {
  id: string;
  organizationId?: string;
  name?: string;
  city?: string;
  country?: number;
  foundedYear?: string;
  logoUrl?: string;
  homeVenueId?: string;
  description?: string;
  activeFrom?: string;
  activeTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tier {
  id: string;
  organizationId?: string;
  name?: string;
  tierType?: string;
  levelRank?: string;
  parentTierId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Competition {
  id: string;
  organizationId?: string;
  competitionCode?: string;
  name?: string;
  competitionType?: string;
  tierId?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbTeam {
  id: string;
  clubId?: string;
  competitionId?: string;
  teamCode?: string;
  name?: string;
  tierId?: string;
  coachId?: string;
  generalManagerId?: string;
  foundedYear?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  description?: string;
  activeFrom?: string;
  activeTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Season {
  id: string;
  competitionId?: string;
  year?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

export interface SeasonPhase {
  id: string;
  seasonId?: string;
  phaseType?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  createdAt?: string;
}

export interface PlayoffBracket {
  id: string;
  seasonId?: string;
  name?: string;
  roundNumber?: number;
  createdAt?: string;
}

export interface BracketMatchup {
  id: string;
  bracketId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  seriesGameNumber?: number;
  winnerTeamId?: string;
  createdAt?: string;
}

export interface Venue {
  id: string;
  name?: string;
  city?: string;
  country?: number;
  capacity?: string;
  address?: string;
  website?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbEvent {
  id: string;
  teamId?: string;
  eventType?: string;
  scheduledAt?: string;
  venueId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbEventRsvp {
  id: string;
  eventId?: string;
  personId?: string;
  rsvpStatus?: string;
  respondedAt?: string;
  createdAt?: string;
}

export interface DbGame {
  id: string;
  seasonId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  venueId?: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  homeScore?: string;
  awayScore?: string;
  status?: string;
  attendance?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GameOfficial {
  id: string;
  gameId?: string;
  personId?: string;
  officialRole?: string;
  activeFrom?: string;
  activeTo?: string;
  createdAt?: string;
}

export interface PenaltyType {
  id: string;
  name?: string;
  isActive?: boolean;
  defaultDurationMinutes?: string;
  description?: string;
  createdAt?: string;
}

export interface GameEvent {
  id: string;
  gameId?: string;
  period?: string;
  timeElapsed?: string;
  timeLeft?: string;
  triggerEventType?: string;
  triggerTeamId?: string;
  triggerPlayerId?: string;
  firstAssistPlayerId?: string;
  secondAssistPlayerId?: string;
  penaltyTypeId?: string;
  penaltyDuration?: string;
  xCoordinate?: string;
  yCoordinate?: string;
  playStoppage?: string;
  playResumes?: string;
  description?: string;
  authorizedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbRoster {
  id: string;
  teamId?: string;
  seasonId?: string;
  rosterName?: string;
  rosterStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RosterMember {
  id: string;
  rosterId?: string;
  personId?: string;
  personFullName?: string;
  jerseyNumber?: number;
  position?: string;
  status?: string;
  joinedAt?: string;
  leftAt?: string;
  createdAt?: string;
}

export interface DbPlayer {
  id: string;
  personId?: string;
  handedness?: string;
  primaryPosition?: string;
  secondaryPosition?: string;
  activeFrom?: string;
  activeTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbLineup {
  id: string;
  gameId?: string;
  teamId?: string;
  lineupName?: string;
  createdAt?: string;
}

export interface SpecialTeam {
  id: string;
  teamId?: string;
  seasonId?: string;
  specialTeamType?: string;
  name?: string;
  activeFrom?: string;
  activeTo?: string;
  createdAt?: string;
}

export interface LineupSlot {
  id: string;
  lineupId?: string;
  personId?: string;
  lineNumber?: number;
  position?: string;
  createdAt?: string;
}

export interface SpecialTeamMember {
  id: string;
  specialTeamId?: string;
  personId?: string;
  lineNumber?: number;
  position?: string;
  createdAt?: string;
}

export interface PlayerStat {
  id: string;
  seasonId?: string;
  personId?: string;
  teamId?: string;
  personFullName?: string;
  teamName?: string;
  gamesPlayed?: number;
  goals?: number;
  assists?: number;
  points?: number;
  plusMinus?: string;
  penaltiesInMinutes?: number;
  shots?: string;
  hits?: string;
  blocks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalieStat {
  id: string;
  seasonId?: string;
  personId?: string;
  teamId?: string;
  personFullName?: string;
  teamName?: string;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  goalsAgainst?: number;
  saves?: number;
  shotsAgainst?: string;
  shutouts?: number;
  savePercentage?: number;
  goalsAgainstAverage?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamStat {
  id: string;
  seasonId?: string;
  teamId?: string;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Standings {
  id: string;
  seasonId?: string;
  tierId?: string;
  teamId?: string;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  points?: number;
  position?: string;
  updatedAt?: string;
}

export interface FreeAgent {
  id: string;
  personId?: string;
  seasonId?: string;
  availableFrom?: string;
  availableTo?: string;
  askingPriceLower?: string;
  askingPriceUpper?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerDraft {
  id: string;
  seasonId?: string;
  competitionId?: string;
  status?: string;
  draftDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbDraftPick {
  id: string;
  draftId?: string;
  pickOrder?: string;
  teamId?: string;
  personId?: string;
  roundNumber?: number;
  notes?: string;
  createdAt?: string;
}

export interface DbBrand {
  id: string;
  name?: string;
  country?: number;
  logoUrl?: string;
  website?: string;
  description?: string;
  createdAt?: string;
}

export interface DbPlayerEquipment {
  id: string;
  personId?: string;
  equipmentType?: string;
  brandId?: string;
  serialNumber?: number;
  purchaseDate?: string;
  activeFrom?: string;
  activeTo?: string;
  condition?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Stick {
  id: string;
  personId?: string;
  playerProfileId?: string;
  brandId?: string;
  model?: string;
  handedness?: string;
  flexRating?: string;
  curveType?: string;
  lengthInches?: string;
  material?: string;
  purchaseDate?: string;
  activeFrom?: string;
  activeTo?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbRetailer {
  id: string;
  name?: string;
  website?: string;
  email?: string;
  phone?: string;
  country?: number;
  createdAt?: string;
}

export interface DbSponsor {
  id: string;
  name?: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  contactPerson?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamSponsor {
  id: string;
  teamId?: string;
  sponsorId?: string;
  seasonId?: string;
  sponsorshipLevel?: string;
  amountUsd?: number;
  startedAt?: string;
  endedAt?: string;
  createdAt?: string;
}

export interface DbPlayerProfile {
  id: string;
  personId?: string;
  userId?: string;
  bio?: string;
  careerHighlights?: string;
  achievementsSummary?: string;
  profileUrl?: string;
  visibility?: string;
  isPublished?: boolean;
  featuredBadgeId?: string;
  featuredAwardId?: string;
  totalEquipment?: string;
  totalBadges?: string;
  totalAwards?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamProfile {
  id: string;
  teamId?: string;
  description?: string;
  history?: string;
  recentAchievements?: string;
  profileUrl?: string;
  visibility?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DivisionProfile {
  id: string;
  tierId?: string;
  description?: string;
  rulesSummary?: string;
  profileUrl?: string;
  visibility?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeagueProfile {
  id: string;
  competitionId?: string;
  description?: string;
  rulesSummary?: string;
  history?: string;
  profileUrl?: string;
  visibility?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbAchievement {
  id: string;
  name?: string;
  description?: string;
  iconUrl?: string;
  category?: string;
  criteriaDescription?: string;
  pointsReward?: number;
  createdAt?: string;
}

export interface UserAchievement {
  id: string;
  userId?: string;
  achievementId?: string;
  awardedAt?: string;
  notes?: string;
  createdAt?: string;
}

export interface DbBadge {
  id: string;
  name?: string;
  description?: string;
  iconUrl?: string;
  tier?: string;
  createdAt?: string;
}

export interface UserBadge {
  id: string;
  userId?: string;
  badgeId?: string;
  earnedAt?: string;
  createdAt?: string;
}

export interface SeasonalAward {
  id: string;
  seasonId?: string;
  awardName?: string;
  category?: string;
  personId?: string;
  teamId?: string;
  description?: string;
  awardOrder?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerAward {
  id: string;
  seasonId?: string;
  personId?: string;
  gameId?: string;
  awardType?: string;
  description?: string;
  awardedAt?: string;
  createdAt?: string;
}

export interface PlayerSeason {
  id: string;
  personId?: string;
  seasonId?: string;
  primaryTeamId?: string;
  seasonRole?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationRegistration {
  id: string;
  organizationId?: string;
  federationCode?: string;
  federationName?: string;
  licenseType?: string;
  registrationDate?: string;
  expiryDate?: string;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClubLicense {
  id: string;
  clubId?: string;
  licenseType?: string;
  issuedDate?: string;
  expiryDate?: string;
  isActive?: boolean;
  complianceStatus?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerLicense {
  id: string;
  personId?: string;
  knhbLicenseNumber?: number;
  licenseCategory?: string;
  issuedDate?: string;
  expiryDate?: string;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const dbSchema: Record<string, string[]> = {
  "users": ["id", "username", "email", "password_hash", "role", "display_name", "avatar_url", "bio", "active_from", "active_to", "created_at", "updated_at"],
  "persons": ["id", "person_code", "first_name", "last_name", "date_of_birth", "nationality", "height_cm", "weight_kg", "jersey_number", "plays_position", "photo_url", "bio", "created_at", "updated_at"],
  "jobs": ["id", "person_id", "job_type", "organization_id", "start_date", "end_date", "is_active", "created_at"],
  "organizations": ["id", "name", "country", "founded_year", "logo_url", "website", "description", "active_from", "active_to", "created_at", "updated_at"],
  "clubs": ["id", "organization_id", "name", "city", "country", "founded_year", "logo_url", "home_venue_id", "description", "active_from", "active_to", "created_at", "updated_at"],
  "tiers": ["id", "organization_id", "name", "tier_type", "level_rank", "parent_tier_id", "created_at", "updated_at"],
  "competitions": ["id", "organization_id", "competition_code", "name", "competition_type", "tier_id", "start_date", "end_date", "description", "created_at", "updated_at"],
  "teams": ["id", "club_id", "competition_id", "team_code", "name", "tier_id", "coach_id", "general_manager_id", "founded_year", "logo_url", "primary_color", "secondary_color", "description", "active_from", "active_to", "created_at", "updated_at"],
  "seasons": ["id", "competition_id", "year", "start_date", "end_date", "created_at"],
  "season_phases": ["id", "season_id", "phase_type", "start_date", "end_date", "description", "created_at"],
  "playoff_brackets": ["id", "season_id", "name", "round_number", "created_at"],
  "bracket_matchups": ["id", "bracket_id", "home_team_id", "away_team_id", "series_game_number", "winner_team_id", "created_at"],
  "venues": ["id", "name", "city", "country", "capacity", "address", "website", "phone", "created_at", "updated_at"],
  "events": ["id", "team_id", "event_type", "scheduled_at", "venue_id", "notes", "created_at", "updated_at"],
  "event_rsvps": ["id", "event_id", "person_id", "rsvp_status", "responded_at", "created_at"],
  "games": ["id", "season_id", "home_team_id", "away_team_id", "venue_id", "scheduled_at", "started_at", "ended_at", "home_score", "away_score", "status", "attendance", "notes", "created_at", "updated_at"],
  "game_officials": ["id", "game_id", "person_id", "official_role", "active_from", "active_to", "created_at"],
  "penalty_types": ["id", "name", "is_active", "default_duration_minutes", "description", "created_at"],
  "game_events": ["id", "game_id", "period", "time_elapsed", "time_left", "trigger_event_type", "trigger_team_id", "trigger_player_id", "first_assist_player_id", "second_assist_player_id", "penalty_type_id", "penalty_duration", "x_coordinate", "y_coordinate", "play_stoppage", "play_resumes", "description", "authorized_by", "created_at", "updated_at"],
  "rosters": ["id", "team_id", "season_id", "roster_name", "roster_status", "created_at", "updated_at"],
  "roster_members": ["id", "roster_id", "person_id", "person_full_name", "jersey_number", "position", "status", "joined_at", "left_at", "created_at"],
  "players": ["id", "person_id", "handedness", "primary_position", "secondary_position", "active_from", "active_to", "created_at", "updated_at"],
  "lineups": ["id", "game_id", "team_id", "lineup_name", "created_at"],
  "special_teams": ["id", "team_id", "season_id", "special_team_type", "name", "active_from", "active_to", "created_at"],
  "lineup_slots": ["id", "lineup_id", "person_id", "line_number", "position", "created_at"],
  "special_team_members": ["id", "special_team_id", "person_id", "line_number", "position", "created_at"],
  "player_stats": ["id", "season_id", "person_id", "team_id", "person_full_name", "team_name", "games_played", "goals", "assists", "points", "plus_minus", "penalties_in_minutes", "shots", "hits", "blocks", "created_at", "updated_at"],
  "goalie_stats": ["id", "season_id", "person_id", "team_id", "person_full_name", "team_name", "games_played", "wins", "losses", "ties", "goals_against", "saves", "shots_against", "shutouts", "save_percentage", "goals_against_average", "created_at", "updated_at"],
  "team_stats": ["id", "season_id", "team_id", "games_played", "wins", "losses", "ties", "goals_for", "goals_against", "created_at", "updated_at"],
  "standings": ["id", "season_id", "tier_id", "team_id", "games_played", "wins", "losses", "ties", "points", "position", "updated_at"],
  "free_agents": ["id", "person_id", "season_id", "available_from", "available_to", "asking_price_lower", "asking_price_upper", "notes", "created_at", "updated_at"],
  "player_drafts": ["id", "season_id", "competition_id", "status", "draft_date", "notes", "created_at", "updated_at"],
  "draft_picks": ["id", "draft_id", "pick_order", "team_id", "person_id", "round_number", "notes", "created_at"],
  "brands": ["id", "name", "country", "logo_url", "website", "description", "created_at"],
  "player_equipment": ["id", "person_id", "equipment_type", "brand_id", "serial_number", "purchase_date", "active_from", "active_to", "condition", "notes", "created_at", "updated_at"],
  "sticks": ["id", "person_id", "player_profile_id", "brand_id", "model", "handedness", "flex_rating", "curve_type", "length_inches", "material", "purchase_date", "active_from", "active_to", "notes", "created_at", "updated_at"],
  "retailers": ["id", "name", "website", "email", "phone", "country", "created_at"],
  "sponsors": ["id", "name", "logo_url", "website", "email", "contact_person", "created_at", "updated_at"],
  "team_sponsors": ["id", "team_id", "sponsor_id", "season_id", "sponsorship_level", "amount_usd", "started_at", "ended_at", "created_at"],
  "player_profiles": ["id", "person_id", "user_id", "bio", "career_highlights", "achievements_summary", "profile_url", "visibility", "is_published", "featured_badge_id", "featured_award_id", "total_equipment", "total_badges", "total_awards", "created_at", "updated_at"],
  "team_profiles": ["id", "team_id", "description", "history", "recent_achievements", "profile_url", "visibility", "is_published", "created_at", "updated_at"],
  "division_profiles": ["id", "tier_id", "description", "rules_summary", "profile_url", "visibility", "is_published", "created_at", "updated_at"],
  "league_profiles": ["id", "competition_id", "description", "rules_summary", "history", "profile_url", "visibility", "is_published", "created_at", "updated_at"],
  "achievements": ["id", "name", "description", "icon_url", "category", "criteria_description", "points_reward", "created_at"],
  "user_achievements": ["id", "user_id", "achievement_id", "awarded_at", "notes", "created_at"],
  "badges": ["id", "name", "description", "icon_url", "tier", "created_at"],
  "user_badges": ["id", "user_id", "badge_id", "earned_at", "created_at"],
  "seasonal_awards": ["id", "season_id", "award_name", "category", "person_id", "team_id", "description", "award_order", "created_at", "updated_at"],
  "player_awards": ["id", "season_id", "person_id", "game_id", "award_type", "description", "awarded_at", "created_at"],
  "player_seasons": ["id", "person_id", "season_id", "primary_team_id", "season_role", "created_at", "updated_at"],
  "organization_registrations": ["id", "organization_id", "federation_code", "federation_name", "license_type", "registration_date", "expiry_date", "is_active", "notes", "created_at", "updated_at"],
  "club_licenses": ["id", "club_id", "license_type", "issued_date", "expiry_date", "is_active", "compliance_status", "notes", "created_at", "updated_at"],
  "player_licenses": ["id", "person_id", "knhb_license_number", "license_category", "issued_date", "expiry_date", "is_active", "notes", "created_at", "updated_at"]
};
