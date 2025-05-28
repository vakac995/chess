import React from 'react';
import { dev, formatRegistrationData } from '@/utils';
import type { RegistrationDataDisplayProps } from './RegistrationDataDisplay.types';

/**
 * Component to display registration data in a readable format
 */
export const RegistrationDataDisplay: React.FC<RegistrationDataDisplayProps> = ({
  data,
  className = '',
}) => {
  dev.debug('RegistrationDataDisplay received:', data);

  if (!data) {
    return <div className={`text-center ${className}`}>No registration data available</div>;
  }

  try {
    const formattedData = formatRegistrationData(data);

    return (
      <div
        className={`bg-background/50 text-text mt-4 overflow-auto rounded p-2 text-left text-xs ${className}`}
      >
        <pre>{formattedData}</pre>
      </div>
    );
  } catch {
    return <div className={`text-center text-red-500 ${className}`}>Error formatting data</div>;
  }
};
