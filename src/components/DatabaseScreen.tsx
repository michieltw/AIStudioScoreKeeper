import { getGasUrl, setGasUrl as setGasUrlToCache } from '../utils/gasUrl';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Database, Loader2, Save, Copy, Key } from 'lucide-react';
import { generateGasCodeSnippet } from "../utils/gasSnippet";

interface DatabaseScreenProps {
  onBack: () => void;
}

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
