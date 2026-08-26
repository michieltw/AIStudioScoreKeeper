import { useState, useEffect } from 'react';
import { ArrowLeft, User as UserIcon, Briefcase, Ruler, Shield, Plus, Edit2, Calendar, Star, Medal, Camera, MessageCircle, UserPlus, MoreHorizontal, Image as ImageIcon, Link as LinkIcon, X, Check, Trash2, AlertCircle, Loader2, Flag, Hash, Activity, Eye, ShieldCheck, Globe } from 'lucide-react';
import { User, Achievement, Award } from '../types';
import { getGasUrl } from '../utils/gasUrl';
import { fetchGasData } from '../utils/fetchGas';
import CountryFlag from './CountryFlag';

interface MyProfileScreenProps {
  viewedPerson?: any;
  currentUser: User | null;
  onBack: () => void;
}

export default function MyProfileScreen({ currentUser, viewedPerson, onBack }: MyProfileScreenProps) {
  const isOwnProfile = !viewedPerson || !currentUser || (viewedPerson && (viewedPerson.id === currentUser.personId || viewedPerson.id === currentUser.id));
  const canEditPhotos = true; // Always allow changing profile photo and banner on profile view
  const personId = viewedPerson?.id || currentUser?.personId || currentUser?.id || 'person-1';
  const [activeTab, setActiveTab] = useState<'about' | 'jobs' | 'equipment' | 'events' | 'achievements'>('about');

  const [profileData, setProfileData] = useState<any>(null);
  const [equipmentData, setEquipmentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingEquipment, setIsEditingEquipment] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState<any>({});
  const [editEquipmentForm, setEditEquipmentForm] = useState<any>({});

  const [jobsData, setJobsData] = useState<any[]>([]);

  // Photo & Banner Modal State
  const [photoModal, setPhotoModal] = useState<{
    isOpen: boolean;
    type: 'profile' | 'cover';
    url: string;
  }>({
    isOpen: false,
    type: 'profile',
    url: ''
  });
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  const [rsvps, setRsvps] = useState<Record<string, string>>({
    'evt-1': 'Maybe',
    'evt-2': 'Attending'
  });

  const fetchData = async (forceRefresh = false) => {
    if (!personId) return;
    setLoading(true);
    setError(null);
    try {
      const url = getGasUrl();
      if (!url) {
        throw new Error("No database URL set.");
      }

      // Fetch person data
      const personsRes = await fetchGasData(url, { action: 'getEcosystemData', sheetName: 'persons' }, forceRefresh);
      const personsResult = await personsRes.json();
      if (personsResult.status === 'Success') {
        const headers = personsResult.data[0];
        const rows = personsResult.data.slice(1);
        const personRow = rows.find((r: any[]) => r[0] === personId);
        if (personRow) {
          const mappedPerson = headers.reduce((acc: any, curr: string, idx: number) => {
            acc[curr] = personRow[idx];
            return acc;
          }, {});
          setProfileData(mappedPerson);
          setEditProfileForm(mappedPerson);
        }
      }

      // Fetch equipment data
      const eqRes = await fetchGasData(url, { action: 'getEcosystemData', sheetName: 'player_equipment' }, forceRefresh);
      const eqResult = await eqRes.json();
      if (eqResult.status === 'Success') {
        const eqHeaders = eqResult.data[0];
        const eqRows = eqResult.data.slice(1);
        // Note: equipment might be multiple rows, but we simplify by taking the first matched or map all.
        // Let's assume one row per person for simplification, or filter by equipment_type
        const playerEq = eqRows.filter((r: any[]) => r[1] === personId); // index 1 is person_id according to schema

        // For UI simplicity, we map specific types
        const eqMap: any = {};
        let eqIdMap: any = {}; // store ids to allow updating
        playerEq.forEach((row: any[]) => {
          const type = row[2]; // equipment_type
          const brand = row[3]; // brand_id
          const serial = row[4]; // serial_number
          const purchaseDate = row[5]; // purchase_date
          const notes = row[9]; // notes, using notes as model/details for simplicity
          eqMap[`${type}Brand`] = brand;
          eqMap[`${type}Model`] = notes;
          eqIdMap[`${type}Id`] = row[0]; // id

          if (type === 'stick') {
            let modelVal = notes || '';
            let curveVal = '';
            let flexVal = '';
            let purchaseYearVal = purchaseDate ? String(purchaseDate).substring(0, 4) : '';

            if (notes) {
              try {
                const parsed = JSON.parse(notes);
                if (parsed && typeof parsed === 'object') {
                  modelVal = parsed.model || '';
                  curveVal = parsed.curve || '';
                  flexVal = parsed.flex || '';
                  if (parsed.purchaseYear) purchaseYearVal = String(parsed.purchaseYear);
                }
              } catch (e) {
                modelVal = notes;
              }
            }
            if (!purchaseYearVal && purchaseDate) {
              purchaseYearVal = String(purchaseDate).substring(0, 4);
            }
            eqMap.stickModel = modelVal;
            eqMap.stickCurve = curveVal;
            eqMap.stickFlex = flexVal;
            eqMap.stickPurchaseYear = purchaseYearVal;
          }
        });
        setEquipmentData({ ...eqMap, _ids: eqIdMap });
        setEditEquipmentForm(eqMap);
      }

      // Fetch jobs data
      const jobsRes = await fetchGasData(url, { action: 'getEcosystemData', sheetName: 'jobs' }, forceRefresh);
      const jobsResult = await jobsRes.json();
      if (jobsResult.status === 'Success') {
        const jobsHeaders = jobsResult.data[0];
        const jobsRows = jobsResult.data.slice(1);
        const playerJobs = jobsRows.filter((r: any[]) => r[1] === personId && r[2] !== 'Deleted'); // index 1 is person_id, filter out deleted

        const mappedJobs = playerJobs.map((row: any[]) => {
            return jobsHeaders.reduce((acc: any, curr: string, idx: number) => {
              acc[curr] = row[idx];
              return acc;
            }, {});
        });
        setJobsData(mappedJobs);
      }

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [personId]);

  const displayName = profileData
    ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || viewedPerson?.name || currentUser?.username || currentUser?.email || "My Profile"
    : (viewedPerson?.name || currentUser?.username || currentUser?.email || "My Profile");

  const dummyBadges: Achievement[] = [
    { id: 'b1', name: '100 Career Goals' },
    { id: 'b2', name: 'Hat Trick Hero' }
  ];

  const dummyAwards: Award[] = [
    { id: 'a1', name: 'MVP 2023' },
    { id: 'a2', name: 'Best Forward' }
  ];

  const dummyEvents = [
    { id: 'evt-1', title: 'Practice - Blackout HC', date: '2024-11-15 20:00' },
    { id: 'evt-2', title: 'Game vs Spartans', date: '2024-11-18 19:30' }
  ];

  const handleOpenEditProfile = () => {
    setEditProfileForm({
      first_name: profileData?.first_name || '',
      last_name: profileData?.last_name || '',
      height_cm: profileData?.height_cm || '',
      weight_kg: profileData?.weight_kg || '',
      plays_position: profileData?.plays_position || 'Center',
      secondary_position: profileData?.secondary_position || '',
      shoots: profileData?.shoots || 'Right',
      nationality: profileData?.nationality || 'Netherlands',
      date_of_birth: profileData?.date_of_birth ? String(profileData.date_of_birth).substring(0, 10) : '',
      gender: profileData?.gender || 'Male',
      visibility: profileData?.visibility || 'Public',
      ijn_bondsnummer: profileData?.ijn_bondsnummer || '',
      jersey_number: profileData?.jersey_number || '',
      playstyle: profileData?.playstyle || '',
      status: profileData?.status || 'Active',
      bio: profileData?.bio || ''
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!personId) return;
    setLoading(true);
    setError(null);
    try {
      const url = getGasUrl();
      if (!url) throw new Error("No database URL set.");

      const payload = {
        first_name: editProfileForm.first_name || '',
        last_name: editProfileForm.last_name || '',
        height_cm: editProfileForm.height_cm || '',
        weight_kg: editProfileForm.weight_kg || '',
        plays_position: editProfileForm.plays_position || '',
        secondary_position: editProfileForm.secondary_position || '',
        shoots: editProfileForm.shoots || 'Right',
        nationality: editProfileForm.nationality || '',
        date_of_birth: editProfileForm.date_of_birth || '',
        gender: editProfileForm.gender || '',
        visibility: editProfileForm.visibility || 'Public',
        ijn_bondsnummer: editProfileForm.ijn_bondsnummer || '',
        jersey_number: editProfileForm.jersey_number || '',
        playstyle: editProfileForm.playstyle || '',
        status: editProfileForm.status || 'Active',
        bio: editProfileForm.bio || ''
      };

      const res = await fetchGasData(url, {
        action: 'updateRow',
        sheetName: 'persons',
        idColumn: 'id',
        idValue: personId,
        updateData: payload
      });
      const result = await res.json();
      if (result.status === 'Success') {
        setIsEditingProfile(false);
        setProfileData((prev: any) => ({ ...prev, ...payload }));
        fetchData(true);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch(e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEquipment = async (type: string, data: any) => {
    if (!personId) return;
    setLoading(true);
    try {
      const url = getGasUrl();
      if (!url) throw new Error("No database URL set.");

      let eqId = equipmentData?._ids?.[`${type}Id`];
      let idCol = 'id';
      let idVal = eqId;

      if (!eqId) {
        eqId = `eq-${Date.now()}-${type}`;
        idCol = 'id';
        idVal = eqId;
      }

      let brandVal = '';
      let notesVal = '';
      let purchaseDateVal = '';
      let serialVal = '';

      if (typeof data === 'object' && data !== null) {
        brandVal = data.brand || '';
        if (type === 'stick') {
          purchaseDateVal = data.purchaseYear ? String(data.purchaseYear) : '';
          serialVal = `${data.curve || ''}${data.flex ? ` | ${data.flex} Flex` : ''}`.trim();
          notesVal = JSON.stringify({
            model: data.model || '',
            curve: data.curve || '',
            flex: data.flex || '',
            purchaseYear: data.purchaseYear || ''
          });
        } else {
          notesVal = data.model || '';
        }
      } else {
        brandVal = data || '';
      }

      const res = await fetchGasData(url, {
        action: 'updateRow',
        sheetName: 'player_equipment',
        idColumn: idCol,
        idValue: idVal,
        updateData: {
          person_id: personId,
          equipment_type: type,
          brand_id: brandVal,
          purchase_date: purchaseDateVal,
          serial_number: serialVal,
          notes: notesVal
        }
      });
      const result = await res.json();
      if (result.status === 'Success') {
        fetchData(true);
      } else {
        throw new Error(result.error || 'Failed to update equipment');
      }
    } catch(e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleSaveJob = async (job: any = null) => {
    if (!personId) return;
    setLoading(true);
    try {
      const url = getGasUrl();
      if (!url) throw new Error("No database URL set.");

      let jobId = job?.id;
      let newJobType = '';
      let newOrg = '';
      let newIsActive = true;

      if (job) {
          // Edit existing - for simplicity using prompts or could use a proper form
          newJobType = prompt("Enter job type/title:", job.job_type) || job.job_type;
          newOrg = prompt("Enter organization/club:", job.organization_id) || job.organization_id;
          newIsActive = confirm("Is this job currently active?");
      } else {
          // Add new
          jobId = `job-${Date.now()}`;
          newJobType = prompt("Enter job type/title (e.g. Head Coach):") || '';
          newOrg = prompt("Enter organization/club:") || '';
          if (!newJobType) {
              setLoading(false);
              return; // Cancelled
          }
      }

      const res = await fetchGasData(url, {
        action: 'updateRow',
        sheetName: 'jobs',
        idColumn: 'id',
        idValue: jobId,
        updateData: {
          person_id: personId,
          job_type: newJobType,
          organization_id: newOrg,
          is_active: newIsActive
        }
      });

      const result = await res.json();
      if (result.status === 'Success') {
        fetchData(true);
      } else {
        throw new Error(result.error || 'Failed to save job');
      }
    } catch(e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleRemoveJob = async (jobId: string) => {
      if (!confirm("Are you sure you want to remove this job?")) return;
      // In a real app we might delete the row, but here we can just mark it inactive or blank it out if delete isn't supported.
      // Since updateRow adds or updates, let's just mark it inactive and "Deleted" for now.
      if (!personId) return;
      setLoading(true);
      try {
        const url = getGasUrl();
        if (!url) throw new Error("No database URL set.");

        const res = await fetchGasData(url, {
          action: 'updateRow',
          sheetName: 'jobs',
          idColumn: 'id',
          idValue: jobId,
          updateData: {
            is_active: false,
            job_type: "Deleted"
          }
        });

        const result = await res.json();
        if (result.status === 'Success') {
          fetchData(true);
        } else {
          throw new Error(result.error || 'Failed to remove job');
        }
      } catch(e: any) {
        setError(e.message);
        setLoading(false);
      }
  };

  const handleOpenPhotoModal = (type: 'profile' | 'cover') => {
    const currentUrl = type === 'profile' ? profileData?.photo_url || '' : profileData?.cover_url || '';
    setPhotoModal({
      isOpen: true,
      type,
      url: currentUrl
    });
    setPhotoError(null);
    setPreviewError(false);
  };

  const handleSavePhoto = async (customUrl?: string) => {
    if (!personId) {
      setPhotoError("No person record identified for this profile.");
      return;
    }
    setSavingPhoto(true);
    setPhotoError(null);
    try {
      const url = getGasUrl();
      if (!url) throw new Error("No database URL set. Please connect Google Apps Script in Settings.");

      const targetUrl = typeof customUrl === 'string' ? customUrl.trim() : photoModal.url.trim();
      const isProfile = photoModal.type === 'profile';
      const fieldKey = isProfile ? 'photo_url' : 'cover_url';

      const updateData: Record<string, any> = {
        [fieldKey]: targetUrl
      };

      // Populate basic names if creating row for the first time
      if (!profileData?.first_name && currentUser) {
        updateData.first_name = currentUser.username || (currentUser.email ? currentUser.email.split('@')[0] : 'Player');
        updateData.plays_position = 'Forward';
      }

      const res = await fetchGasData(url, {
        action: 'updateRow',
        sheetName: 'persons',
        idColumn: 'id',
        idValue: personId,
        updateData
      });
      const result = await res.json();
      if (result.status === 'Success') {
        setProfileData((prev: any) => ({
          ...prev,
          [fieldKey]: targetUrl
        }));
        setPhotoModal(prev => ({ ...prev, isOpen: false }));
        fetchData(true);
      } else {
        throw new Error(result.error || 'Failed to update photo in database');
      }
    } catch(e: any) {
      setPhotoError(e.message || 'Failed to update photo');
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleRsvpChange = async (eventId: string, status: string) => {
    setRsvps(prev => ({ ...prev, [eventId]: status })); // optimistic update

    if (!personId) return;
    try {
        const url = getGasUrl();
        if (!url) return;

        // Find existing RSVP id for this event/person combination if any.
        // For now, let's assume we can just use `updateRow` with a composite-like ID or we just save new.
        // A proper implementation would need `id` from the fetch.
        // Simplification: generate a unique ID based on person+event.
        const rsvpId = `rsvp-${personId}-${eventId}`;

        await fetchGasData(url, {
            action: 'updateRow',
            sheetName: 'event_rsvps',
            idColumn: 'id',
            idValue: rsvpId,
            updateData: {
                event_id: eventId,
                person_id: personId,
                rsvp_status: status
            }
        });
    } catch(e: any) {
        console.error("Failed to save RSVP", e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Top Navigation */}
      <div className="flex items-center p-4 bg-surface-container-low/50 backdrop-blur-md sticky top-0 z-50">
        <button
          onClick={onBack}
          className="text-on-surface-variant hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-bold ml-2 text-white">{displayName}</span>
      </div>

      <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto flex flex-col bg-background">

        {/* Cover Photo Area */}
        <div 
          onClick={() => handleOpenPhotoModal('cover')}
          className="relative w-full h-48 md:h-64 bg-surface-container-highest rounded-b-lg overflow-hidden cursor-pointer group/banner z-20"
          title="Click to change banner image"
        >
            {/* Cover Image or Placeholder Cover Gradient */}
            {profileData?.cover_url ? (
               <img src={profileData.cover_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
               <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-high to-tertiary/20"></div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <Camera className="w-8 h-8 text-white" />
            </div>

            {canEditPhotos && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPhotoModal('cover');
                  }}
                  className="absolute bottom-3 right-3 z-30 bg-surface-container-low border border-[#2A2A2A] hover:bg-surface-container-highest hover:border-tertiary p-2 rounded-full text-tertiary transition-all shadow-lg active:scale-95 cursor-pointer pointer-events-auto"
                  title="Change Banner Image"
                  aria-label="Change Banner Image"
                >
                    <Camera className="w-4 h-4" />
                </button>
            )}
        </div>

        {/* Profile Header Section */}
        <div className="px-4 pb-4 border-b border-[#2A2A2A] relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between">

                {/* Profile Pic & Name */}
                <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16 relative z-20">
                    {/* Profile Picture */}
                    <div 
                      onClick={() => handleOpenPhotoModal('profile')}
                      className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-surface-container-highest flex items-center justify-center shrink-0 mx-auto md:mx-0 overflow-hidden shadow-2xl cursor-pointer group/avatar"
                      title="Click to change profile picture"
                    >
                        <img
                            src={profileData?.photo_url || "https://cdn.shopify.com/s/files/1/1038/7203/7203/files/placeholder_profile_player_male.png?v=1784405789"}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-full pointer-events-none">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                        {canEditPhotos && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPhotoModal('profile');
                              }}
                              className="absolute bottom-2 right-2 z-30 bg-surface-container-low border border-[#2A2A2A] hover:bg-surface-container-highest hover:border-tertiary p-2 rounded-full text-tertiary transition-all shadow-lg active:scale-95 cursor-pointer pointer-events-auto"
                              title="Change Profile Picture"
                              aria-label="Change Profile Picture"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Name & Title */}
                    <div className="pb-2 text-center md:text-left mt-2 md:mt-0">
                        <h1 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
                            <span>{displayName}</span>
                            {(profileData?.nationality || viewedPerson?.nationality) && (
                                <CountryFlag nationality={profileData?.nationality || viewedPerson?.nationality} size="md" />
                            )}
                        </h1>
                        <p className="text-on-surface-variant font-medium mt-1">
                            {jobsData.find((j: any) => j.is_active)?.job_type || jobsData[0]?.job_type || viewedPerson?.job || "Head Coach"} • {jobsData.find((j: any) => j.is_active)?.organization_id || jobsData[0]?.organization_id || viewedPerson?.club || "Blackout HC"}
                        </p>
                    </div>
                </div>

                {/* Actions (Facebook Style) */}
                <div className="flex flex-col sm:flex-row w-full sm:w-auto justify-center md:justify-end gap-2 mt-4 md:mb-2 md:mt-0">
                    {isOwnProfile ? (
                        <button
                          onClick={handleOpenEditProfile}
                          className="bg-surface-container-low hover:bg-surface-container-highest text-white border border-[#2A2A2A] px-4 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-colors w-full sm:w-auto shadow-sm active:scale-95"
                        >
                            <Edit2 className="w-4 h-4 text-tertiary" /> Edit profile
                        </button>
                    ) : (
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => alert(`You are now following ${displayName}`)} className="flex-1 sm:flex-none bg-tertiary text-black hover:brightness-110 px-4 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                                <UserPlus className="w-4 h-4" /> Follow
                            </button>
                            <button onClick={() => alert(`Opening chat with ${displayName}...`)} className="flex-1 sm:flex-none bg-surface-container-low hover:bg-surface-container-highest text-white border border-[#2A2A2A] px-4 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                                <MessageCircle className="w-4 h-4" /> Message
                            </button>
                            <button onClick={() => alert('More options coming soon!')} className="bg-surface-container-low hover:bg-surface-container-highest text-white border border-[#2A2A2A] px-3 py-2 rounded-md transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Horizontal Divider before Tabs */}
            <div className="h-[1px] bg-[#2A2A2A] mt-6 mb-1 hidden md:block"></div>

            {/* Scrollable Tabs row */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 mt-4 md:mt-0 px-2 md:px-0 shrink-0 w-full">
                <button
                    onClick={() => setActiveTab('about')}
                    className={`py-3 px-4 font-bold text-sm rounded-md transition-colors whitespace-nowrap ${
                        activeTab === 'about' ? 'text-tertiary bg-surface-container-low' : 'text-on-surface-variant hover:bg-surface-container-lowest'
                    }`}
                >
                    About
                </button>
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={`py-3 px-4 font-bold text-sm rounded-md transition-colors whitespace-nowrap ${
                        activeTab === 'jobs' ? 'text-tertiary bg-surface-container-low' : 'text-on-surface-variant hover:bg-surface-container-lowest'
                    }`}
                >
                    Jobs
                </button>
                <button
                    onClick={() => setActiveTab('equipment')}
                    className={`py-3 px-4 font-bold text-sm rounded-md transition-colors whitespace-nowrap ${
                        activeTab === 'equipment' ? 'text-tertiary bg-surface-container-low' : 'text-on-surface-variant hover:bg-surface-container-lowest'
                    }`}
                >
                    Equipment
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`py-3 px-4 font-bold text-sm rounded-md transition-colors whitespace-nowrap ${
                        activeTab === 'events' ? 'text-tertiary bg-surface-container-low' : 'text-on-surface-variant hover:bg-surface-container-lowest'
                    }`}
                >
                    Events
                </button>
                <button
                    onClick={() => setActiveTab('achievements')}
                    className={`py-3 px-4 font-bold text-sm rounded-md transition-colors whitespace-nowrap ${
                        activeTab === 'achievements' ? 'text-tertiary bg-surface-container-low' : 'text-on-surface-variant hover:bg-surface-container-lowest'
                    }`}
                >
                    Achievements
                </button>
            </div>
        </div>

        {/* Content Area (Two Columns on Desktop) */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-surface-container-lowest md:bg-transparent min-h-[500px]">

            {/* Left Column (Intro / Details Widget) */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold text-xl">Intro</h3>
                        {profileData?.status && (
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                                profileData.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                profileData.status === 'Retired' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
                            }`}>
                                {profileData.status}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 text-sm">
                        <div className="flex items-center gap-3 text-on-surface-variant">
                            <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>Role / Pos: <strong className="text-white">{profileData?.plays_position || viewedPerson?.role || currentUser?.role || "Player"}</strong></span>
                        </div>
                        {profileData?.secondary_position && profileData.secondary_position !== 'None' && (
                            <div className="flex items-center gap-3 text-on-surface-variant">
                                <Shield className="w-4 h-4 text-gray-400 shrink-0" />
                                <span>Sec. Position: <strong className="text-white">{profileData.secondary_position}</strong></span>
                            </div>
                        )}
                        {profileData?.jersey_number && (
                            <div className="flex items-center gap-3 text-on-surface-variant">
                                <Hash className="w-4 h-4 text-gray-400 shrink-0" />
                                <span>Jersey #: <strong className="text-white">#{profileData.jersey_number}</strong></span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-on-surface-variant">
                            <div className="w-4 text-center font-bold text-xs text-gray-400 shrink-0">H</div>
                            <span>Shoots: <strong className="text-white">{profileData?.shoots || viewedPerson?.handedness || "Right"}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface-variant">
                            <Ruler className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>Height: <strong className="text-white">{profileData?.height_cm ? `${profileData.height_cm} cm` : (viewedPerson?.height || "—")}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface-variant">
                            <div className="w-4 text-center font-bold text-xs text-gray-400 shrink-0">W</div>
                            <span>Weight: <strong className="text-white">{profileData?.weight_kg ? `${profileData.weight_kg} kg` : (viewedPerson?.weight || "—")}</strong></span>
                        </div>
                        {(profileData?.nationality || viewedPerson?.nationality) && (
                            <div className="flex items-center gap-3 text-on-surface-variant">
                                <div className="w-4 flex items-center justify-center shrink-0">
                                    <CountryFlag nationality={profileData?.nationality || viewedPerson?.nationality} size="sm" />
                                </div>
                                <span>Nationality: <strong className="text-white">{profileData?.nationality || viewedPerson?.nationality}</strong></span>
                            </div>
                        )}
                        {profileData?.date_of_birth && (
                            <div className="flex items-center gap-3 text-on-surface-variant">
                                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                <span>Birthdate: <strong className="text-white">{String(profileData.date_of_birth).substring(0, 10)}</strong></span>
                            </div>
                        )}
                        {profileData?.gender && (
                            <div className="flex items-center gap-3 text-on-surface-variant">
                                <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                <span>Gender: <strong className="text-white">{profileData.gender}</strong></span>
                            </div>
                        )}
                        {profileData?.ijn_bondsnummer && (
                            <div className="flex items-center gap-3 text-on-surface-variant">
                                <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
                                <span>IJN Bonds#: <strong className="text-white">{profileData.ijn_bondsnummer}</strong></span>
                            </div>
                        )}
                        {profileData?.playstyle && (
                            <div className="flex items-center gap-3 text-on-surface-variant">
                                <Activity className="w-4 h-4 text-gray-400 shrink-0" />
                                <span>Playstyle: <strong className="text-white">{profileData.playstyle}</strong></span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-on-surface-variant">
                            <Eye className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>Profile: <strong className="text-white">{profileData?.visibility || "Public"}</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column (Dynamic Tab Content) */}
            <div className="w-full md:w-2/3 flex flex-col gap-4">
                <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 shadow-sm min-h-[300px]">
                    {activeTab === 'about' && (
                        <div className="flex flex-col gap-4">
                            <h3 className="text-white font-bold text-xl mb-2">About</h3>
                            <p className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap">
                                {profileData?.bio || `Welcome to ${displayName}'s profile. This section includes bio information, favorite quotes, or a summary of their hockey career.`}
                            </p>
                        </div>
                    )}

                    {activeTab === 'jobs' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-bold text-xl">Assigned Jobs & Roles</h3>
                                {isOwnProfile && (
                                    <button onClick={() => handleSaveJob()} className="text-tertiary hover:underline text-sm font-bold flex items-center gap-1">
                                        <Plus className="w-4 h-4" /> Add
                                    </button>
                                )}
                            </div>

                            {jobsData.length > 0 ? jobsData.map((job: any) => (
                                <div key={job.id} className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-4 flex flex-col gap-1 relative group">
                                    <div className="flex justify-between items-start">
                                        <span className="text-white font-bold text-lg">{job.job_type || "Unknown Job"}</span>
                                        <span className={`text-xs px-2 py-1 rounded-md ${job.is_active ? 'bg-[#2A2A2A] text-gray-300' : 'bg-red-900/50 text-red-300'}`}>
                                            {job.organization_id || "No Org"} {job.is_active ? '' : '(Inactive)'}
                                        </span>
                                    </div>
                                    <span className="text-sm text-on-surface-variant">Role: {job.job_type || "Role"}</span>

                                    {isOwnProfile && (
                                        <div className="absolute top-4 right-4 hidden group-hover:flex gap-2">
                                            <button onClick={() => handleSaveJob(job)} className="text-tertiary hover:text-white p-1">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleRemoveJob(job.id)} className="text-red-500 hover:text-red-400 p-1">
                                                X
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="text-on-surface-variant text-sm">No jobs listed.</div>
                            )}

                        </div>
                    )}

                    {activeTab === 'equipment' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-bold text-xl">Preferred Equipment</h3>
                                {isOwnProfile && (
                                    <button
                                      onClick={() => setIsEditingEquipment(!isEditingEquipment)}
                                      className="text-tertiary hover:underline text-sm font-bold flex items-center gap-1"
                                    >
                                        <Edit2 className="w-4 h-4" /> {isEditingEquipment ? 'Cancel' : 'Edit'}
                                    </button>
                                )}
                            </div>
                            {!isEditingEquipment ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-mono uppercase tracking-wider text-tertiary font-bold">Stick Specifications</span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            <div className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-3 flex flex-col gap-1">
                                                <span className="text-xs text-gray-400">Stick Brand</span>
                                                <span className="text-white font-bold">{equipmentData?.stickBrand || "Bauer"}</span>
                                            </div>
                                            <div className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-3 flex flex-col gap-1">
                                                <span className="text-xs text-gray-400">Stick Model</span>
                                                <span className="text-white font-bold">{equipmentData?.stickModel || "Nexus Sync"}</span>
                                            </div>
                                            <div className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-3 flex flex-col gap-1">
                                                <span className="text-xs text-gray-400">Blade Curve</span>
                                                <span className="text-white font-bold">{equipmentData?.stickCurve || "P92"}</span>
                                            </div>
                                            <div className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-3 flex flex-col gap-1">
                                                <span className="text-xs text-gray-400">Flex</span>
                                                <span className="text-white font-bold">{equipmentData?.stickFlex ? `${equipmentData.stickFlex} Flex` : "87 Flex"}</span>
                                            </div>
                                            <div className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-3 flex flex-col gap-1">
                                                <span className="text-xs text-gray-400">Year Purchased</span>
                                                <span className="text-white font-bold">{equipmentData?.stickPurchaseYear || "2023"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold">Other Equipment</span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-3 flex flex-col gap-1">
                                                <span className="text-xs text-gray-400">Skate Brand</span>
                                                <span className="text-white font-bold">{equipmentData?.skateBrand || "CCM"}</span>
                                            </div>
                                            <div className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-3 flex flex-col gap-1">
                                                <span className="text-xs text-gray-400">Helmet Brand</span>
                                                <span className="text-white font-bold">{equipmentData?.helmetBrand || "Warrior"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-3">
                                        <span className="text-xs font-mono uppercase tracking-wider text-tertiary font-bold">Stick Details</span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-gray-400">Stick Brand</label>
                                                <input
                                                  type="text"
                                                  placeholder="e.g. Bauer, CCM, True"
                                                  value={editEquipmentForm.stickBrand || ''}
                                                  onChange={e => setEditEquipmentForm({...editEquipmentForm, stickBrand: e.target.value})}
                                                  className="bg-[#050505] border border-[#2A2A2A] rounded px-2 py-1.5 text-white text-sm"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-gray-400">Stick Model</label>
                                                <input
                                                  type="text"
                                                  placeholder="e.g. Nexus Sync, Hyperlite 2"
                                                  value={editEquipmentForm.stickModel || ''}
                                                  onChange={e => setEditEquipmentForm({...editEquipmentForm, stickModel: e.target.value})}
                                                  className="bg-[#050505] border border-[#2A2A2A] rounded px-2 py-1.5 text-white text-sm"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-gray-400">Blade Curve</label>
                                                <input
                                                  type="text"
                                                  placeholder="e.g. P92, P28, P88, W03"
                                                  value={editEquipmentForm.stickCurve || ''}
                                                  onChange={e => setEditEquipmentForm({...editEquipmentForm, stickCurve: e.target.value})}
                                                  className="bg-[#050505] border border-[#2A2A2A] rounded px-2 py-1.5 text-white text-sm"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-gray-400">Flex</label>
                                                <input
                                                  type="text"
                                                  placeholder="e.g. 77, 85, 87, 95"
                                                  value={editEquipmentForm.stickFlex || ''}
                                                  onChange={e => setEditEquipmentForm({...editEquipmentForm, stickFlex: e.target.value})}
                                                  className="bg-[#050505] border border-[#2A2A2A] rounded px-2 py-1.5 text-white text-sm"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-gray-400">Year Purchased</label>
                                                <input
                                                  type="text"
                                                  placeholder="e.g. 2024, 2023"
                                                  value={editEquipmentForm.stickPurchaseYear || ''}
                                                  onChange={e => setEditEquipmentForm({...editEquipmentForm, stickPurchaseYear: e.target.value})}
                                                  className="bg-[#050505] border border-[#2A2A2A] rounded px-2 py-1.5 text-white text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <span className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold">Other Equipment</span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-gray-400">Skate Brand</label>
                                                <input
                                                  type="text"
                                                  placeholder="e.g. CCM, Bauer, True"
                                                  value={editEquipmentForm.skateBrand || ''}
                                                  onChange={e => setEditEquipmentForm({...editEquipmentForm, skateBrand: e.target.value})}
                                                  className="bg-[#050505] border border-[#2A2A2A] rounded px-2 py-1.5 text-white text-sm"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-gray-400">Helmet Brand</label>
                                                <input
                                                  type="text"
                                                  placeholder="e.g. Warrior, Bauer, CCM"
                                                  value={editEquipmentForm.helmetBrand || ''}
                                                  onChange={e => setEditEquipmentForm({...editEquipmentForm, helmetBrand: e.target.value})}
                                                  className="bg-[#050505] border border-[#2A2A2A] rounded px-2 py-1.5 text-white text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <button
                                          onClick={async () => {
                                              await handleSaveEquipment('stick', {
                                                  brand: editEquipmentForm.stickBrand,
                                                  model: editEquipmentForm.stickModel,
                                                  curve: editEquipmentForm.stickCurve,
                                                  flex: editEquipmentForm.stickFlex,
                                                  purchaseYear: editEquipmentForm.stickPurchaseYear,
                                              });
                                              await handleSaveEquipment('skate', {
                                                  brand: editEquipmentForm.skateBrand,
                                                  model: editEquipmentForm.skateModel,
                                              });
                                              await handleSaveEquipment('helmet', {
                                                  brand: editEquipmentForm.helmetBrand,
                                                  model: editEquipmentForm.helmetModel,
                                              });
                                              setIsEditingEquipment(false);
                                          }}
                                          className="bg-tertiary text-black flex-1 py-2 rounded-md font-bold text-sm tracking-wide uppercase font-mono"
                                        >
                                            Save All Equipment
                                        </button>
                                        <button
                                          onClick={() => setIsEditingEquipment(false)}
                                          className="bg-surface-container-highest text-white px-4 py-2 rounded-md text-sm font-mono uppercase"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div className="flex flex-col gap-4">
                            <h3 className="text-white font-bold text-xl mb-2">Upcoming Events</h3>
                            <div className="flex flex-col gap-3">
                                {dummyEvents.map(event => (
                                    <div key={event.id} className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h4 className="text-white font-bold">{event.title}</h4>
                                            <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                                                <Calendar className="w-4 h-4" /> {event.date}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            {['Attending', 'Not Attending', 'Maybe'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleRsvpChange(event.id, status)}
                                                    className={`flex-1 sm:flex-none px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${
                                                        rsvps[event.id] === status
                                                            ? 'bg-tertiary text-black'
                                                            : 'bg-surface-container-highest text-on-surface-variant hover:text-white'
                                                    }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Medal className="w-6 h-6 text-tertiary" />
                                <h3 className="text-white font-bold text-xl">Awards</h3>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {dummyAwards.map(award => (
                                      <div key={award.id} className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-4 flex flex-col items-center justify-center gap-2 text-center">
                                          <Medal className="w-8 h-8 text-yellow-400" />
                                          <span className="text-white font-bold text-sm">{award.name}</span>
                                      </div>
                                  ))}
                              </div>
                            </div>

                            <div className="flex flex-col gap-4 mt-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Star className="w-6 h-6 text-tertiary" />
                                <h3 className="text-white font-bold text-xl">Milestones</h3>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {dummyBadges.map(badge => (
                                      <div key={badge.id} className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-4 flex flex-col items-center justify-center gap-2 text-center">
                                          <Shield className="w-8 h-8 text-tertiary" />
                                          <span className="text-white font-bold text-sm">{badge.name}</span>
                                      </div>
                                  ))}
                              </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Photo & Banner Image Modal */}
      {photoModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] relative z-[10000]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A] bg-surface-container-low">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-display">
                    {photoModal.type === 'profile' ? 'Change Profile Picture' : 'Change Banner Image'}
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    {photoModal.type === 'profile' 
                      ? 'Specify the image URL for your profile avatar' 
                      : 'Specify the image URL for your header banner'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPhotoModal(prev => ({ ...prev, isOpen: false }))}
                disabled={savingPhoto}
                className="text-on-surface-variant hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
              
              {/* URL Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-on-surface-variant">
                  Image Web URL
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="url"
                    value={photoModal.url}
                    onChange={(e) => {
                      setPhotoModal(prev => ({ ...prev, url: e.target.value }));
                      setPreviewError(false);
                      setPhotoError(null);
                    }}
                    placeholder={photoModal.type === 'profile' ? 'https://example.com/avatar.jpg' : 'https://example.com/banner.jpg'}
                    className="w-full bg-[#050505] border border-[#2A2A2A] rounded-lg pl-9 pr-9 py-2.5 text-sm text-white focus:outline-none focus:border-tertiary transition-colors font-mono"
                    autoFocus
                  />
                  {photoModal.url && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoModal(prev => ({ ...prev, url: '' }));
                        setPreviewError(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                      title="Clear URL"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Live Preview Frame */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-mono uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-tertiary" />
                  Live Preview
                </span>

                <div className="bg-[#050505] border border-[#2A2A2A] rounded-lg p-4 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                  {photoModal.url ? (
                    photoModal.type === 'profile' ? (
                      <div className="relative flex flex-col items-center">
                        <div className="relative w-28 h-28 rounded-full border-2 border-tertiary/70 overflow-hidden shadow-xl bg-surface-container-high">
                          <img
                            src={photoModal.url}
                            alt="Profile Preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => setPreviewError(true)}
                            onLoad={() => setPreviewError(false)}
                          />
                        </div>
                        {previewError ? (
                          <div className="flex items-center gap-1.5 text-xs text-error mt-2">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Unable to load image from URL (check link)</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-tertiary font-mono mt-2 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Valid image preview
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center">
                        <div className="relative w-full h-32 rounded-lg border border-tertiary/50 overflow-hidden bg-surface-container-high shadow-lg">
                          <img
                            src={photoModal.url}
                            alt="Banner Preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => setPreviewError(true)}
                            onLoad={() => setPreviewError(false)}
                          />
                        </div>
                        {previewError ? (
                          <div className="flex items-center gap-1.5 text-xs text-error mt-2">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Unable to load image from URL (check link)</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-tertiary font-mono mt-2 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Valid banner preview
                          </span>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4 text-gray-500">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
                      <p className="text-xs font-medium">Enter an image URL above</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Banner */}
              {photoError && (
                <div className="bg-error/10 border border-error/30 rounded-lg p-3 flex items-start gap-2.5 text-xs text-error">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">{photoError}</div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#2A2A2A] bg-surface-container-low flex items-center justify-between gap-3">
              {photoModal.url ? (
                <button
                  type="button"
                  onClick={() => handleSavePhoto('')}
                  disabled={savingPhoto}
                  className="px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1.5 font-medium disabled:opacity-50"
                  title="Remove image and reset to default"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Image</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPhotoModal(prev => ({ ...prev, isOpen: false }))}
                  disabled={savingPhoto}
                  className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-white bg-surface-container-high hover:bg-surface-container-highest rounded-lg transition-colors border border-[#2A2A2A]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleSavePhoto()}
                  disabled={savingPhoto}
                  className="px-4 py-2 text-xs font-bold bg-tertiary text-black hover:brightness-110 rounded-lg transition-all flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {savingPhoto ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Comprehensive Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] relative z-[10000]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A] bg-surface-container-low">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-display">
                    Edit Profile
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Update personal, hockey, and federation profile information
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                disabled={loading}
                className="text-on-surface-variant hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-6 text-sm">
              
              {/* Error Message */}
              {error && (
                <div className="bg-error/10 border border-error/30 rounded-lg p-3 flex items-start gap-2.5 text-xs text-error">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">{error}</div>
                </div>
              )}

              {/* Section 1: Basic Identity */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-tertiary flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" /> Basic Information & Visibility
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant font-medium">First Name</label>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={editProfileForm.first_name || ''}
                      onChange={e => setEditProfileForm({ ...editProfileForm, first_name: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant font-medium">Last Name</label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={editProfileForm.last_name || ''}
                      onChange={e => setEditProfileForm({ ...editProfileForm, last_name: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant font-medium">Preferred Jersey #</label>
                    <input
                      type="text"
                      placeholder="e.g. 8, 99"
                      value={editProfileForm.jersey_number || ''}
                      onChange={e => setEditProfileForm({ ...editProfileForm, jersey_number: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant font-medium">Public Profile?</label>
                    <select
                      value={editProfileForm.visibility || 'Public'}
                      onChange={e => setEditProfileForm({ ...editProfileForm, visibility: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    >
                      <option value="Public">Public (Visible to everyone)</option>
                      <option value="Private">Private (Members only)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Hockey & Athletic Attributes */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-tertiary flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Hockey & Athletics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant font-medium">Primary Position</label>
                    <select
                      value={editProfileForm.plays_position || 'Center'}
                      onChange={e => setEditProfileForm({ ...editProfileForm, plays_position: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    >
                      <option value="Center">Center</option>
                      <option value="Left Wing">Left Wing</option>
                      <option value="Right Wing">Right Wing</option>
                      <option value="Forward">Forward</option>
                      <option value="Defense">Defense</option>
                      <option value="Goalie">Goalie</option>
                      <option value="Coach">Coach</option>
                      <option value="Referee">Referee</option>
                      <option value="Team Manager">Team Manager</option>
                      <option value="Player">Player</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant font-medium">Secondary Position</label>
                    <select
                      value={editProfileForm.secondary_position || 'None'}
                      onChange={e => setEditProfileForm({ ...editProfileForm, secondary_position: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    >
                      <option value="None">None</option>
                      <option value="Center">Center</option>
                      <option value="Left Wing">Left Wing</option>
                      <option value="Right Wing">Right Wing</option>
                      <option value="Forward">Forward</option>
                      <option value="Defense">Defense</option>
                      <option value="Goalie">Goalie</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant font-medium">Shoots / Handedness</label>
                    <select
                      value={editProfileForm.shoots || 'Right'}
                      onChange={e => setEditProfileForm({ ...editProfileForm, shoots: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    >
                      <option value="Left">Left</option>
                      <option value="Right">Right</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant font-medium">Height (cm)</label>
                    <input
                      type="number"
                      placeholder="e.g. 185"
                      value={editProfileForm.height_cm || ''}
                      onChange={e => setEditProfileForm({ ...editProfileForm, height_cm: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant font-medium">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 85"
                      value={editProfileForm.weight_kg || ''}
                      onChange={e => setEditProfileForm({ ...editProfileForm, weight_kg: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant font-medium">Status</label>
                    <select
                      value={editProfileForm.status || 'Active'}
                      onChange={e => setEditProfileForm({ ...editProfileForm, status: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-3">
                    <label className="text-xs text-on-surface-variant font-medium">Playstyle</label>
                    <input
                      type="text"
                      placeholder="e.g. Sniper, Playmaker, Two-Way Forward, Power Forward, Enforcer, Butterfly Goalie"
                      value={editProfileForm.playstyle || ''}
                      onChange={e => setEditProfileForm({ ...editProfileForm, playstyle: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Federation & Personal */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-tertiary flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Federation & Demographics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant font-medium">IJshockey Nederland Bondsnummer</label>
                    <input
                      type="text"
                      placeholder="e.g. IJN-104928"
                      value={editProfileForm.ijn_bondsnummer || ''}
                      onChange={e => setEditProfileForm({ ...editProfileForm, ijn_bondsnummer: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant font-medium">Nationality</label>
                    <input
                      type="text"
                      placeholder="e.g. Netherlands, Canada, USA"
                      value={editProfileForm.nationality || ''}
                      onChange={e => setEditProfileForm({ ...editProfileForm, nationality: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant font-medium">Birthdate</label>
                    <input
                      type="date"
                      value={editProfileForm.date_of_birth || ''}
                      onChange={e => setEditProfileForm({ ...editProfileForm, date_of_birth: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant font-medium">Gender</label>
                    <select
                      value={editProfileForm.gender || 'Male'}
                      onChange={e => setEditProfileForm({ ...editProfileForm, gender: e.target.value })}
                      className="bg-[#080808] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white focus:border-tertiary focus:outline-none transition-colors"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Biography */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-tertiary flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Biography & Hockey Career
                </h4>
                <textarea
                  rows={4}
                  placeholder="Share details about your hockey background, favorite highlights, career achievements, or personal bio..."
                  value={editProfileForm.bio || ''}
                  onChange={e => setEditProfileForm({ ...editProfileForm, bio: e.target.value })}
                  className="bg-[#080808] border border-[#2A2A2A] rounded-lg p-3 text-white focus:border-tertiary focus:outline-none transition-colors resize-y text-sm"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#2A2A2A] bg-surface-container-low flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                disabled={loading}
                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-white bg-surface-container-high hover:bg-surface-container-highest rounded-lg transition-colors border border-[#2A2A2A]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={loading}
                className="px-5 py-2 text-xs font-bold bg-tertiary text-black hover:brightness-110 rounded-lg transition-all flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
