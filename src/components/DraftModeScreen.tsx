import { ArrowLeft, Users, Zap, Search, Clock, Play, Pause, RotateCcw, CheckCircle2, Shield, Sparkles, UserPlus, AlertCircle, Award, ChevronRight, Filter, RefreshCw, Layers } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchGasData } from '../utils/fetchGas';
import { getGasUrl } from '../utils/gasUrl';
import { dbSchema, User } from '../types';
import CountryFlag from './CountryFlag';

interface DraftModeScreenProps {
  currentUser?: User | null;
  onBack: () => void;
}

interface DraftPick {
  id: string;
  draftId: string;
  pickOrder: number;
  overallPick: number;
  roundNumber: number;
  teamId: string;
  personId?: string;
  notes?: string;
  createdAt?: string;
}

interface DraftTeam {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  primaryColor?: string;
}

interface DraftPlayer {
  id: string;
  personCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  secondaryPosition?: string;
  dob?: string;
  age: string;
  nationality?: string;
  shoots?: string;
  heightCm?: string | number;
  weightKg?: string | number;
  jerseyNumber?: string | number;
  photoUrl?: string;
  previousTeamId?: string;
  previousTeamCode?: string;
  previousAav?: string | number;
  yearsOfExperience?: string | number;
  status: string;
  isSigned: boolean;
  signedTeamId?: string;
  playstyle?: string;
}

const ensure2DArray = (val: any): any[][] => {
  if (!val) return [];
  if (Array.isArray(val)) {
    if (val.length === 0) return [];
    if (Array.isArray(val[0])) return val;
    return [val];
  }
  if (val && Array.isArray(val.data)) {
    if (val.data.length === 0) return [];
    if (Array.isArray(val.data[0])) return val.data;
    return [val.data];
  }
  return [];
};

const DEFAULT_TEAMS: DraftTeam[] = [
  { id: 'team-001', name: 'Blackout HC', code: 'BOK' },
  { id: 'team-002', name: 'Spartans Amsterdam', code: 'SPA' },
  { id: 'team-003', name: 'Red Wings Groningen', code: 'RWG' },
  { id: 'team-004', name: 'Polar Bears Utrecht', code: 'PBU' },
  { id: 'team-005', name: 'Ice Hawks Eindhoven', code: 'IHE' },
  { id: 'team-006', name: 'Knights Tilburg', code: 'KTB' }
];

const DEFAULT_PLAYERS: DraftPlayer[] = [
  { id: 'p-101', personCode: 'P-101', firstName: 'Lars', lastName: 'van Dijk', fullName: 'Lars van Dijk', position: 'C', age: '24', nationality: 'Netherlands', shoots: 'Left', heightCm: 186, weightKg: 88, jerseyNumber: 19, previousTeamCode: 'BOK', previousAav: '€18,500', yearsOfExperience: 4, status: 'Available', isSigned: false, playstyle: 'Playmaker' },
  { id: 'p-102', personCode: 'P-102', firstName: 'Mark', lastName: 'de Boer', fullName: 'Mark de Boer', position: 'D', age: '27', nationality: 'Netherlands', shoots: 'Right', heightCm: 192, weightKg: 94, jerseyNumber: 4, previousTeamCode: 'SPA', previousAav: '€22,000', yearsOfExperience: 6, status: 'Available', isSigned: false, playstyle: 'Two-way Defenseman' },
  { id: 'p-103', personCode: 'P-103', firstName: 'Sven', lastName: 'Lindqvist', fullName: 'Sven Lindqvist', position: 'LW', age: '22', nationality: 'Sweden', shoots: 'Left', heightCm: 183, weightKg: 82, jerseyNumber: 88, previousTeamCode: 'RWG', previousAav: '€16,000', yearsOfExperience: 2, status: 'Available', isSigned: false, playstyle: 'Sniper' },
  { id: 'p-104', personCode: 'P-104', firstName: 'Jesper', lastName: 'Nieminen', fullName: 'Jesper Nieminen', position: 'G', age: '26', nationality: 'Finland', shoots: 'Left', heightCm: 188, weightKg: 85, jerseyNumber: 30, previousTeamCode: 'PBU', previousAav: '€24,000', yearsOfExperience: 5, status: 'Available', isSigned: false, playstyle: 'Butterfly' },
  { id: 'p-105', personCode: 'P-105', firstName: 'Karel', lastName: 'Novak', fullName: 'Karel Novak', position: 'RW', age: '25', nationality: 'Czechia', shoots: 'Right', heightCm: 185, weightKg: 86, jerseyNumber: 11, previousTeamCode: 'IHE', previousAav: '€19,000', yearsOfExperience: 4, status: 'Available', isSigned: false, playstyle: 'Power Forward' },
  { id: 'p-106', personCode: 'P-106', firstName: 'Thomas', lastName: 'Bakker', fullName: 'Thomas Bakker', position: 'D', age: '23', nationality: 'Netherlands', shoots: 'Left', heightCm: 189, weightKg: 90, jerseyNumber: 7, previousTeamCode: 'KTB', previousAav: '€14,500', yearsOfExperience: 3, status: 'Available', isSigned: false, playstyle: 'Defensive Defenseman' },
  { id: 'p-107', personCode: 'P-107', firstName: 'Alex', lastName: 'Dubois', fullName: 'Alex Dubois', position: 'C', age: '21', nationality: 'Canada', shoots: 'Left', heightCm: 180, weightKg: 79, jerseyNumber: 97, previousTeamCode: 'FREE', previousAav: '€12,000', yearsOfExperience: 1, status: 'Available', isSigned: false, playstyle: 'Speedster' },
  { id: 'p-108', personCode: 'P-108', firstName: 'Daan', lastName: 'Vermeulen', fullName: 'Daan Vermeulen', position: 'RW', age: '28', nationality: 'Netherlands', shoots: 'Right', heightCm: 182, weightKg: 84, jerseyNumber: 21, previousTeamCode: 'BOK', previousAav: '€20,000', yearsOfExperience: 7, status: 'Available', isSigned: false, playstyle: 'Grinder' },
  { id: 'p-109', personCode: 'P-109', firstName: 'Mikko', lastName: 'Heikkinen', fullName: 'Mikko Heikkinen', position: 'G', age: '24', nationality: 'Finland', shoots: 'Left', heightCm: 191, weightKg: 89, jerseyNumber: 35, previousTeamCode: 'SPA', previousAav: '€17,000', yearsOfExperience: 3, status: 'Available', isSigned: false, playstyle: 'Hybrid Goalie' },
  { id: 'p-110', personCode: 'P-110', firstName: 'Bram', lastName: 'Koster', fullName: 'Bram Koster', position: 'D', age: '29', nationality: 'Netherlands', shoots: 'Right', heightCm: 187, weightKg: 92, jerseyNumber: 55, previousTeamCode: 'RWG', previousAav: '€21,500', yearsOfExperience: 8, status: 'Available', isSigned: false, playstyle: 'Offensive Defenseman' },
  { id: 'p-111', personCode: 'P-111', firstName: 'Robin', lastName: 'Visser', fullName: 'Robin Visser', position: 'LW', age: '20', nationality: 'Netherlands', shoots: 'Left', heightCm: 178, weightKg: 76, jerseyNumber: 13, previousTeamCode: 'FREE', previousAav: '€10,000', yearsOfExperience: 1, status: 'Available', isSigned: false, playstyle: 'Playmaker' },
  { id: 'p-112', personCode: 'P-112', firstName: 'Emil', lastName: 'Horvat', fullName: 'Emil Horvat', position: 'C', age: '26', nationality: 'Slovakia', shoots: 'Right', heightCm: 186, weightKg: 87, jerseyNumber: 71, previousTeamCode: 'PBU', previousAav: '€18,000', yearsOfExperience: 5, status: 'Available', isSigned: false, playstyle: 'Two-Way Forward' }
];

export default function DraftModeScreen({ currentUser, onBack }: DraftModeScreenProps) {
  const [activeTab, setActiveTab] = useState<'board' | 'pool' | 'rosters'>('board');
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<DraftTeam[]>(DEFAULT_TEAMS);
  const [players, setPlayers] = useState<DraftPlayer[]>(DEFAULT_PLAYERS);
  const [picks, setPicks] = useState<DraftPick[]>([]);
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [totalRounds, setTotalRounds] = useState<number>(3);
  const [draftType, setDraftType] = useState<'snake' | 'standard'>('snake');
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<'ALL' | 'FORWARD' | 'DEFENSE' | 'GOALIE'>('ALL');
  const [selectedPlayerForDraft, setSelectedPlayerForDraft] = useState<DraftPlayer | null>(null);
  const [selectedTeamManagerId, setSelectedTeamManagerId] = useState<string>(DEFAULT_TEAMS[0].id);
  const [isSubmittingPick, setIsSubmittingPick] = useState(false);
  const [lastAnnouncedPick, setLastAnnouncedPick] = useState<{ player: DraftPlayer; team: DraftTeam; round: number; pick: number } | null>(null);

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Load Data from GAS
  const loadDraftData = useCallback(async () => {
    try {
      setLoading(true);
      const gasUrl = getGasUrl();
      if (!gasUrl) {
        // Fallback to defaults
        setTeams(DEFAULT_TEAMS);
        setPlayers(DEFAULT_PLAYERS);
        generateDraftOrder(DEFAULT_TEAMS, totalRounds, draftType, []);
        setLoading(false);
        return;
      }

      const [teamsRes, personsRes, agentsRes, picksRes] = await Promise.all([
        fetchGasData(gasUrl, { action: 'getEcosystemData', sheetName: 'teams' }).catch(() => null),
        fetchGasData(gasUrl, { action: 'getEcosystemData', sheetName: 'persons' }).catch(() => null),
        fetchGasData(gasUrl, { action: 'getEcosystemData', sheetName: 'free_agents' }).catch(() => null),
        fetchGasData(gasUrl, { action: 'getEcosystemData', sheetName: 'draft_picks' }).catch(() => null)
      ]);

      // Process Teams
      let loadedTeams: DraftTeam[] = DEFAULT_TEAMS;
      if (teamsRes) {
        const teamsData = ensure2DArray(await teamsRes.json());
        if (teamsData.length > 1) {
          const headers = teamsData[0] || dbSchema['teams'];
          const idIdx = headers.indexOf('id');
          const nameIdx = headers.indexOf('name');
          const codeIdx = headers.indexOf('team_code');
          const logoIdx = headers.indexOf('logo_url');

          const mapped = teamsData.slice(1).map(row => ({
            id: row[idIdx] || `team-${Math.random()}`,
            name: row[nameIdx] || 'Unnamed Team',
            code: row[codeIdx] || (row[nameIdx] ? row[nameIdx].substring(0, 3).toUpperCase() : 'UNK'),
            logoUrl: row[logoIdx] || ''
          })).filter(t => t.id && t.name);

          if (mapped.length > 0) {
            loadedTeams = mapped;
            setTeams(mapped);
            setSelectedTeamManagerId(mapped[0].id);
          }
        }
      }

      // Process Persons
      const personsMap = new Map<string, any>();
      if (personsRes) {
        const personsData = ensure2DArray(await personsRes.json());
        if (personsData.length > 1) {
          const headers = personsData[0] || dbSchema['persons'];
          const idIdx = headers.indexOf('id');
          const codeIdx = headers.indexOf('person_code');
          const fnIdx = headers.indexOf('first_name');
          const lnIdx = headers.indexOf('last_name');
          const dobIdx = headers.indexOf('date_of_birth');
          const natIdx = headers.indexOf('nationality');
          const posIdx = headers.indexOf('plays_position');
          const secPosIdx = headers.indexOf('secondary_position');
          const shootsIdx = headers.indexOf('shoots');
          const hIdx = headers.indexOf('height_cm');
          const wIdx = headers.indexOf('weight_kg');
          const jIdx = headers.indexOf('jersey_number');
          const photoIdx = headers.indexOf('photo_url');
          const playstyleIdx = headers.indexOf('playstyle');

          for (let i = 1; i < personsData.length; i++) {
            const row = personsData[i];
            const pId = row[idIdx];
            if (pId) {
              personsMap.set(pId, {
                id: pId,
                personCode: row[codeIdx] || '',
                firstName: row[fnIdx] || '',
                lastName: row[lnIdx] || '',
                dob: row[dobIdx] || '',
                nationality: row[natIdx] || 'Netherlands',
                position: row[posIdx] || 'Forward',
                secondaryPosition: row[secPosIdx] || '',
                shoots: row[shootsIdx] || 'Left',
                heightCm: row[hIdx] || '',
                weightKg: row[wIdx] || '',
                jerseyNumber: row[jIdx] || '',
                photoUrl: row[photoIdx] || '',
                playstyle: row[playstyleIdx] || ''
              });
            }
          }
        }
      }

      // Process Existing Draft Picks
      let existingPicks: DraftPick[] = [];
      const pickedPersonIds = new Set<string>();
      if (picksRes) {
        const picksData = ensure2DArray(await picksRes.json());
        if (picksData.length > 1) {
          const headers = picksData[0] || dbSchema['draft_picks'];
          const idIdx = headers.indexOf('id');
          const draftIdIdx = headers.indexOf('draft_id');
          const pickOrderIdx = headers.indexOf('pick_order');
          const teamIdIdx = headers.indexOf('team_id');
          const personIdIdx = headers.indexOf('person_id');
          const roundNumIdx = headers.indexOf('round_number');
          const notesIdx = headers.indexOf('notes');

          for (let i = 1; i < picksData.length; i++) {
            const row = picksData[i];
            const pId = row[personIdIdx];
            if (pId) pickedPersonIds.add(pId);

            existingPicks.push({
              id: row[idIdx] || `pick-${i}`,
              draftId: row[draftIdIdx] || 'draft-current',
              pickOrder: parseInt(row[pickOrderIdx]) || i,
              overallPick: i,
              roundNumber: parseInt(row[roundNumIdx]) || 1,
              teamId: row[teamIdIdx] || '',
              personId: pId || undefined,
              notes: row[notesIdx] || ''
            });
          }
        }
      }

      // Process Free Agents into Player Pool
      let loadedPlayers: DraftPlayer[] = [];
      if (agentsRes) {
        const agentsData = ensure2DArray(await agentsRes.json());
        if (agentsData.length > 1) {
          const headers = agentsData[0] || dbSchema['free_agents'];
          const personFkIdx = headers.indexOf('person_id');
          const statusIdx = headers.indexOf('status');
          const prevTeamIdx = headers.indexOf('previous_team_id');
          const prevAavIdx = headers.indexOf('previous_aav');
          const yoeIdx = headers.indexOf('years_of_experience');
          const isSignedIdx = headers.indexOf('is_signed');
          const signedTeamIdx = headers.indexOf('signed_team_id');

          for (let i = 1; i < agentsData.length; i++) {
            const row = agentsData[i];
            const pId = row[personFkIdx];
            if (!pId) continue;
            const person = personsMap.get(pId) || {
              firstName: 'Player',
              lastName: pId,
              nationality: 'Netherlands',
              position: 'Forward'
            };

            let age = '24';
            if (person.dob) {
              const birthDate = new Date(person.dob);
              if (!isNaN(birthDate.getTime())) {
                const ageDifMs = Date.now() - birthDate.getTime();
                const ageDate = new Date(ageDifMs);
                age = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
              }
            }

            const isSigned = row[isSignedIdx] === true || row[isSignedIdx] === 'TRUE' || pickedPersonIds.has(pId);

            loadedPlayers.push({
              id: pId,
              personCode: person.personCode || pId,
              firstName: person.firstName,
              lastName: person.lastName,
              fullName: `${person.firstName} ${person.lastName}`.trim() || pId,
              position: person.position || 'Forward',
              secondaryPosition: person.secondaryPosition,
              dob: person.dob,
              age,
              nationality: person.nationality || 'Netherlands',
              shoots: person.shoots || 'Left',
              heightCm: person.heightCm,
              weightKg: person.weightKg,
              jerseyNumber: person.jerseyNumber,
              photoUrl: person.photoUrl,
              previousTeamId: row[prevTeamIdx] || '',
              previousTeamCode: row[prevTeamIdx] || 'FA',
              previousAav: row[prevAavIdx] ? `€${Number(row[prevAavIdx]).toLocaleString()}` : '€15,000',
              yearsOfExperience: row[yoeIdx] || 2,
              status: isSigned ? 'Drafted' : (row[statusIdx] || 'Available'),
              isSigned,
              signedTeamId: row[signedTeamIdx] || '',
              playstyle: person.playstyle || 'All-Around'
            });
          }
        }
      }

      if (loadedPlayers.length === 0) {
        loadedPlayers = DEFAULT_PLAYERS;
      }
      setPlayers(loadedPlayers);

      generateDraftOrder(loadedTeams, totalRounds, draftType, existingPicks);
    } catch (e) {
      console.error('Error loading draft data:', e);
      setTeams(DEFAULT_TEAMS);
      setPlayers(DEFAULT_PLAYERS);
      generateDraftOrder(DEFAULT_TEAMS, totalRounds, draftType, []);
    } finally {
      setLoading(false);
    }
  }, [totalRounds, draftType]);

  // Generate or align complete draft order slots
  const generateDraftOrder = (
    currentTeams: DraftTeam[],
    rounds: number,
    type: 'snake' | 'standard',
    existingPicks: DraftPick[]
  ) => {
    const generated: DraftPick[] = [];
    let overall = 1;

    for (let r = 1; r <= rounds; r++) {
      const teamsInRound = type === 'snake' && r % 2 === 0 ? [...currentTeams].reverse() : [...currentTeams];

      teamsInRound.forEach((team, idx) => {
        const existing = existingPicks.find(p => p.overallPick === overall);
        if (existing) {
          generated.push({
            ...existing,
            roundNumber: r,
            pickOrder: idx + 1,
            overallPick: overall,
            teamId: existing.teamId || team.id
          });
        } else {
          generated.push({
            id: `pick-r${r}-p${idx + 1}`,
            draftId: 'draft-current',
            roundNumber: r,
            pickOrder: idx + 1,
            overallPick: overall,
            teamId: team.id,
            personId: undefined
          });
        }
        overall++;
      });
    }

    setPicks(generated);
  };

  useEffect(() => {
    loadDraftData();
  }, [loadDraftData]);

  // Current On-The-Clock Pick
  const currentPick = useMemo(() => {
    return picks.find(p => !p.personId);
  }, [picks]);

  // Current On-The-Clock Team
  const currentTeam = useMemo(() => {
    if (!currentPick) return null;
    return teams.find(t => t.id === currentPick.teamId) || null;
  }, [currentPick, teams]);

  // Check if active user is authorized to draft for current team
  const isManagerForCurrentTeam = useMemo(() => {
    if (!currentUser) return true; // allow interactive prototype
    if (['Admin', 'League Manager'].includes(currentUser.role)) return true;
    if (currentUser.role === 'Team Manager') {
      return selectedTeamManagerId === currentTeam?.id;
    }
    return false;
  }, [currentUser, selectedTeamManagerId, currentTeam]);

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0 && currentPick) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, currentPick]);

  // Reset timer on new pick
  const resetTimer = () => {
    setTimerSeconds(60);
    setIsTimerRunning(false);
  };

  // Execute Draft Pick
  const handleDraftPlayer = async (player: DraftPlayer) => {
    if (!currentPick || !currentTeam) return;

    try {
      setIsSubmittingPick(true);
      const gasUrl = getGasUrl();
      const pickId = `DP-${Date.now()}`;
      const timestamp = new Date().toISOString();

      // 1. Update pick locally
      const updatedPicks = picks.map(p => {
        if (p.overallPick === currentPick.overallPick) {
          return {
            ...p,
            id: pickId,
            personId: player.id,
            createdAt: timestamp
          };
        }
        return p;
      });
      setPicks(updatedPicks);

      // 2. Mark player as drafted locally
      const updatedPlayers = players.map(p => {
        if (p.id === player.id) {
          return {
            ...p,
            status: 'Drafted',
            isSigned: true,
            signedTeamId: currentTeam.id
          };
        }
        return p;
      });
      setPlayers(updatedPlayers);

      // Set Announcement
      setLastAnnouncedPick({
        player,
        team: currentTeam,
        round: currentPick.roundNumber,
        pick: currentPick.pickOrder
      });
      setSelectedPlayerForDraft(null);
      resetTimer();

      // 3. Persist to Google Sheets via GAS (if connected)
      if (gasUrl) {
        // Append pick to draft_picks
        const pickRow = [
          pickId,
          currentPick.draftId || 'draft-current',
          currentPick.pickOrder,
          currentTeam.id,
          player.id,
          currentPick.roundNumber,
          `Drafted by ${currentTeam.name}`,
          timestamp
        ];

        fetchGasData(gasUrl, {
          action: 'saveEcosystemData',
          sheetName: 'draft_picks',
          rowData: pickRow
        }).catch(err => console.warn('Failed to save draft pick to GAS:', err));

        // Update player in free_agents sheet
        fetchGasData(gasUrl, {
          action: 'updateRow',
          sheetName: 'free_agents',
          idColumn: 'person_id',
          idValue: player.id,
          updateData: {
            status: 'Drafted',
            is_signed: true,
            signed_team_id: currentTeam.id
          }
        }).catch(err => console.warn('Failed to update free agent in GAS:', err));

        // Also add to roster_members
        const rosterMemberRow = [
          `RM-${Date.now()}`,
          `ROSTER-${currentTeam.id}`,
          player.id,
          player.fullName,
          player.jerseyNumber || '',
          player.position || '',
          'active',
          timestamp,
          '',
          timestamp
        ];

        fetchGasData(gasUrl, {
          action: 'saveEcosystemData',
          sheetName: 'roster_members',
          rowData: rosterMemberRow
        }).catch(err => console.warn('Failed to add to roster_members in GAS:', err));
      }
    } catch (err) {
      console.error('Draft pick failed:', err);
    } finally {
      setIsSubmittingPick(false);
    }
  };

  // Auto-Pick / Simulate Pick for CPU or fast-forward
  const handleAutoPick = () => {
    if (!currentPick || !currentTeam) return;
    const available = players.filter(p => !p.isSigned && p.status !== 'Drafted');
    if (available.length === 0) return;

    // Pick top available player
    const topPlayer = available[0];
    handleDraftPlayer(topPlayer);
  };

  // Reset Draft
  const handleResetDraft = () => {
    if (!confirm('Are you sure you want to reset all draft picks for this session?')) return;
    const resetPicks = picks.map(p => ({ ...p, personId: undefined }));
    setPicks(resetPicks);
    const resetPlayers = players.map(p => ({ ...p, status: 'Available', isSigned: false, signedTeamId: '' }));
    setPlayers(resetPlayers);
    setLastAnnouncedPick(null);
    resetTimer();
  };

  // Filtered available players
  const filteredAvailablePlayers = useMemo(() => {
    return players.filter(p => {
      const isAvailable = !p.isSigned && p.status !== 'Drafted';
      const matchesSearch = p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.nationality && p.nationality.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesPosition = true;
      if (positionFilter === 'FORWARD') {
        matchesPosition = ['C', 'LW', 'RW', 'F', 'FORWARD', 'Forward', 'W', 'Winger'].some(pos => p.position.toUpperCase().includes(pos));
      } else if (positionFilter === 'DEFENSE') {
        matchesPosition = ['D', 'DEFENSE', 'Defense', 'LD', 'RD'].some(pos => p.position.toUpperCase().includes(pos));
      } else if (positionFilter === 'GOALIE') {
        matchesPosition = ['G', 'GOALIE', 'Goalie', 'GK'].some(pos => p.position.toUpperCase().includes(pos));
      }

      return isAvailable && matchesSearch && matchesPosition;
    });
  }, [players, searchQuery, positionFilter]);

  // Completed Picks list (ordered by newest first)
  const recentPicks = useMemo(() => {
    return picks
      .filter(p => p.personId)
      .map(p => {
        const player = players.find(pl => pl.id === p.personId);
        const team = teams.find(t => t.id === p.teamId);
        return { pick: p, player, team };
      })
      .reverse();
  }, [picks, players, teams]);

  // Grouped picks by round for Draft Board
  const roundPicks = useMemo(() => {
    return picks.filter(p => p.roundNumber === selectedRound);
  }, [picks, selectedRound]);

  // Position badge helper
  const renderPositionBadge = (pos: string) => {
    const p = pos.toUpperCase();
    let bg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (['D', 'LD', 'RD', 'DEFENSE'].some(x => p.includes(x))) {
      bg = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    } else if (['G', 'GOALIE', 'GK'].some(x => p.includes(x))) {
      bg = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
    return (
      <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold uppercase tracking-wider border ${bg}`}>
        {pos}
      </span>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden text-on-surface">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between p-4 bg-surface-container-low/50 backdrop-blur-md border-b border-[#2A2A2A] sticky top-0 z-40">
        <button
          onClick={onBack}
          className="text-on-surface-variant hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-tertiary/10 border border-tertiary/40 flex items-center justify-center text-tertiary">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-display text-[16px] md:text-[18px] font-bold text-white uppercase tracking-wider">
              Draft Room
            </h1>
            <div className="flex items-center gap-2 text-[11px] font-mono text-on-surface-variant">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentPick ? `ROUND ${currentPick.roundNumber} • PICK #${currentPick.pickOrder}` : 'DRAFT COMPLETED'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Team Manager Selector */}
          <div className="hidden sm:flex items-center gap-2 bg-[#050505] border border-[#2A2A2A] rounded px-2.5 py-1 text-xs">
            <span className="text-on-surface-variant font-mono uppercase text-[10px]">Manager:</span>
            <select
              value={selectedTeamManagerId}
              onChange={(e) => setSelectedTeamManagerId(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id} className="bg-[#111] text-white">
                  {team.name} ({team.code})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadDraftData}
            title="Refresh Data"
            className="w-9 h-9 rounded bg-[#050505] border border-[#2A2A2A] hover:border-tertiary/60 flex items-center justify-center text-on-surface-variant hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 max-w-6xl mx-auto w-full flex flex-col gap-6 pt-6 pb-16">

        {/* Live On-The-Clock Banner */}
        {currentPick && currentTeam ? (
          <div className={`border rounded-lg p-5 md:p-6 transition-all duration-300 relative overflow-hidden ${
            isManagerForCurrentTeam
              ? 'bg-gradient-to-r from-tertiary/15 via-[#050505] to-[#050505] border-tertiary shadow-[0_0_30px_rgba(234,179,8,0.15)]'
              : 'bg-[#050505] border-[#2A2A2A]'
          }`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              {/* Left Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-surface-container-highest border border-[#2A2A2A] flex items-center justify-center font-display text-xl font-bold text-white shadow-inner">
                  {currentTeam.code}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-tertiary text-black font-mono text-[10px] font-bold uppercase tracking-widest animate-pulse">
                      ON THE CLOCK
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant">
                      Overall #{currentPick.overallPick} • Round {currentPick.roundNumber}, Pick {currentPick.pickOrder}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    {currentTeam.name}
                    {isManagerForCurrentTeam && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        YOUR TURN
                      </span>
                    )}
                  </h2>
                </div>
              </div>

              {/* Right Timer & Actions */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                {/* Countdown Timer */}
                <div className="flex items-center gap-2 bg-[#111] border border-[#2A2A2A] px-3 py-1.5 rounded font-mono">
                  <Clock className={`w-4 h-4 ${timerSeconds <= 10 ? 'text-error animate-ping' : 'text-tertiary'}`} />
                  <span className={`text-lg font-bold ${timerSeconds <= 10 ? 'text-error' : 'text-white'}`}>
                    00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                  </span>
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-1 hover:text-tertiary transition-colors"
                    title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="p-1 hover:text-tertiary transition-colors"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Action: Pick Player or Auto Pick */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('pool')}
                    className="btn-primary px-4 py-2 rounded font-mono text-xs font-bold uppercase tracking-wider text-on-tertiary flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
                  >
                    <UserPlus className="w-4 h-4" />
                    Select Player
                  </button>
                  <button
                    onClick={handleAutoPick}
                    title="Auto-Pick Top Available"
                    className="btn-secondary px-3 py-2 rounded font-mono text-xs font-bold uppercase tracking-wider text-tertiary border border-tertiary/40 hover:border-tertiary hover:bg-tertiary/10 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-Pick
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#050505] border border-emerald-500/40 rounded-lg p-6 text-center flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Draft Complete!</h2>
            <p className="text-sm text-on-surface-variant max-w-md">
              All {picks.length} picks across {totalRounds} rounds have been executed successfully.
            </p>
            <button
              onClick={handleResetDraft}
              className="mt-2 px-4 py-2 rounded border border-[#2A2A2A] text-xs font-mono text-on-surface-variant hover:text-white hover:border-white/30 transition-colors"
            >
              Restart Draft Session
            </button>
          </div>
        )}

        {/* Pick Announcement Notification */}
        {lastAnnouncedPick && (
          <div className="bg-gradient-to-r from-emerald-950/40 via-[#050505] to-[#050505] border border-emerald-500/50 rounded-lg p-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                ✓
              </div>
              <div>
                <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest block">
                  PICK ANNOUNCED • ROUND {lastAnnouncedPick.round}, PICK {lastAnnouncedPick.pick}
                </span>
                <span className="text-white font-bold text-sm">
                  {lastAnnouncedPick.team.name} selects <span className="text-tertiary">{lastAnnouncedPick.player.fullName}</span> ({lastAnnouncedPick.player.position})
                </span>
              </div>
            </div>
            <button
              onClick={() => setLastAnnouncedPick(null)}
              className="text-on-surface-variant hover:text-white text-xs font-mono p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Headers */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-3">
          <div className="flex bg-[#050505] border border-[#2A2A2A] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-4 py-2 rounded font-mono text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
                activeTab === 'board' ? 'bg-tertiary text-black' : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Draft Board
            </button>
            <button
              onClick={() => setActiveTab('pool')}
              className={`px-4 py-2 rounded font-mono text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
                activeTab === 'pool' ? 'bg-tertiary text-black' : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Player Pool ({filteredAvailablePlayers.length})
            </button>
            <button
              onClick={() => setActiveTab('rosters')}
              className={`px-4 py-2 rounded font-mono text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
                activeTab === 'rosters' ? 'bg-tertiary text-black' : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Team Needs
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-on-surface-variant">
            <span>Progress: {picks.filter(p => p.personId).length} / {picks.length}</span>
            <div className="w-24 h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div
                className="h-full bg-tertiary transition-all duration-300"
                style={{ width: `${picks.length ? (picks.filter(p => p.personId).length / picks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* TAB 1: DRAFT BOARD */}
        {activeTab === 'board' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Round Grid */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Round Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {Array.from({ length: totalRounds }, (_, i) => i + 1).map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRound(r)}
                    className={`px-4 py-2 rounded font-mono text-xs font-bold uppercase tracking-wider transition-colors border ${
                      selectedRound === r
                        ? 'bg-white/10 text-white border-tertiary'
                        : 'bg-[#050505] text-on-surface-variant border-[#2A2A2A] hover:border-white/20'
                    }`}
                  >
                    Round {r}
                  </button>
                ))}
              </div>

              {/* Picks in Selected Round */}
              <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg divide-y divide-[#2A2A2A] overflow-hidden">
                {roundPicks.map(p => {
                  const team = teams.find(t => t.id === p.teamId);
                  const player = players.find(pl => pl.id === p.personId);
                  const isCurrent = currentPick?.overallPick === p.overallPick;

                  return (
                    <div
                      key={p.overallPick}
                      className={`p-4 flex items-center justify-between gap-4 transition-all ${
                        isCurrent
                          ? 'bg-tertiary/10 border-l-4 border-l-tertiary'
                          : p.personId
                          ? 'hover:bg-white/5'
                          : 'opacity-60'
                      }`}
                    >
                      {/* Pick Number & Team */}
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-on-surface-variant w-8">
                          #{p.overallPick}
                        </span>
                        <div className="w-8 h-8 rounded bg-surface-container-highest border border-[#2A2A2A] flex items-center justify-center font-mono text-xs font-bold text-white shrink-0">
                          {team?.code || 'UNK'}
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm">
                            {team?.name || 'Unnamed Team'}
                          </div>
                          <div className="text-[10px] font-mono text-on-surface-variant">
                            Round {p.roundNumber} • Pick {p.pickOrder}
                          </div>
                        </div>
                      </div>

                      {/* Pick Selection Status */}
                      <div className="flex items-center gap-3 text-right">
                        {player ? (
                          <div>
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-white font-bold text-sm">{player.fullName}</span>
                              {renderPositionBadge(player.position)}
                            </div>
                            <div className="text-[11px] font-mono text-on-surface-variant flex items-center justify-end gap-1.5">
                              <CountryFlag nationality={player.nationality} size="xs" />
                              <span>{player.nationality || 'NED'} • Age {player.age}</span>
                            </div>
                          </div>
                        ) : isCurrent ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded bg-tertiary text-black font-mono text-xs font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              On Clock
                            </span>
                            {isManagerForCurrentTeam && (
                              <button
                                onClick={() => setActiveTab('pool')}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded font-mono text-xs font-bold transition-colors"
                              >
                                Draft Now
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-on-surface-variant/60 italic">
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Recent Picks Feed */}
            <div className="flex flex-col gap-4">
              <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-4 flex flex-col gap-3">
                <h3 className="font-mono text-white text-xs font-bold uppercase tracking-widest flex items-center justify-between">
                  <span>Recent Picks</span>
                  <span className="text-tertiary">{recentPicks.length} Made</span>
                </h3>

                {recentPicks.length === 0 ? (
                  <p className="text-xs text-on-surface-variant italic py-4 text-center">
                    No picks made yet. Select a player to start the draft.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {recentPicks.map(({ pick, player, team }) => (
                      <div
                        key={pick.overallPick}
                        className="bg-[#111] border border-[#2A2A2A] rounded p-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-tertiary font-bold">
                            #{pick.overallPick}
                          </span>
                          <span className="font-bold text-white">{team?.code}:</span>
                          <span className="text-on-surface">{player?.fullName}</span>
                        </div>
                        {player && renderPositionBadge(player.position)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Draft Configuration Panel (Admin/League Manager) */}
              <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-4 flex flex-col gap-3">
                <h3 className="font-mono text-on-surface-variant text-xs font-bold uppercase tracking-widest">
                  Draft Controls
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-on-surface-variant">Draft Format:</span>
                    <span className="text-white uppercase font-bold">{draftType} Draft</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-on-surface-variant">Total Rounds:</span>
                    <span className="text-white font-bold">{totalRounds} Rounds</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-on-surface-variant">Total Picks:</span>
                    <span className="text-white font-bold">{picks.length} Picks</span>
                  </div>
                </div>

                <div className="border-t border-[#2A2A2A] pt-3 mt-1 flex gap-2">
                  <button
                    onClick={handleAutoPick}
                    disabled={!currentPick}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded font-mono text-[11px] font-bold uppercase transition-colors disabled:opacity-40"
                  >
                    Simulate Next
                  </button>
                  <button
                    onClick={handleResetDraft}
                    className="py-1.5 px-3 border border-error/40 hover:bg-error/10 text-error rounded font-mono text-[11px] font-bold uppercase transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLAYER POOL (INTERACTIVE SELECTION) */}
        {activeTab === 'pool' && (
          <div className="flex flex-col gap-4">
            {/* Filters Bar */}
            <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search player name, position, nationality..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#111] border border-[#2A2A2A] rounded pl-9 pr-4 py-2 text-sm text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary transition-colors"
                />
              </div>

              {/* Position Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                {(['ALL', 'FORWARD', 'DEFENSE', 'GOALIE'] as const).map(pos => (
                  <button
                    key={pos}
                    onClick={() => setPositionFilter(pos)}
                    className={`px-3 py-1.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                      positionFilter === pos
                        ? 'bg-tertiary text-black'
                        : 'bg-[#111] text-on-surface-variant hover:text-white border border-[#2A2A2A]'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Players Table / Grid */}
            <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#111] text-on-surface-variant font-mono text-xs uppercase border-b border-[#2A2A2A]">
                    <tr>
                      <th className="p-3.5 pl-4">Player</th>
                      <th className="p-3.5">Position</th>
                      <th className="p-3.5">Age</th>
                      <th className="p-3.5">Shoots</th>
                      <th className="p-3.5">Experience</th>
                      <th className="p-3.5">Prev. AAV</th>
                      <th className="p-3.5">Playstyle</th>
                      <th className="p-3.5 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A2A]">
                    {filteredAvailablePlayers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-on-surface-variant italic">
                          No available players found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAvailablePlayers.map(player => (
                        <tr
                          key={player.id}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="p-3.5 pl-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded bg-surface-container-highest border border-[#2A2A2A] flex items-center justify-center font-mono text-xs font-bold text-white shrink-0">
                                {player.firstName[0]}{player.lastName[0]}
                              </div>
                              <div>
                                <div className="text-white font-bold group-hover:text-tertiary transition-colors">
                                  {player.fullName}
                                </div>
                                <div className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1.5">
                                  <CountryFlag nationality={player.nationality} size="xs" />
                                  <span>{player.nationality || 'NED'}</span>
                                  {player.jerseyNumber && <span>• #{player.jerseyNumber}</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            {renderPositionBadge(player.position)}
                          </td>
                          <td className="p-3.5 font-mono text-xs text-on-surface">
                            {player.age} yrs
                          </td>
                          <td className="p-3.5 font-mono text-xs text-on-surface-variant">
                            {player.shoots || 'L'}
                          </td>
                          <td className="p-3.5 font-mono text-xs text-on-surface">
                            {player.yearsOfExperience || 1} YOE
                          </td>
                          <td className="p-3.5 font-mono text-xs text-tertiary">
                            {player.previousAav || '—'}
                          </td>
                          <td className="p-3.5 text-xs text-on-surface-variant">
                            {player.playstyle || 'All-Around'}
                          </td>
                          <td className="p-3.5 text-right pr-4">
                            <button
                              onClick={() => setSelectedPlayerForDraft(player)}
                              disabled={!currentPick || isSubmittingPick}
                              className={`px-3 py-1.5 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ml-auto ${
                                currentPick
                                  ? 'bg-tertiary text-black hover:brightness-110 active:scale-95 shadow'
                                  : 'bg-white/10 text-on-surface-variant cursor-not-allowed'
                              }`}
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              Draft
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TEAM NEEDS & ROSTERS */}
        {activeTab === 'rosters' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => {
              const teamPicks = picks.filter(p => p.teamId === team.id && p.personId);
              const draftedPlayers = teamPicks.map(p => players.find(pl => pl.id === p.personId)).filter(Boolean) as DraftPlayer[];

              const forwardsCount = draftedPlayers.filter(p => ['C', 'LW', 'RW', 'F', 'FORWARD'].some(pos => p.position.toUpperCase().includes(pos))).length;
              const defenseCount = draftedPlayers.filter(p => ['D', 'DEFENSE', 'LD', 'RD'].some(pos => p.position.toUpperCase().includes(pos))).length;
              const goalieCount = draftedPlayers.filter(p => ['G', 'GOALIE', 'GK'].some(pos => p.position.toUpperCase().includes(pos))).length;

              return (
                <div
                  key={team.id}
                  className={`bg-[#050505] border rounded-lg p-5 flex flex-col gap-4 ${
                    currentTeam?.id === team.id ? 'border-tertiary shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-[#2A2A2A]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container-highest border border-[#2A2A2A] flex items-center justify-center font-display font-bold text-white">
                        {team.code}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">{team.name}</h4>
                        <span className="text-[10px] font-mono text-on-surface-variant uppercase">
                          {teamPicks.length} Drafted
                        </span>
                      </div>
                    </div>
                    {currentTeam?.id === team.id && (
                      <span className="px-2 py-0.5 rounded bg-tertiary/20 text-tertiary border border-tertiary/30 font-mono text-[10px] font-bold uppercase animate-pulse">
                        Clock
                      </span>
                    )}
                  </div>

                  {/* Positional Balance */}
                  <div className="grid grid-cols-3 gap-2 bg-[#111] p-2 rounded border border-[#2A2A2A] text-center font-mono text-xs">
                    <div>
                      <div className="text-amber-400 font-bold">{forwardsCount}</div>
                      <div className="text-[10px] text-on-surface-variant uppercase">Forwards</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">{defenseCount}</div>
                      <div className="text-[10px] text-on-surface-variant uppercase">Defense</div>
                    </div>
                    <div>
                      <div className="text-purple-400 font-bold">{goalieCount}</div>
                      <div className="text-[10px] text-on-surface-variant uppercase">Goalies</div>
                    </div>
                  </div>

                  {/* Drafted Players List */}
                  <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                    {draftedPlayers.length === 0 ? (
                      <p className="text-xs text-on-surface-variant/50 italic py-2">No selections yet</p>
                    ) : (
                      draftedPlayers.map(p => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded bg-white/5 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <CountryFlag nationality={p.nationality} size="xs" />
                            <span className="text-white font-bold">{p.fullName}</span>
                          </div>
                          {renderPositionBadge(p.position)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DRAFT CONFIRMATION MODAL */}
      {selectedPlayerForDraft && currentPick && currentTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0b0b] border border-tertiary/60 rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#2A2A2A] pb-4">
              <div>
                <span className="font-mono text-[10px] text-tertiary uppercase tracking-widest block mb-1">
                  CONFIRM DRAFT SELECTION
                </span>
                <h3 className="text-xl font-bold text-white">
                  Drafting to {currentTeam.name}
                </h3>
                <span className="text-xs font-mono text-on-surface-variant">
                  Round {currentPick.roundNumber} • Pick #{currentPick.pickOrder} (Overall #{currentPick.overallPick})
                </span>
              </div>
              <button
                onClick={() => setSelectedPlayerForDraft(null)}
                className="text-on-surface-variant hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Player Card Summary */}
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-surface-container-highest border border-[#2A2A2A] flex items-center justify-center font-display text-lg font-bold text-white shrink-0">
                {selectedPlayerForDraft.firstName[0]}{selectedPlayerForDraft.lastName[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-bold text-white">{selectedPlayerForDraft.fullName}</h4>
                  {renderPositionBadge(selectedPlayerForDraft.position)}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <CountryFlag nationality={selectedPlayerForDraft.nationality} size="xs" />
                    {selectedPlayerForDraft.nationality || 'NED'}
                  </span>
                  <span>Age: {selectedPlayerForDraft.age}</span>
                  <span>Shoots: {selectedPlayerForDraft.shoots || 'L'}</span>
                  <span>Exp: {selectedPlayerForDraft.yearsOfExperience || 1} YOE</span>
                </div>
              </div>
            </div>

            {/* Financial / Roster Impact */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-[#111] p-3 rounded border border-[#2A2A2A]">
                <span className="text-on-surface-variant block text-[10px] uppercase">Previous AAV</span>
                <span className="text-white font-bold text-sm">{selectedPlayerForDraft.previousAav || '€15,000'}</span>
              </div>
              <div className="bg-[#111] p-3 rounded border border-[#2A2A2A]">
                <span className="text-on-surface-variant block text-[10px] uppercase">Assigned Roster</span>
                <span className="text-emerald-400 font-bold text-sm">{currentTeam.code} Main Roster</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlayerForDraft(null)}
                className="flex-1 py-3 rounded border border-[#2A2A2A] text-on-surface hover:text-white hover:border-white/40 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingPick}
                onClick={() => handleDraftPlayer(selectedPlayerForDraft)}
                className="flex-1 py-3 rounded bg-tertiary text-black hover:brightness-110 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                {isSubmittingPick ? 'Processing...' : 'Confirm Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
