import { useState } from 'react';
import { ArrowLeft, User as UserIcon, Briefcase, Ruler, Shield, Plus, Edit2, Calendar, Star, Medal, Camera, MessageCircle, UserPlus, MoreHorizontal } from 'lucide-react';
import { User, Achievement, Award } from '../types';

interface MyProfileScreenProps {
  viewedPerson?: any;
  currentUser: User | null;
  onBack: () => void;
}

export default function MyProfileScreen({ currentUser, viewedPerson, onBack }: MyProfileScreenProps) {
  const isOwnProfile = !viewedPerson || (currentUser && viewedPerson.id === currentUser.personId);
  const displayName = viewedPerson ? viewedPerson.name : (currentUser?.email || "My Profile");
  const [activeTab, setActiveTab] = useState<'about' | 'jobs' | 'equipment' | 'events' | 'achievements'>('about');
  const [rsvps, setRsvps] = useState<Record<string, string>>({
    'evt-1': 'Maybe',
    'evt-2': 'Attending'
  });

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

  const handleRsvpChange = (eventId: string, status: string) => {
    setRsvps(prev => ({ ...prev, [eventId]: status }));
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
        <div className="relative w-full h-48 md:h-64 bg-surface-container-highest rounded-b-lg overflow-hidden group">
            {/* Placeholder Cover Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-high to-tertiary/20"></div>
            {isOwnProfile && (
                <button className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-md flex items-center gap-2 text-sm font-bold transition-colors">
                    <Camera className="w-4 h-4" />
                    <span className="hidden md:inline">Edit cover photo</span>
                </button>
            )}
        </div>

        {/* Profile Header Section */}
        <div className="px-4 pb-4 border-b border-[#2A2A2A] relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between">

                {/* Profile Pic & Name */}
                <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16 relative z-10">
                    {/* Profile Picture */}
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-surface-container-highest flex items-center justify-center shrink-0 mx-auto md:mx-0">
                        <img
                            src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/placeholder_profile_player_male.png?v=1784405789"
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full"
                        />
                        {isOwnProfile && (
                            <button className="absolute bottom-2 right-2 bg-surface-container-low border border-[#2A2A2A] hover:bg-surface-container-highest p-2 rounded-full text-white transition-colors shadow-lg">
                                <Camera className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Name & Title */}
                    <div className="pb-2 text-center md:text-left mt-2 md:mt-0">
                        <h1 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                            {displayName}
                        </h1>
                        <p className="text-on-surface-variant font-medium mt-1">
                            {viewedPerson?.job || "Head Coach"} • {viewedPerson?.club || "Blackout HC"}
                        </p>
                    </div>
                </div>

                {/* Actions (Facebook Style) */}
                <div className="flex flex-col sm:flex-row w-full sm:w-auto justify-center md:justify-end gap-2 mt-4 md:mb-2 md:mt-0">
                    {isOwnProfile ? (
                        <>
                            <button className="bg-tertiary text-black hover:brightness-110 px-4 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-colors w-full sm:w-auto">
                                <Plus className="w-4 h-4" /> Add to Story
                            </button>
                            <button className="bg-surface-container-low hover:bg-surface-container-highest text-white border border-[#2A2A2A] px-4 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-colors w-full sm:w-auto">
                                <Edit2 className="w-4 h-4" /> Edit profile
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none bg-tertiary text-black hover:brightness-110 px-4 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                                <UserPlus className="w-4 h-4" /> Follow
                            </button>
                            <button className="flex-1 sm:flex-none bg-surface-container-low hover:bg-surface-container-highest text-white border border-[#2A2A2A] px-4 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                                <MessageCircle className="w-4 h-4" /> Message
                            </button>
                            <button className="bg-surface-container-low hover:bg-surface-container-highest text-white border border-[#2A2A2A] px-3 py-2 rounded-md transition-colors">
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
                    <h3 className="text-white font-bold text-xl">Intro</h3>

                    <div className="flex flex-col gap-3 text-sm">
                        <div className="flex items-center gap-3 text-on-surface-variant">
                            <Briefcase className="w-5 h-5 text-gray-400" />
                            <span>Role: <strong className="text-white">{viewedPerson?.role || currentUser?.role || "User"}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface-variant">
                            <Ruler className="w-5 h-5 text-gray-400" />
                            <span>Height: <strong className="text-white">{viewedPerson?.height || "6'1\""}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface-variant">
                            <div className="w-5 text-center font-bold text-gray-400">W</div>
                            <span>Weight: <strong className="text-white">{viewedPerson?.weight || "190 lbs"}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface-variant">
                            <div className="w-5 text-center font-bold text-gray-400">H</div>
                            <span>Shoots: <strong className="text-white">{viewedPerson?.handedness || "Right"}</strong></span>
                        </div>
                    </div>

                    {isOwnProfile && (
                        <button className="w-full py-1.5 bg-surface-container-highest hover:bg-surface-container-highest/80 border border-[#2A2A2A] rounded-md text-white font-bold text-sm transition-colors mt-2">
                            Edit details
                        </button>
                    )}
                </div>
            </div>

            {/* Right Column (Dynamic Tab Content) */}
            <div className="w-full md:w-2/3 flex flex-col gap-4">
                <div className="bg-surface-container-low border border-[#2A2A2A] rounded-lg p-4 shadow-sm min-h-[300px]">
                    {activeTab === 'about' && (
                        <div className="flex flex-col gap-4">
                            <h3 className="text-white font-bold text-xl mb-2">About</h3>
                            <p className="text-on-surface-variant text-sm leading-relaxed">
                                Welcome to {displayName}'s profile. This section can include bio information, favorite quotes, or a summary of their hockey career.
                            </p>
                            {isOwnProfile && (
                                <p className="text-tertiary text-sm mt-4 cursor-pointer hover:underline">
                                    + Add bio
                                </p>
                            )}
                        </div>
                    )}

                    {activeTab === 'jobs' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-bold text-xl">Assigned Jobs & Roles</h3>
                                {isOwnProfile && (
                                    <button className="text-tertiary hover:underline text-sm font-bold flex items-center gap-1">
                                        <Plus className="w-4 h-4" /> Add
                                    </button>
                                )}
                            </div>
                            <div className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-4 flex flex-col gap-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-white font-bold text-lg">{viewedPerson?.job || "Head Coach"}</span>
                                    <span className="text-xs bg-[#2A2A2A] text-gray-300 px-2 py-1 rounded-md">{viewedPerson?.club || "Blackout HC"}</span>
                                </div>
                                <span className="text-sm text-on-surface-variant">Role: {viewedPerson?.role || "Coach"}</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'equipment' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-bold text-xl">Preferred Equipment</h3>
                                {isOwnProfile && (
                                    <button className="text-tertiary hover:underline text-sm font-bold flex items-center gap-1">
                                        <Edit2 className="w-4 h-4" /> Edit
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-3 flex flex-col gap-1">
                                    <span className="text-xs text-gray-400">Stick Brand</span>
                                    <span className="text-white font-bold">{viewedPerson?.equipment?.stickBrand || "Bauer"}</span>
                                </div>
                                <div className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-3 flex flex-col gap-1">
                                    <span className="text-xs text-gray-400">Stick Model</span>
                                    <span className="text-white font-bold">{viewedPerson?.equipment?.stickModel || "Nexus Sync"}</span>
                                </div>
                                <div className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-3 flex flex-col gap-1">
                                    <span className="text-xs text-gray-400">Skate Brand</span>
                                    <span className="text-white font-bold">{viewedPerson?.equipment?.skateBrand || "CCM"}</span>
                                </div>
                                <div className="bg-surface-container-lowest border border-[#2A2A2A] rounded-md p-3 flex flex-col gap-1">
                                    <span className="text-xs text-gray-400">Helmet Brand</span>
                                    <span className="text-white font-bold">{viewedPerson?.equipment?.helmetBrand || "Warrior"}</span>
                                </div>
                            </div>
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
    </div>
  );
}
