export const generateGasCodeSnippet = (token: string) => `function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ============================================================================
  // DYNAMIC SCHEMA GENERATION (Merged from Google Sheet Tabs)
  // ============================================================================
  const enumLookups = {
    // Identity & Roles
    "user_role": ["admin", "league_manager", "team_manager", "coach", "player", "fan", "retailer", "sponsor"],
    "job_type": ["head_coach", "assistant_coach", "goalie_coach", "general_manager", "assistant_gm", "trainer", "physiotherapist", "scout"],
    "official_role": ["referee", "linesman", "timekeeper", "bench_official", "authorized_official"],

    // Competition & Seasons
    "competition_type": ["league", "tournament", "cup", "friendly_matches"],
    "tier_type": ["E", "P", "SP", "A", "R", "Y"],
    "season_phase_type": ["preseason", "regular", "playoff", "offseason"],
    "draft_status": ["upcoming", "in_progress", "completed"],

    // Teams & Rosters
    "roster_status": ["open", "closed", "locked"],
    "player_status": ["active", "injured", "suspended", "inactive", "retired", "on_loan"],
    "season_role": ["primary", "backup", "call_up", "loan"],
    "special_team_type": ["power_play", "penalty_kill", "even_strength"],

    // Games & Events
    "event_type": ["game", "practice", "scrimmage", "training", "friendly_match"],
    "game_status": ["scheduled", "in_progress", "pre_game", "completed", "postponed", "cancelled"],
    "rsvp_status": ["accepted", "declined", "tentative", "not_responded"],
    "trigger_event_type": [
      "goal_even_strength", "goal_penalty_shot", "goal_power_play_5v4", "goal_power_play_5v3",
      "goal_shorthanded_4v5", "goal_shorthanded_3v5", "goal_empty_net", "shootout_goal",
      "shootout_miss", "shot_on_goal", "penalty", "faceoff_won", "period_end", "period_start",
      "game_start", "game_end", "offside", "icing", "timeout", "official_challenge",
      "boarding_call", "other"
    ],

    // Player Equipment & Details
    "equipment_type": ["stick", "skates", "helmet", "gloves", "pads", "jersey", "socks", "tape", "other"],
    "stick_handedness": ["left", "right"],
    "handedness": ["left", "right"],

    // Commercial & Ecosystem
    "sponsorship_level": ["gold", "silver", "bronze"],
    "license_category": ["professional", "semi_pro", "recreational", "woman", "youth"],
    "compliance_status": ["compliant", "pending_review", "non_compliant"],

    // Profiles & Gamification
    "visibility": ["public", "private", "unlisted"],
    "achievement_category": ["scoring", "goaltending", "teamwork", "sportsmanship", "milestone", "seasonal_award"]
  };

  const dbSchema = {
    // --- Identity & Roles ---
    "users": ["id", "username", "email", "password_hash", "role", "display_name", "avatar_url", "bio", "active_from", "active_to", "created_at", "updated_at"],
    "persons": ["id", "person_code", "first_name", "last_name", "date_of_birth", "nationality", "height_cm", "weight_kg", "jersey_number", "plays_position", "photo_url", "bio", "created_at", "updated_at"],
    "jobs": ["id", "person_id", "job_type", "organization_id", "start_date", "end_date", "is_active", "created_at"],
    "players": ["id", "person_id", "handedness", "primary_position", "secondary_position", "active_from", "active_to", "created_at", "updated_at"],

    // --- Ecosystem ---
    "organizations": ["id", "name", "country", "founded_year", "logo_url", "website", "description", "active_from", "active_to", "created_at", "updated_at"],
    "clubs": ["id", "organization_id", "name", "city", "country", "founded_year", "logo_url", "home_venue_id", "description", "active_from", "active_to", "created_at", "updated_at"],
    "venues": ["id", "name", "city", "country", "capacity", "address", "website", "phone", "created_at", "updated_at"],
    "organization_registrations": ["id", "organization_id", "federation_code", "federation_name", "license_type", "registration_date", "expiry_date", "is_active", "notes", "created_at", "updated_at"],
    "club_licenses": ["id", "club_id", "license_type", "issued_date", "expiry_date", "is_active", "compliance_status", "notes", "created_at", "updated_at"],
    "player_licenses": ["id", "person_id", "knhb_license_number", "license_category", "issued_date", "expiry_date", "is_active", "notes", "created_at", "updated_at"],

    // --- Competition & Seasons ---
    "tiers": ["id", "organization_id", "name", "tier_type", "level_rank", "parent_tier_id", "created_at", "updated_at"],
    "competitions": ["id", "organization_id", "competition_code", "name", "competition_type", "tier_id", "start_date", "end_date", "description", "created_at", "updated_at"],
    "seasons": ["id", "competition_id", "year", "start_date", "end_date", "created_at"],
    "season_phases": ["id", "season_id", "phase_type", "start_date", "end_date", "description", "created_at"],
    "playoff_brackets": ["id", "season_id", "name", "round_number", "created_at"],
    "bracket_matchups": ["id", "bracket_id", "home_team_id", "away_team_id", "series_game_number", "winner_team_id", "created_at"],
    "player_drafts": ["id", "season_id", "competition_id", "status", "draft_date", "notes", "created_at", "updated_at"],
    "draft_picks": ["id", "draft_id", "pick_order", "team_id", "person_id", "round_number", "notes", "created_at"],

    // --- Teams & Rosters ---
    "teams": ["id", "club_id", "competition_id", "team_code", "name", "tier_id", "coach_id", "general_manager_id", "founded_year", "logo_url", "primary_color", "secondary_color", "description", "active_from", "active_to", "created_at", "updated_at"],
    "rosters": ["id", "team_id", "season_id", "roster_name", "roster_status", "created_at", "updated_at"],
    "roster_members": ["id", "roster_id", "person_id", "person_full_name", "jersey_number", "position", "status", "joined_at", "left_at", "created_at"],
    "player_seasons": ["id", "person_id", "season_id", "primary_team_id", "season_role", "created_at", "updated_at"],
    "free_agents": ["id", "person_id", "season_id", "status", "previous_team_id", "previous_aav", "years_of_experience", "is_signed", "signed_team_id", "signed_aav", "available_from", "available_to", "asking_price_lower", "asking_price_upper", "notes", "created_at", "updated_at"],
    "lineups": ["id", "game_id", "team_id", "lineup_name", "created_at"],
    "lineup_slots": ["id", "lineup_id", "person_id", "line_number", "position", "created_at"],
    "special_teams": ["id", "team_id", "season_id", "special_team_type", "name", "active_from", "active_to", "created_at"],
    "special_team_members": ["id", "special_team_id", "person_id", "line_number", "position", "created_at"],

    // --- Games & Events ---
    "events": ["id", "team_id", "event_type", "scheduled_at", "venue_id", "notes", "created_at", "updated_at"],
    "event_rsvps": ["id", "event_id", "person_id", "rsvp_status", "responded_at", "created_at"],
    "games": ["id", "season_id", "home_team_id", "away_team_id", "venue_id", "scheduled_at", "started_at", "ended_at", "home_score", "away_score", "status", "attendance", "notes", "created_at", "updated_at"],
    "game_officials": ["id", "game_id", "person_id", "official_role", "active_from", "active_to", "created_at"],
    "penalty_types": ["id", "name", "is_active", "default_duration_minutes", "description", "created_at"],
    "game_events": ["id", "game_id", "period", "time_elapsed", "time_left", "trigger_event_type", "trigger_team_id", "trigger_player_id", "first_assist_player_id", "second_assist_player_id", "penalty_type_id", "penalty_duration", "x_coordinate", "y_coordinate", "play_stoppage", "play_resumes", "description", "authorized_by", "created_at", "updated_at"],

    // --- Stats ---
    "player_stats": ["id", "season_id", "person_id", "team_id", "person_full_name", "team_name", "games_played", "goals", "assists", "points", "plus_minus", "penalties_in_minutes", "shots", "hits", "blocks", "created_at", "updated_at"],
    "goalie_stats": ["id", "season_id", "person_id", "team_id", "person_full_name", "team_name", "games_played", "wins", "losses", "ties", "goals_against", "saves", "shots_against", "shutouts", "save_percentage", "goals_against_average", "created_at", "updated_at"],
    "team_stats": ["id", "season_id", "team_id", "games_played", "wins", "losses", "ties", "goals_for", "goals_against", "created_at", "updated_at"],
    "standings": ["id", "season_id", "tier_id", "team_id", "games_played", "wins", "losses", "ties", "points", "position", "updated_at"],

    // --- Commercial & Equipment ---
    "brands": ["id", "name", "country", "logo_url", "website", "description", "created_at"],
    "retailers": ["id", "name", "website", "email", "phone", "country", "created_at"],
    "sponsors": ["id", "name", "logo_url", "website", "email", "contact_person", "created_at", "updated_at"],
    "team_sponsors": ["id", "team_id", "sponsor_id", "season_id", "sponsorship_level", "amount_usd", "started_at", "ended_at", "created_at"],
    "player_equipment": ["id", "person_id", "equipment_type", "brand_id", "serial_number", "purchase_date", "active_from", "active_to", "condition", "notes", "created_at", "updated_at"],
    "sticks": ["id", "person_id", "player_profile_id", "brand_id", "model", "handedness", "flex_rating", "curve_type", "length_inches", "material", "purchase_date", "active_from", "active_to", "notes", "created_at", "updated_at"],

    // --- Profiles & Gamification ---
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
    "settings": ["SettingName", "SettingValue"]
  };

  for (const sheetName in dbSchema) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(dbSchema[sheetName]);
      sheet.getRange(1, 1, 1, dbSchema[sheetName].length).setFontWeight("bold");
    } else {
      // If the sheet already exists, we could check if columns match, but for now we leave existing code
      // We don't remove existing code, just merge in missing ones.
    }
  }

  for (const enumName in enumLookups) {
    const sheetName = "enum_" + enumName;
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["Value"]);
      sheet.getRange(1, 1, 1, 1).setFontWeight("bold");
      const values = enumLookups[enumName];
      values.forEach(val => sheet.appendRow([val]));
    }
  }
}

function calculateStandingsAndStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const gamesSheet = ss.getSheetByName("games");
  const eventsSheet = ss.getSheetByName("game_events");
  const teamsSheet = ss.getSheetByName("teams");

  let standingsSheet = ss.getSheetByName("standings");
  if (!standingsSheet) {
    standingsSheet = ss.insertSheet("standings");
    standingsSheet.appendRow(dbSchema["standings"]);
    standingsSheet.getRange(1, 1, 1, dbSchema["standings"].length).setFontWeight("bold");
  }

  let statsSheet = ss.getSheetByName("player_stats");
  if (!statsSheet) {
    statsSheet = ss.insertSheet("player_stats");
    statsSheet.appendRow(dbSchema["player_stats"]);
    statsSheet.getRange(1, 1, 1, dbSchema["player_stats"].length).setFontWeight("bold");
  }

  if (!gamesSheet || !eventsSheet) return;

  const gamesData = gamesSheet.getDataRange().getValues();
  const eventsData = eventsSheet.getDataRange().getValues();
  const teamsData = teamsSheet ? teamsSheet.getDataRange().getValues() : [];

  if (gamesData.length <= 1) return;

  // Build team tier mapping
  const teamTiers = {};
  if (teamsData.length > 1) {
    const tHeaders = teamsData[0];
    const idIdx = tHeaders.indexOf('id');
    const tierIdx = tHeaders.indexOf('tier_id');
    if (idIdx > -1 && tierIdx > -1) {
      for (let i = 1; i < teamsData.length; i++) {
        teamTiers[teamsData[i][idIdx]] = teamsData[i][tierIdx];
      }
    }
  }

  const gHeaders = gamesData[0];
  const gIdIdx = gHeaders.indexOf('id');
  const gHomeTeamIdx = gHeaders.indexOf('home_team_id');
  const gAwayTeamIdx = gHeaders.indexOf('away_team_id');
  const gHomeScoreIdx = gHeaders.indexOf('home_score');
  const gAwayScoreIdx = gHeaders.indexOf('away_score');
  const gStatusIdx = gHeaders.indexOf('status');
  const gSeasonIdx = gHeaders.indexOf('season_id');

  // Calculate Standings
  const standings = {};

  for (let i = 1; i < gamesData.length; i++) {
    const row = gamesData[i];
    const gameId = row[gIdIdx];
    const status = row[gStatusIdx];
    if (!gameId || status !== 'completed') continue;

    const homeTeam = row[gHomeTeamIdx];
    const awayTeam = row[gAwayTeamIdx];
    const homeScore = parseInt(row[gHomeScoreIdx]) || 0;
    const awayScore = parseInt(row[gAwayScoreIdx]) || 0;
    const season = row[gSeasonIdx] || 'current';

    const homeTier = teamTiers[homeTeam] || 'All';
    const awayTier = teamTiers[awayTeam] || 'All';

    const homeKey = homeTeam + '|' + season + '|' + homeTier;
    const awayKey = awayTeam + '|' + season + '|' + awayTier;

    if (!standings[homeKey]) standings[homeKey] = { Team: homeTeam, Season: season, Tier: homeTier, GP: 0, W: 0, L: 0, OTL: 0, PTS: 0 };
    if (!standings[awayKey]) standings[awayKey] = { Team: awayTeam, Season: season, Tier: awayTier, GP: 0, W: 0, L: 0, OTL: 0, PTS: 0 };

    standings[homeKey].GP++;
    standings[awayKey].GP++;

    if (homeScore > awayScore) {
      standings[homeKey].W++;
      standings[homeKey].PTS += 2;
      standings[awayKey].L++;
    } else if (awayScore > homeScore) {
      standings[awayKey].W++;
      standings[awayKey].PTS += 2;
      standings[homeKey].L++;
    } else {
      standings[homeKey].OTL++;
      standings[homeKey].PTS += 1;
      standings[awayKey].OTL++;
      standings[awayKey].PTS += 1;
    }
  }

  standingsSheet.getRange(2, 1, Math.max(1, standingsSheet.getLastRow() - 1), dbSchema["standings"].length).clearContent();
  const newStandingsArray = Object.keys(standings).map(key => {
    const s = standings[key];
    return [
      Utilities.getUuid(), // id
      s.Season, // season_id
      s.Tier, // tier_id
      s.Team, // team_id
      s.GP, // games_played
      s.W, // wins
      s.L, // losses
      s.OTL, // ties
      s.PTS, // points
      0, // position
      new Date().toISOString() // updated_at
    ];
  });

  newStandingsArray.sort((a, b) => b[8] - a[8]);
  newStandingsArray.forEach((row, idx) => {
    row[9] = idx + 1; // Set position
  });

  if (newStandingsArray.length > 0) {
    standingsSheet.getRange(2, 1, newStandingsArray.length, dbSchema["standings"].length).setValues(newStandingsArray);
  }

  // Calculate Player Stats
  const stats = {};
  const playerTeams = {};
  const gamesPlayedByTeam = {};

  for (let key in standings) {
    gamesPlayedByTeam[standings[key].Team] = standings[key].GP;
  }

  if (eventsData.length > 1) {
    const eHeaders = eventsData[0];
    const eTypeIdx = eHeaders.indexOf('trigger_event_type');
    const eTeamIdx = eHeaders.indexOf('trigger_team_id');
    const ePlayerIdx = eHeaders.indexOf('trigger_player_id');
    const eAssist1Idx = eHeaders.indexOf('first_assist_player_id');
    const eAssist2Idx = eHeaders.indexOf('second_assist_player_id');
    const ePenaltyDurIdx = eHeaders.indexOf('penalty_duration');

    for (let i = 1; i < eventsData.length; i++) {
      const row = eventsData[i];
      const eventType = row[eTypeIdx];
      const team = row[eTeamIdx];
      const player = row[ePlayerIdx];
      const assist1 = row[eAssist1Idx];
      const assist2 = row[eAssist2Idx];
      const penaltyMinutes = parseInt(row[ePenaltyDurIdx]) || 0;

      if (!player || player === 'Speler') continue;

      if (!stats[player]) {
        stats[player] = { G: 0, A: 0, PTS: 0, PIM: 0 };
      }
      playerTeams[player] = team;

      if (eventType === 'goal') {
        stats[player].G++;
        stats[player].PTS++;

        if (assist1 && assist1 !== 'Speler') {
          if (!stats[assist1]) stats[assist1] = { G: 0, A: 0, PTS: 0, PIM: 0 };
          stats[assist1].A++;
          stats[assist1].PTS++;
          playerTeams[assist1] = team;
        }
        if (assist2 && assist2 !== 'Speler') {
          if (!stats[assist2]) stats[assist2] = { G: 0, A: 0, PTS: 0, PIM: 0 };
          stats[assist2].A++;
          stats[assist2].PTS++;
          playerTeams[assist2] = team;
        }
      } else if (eventType === 'penalty') {
        stats[player].PIM += penaltyMinutes;
      }
    }
  }

  statsSheet.getRange(2, 1, Math.max(1, statsSheet.getLastRow() - 1), dbSchema["player_stats"].length).clearContent();
  const newStatsArray = Object.keys(stats).map(player => {
    const s = stats[player];
    const team = playerTeams[player] || '';
    const gp = gamesPlayedByTeam[team] || 0;
    return [
      Utilities.getUuid(), // id
      "current", // season_id
      "", // person_id
      team, // team_id
      player, // person_full_name
      team, // team_name
      gp, // games_played
      s.G, // goals
      s.A, // assists
      s.PTS, // points
      0, // plus_minus
      s.PIM, // penalties_in_minutes
      0, // shots
      0, // hits
      0, // blocks
      new Date().toISOString(), // created_at
      new Date().toISOString() // updated_at
    ];
  });

  newStatsArray.sort((a, b) => b[9] - a[9] || b[7] - a[7]);
  if (newStatsArray.length > 0) {
    statsSheet.getRange(2, 1, newStatsArray.length, dbSchema["player_stats"].length).setValues(newStatsArray);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({error: "GET requests are not supported"})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const SECRET_TOKEN = "${token}";
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Parse the data
    const data = JSON.parse(e.postData.contents);

    // Validate token
    if (data.token !== SECRET_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({error: "Unauthorized: Invalid or missing token"})).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'testConnection') {
      return ContentService.createTextOutput(JSON.stringify({status: "Success"})).setMimeType(ContentService.MimeType.JSON);
    }

    // Sanitize input to prevent formula injection
    const sanitizeField = (value) => {
      if (typeof value === 'string' && value.match(/^[=+\-@]/)) {
        return "'" + value;
      }
      return value;
    };

    if (data.action === 'saveEcosystemData') {
      const { sheetName, rowData } = data;
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error("Sheet niet gevonden: " + sheetName);

      if (Array.isArray(rowData)) {
        sheet.appendRow(rowData.map(sanitizeField));
      }
      return ContentService.createTextOutput(JSON.stringify({status: "Success"})).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'getEcosystemData') {
      const { sheetName } = data;
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error("Sheet niet gevonden: " + sheetName);
      const values = sheet.getDataRange().getValues();
      return ContentService.createTextOutput(JSON.stringify({status: "Success", data: values})).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'updateRow') {
      const { sheetName, idColumn, idValue, updateData } = data;
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error("Sheet niet gevonden: " + sheetName);

      const values = sheet.getDataRange().getValues();
      const headers = values[0];
      const idColIndex = headers.indexOf(idColumn);
      if (idColIndex === -1) throw new Error("ID kolom niet gevonden: " + idColumn);

      let rowIndexToUpdate = -1;
      for (let i = 1; i < values.length; i++) {
        if (values[i][idColIndex] === idValue) {
          rowIndexToUpdate = i;
          break;
        }
      }

      if (rowIndexToUpdate === -1) {
        // If not found, optionally append a new row
        const newRow = new Array(headers.length).fill('');
        newRow[idColIndex] = idValue;

        Object.keys(updateData).forEach(key => {
          let colIndex = headers.indexOf(key);
          if (colIndex === -1) {
            colIndex = headers.length;
            headers.push(key);
            sheet.getRange(1, colIndex + 1).setValue(key).setFontWeight("bold");
            newRow.push('');
          }
          newRow[colIndex] = updateData[key];
        });

        sheet.appendRow(newRow.map(sanitizeField));
      } else {
        // Update existing row
        Object.keys(updateData).forEach(key => {
          let colIndex = headers.indexOf(key);
          if (colIndex === -1) {
            colIndex = headers.length;
            headers.push(key);
            sheet.getRange(1, colIndex + 1).setValue(key).setFontWeight("bold");
          }
          // Arrays are 0-indexed, but getRange is 1-indexed. Plus we skip header row.
          // rowIndexToUpdate is 1-based relative to data array (index 1 = row 2)
          sheet.getRange(rowIndexToUpdate + 1, colIndex + 1).setValue(sanitizeField(updateData[key]));
        });
      }

      return ContentService.createTextOutput(JSON.stringify({status: "Success"})).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'getSettings') {
      const sheet = ss.getSheetByName("settings");
      const values = sheet ? sheet.getDataRange().getValues() : [];
      return ContentService.createTextOutput(JSON.stringify({status: "Success", data: values})).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'saveGame') {
      if (data.newSchema) {
        if (data.newSchema.games) {
          let gamesSheet = ss.getSheetByName("games");
          if (!gamesSheet) {
             gamesSheet = ss.insertSheet("games");
             gamesSheet.appendRow(dbSchema["games"]);
             gamesSheet.getRange(1, 1, 1, dbSchema["games"].length).setFontWeight("bold");
          }
          const headers = dbSchema["games"];

          const gamesData = gamesSheet.getDataRange().getValues();
          const sheetHeaders = gamesData[0] || headers;
          const idIdx = sheetHeaders.indexOf('id');

          data.newSchema.games.forEach(g => {
            const gameId = g['id'];
            let rowIndex = -1;

            if (idIdx !== -1 && gameId) {
              for (let i = 1; i < gamesData.length; i++) {
                if (gamesData[i][idIdx] === gameId) {
                  rowIndex = i;
                  break;
                }
              }
            }

            if (rowIndex !== -1) {
              // Update existing row
              sheetHeaders.forEach((h, colIndex) => {
                if (g[h] !== undefined) {
                  gamesSheet.getRange(rowIndex + 1, colIndex + 1).setValue(sanitizeField(g[h]));
                }
              });
            } else {
              // Append new row
              const row = headers.map(h => sanitizeField(g[h] || ''));
              gamesSheet.appendRow(row);
            }
          });
        }
        if (data.newSchema.game_events) {
          let eventsSheet = ss.getSheetByName("game_events");
          if (!eventsSheet) {
             eventsSheet = ss.insertSheet("game_events");
             eventsSheet.appendRow(dbSchema["game_events"]);
             eventsSheet.getRange(1, 1, 1, dbSchema["game_events"].length).setFontWeight("bold");
          }
          const headers = dbSchema["game_events"];
          data.newSchema.game_events.forEach(e => {
            const row = headers.map(h => sanitizeField(e[h] || ''));
            eventsSheet.appendRow(row);
          });
        }
      }

      // Automatically recalculate stats and standings after saving a game
      calculateStandingsAndStats();

      return ContentService.createTextOutput(JSON.stringify({status: "Success"})).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({error: "No valid action found"})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.message})).setMimeType(ContentService.MimeType.JSON);
  }
}
`;
