import { dbSchema } from '../../types';
import { useState, useEffect } from 'react';
import { ArrowLeft, Globe, Database, Building2, MapPin, CalendarDays, Shield, Plus, RefreshCw } from 'lucide-react';
import { getGasUrl } from '../../utils/gasUrl';
import { fetchGasData } from '../../utils/fetchGas';

interface EcosystemScreenProps {
  onBack: () => void;
}

function useEcosystemData(sheetName: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [sheetName]);

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = getGasUrl();
      if (!url) {
        throw new Error("No database URL set. Please connect in Database settings.");
      }

      const res = await fetchGasData(url, { action: 'getEcosystemData', sheetName }, forceRefresh);
      const result = await res.json();
      if (result.status === 'Success' && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (e: any) {
      setError(e.message);
      // Fallback for UI visualization during dev/testing without a valid GAS setup
      setData([
        ['ID', 'Name', 'Detail'],
        ['1', `Mock ${sheetName} 1`, 'Placeholder data'],
        ['2', `Mock ${sheetName} 2`, 'Placeholder data']
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (rowData: any[]) => {
    setLoading(true);
    try {
      const url = getGasUrl();
      if (!url) throw new Error("No database URL set.");

      const res = await fetchGasData(url, { action: 'saveEcosystemData', sheetName, rowData });
      const result = await res.json();
      if (result.status === 'Success') {
        fetchData(true);
      } else {
        throw new Error(result.error || 'Failed to save data');
      }
    } catch (e: any) {
      setError(e.message);
      alert(`Failed to save to GAS: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, saveData, fetchData };
}

type Tab = string;

export default function EcosystemScreen({ onBack }: EcosystemScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('organizations');

  const { data, loading, error, saveData, fetchData } = useEcosystemData(activeTab);

  const handleAddMockRow = () => {
    const id = Math.random().toString(36).substring(2, 9).toUpperCase();
    const mockRow = [id, `New ${activeTab}`, 'Auto-generated'];
    saveData(mockRow);
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
        <h1 className="font-display text-[18px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-5 h-5 text-tertiary" />
          Ecosystem Admin
        </h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-[#2A2A2A] bg-surface-container-lowest sticky top-[65px] z-40 hide-scrollbar">
        {Object.keys(dbSchema).map((tableName) => (
          <button
            key={tableName}
            onClick={() => setActiveTab(tableName)}
            className={`flex-none px-4 py-3 font-mono text-[11px] font-bold tracking-widest uppercase flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === tableName ? 'border-tertiary text-tertiary' : 'border-transparent text-on-surface-variant hover:text-white'
            }`}
          >
            {tableName}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 w-full max-w-3xl mx-auto flex flex-col gap-4">
        <div className="bg-surface-container-low rounded-lg p-6 border border-[#2A2A2A] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[14px] font-bold tracking-widest uppercase text-white">
              {activeTab} Directory
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => fetchData(true)}
                disabled={loading}
                className="bg-[#2A2A2A] hover:bg-[#333] text-white p-2 rounded transition-colors disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleAddMockRow}
                disabled={loading}
                className="bg-tertiary text-black px-3 py-2 rounded text-xs font-mono font-bold tracking-widest uppercase hover:brightness-110 flex items-center gap-1 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Record
              </button>
            </div>
          </div>

          <p className="text-on-surface-variant text-sm">
            Manage {activeTab} in the Blackout ecosystem.
          </p>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error p-3 rounded text-sm font-mono">
              Notice: {error}. Showing mock fallback data.
            </div>
          )}

          <div className="bg-[#050505] border border-[#2A2A2A] rounded overflow-x-auto">
            <table className="w-full text-left text-sm text-on-surface-variant">
              <thead className="bg-[#111] border-b border-[#2A2A2A] font-mono text-[10px] uppercase tracking-widest text-white">
                <tr>
                  {data.length > 0 ? (
                    data[0].map((header: string, i: number) => (
                      <th key={i} className="px-4 py-3">{header}</th>
                    ))
                  ) : (
                    <th className="px-4 py-3">No Schema Found</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.length > 1 ? (
                  data.slice(1).map((row: any[], i: number) => (
                    <tr key={i} className="border-b border-[#2A2A2A]/50 hover:bg-white/5 transition-colors">
                      {row.map((cell: any, j: number) => (
                        <td key={j} className="px-4 py-3">{cell}</td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-on-surface-variant/50 italic">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
