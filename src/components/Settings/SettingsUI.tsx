import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const Section = ({ title, children, defaultExpanded = true }: { title: string, children: React.ReactNode, defaultExpanded?: boolean }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <section className="flex flex-col gap-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full hover:opacity-80 transition-opacity"
      >
        <h2 className="font-mono text-[12px] font-bold text-tertiary tracking-widest uppercase">{title}</h2>
        {expanded ? <ChevronUp className="w-4 h-4 text-tertiary" /> : <ChevronDown className="w-4 h-4 text-tertiary" />}
      </button>
      {expanded && (
        <div className="bg-card-gradient metallic-border rounded-lg p-4 inner-glow flex flex-col gap-4 mt-2">
          {children}
        </div>
      )}
    </section>
  );
};

export const Row = ({ label, children, border = true, disabled = false }: { label: string, children: React.ReactNode, border?: boolean, disabled?: boolean }) => (
  <div className={`flex justify-between items-center py-2 ${border ? 'border-b border-outline-variant/30' : ''} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <span className="text-[18px] text-on-background">{label}</span>
    {children}
  </div>
);

export const Select = ({ options, value, onChange, className = "w-32", disabled = false }: { options: string[], value?: string, onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void, className?: string, disabled?: boolean }) => (
  <select
    className={`bg-[#050505] border border-[#2A2A2A] rounded p-2 text-on-background text-[16px] outline-none input-focus pr-8 appearance-none ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    value={value}
    onChange={onChange}
    disabled={disabled}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238e9192' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.5em 1.5em'
    }}
  >
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

export const Toggle = ({ checked, onChange, disabled = false }: { checked?: boolean, onChange?: () => void, disabled?: boolean }) => (
  <button
    className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${checked && !disabled ? 'bg-tertiary' : 'bg-surface-container-highest border border-outline-variant'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={disabled ? undefined : onChange}
    disabled={disabled}
  >
    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${checked && !disabled ? 'right-1 bg-black' : 'left-1 bg-outline'}`}></div>
  </button>
);
