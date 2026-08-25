import { useState } from 'react';

interface SetupWizardScreenProps {
  onFinish: () => void;
  onCancel: () => void;
}

export default function SetupWizardScreen({ onFinish, onCancel }: SetupWizardScreenProps) {
  const [step, setStep] = useState(1);
  const [leagueName, setLeagueName] = useState('');
  const [rulesSummary, setRulesSummary] = useState('');

  const [divisions, setDivisions] = useState<string[]>([]);
  const [newDivision, setNewDivision] = useState('');

  const [teams, setTeams] = useState<{name: string, division: string}[]>([]);
  const [newTeam, setNewTeam] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const addDivision = () => {
    if (newDivision.trim() && !divisions.includes(newDivision.trim())) {
      setDivisions([...divisions, newDivision.trim()]);
      if (!selectedDivision) setSelectedDivision(newDivision.trim());
      setNewDivision('');
    }
  };

  const removeDivision = (divToRemove: string) => {
    setDivisions(divisions.filter(d => d !== divToRemove));
    if (selectedDivision === divToRemove) setSelectedDivision(divisions[0] || '');
    setTeams(teams.filter(t => t.division !== divToRemove));
  };

  const addTeam = () => {
    if (newTeam.trim() && selectedDivision) {
      setTeams([...teams, { name: newTeam.trim(), division: selectedDivision }]);
      setNewTeam('');
    }
  };

  const removeTeam = (teamName: string, division: string) => {
    setTeams(teams.filter(t => !(t.name === teamName && t.division === division)));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative p-4 pt-16">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col bg-[#050505] border border-[#2A2A2A] rounded-lg shadow-md p-6">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-bold text-tertiary uppercase">League Setup Wizard</h2>
          <span className="text-sm font-mono text-gray-500">Step {step} of 3</span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white mb-2">1. League Basics</h3>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-mono text-gray-400">League Name</label>
                <input
                  type="text"
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant rounded p-2 text-white"
                  placeholder="e.g. Metro Hockey League"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-mono text-gray-400">Rules Summary</label>
                <textarea
                  value={rulesSummary}
                  onChange={(e) => setRulesSummary(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant rounded p-2 text-white min-h-[100px]"
                  placeholder="Basic rules, period lengths, overtime rules..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white mb-2">2. Divisions Setup</h3>
              <p className="text-sm text-gray-400">Create divisions for your league (optional).</p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDivision}
                  onChange={(e) => setNewDivision(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addDivision()}
                  className="flex-1 bg-surface-container-low border border-outline-variant rounded p-2 text-white"
                  placeholder="New Division Name"
                />
                <button
                  onClick={addDivision}
                  className="bg-tertiary text-black px-4 rounded font-bold hover:brightness-110"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                {divisions.length === 0 ? (
                  <div className="text-gray-500 italic text-sm">No divisions added yet.</div>
                ) : (
                  divisions.map(div => (
                    <div key={div} className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/10">
                      <span className="text-white">{div}</span>
                      <button onClick={() => removeDivision(div)} className="text-error hover:text-error/80 text-sm">Remove</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white mb-2">3. Teams Setup</h3>

              {divisions.length === 0 ? (
                <div className="text-warning text-sm p-4 bg-warning/10 rounded">
                  Please add at least one division in Step 2 to add teams.
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-mono text-gray-400">Select Division</label>
                    <select
                      value={selectedDivision}
                      onChange={(e) => setSelectedDivision(e.target.value)}
                      className="bg-surface-container-low border border-outline-variant rounded p-2 text-white"
                    >
                      {divisions.map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTeam}
                      onChange={(e) => setNewTeam(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTeam()}
                      className="flex-1 bg-surface-container-low border border-outline-variant rounded p-2 text-white"
                      placeholder="New Team Name"
                    />
                    <button
                      onClick={addTeam}
                      className="bg-tertiary text-black px-4 rounded font-bold hover:brightness-110"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                    {teams.length === 0 ? (
                      <div className="text-gray-500 italic text-sm">No teams added yet.</div>
                    ) : (
                      teams.map((team, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/10">
                          <div>
                            <span className="text-white font-bold">{team.name}</span>
                            <span className="text-xs text-gray-400 ml-2">({team.division})</span>
                          </div>
                          <button onClick={() => removeTeam(team.name, team.division)} className="text-error hover:text-error/80 text-sm">Remove</button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-[#2A2A2A]">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-[#2A2A2A] rounded hover:bg-white/5 text-white transition-colors"
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onFinish}
                className="px-6 py-2 bg-tertiary text-black font-bold rounded hover:brightness-110 transition-all shadow-[0_0_10px_rgba(233,196,0,0.2)]"
              >
                Finish Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
