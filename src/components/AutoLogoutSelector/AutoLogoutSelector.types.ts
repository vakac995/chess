import type { Optional } from '@/types';

export type AutoLogoutMode = 'duration' | 'specific-date' | 'custom-schedule';

export interface AutoLogoutPreference {
  readonly mode: AutoLogoutMode;
  readonly durationHours?: Optional<number>;
  readonly specificDate?: Optional<Date>;
  readonly customSchedule?: Optional<{
    startDate: Date;
    endDate: Date;
  }>;
  readonly enabled: boolean;
}

export interface AutoLogoutSelectorProps {
  readonly value?: Optional<AutoLogoutPreference>;
  readonly onChange?: Optional<(preference: AutoLogoutPreference) => void>;
  readonly className?: Optional<string>;
  readonly disabled?: Optional<boolean>;
}

export interface AutoLogoutModeOption {
  readonly mode: AutoLogoutMode;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
}
