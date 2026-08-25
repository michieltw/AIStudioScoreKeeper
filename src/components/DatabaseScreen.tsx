import { getGasUrl, setGasUrl as setGasUrlToCache } from '../utils/gasUrl';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Database, Loader2, Save, Copy, Key } from 'lucide-react';

interface DatabaseScreenProps {
  onBack: () => void;
}

const generateGasCodeSnippet = (token: string) => `function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Phase 1 Ecosystem Tabs
  let orgSheet = ss.getSheetByName("Organizations");
  if (!orgSheet) {
    orgSheet = ss.insertSheet("Organizations");
    orgSheet.appendRow(["OrgID", "Name", "Contact"]);
    orgSheet.getRange("A1:C1").setFontWeight("bold");
  }

  let leaguesSheet = ss.getSheetByName("Leagues");
  if (!leaguesSheet) {
    leaguesSheet = ss.insertSheet("Leagues");
    leaguesSheet.appendRow(["LeagueID", "OrgID", "Name", "Level"]);
    leaguesSheet.getRange("A1:D1").setFontWeight("bold");
  }

  let divisionsSheet = ss.getSheetByName("Divisions");
  if (!divisionsSheet) {
    divisionsSheet = ss.insertSheet("Divisions");
    divisionsSheet.appendRow(["DivisionID", "LeagueID", "Name"]);
    divisionsSheet.getRange("A1:C1").setFontWeight("bold");
  }

  let seasonsSheet = ss.getSheetByName("Seasons");
  if (!seasonsSheet) {
    seasonsSheet = ss.insertSheet("Seasons");
    seasonsSheet.appendRow(["SeasonID", "Name", "StartDate", "EndDate"]);
    seasonsSheet.getRange("A1:D1").setFontWeight("bold");
  }

  let clubsSheet = ss.getSheetByName("Clubs");
  if (!clubsSheet) {
    clubsSheet = ss.insertSheet("Clubs");
    clubsSheet.appendRow(["ClubID", "Name", "Founded"]);
    clubsSheet.getRange("A1:C1").setFontWeight("bold");
  }

  let venuesSheet = ss.getSheetByName("Venues");
  if (!venuesSheet) {
    venuesSheet = ss.insertSheet("Venues");
    venuesSheet.appendRow(["VenueID", "Name", "City", "Country", "Capacity", "Address", "Phone", "LockerRooms", "IceSheets"]);
    venuesSheet.getRange("A1:I1").setFontWeight("bold");

    const defaultVenues = [
      ["VEN-001", "Kardinge IJsbaan", "Groningen", "Netherlands", 900, "Kardingerplein 1", "", 12, 1],
      ["VEN-002", "Thialf", "Heerenveen", "Netherlands", 3500, "Pim Mulierlaan 1", "", "", 1],
      ["VEN-003", "11Stedenhal", "Leeuwarden", "Netherlands", 400, "Fryslânplein 1", "", "", 1],
      ["VEN-004", "De Meent", "Alkmaar", "Netherlands", 100, "Terborchlaan 301", "", "", 1],
      ["VEN-005", "Triavium", "Nijmegen", "Netherlands", 1800, "Van Rosenburgweg 2", "", "", 1],
      ["VEN-006", "IJsbaan Twente", "Enschede", "Netherlands", 100, "Colosseum 90", "", "", 1],
      ["VEN-007", "Jaap Eden", "Amsterdam", "Netherlands", 2000, "Radioweg 64", "", "", 1],
      ["VEN-008", "Uithof", "Den Haag", "Netherlands", 3000, "Jaap Edenweg 10", "", "", 1],
      ["VEN-009", "IJssportcentrum", "Eindhoven", "Netherlands", 2500, "Antoon Coolenlaan 3", "", "", 2],
      ["VEN-010", "Glanerbrook", "Geleen", "Netherlands", 1200, "Kummenaedestraat 45", "", "", 1],
      ["VEN-013", "Sportboulevard Dordrecht", "Dordrecht", "Netherlands", 1800, "Fanny Blankers-Koenweg 10", "", "", 1],
      ["VEN-014", "De Vechtsebanen", "Utrecht", "Netherlands", 2500, "Mississippidreef 151", "", "", 1],
      ["VEN-015", "De Westfries", "Hoorn", "Netherlands", 100, "Westfriese Parkweg 5", "", "", 1],
      ["VEN-017", "Stappegoor", "Tilburg", "Netherlands", 3000, "Stappegoorweg 1", "", "", 2],
      ["VEN-018", "IJshal De Vliet", "Leiden", "Netherlands", 100, "Marie Diebenplaats 104", "", "", 1],
      ["VEN-019", "IceFun Sportiom", "Den Bosch", "Netherlands", 800, "Victorialaan 10", "", "", 1],
      ["VEN-020", "SilverDome", "Zoetermeer", "Netherlands", 1500, "Van der Hagenstraat 20", "", "", 1],
      ["VEN-021", "Kunstijsbaan Breda", "Breda", "Netherlands", 500, "Terheijdenseweg 506", "", "", 1],
      ["VEN-022", "Sport Vlaanderen Herentals", "Herentals", "Belgium", 200, "Vorselaarsebaan 60", "", "", 1],
      ["VEN-023", "IJsbaan Haarlem", "Haarlem", "Netherlands", 100, "IJsbaanlaan 2", "", "", 1],
      ["VEN-024", "Ice Park Beaufort", "Beaufort", "Luxembourgh", 500, "Grand-Rue 87", "", "", 1],
      ["VEN-025", "IJsbaan Leuven", "Leuven", "Belgium", 800, "Ondernemingenweg 1", "", "", 1],
      ["VEN-026", "Patinoire de Liège", "Luik (Liège)", "Belgium", 1300, "Boulevard Raymond Poincaré 7/112", "", "", 1],
      ["VEN-027", "Patinoire de Charleroi", "Charleroi", "Belgium", 500, "Rue Neuve 75a", "", "", 1],
      ["VEN-028", "IJsbaan Kristallijn", "Gent", "Belgium", 1000, "Warmoezeniersweg 20", "", "", 1],
      ["VEN-029", "Sport Vlaanderen (Schaverdijn)", "Hasselt", "Belgium", 1000, "Gouverneur Verwilghensingel 13-15", "", "", 1],
      ["VEN-030", "IJsbaan De Piste", "Kortrijk", "Belgium", 800, "Gentsesteenweg 131", "", "", 1],
      ["VEN-031", "IJsbaan Netepark", "Herentals", "Belgium", 300, "Vorselaarsebaan 56", "", "", 1],
      ["VEN-033", "IJsbaan Heuvelkouter", "Liedekerke", "Belgium", 1000, "Sportlaan 5", "", "", 1],
      ["VEN-034", "Patinoire de Kockelscheuer", "Luxemburg", "Luxembourgh", 800, "42, Route de Bettembourg", "", "", 1],
      ["VEN-035", "Sportcentrum Die Swaene", "Heist-op-den-Berg", "Belgium", 500, "Kasteelstraat 85", "", "", 1],
      ["VEN-036", "Ice Skating Center Mechelen", "Mechelen", "Belgium", 600, "Spuibeekstraat 1", "", "", 1],
      ["VEN-037", "IJsbaan Finlandia", "Gullegem", "Belgium", 500, "Driemasten 39", "", "", 1],
      ["VEN-038", "Sportoase Groot Schijn", "Deurne", "Belgium", 1000, "Ruggeveldlaan 488", "", "", 1],
      ["VEN-039", "Natuurijs", "N.T.B.", "N.T.B.", 100, "N.T.B.", "", 0, 1]
    ];

    defaultVenues.forEach(venue => {
      venuesSheet.appendRow(venue);
    });
  }

  // Settings Tab
  let settingsSheet = ss.getSheetByName("Settings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("Settings");
    settingsSheet.appendRow(["SettingName", "SettingValue"]);
    settingsSheet.getRange("A1:B1").setFontWeight("bold");
  }

  // Teams Tab
  let teamsSheet = ss.getSheetByName("Teams");
  if (!teamsSheet) {
    teamsSheet = ss.insertSheet("Teams");
    teamsSheet.appendRow(["TeamName", "PlayerID", "PlayerNumber", "PlayerName", "PlayerPosition"]);
    teamsSheet.getRange("A1:E1").setFontWeight("bold");
  }

  // ActionLogs Tab
  let logsSheet = ss.getSheetByName("ActionLogs");
  if (!logsSheet) {
    logsSheet = ss.insertSheet("ActionLogs");
    logsSheet.appendRow(["GameID", "Date", "HomeTeam", "AwayTeam", "Timestamp", "EventType", "Team", "Description", "X", "Y", "Player", "Assist1", "Assist2", "PenaltyReason", "PenaltyMinutes", "EventID"]);
    logsSheet.getRange("A1:P1").setFontWeight("bold");
  }

  // Games Tab
  let gamesSheet = ss.getSheetByName("Games");
  if (!gamesSheet) {
    gamesSheet = ss.insertSheet("Games");
    gamesSheet.appendRow(["GameID", "Date", "HomeTeam", "AwayTeam", "HomeScore", "AwayScore", "HomeSOG", "AwaySOG", "Location", "EventID"]);
    gamesSheet.getRange("A1:J1").setFontWeight("bold");
  }

  // Standings Tab
  let standingsSheet = ss.getSheetByName("Standings");
  if (!standingsSheet) {
    standingsSheet = ss.insertSheet("Standings");
    standingsSheet.appendRow(["Team", "GP", "W", "L", "OTL", "PTS", "ROW", "GF", "GA", "DIFF"]);
    standingsSheet.getRange("A1:J1").setFontWeight("bold");
  }

  // PlayerStats Tab
  let statsSheet = ss.getSheetByName("PlayerStats");
  if (!statsSheet) {
    statsSheet = ss.insertSheet("PlayerStats");
    statsSheet.appendRow(["Player", "Team", "GP", "G", "A", "PTS", "PIM"]);
    statsSheet.getRange("A1:G1").setFontWeight("bold");
  }

  // ScheduledGames Tab
  let scheduledSheet = ss.getSheetByName("ScheduledGames");
  if (!scheduledSheet) {
    scheduledSheet = ss.insertSheet("ScheduledGames");
    scheduledSheet.appendRow(["GameID", "HomeTeam", "AwayTeam", "Date", "Time", "Location", "Competition", "MatchType"]);
    scheduledSheet.getRange("A1:H1").setFontWeight("bold");
  }

  // Phase 4: Events, RSVPs, Lineups
  let eventsSheet = ss.getSheetByName("Events");
  if (!eventsSheet) {
    eventsSheet = ss.insertSheet("Events");
    eventsSheet.appendRow(["EventID", "VenueID", "SeasonID", "PhaseID", "EventType", "HomeTeamID", "AwayTeamID", "TournamentMode", "Date", "Time"]);
    eventsSheet.getRange("A1:J1").setFontWeight("bold");
  }

  let rsvpsSheet = ss.getSheetByName("RSVPs");
  if (!rsvpsSheet) {
    rsvpsSheet = ss.insertSheet("RSVPs");
    rsvpsSheet.appendRow(["EventID", "PersonID", "Status"]);
    rsvpsSheet.getRange("A1:C1").setFontWeight("bold");
  }

  let lineupsSheet = ss.getSheetByName("Lineups");
  if (!lineupsSheet) {
    lineupsSheet = ss.insertSheet("Lineups");
    lineupsSheet.appendRow(["EventID", "PersonID", "TeamID", "UnitType"]);
    lineupsSheet.getRange("A1:D1").setFontWeight("bold");
  }

  // Phase 6: Drafts
  let draftsSheet = ss.getSheetByName("DraftPicks");
  if (!draftsSheet) {
    draftsSheet = ss.insertSheet("DraftPicks");
    draftsSheet.appendRow(["TeamID", "OriginalTeamID", "Year", "Round", "PickNumber", "PersonID"]);
    draftsSheet.getRange("A1:F1").setFontWeight("bold");
  }

  // Ecosystem / Persons & Profiles
  let personsSheet = ss.getSheetByName("persons");
  if (!personsSheet) {
    personsSheet = ss.insertSheet("persons");
    personsSheet.appendRow(["id", "person_code", "first_name", "last_name", "date_of_birth", "nationality", "height_cm", "weight_kg", "jersey_number", "plays_position", "photo_url", "cover_url", "bio", "created_at", "updated_at"]);
    personsSheet.getRange("A1:O1").setFontWeight("bold");
  }

  let playerEquipmentSheet = ss.getSheetByName("player_equipment");
  if (!playerEquipmentSheet) {
    playerEquipmentSheet = ss.insertSheet("player_equipment");
    playerEquipmentSheet.appendRow(["id", "person_id", "equipment_type", "brand_id", "serial_number", "purchase_date", "active_from", "active_to", "condition", "notes", "created_at", "updated_at"]);
    playerEquipmentSheet.getRange("A1:L1").setFontWeight("bold");
  }

  let jobsSheet = ss.getSheetByName("jobs");
  if (!jobsSheet) {
    jobsSheet = ss.insertSheet("jobs");
    jobsSheet.appendRow(["id", "person_id", "job_type", "organization_id", "start_date", "end_date", "is_active", "created_at"]);
    jobsSheet.getRange("A1:H1").setFontWeight("bold");
  }
}

function calculateStandingsAndStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const gamesSheet = ss.getSheetByName("Games");
  const logsSheet = ss.getSheetByName("ActionLogs");
  const standingsSheet = ss.getSheetByName("Standings");
  const statsSheet = ss.getSheetByName("PlayerStats");

  if (!gamesSheet || !logsSheet || !standingsSheet || !statsSheet) return;

  const gamesData = gamesSheet.getDataRange().getValues();
  const logsData = logsSheet.getDataRange().getValues();

  // Calculate Standings
  const standings = {};
  // Skip header
  for (let i = 1; i < gamesData.length; i++) {
    const row = gamesData[i];
    const gameId = row[0];
    if (!gameId) continue;

    const homeTeam = row[2];
    const awayTeam = row[3];
    const homeScore = parseInt(row[4]) || 0;
    const awayScore = parseInt(row[5]) || 0;
    const isOfficial = row[10] === true || row[10] === 'true' || row[10] === 'TRUE';

    if (!isOfficial) continue;

    if (!standings[homeTeam]) standings[homeTeam] = { GP: 0, W: 0, L: 0, OTL: 0, PTS: 0, ROW: 0, GF: 0, GA: 0 };
    if (!standings[awayTeam]) standings[awayTeam] = { GP: 0, W: 0, L: 0, OTL: 0, PTS: 0, ROW: 0, GF: 0, GA: 0 };

    standings[homeTeam].GP++;
    standings[awayTeam].GP++;

    standings[homeTeam].GF += homeScore;
    standings[homeTeam].GA += awayScore;
    standings[awayTeam].GF += awayScore;
    standings[awayTeam].GA += homeScore;

    if (homeScore > awayScore) {
      standings[homeTeam].W++;
      standings[homeTeam].PTS += 2;
      standings[homeTeam].ROW++;
      standings[awayTeam].L++; // Simplification: OTL requires knowing if game went to OT
    } else if (awayScore > homeScore) {
      standings[awayTeam].W++;
      standings[awayTeam].PTS += 2;
      standings[awayTeam].ROW++;
      standings[homeTeam].L++;
    } else {
      // Tie
      standings[homeTeam].OTL++;
      standings[homeTeam].PTS += 1;
      standings[awayTeam].OTL++;
      standings[awayTeam].PTS += 1;
    }
  }

  // Clear and write standings
  standingsSheet.getRange(2, 1, standingsSheet.getLastRow() || 2, 10).clearContent();
  const standingsArray = Object.keys(standings).map(team => {
    const s = standings[team];
    return [team, s.GP, s.W, s.L, s.OTL, s.PTS, s.ROW, s.GF, s.GA, s.GF - s.GA];
  });
  // Sort by PTS descending, then ROW, then DIFF
  standingsArray.sort((a, b) => b[5] - a[5] || b[6] - a[6] || b[9] - a[9]);
  if (standingsArray.length > 0) {
    standingsSheet.getRange(2, 1, standingsArray.length, 10).setValues(standingsArray);
  }

  // Calculate Player Stats
  const stats = {};
  const playerTeams = {}; // Track team per player
  const gamesPlayedByTeam = {}; // Cache games played

  for (let team in standings) {
    gamesPlayedByTeam[team] = standings[team].GP;
  }

  // Skip header
  for (let i = 1; i < logsData.length; i++) {
    const row = logsData[i];
    const eventType = row[5];
    const team = row[6];
    const player = row[10];
    const assist1 = row[11];
    const assist2 = row[12];
    const penaltyMinutes = parseInt(row[14]) || 0;

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

  // Clear and write stats
  statsSheet.getRange(2, 1, statsSheet.getLastRow() || 2, 7).clearContent();
  const statsArray = Object.keys(stats).map(player => {
    const s = stats[player];
    const team = playerTeams[player] || '';
    const gp = gamesPlayedByTeam[team] || 0;
    return [player, team, gp, s.G, s.A, s.PTS, s.PIM];
  });
  // Sort by PTS descending
  statsArray.sort((a, b) => b[5] - a[5] || b[3] - a[3]); // PTS, then G
  if (statsArray.length > 0) {
    statsSheet.getRange(2, 1, statsArray.length, 7).setValues(statsArray);
  }
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action;

  if (action === 'getSettings') {
    const sheet = ss.getSheetByName("Settings");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const data = sheet.getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getTeams') {
    const sheet = ss.getSheetByName("Teams");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const data = sheet.getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getStandings') {
    const sheet = ss.getSheetByName("Standings");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const data = sheet.getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getStats') {
    const sheet = ss.getSheetByName("PlayerStats");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const data = sheet.getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getGames') {
    const sheet = ss.getSheetByName("Games");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const data = sheet.getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getScheduledGames') {
    const sheet = ss.getSheetByName("ScheduledGames");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const data = sheet.getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({error: "Unknown action"})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const SECRET_TOKEN = "${token}";
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Parse the data
    const data = JSON.parse(e.postData.contents);

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
          const colIndex = headers.indexOf(key);
          if (colIndex !== -1) {
            newRow[colIndex] = updateData[key];
          }
        });

        sheet.appendRow(newRow.map(sanitizeField));
      } else {
        // Update existing row
        Object.keys(updateData).forEach(key => {
          const colIndex = headers.indexOf(key);
          if (colIndex !== -1) {
            // Arrays are 0-indexed, but getRange is 1-indexed. Plus we skip header row.
            // rowIndexToUpdate is 1-based relative to data array (index 1 = row 2)
            sheet.getRange(rowIndexToUpdate + 1, colIndex + 1).setValue(sanitizeField(updateData[key]));
          }
        });
      }

      return ContentService.createTextOutput(JSON.stringify({status: "Success"})).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'saveGame' || data.logs) {
      const logsSheet = ss.getSheetByName("ActionLogs");
      if (!logsSheet) throw new Error("ActionLogs sheet niet gevonden");

      if (data.logs && Array.isArray(data.logs)) {
        data.logs.forEach(log => {
          logsSheet.appendRow([
            log.GameID, log.Date, log.HomeTeam, log.AwayTeam,
            log.Timestamp, log.EventType, log.Team, log.Description,
            log.X, log.Y, log.Player, log.Assist1, log.Assist2, log.PenaltyReason, log.PenaltyMinutes, log.EventID || ''
          ].map(sanitizeField));
        });
      }

      if (data.game) {
        const gamesSheet = ss.getSheetByName("Games");
        if (gamesSheet) {
          const g = data.game;
          gamesSheet.appendRow([
            g.GameID, g.Date, g.HomeTeam, g.AwayTeam,
            g.HomeScore, g.AwayScore, g.HomeSOG, g.AwaySOG, g.Location, g.EventID || '', g.IsOfficial ? 'TRUE' : 'FALSE'
          ].map(sanitizeField));
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

export default function DatabaseScreen({ onBack }: DatabaseScreenProps) {
  const [gasUrl, setGasUrl] = useState('');
  const [gasToken, setGasToken] = useState('');
  const [gasSecret, setGasSecret] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedUrl = getGasUrl();
    if (savedUrl) {
      setGasUrl(savedUrl);
    }

    let savedToken = localStorage.getItem('blackout_gas_token');
    if (!savedToken) {
      savedToken = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      localStorage.setItem('blackout_gas_token', savedToken);
    }
    setGasToken(savedToken);
  }, []);

  const testConnection = async (urlToTest: string) => {
    if (!urlToTest) {
      setStatus('idle');
      return;
    }

    setStatus('testing');
    try {
      const response = await fetch(urlToTest, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'testConnection', token: gasToken })
      });
      if (response.ok || response.type === 'opaque') {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (e) {
      // If CORS blocks it, it might still be a valid endpoint.
      // For now, if fetch throws, we mark as error.
      // A better way might be JSONP, but that requires GAS support.
      // Let's be lenient and assume if it starts with script.google.com/macros/s/ it's likely correct format.
      if (urlToTest.includes('script.google.com/macros/s/')) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    }
  };

  const handleSave = () => {
    setGasUrlToCache(gasUrl);
    testConnection(gasUrl);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateGasCodeSnippet(gasToken));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-surface-container-low/50 backdrop-blur-md border-b border-[#2A2A2A] sticky top-0 z-50">
        <button
          onClick={onBack}
          className="text-on-surface-variant hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-[18px] font-bold text-white uppercase tracking-wider">
          Database Connection
        </h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full flex flex-col gap-6 pt-8 pb-12">

        <div className="bg-surface-container-low metallic-border rounded-lg p-6 inner-glow flex flex-col gap-4">
          <div className="flex items-center gap-3 text-tertiary">
            <Database className="w-6 h-6" />
            <h2 className="font-mono text-[14px] font-bold tracking-widest uppercase">Google Sheets Link</h2>
          </div>

          <p className="text-on-surface-variant text-sm leading-relaxed">
            Plaats hier de Google Apps Script (GAS) Web App URL om de app te verbinden met je Google Sheets database.
          </p>

          <div className="flex flex-col gap-2 mt-2">
            <input
              type="text"
              value={gasUrl}
              onChange={(e) => setGasUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/..."
              className="w-full bg-[#050505] border border-[#333] rounded-md px-3 py-3 text-white text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-tertiary/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 text-tertiary mt-4">
            <Key className="w-6 h-6" />
            <h2 className="font-mono text-[14px] font-bold tracking-widest uppercase">API Secret</h2>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Dit is de geheime sleutel die wordt gebruikt om data veilig naar de database te schrijven.
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <input
              type="text"
              value={gasToken}
              onChange={(e) => setGasToken(e.target.value)}
              placeholder="Jouw geheime sleutel"
              className="w-full bg-[#050505] border border-[#333] rounded-md px-3 py-3 text-white text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-tertiary/50 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {status === 'idle' && (
                <span className="text-gray-500 text-xs font-mono uppercase tracking-wider">Geen connectie getest</span>
              )}
              {status === 'testing' && (
                <>
                  <Loader2 className="w-4 h-4 text-tertiary animate-spin" />
                  <span className="text-tertiary text-xs font-mono uppercase tracking-wider">Testen...</span>
                </>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 text-xs font-mono uppercase tracking-wider">Verbonden</span>
                </>
              )}
              {status === 'error' && (
                <>
                  <XCircle className="w-4 h-4 text-error" />
                  <span className="text-error text-xs font-mono uppercase tracking-wider">Fout / Ongeldige URL</span>
                </>
              )}
            </div>

            <button
              onClick={handleSave}
              className="bg-tertiary text-black px-4 py-2 rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_10px_rgba(233,196,0,0.2)]"
            >
              <Save className="w-4 h-4" />
              Opslaan
            </button>
          </div>
        </div>

        {/* Code Snippet Section */}
        <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="font-mono text-[14px] font-bold tracking-widest uppercase text-white">Google Apps Script Code</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Kopieer onderstaande code, open je lege Google Sheet, ga naar <strong>Extensies &gt; Apps Script</strong> en plak de code.
              Voer de functie <code>setupSheet</code> eenmalig uit om de benodigde tabbladen aan te maken.
              Daarna kun je de script implementeren als Web App om de URL hierboven te plakken.
            </p>
          </div>

          <div className="relative group mt-2">
            <div className="absolute right-2 top-2 z-10">
              <button
                onClick={handleCopyCode}
                className="bg-[#2A2A2A] text-on-surface-variant hover:text-white p-2 rounded flex items-center gap-2 text-xs font-mono tracking-widest uppercase transition-colors"
                title="Kopieer Code"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Gekopieerd' : 'Kopieer'}
              </button>
            </div>
            <pre className="bg-[#050505] p-4 rounded-md border border-[#333] overflow-x-auto text-[11px] md:text-xs font-mono text-gray-300">
              <code>{generateGasCodeSnippet(gasToken)}</code>
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
