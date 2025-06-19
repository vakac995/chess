import React from 'react';

interface WarningInfoProps {
  warnings: readonly string[];
  className?: string;
}

export const WarningInfo: React.FC<WarningInfoProps> = ({ warnings, className = '' }) => {
  if (!warnings || warnings.length === 0) return null;
  return (
    <output
      className={`warning-container border-warning bg-warning/10 rounded-md border p-3 ${className}`}
      aria-live="polite"
    >
      <h4 className="text-warning mb-1 flex items-center gap-1 text-xs font-semibold">
        <span role="img" aria-label="Warning">
          ⚠️
        </span>{' '}
        Warning
      </h4>
      <ul className="text-warning/80 space-y-0.5 text-xs">
        {warnings.map((warning, idx) => (
          <li key={`warning-${idx}`}>• {warning}</li>
        ))}
      </ul>
    </output>
  );
};
