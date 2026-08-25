# Ice Hockey Ecosystem Manager: Roadmap

This document provides detailed instructions for AI agents and developers to build a comprehensive Ice Hockey Ecosystem Manager application. It must be built on top of the existing React + Vite + TypeScript frontend and the Google Sheets + Google Apps Script (GAS) backend architecture.

**CRITICAL DIRECTIVE:** The core Scorekeeper application must remain perfectly functional at all times. Do not break or remove existing features. Expanding features and adding tables/enums is encouraged, but the core architecture must be preserved.

---

## Phase 1: Foundational Ecosystem Entities
**Goal:** Establish the high-level structural hierarchy of the hockey ecosystem (Organizations, Leagues, Seasons, Clubs, Venues).

### 1.1 Database Expansion (Google Sheets)
- **Organizations & Leagues:** Create `Organizations` and `Leagues` sheets. A League belongs to an Organization.
- **Divisions:** Create a `Divisions` sheet. A Division belongs to a League.
- **Seasons & Phases:** Create a `Seasons` sheet (e.g., "2024-2025") and a `SeasonPhases` lookup enum (Pre-season, Regular Season, Friendlies, Playoffs).
- **Clubs & Venues:** Create `Clubs` (franchises) and `Venues` (rinks, arenas) sheets.

### 1.2 Backend (GAS)
- Add functions to handle CRUD operations for all Phase 1 sheets.
- Ensure all incoming string data is prefixed with a single quote (`'`) to prevent Formula/CSV injection.
- Ensure the client-side `GAS_TOKEN` validation is applied to new endpoints.

### 1.3 Frontend
- Add a new "Ecosystem Administration" section in the Main Menu (restricted by role later).
- Create UI screens to view, add, and edit Organizations, Leagues, Divisions, Seasons, Clubs, and Venues.

---

## Phase 2: Identity, Roles, and People
**Goal:** Implement a robust identity system encompassing Users, Persons, and their specialized roles (Players, Managers, etc.).

### 2.1 Database Expansion (Google Sheets)
- **Users & Roles:** Expand the existing auth model. Create a `Users` sheet (Email, Password Hash, Base Role) and a `UserRoles` enum (Admin, Manager, Player, Fan).
- **Persons:** Create a `Persons` sheet linked to a User ID. Include fields for names, birthdates, and contact info.
- **Jobs & Personas:** Create mapping sheets for Jobs (e.g., `PersonJobs` linking a Person to a Club as a Manager/Coach) and Player Profiles (`PlayerProfiles` linking Person to height, weight, handedness).
- **Equipment:** Create a `PlayerEquipment` sheet to track the gear preferred/used by specific players.

### 2.2 Backend (GAS)
- Enhance the authentication webhook to return User Roles and linked Person IDs.
- Create endpoints for managing Persons, their profiles, and their associated jobs.

### 2.3 Frontend
- Update `LoginScreen.tsx` to handle role-based redirection and store the logged-in User/Person context.
- Build "My Profile" screens for Persons to manage their details, jobs, and equipment.
- Create global directories (e.g., "People Directory") with filtering by job or role.

---

## Phase 3: Teams, Rosters, and Free Agency
**Goal:** Group Players into Teams and handle player movement (Rosters, Farm Teams, Free Agency).

### 3.1 Database Expansion (Google Sheets)
- **Teams:** Create a `Teams` sheet. A Team belongs to a Club, a Division, and a Season. Add a field for `ParentTeamID` to support farm-team capabilities.
- **Rosters:** Create a `Rosters` sheet linking a `PersonID` (Player) to a `TeamID` for a specific `SeasonID`.
- **Free Agency:** Create a system (or specific status column in `PlayerProfiles`) to identify players who are not currently on an active roster.

### 3.2 Backend (GAS)
- Build endpoints to query teams by Season/Club/Division.
- Build endpoints to fetch active Rosters for a given team, and to fetch all Free Agents.
- Ensure robust constraints (e.g., moving a player from Free Agency to a Roster).

### 3.3 Frontend
- Build Team Profile pages showing associated Rosters.
- Build a "Roster Builder" UI for Team Managers.
- Build a "Free Agency Market" UI to browse available players.

---

## Phase 4: Scheduling, Events, and Lineups
**Goal:** Handle the calendar, game scheduling, practice events, RSVPs, and specific game-day Lineups.

### 4.1 Database Expansion (Google Sheets)
- **Events (Games/Practices):** Create an `Events` sheet. Link to `VenueID`, `SeasonID`, `PhaseID`, and `EventType` (Game, Practice, Event). For games, track `HomeTeamID`, `AwayTeamID`, and `TournamentMode` flags.
- **RSVPs:** Create an `RSVPs` sheet linking `EventID`, `PersonID`, and `Status` (Attending, Not Attending, Maybe).
- **Lineups & Special Teams:** Create a `Lineups` sheet linking `EventID`, `PersonID`, `TeamID`, and `UnitType` (Even Strength, PK1, PK2, PP1, PP2, Starting Goalie, Backup Goalie).

### 4.2 Backend (GAS)
- Create endpoints to fetch calendars (Events) by Team, Club, or User (based on their Rosters).
- Create RSVP submission and Lineup management endpoints.

### 4.3 Frontend
- Build an interactive Calendar UI.
- Build an RSVP toggle interface for Players on their dashboard.
- Build a "Lineup Builder" UI for Coaches/Managers to set game-day lines (including PP/PK units).

---

## Phase 5: Scorekeeper Integration (Bridging to Core App)
**Goal:** Connect the existing Live Game Scorekeeper to the scheduled Events and Lineups without breaking its standalone capabilities.

### 5.1 Database Expansion
- Add an optional `EventID` column to the existing Scorekeeper data tables (e.g., Game Settings or Game Logs) to tie a live scored game to a scheduled Event.

### 5.2 Backend & Frontend Alignment
- **Pre-game Selection:** In `SettingsScreen.tsx` or a new pre-game screen, allow the Scorekeeper to either "Start a Custom Game" (existing flow) or "Select a Scheduled Game".
- If a scheduled game is selected, automatically populate the `Home Team` and `Away Team` rosters based on the `Lineups` defined in Phase 4.
- Ensure the existing Action Logs correctly attach to the `EventID` so stats can be aggregated properly.
- **Verification:** Mock settings contracts and test play/pause and action logging thoroughly to ensure the core scorekeeper remains 100% operational.

---

## Phase 6: Statistics, Standings, and Draft Mode
**Goal:** Calculate comprehensive analytics from live game data, handle league standings, and implement draft logistics.

### 6.1 Database Expansion (Google Sheets)
- **Drafts:** Create `DraftPicks` (TeamID, OriginalTeamID, Year, Round, PickNumber, PersonID selected) to handle player draft mode.
- **Stats:** Define specific Sheets or GAS-calculated aggregations for Player Statistics, Goalie Statistics, and Team Statistics.

### 6.2 Backend (GAS)
- Implement heavy-lifting algorithms in GAS to calculate Standings (Points, ROW, Goal Differential) based on game results tied to `Events`.
- Calculate Player/Goalie stats by iterating through the Action Logs.

### 6.3 Frontend
- Build Standings tables and Statistics Leaderboards.
- Build a "Draft Mode" UI where administrators can execute drafts, allowing teams to pick players from a draft pool (Free Agency).

---

## Phase 7: Commercial Ecosystem and Gamification
**Goal:** Add sponsors, brands, equipment logic, and achievements to complete the ecosystem.

### 7.1 Database Expansion (Google Sheets)
- **Commercial:** Create `Retailers`, `Brands`, and `Sponsors` sheets.
- **Sponsorship Mappings:** Map Sponsors to Leagues, Clubs, or Tournaments.
- **Achievements/Awards:** Create `Awards` (e.g., MVP, Vezina equivalent) and `Achievements` (e.g., 100 Career Goals badge). Create a mapping table to link these to `PersonID`.

### 7.2 Backend (GAS)
- Endpoints to retrieve Sponsor data and associated Badges/Awards for Player Profiles.

### 7.3 Frontend
- Integrate Sponsor logos dynamically across the app (e.g., on Team Profiles or in the Live Scorekeeper UI).
- Enhance the Player Profile screen to display earned Badges, Awards, and selected Brands/Retailers for their equipment.

---

## Implementation Guidelines for AI Agents
1. **Iterative PRs:** Implement one phase (or a sub-section of a phase) at a time.
2. **Verify Always:** Use `read_file` to confirm code writes and `npm run test` after every substantial modification.
3. **Keep the Core Intact:** The Scorekeeper functionality must never break. Use existing utility patterns (like `getGasUrl` and `vi.mock` for testing).
4. **Environment Safety:** Do not expose `ADMIN_EMAIL` and `ADMIN_PASSWORD` to the frontend bundle; use standard `VITE_` variables only for safe public configuration.
5. **No Data Loss:** Remember that local storage is a fallback. New features must respect this by either using local storage correctly or cleanly bypassing it for fully server-driven views.
