import React from 'react';
import { Calendar } from '@/components/Calendar';
import type { DateRange } from 'react-day-picker';
import type {
  AutoLogoutSelectorProps,
  AutoLogoutMode,
  AutoLogoutModeOption,
} from './AutoLogoutSelector.types';
import clsx from 'clsx';

const MODE_OPTIONS: AutoLogoutModeOption[] = [
  {
    mode: 'duration',
    label: 'Session Duration',
    description: 'Auto-logout after a specific number of hours',
    icon: '⏱️',
  },
  {
    mode: 'specific-date',
    label: 'Logout Date',
    description: 'Auto-logout at a specific date and time',
    icon: '📅',
  },
  {
    mode: 'custom-schedule',
    label: 'Schedule Period',
    description: 'Set an active period using date range',
    icon: '📊',
  },
];

const DURATION_OPTIONS = [1, 2, 4, 8, 12, 24, 48, 72, 168]; // Hours: 1h, 2h, 4h, 8h, 12h, 1d, 2d, 3d, 1w

/**
 * Auto-logout selector component that allows users to configure when their session should expire
 * Uses the Calendar component in different modes based on the selected logout preference
 */
export const AutoLogoutSelector: React.FC<AutoLogoutSelectorProps> = ({
  value = {
    mode: 'duration',
    durationHours: 8,
    enabled: false,
  },
  onChange,
  className,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Collapse the panel when disabled
  React.useEffect(() => {
    if (!value.enabled) {
      setIsExpanded(false);
    }
  }, [value.enabled]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleEnabledToggle();
    }
  };

  const handleModeChange = (mode: AutoLogoutMode) => {
    const newValue = {
      ...value,
      mode,
      // Reset mode-specific values
      durationHours: mode === 'duration' ? 8 : undefined,
      specificDate: mode === 'specific-date' ? new Date() : undefined,
      customSchedule:
        mode === 'custom-schedule'
          ? {
              startDate: new Date(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            }
          : undefined,
    };
    onChange?.(newValue);
  };

  const handleEnabledToggle = () => {
    const newEnabled = !value.enabled;

    // When enabling for the first time, ensure we have sensible defaults
    if (newEnabled && !value.enabled) {
      onChange?.({
        ...value,
        enabled: true,
        // Set default values if they don't exist
        mode: value.mode || 'duration',
        durationHours: value.durationHours ?? 8,
      });
    } else {
      // When disabling, just toggle the enabled flag but keep the configuration
      onChange?.({
        ...value,
        enabled: false,
      });
    }
  };

  const handleDurationChange = (hours: number) => {
    onChange?.({
      ...value,
      durationHours: hours,
    });
  };

  const handleSpecificDateChange = (date: Date | undefined) => {
    if (date) {
      onChange?.({
        ...value,
        specificDate: date,
      });
    }
  };
  const handleCustomScheduleChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onChange?.({
        ...value,
        customSchedule: {
          startDate: range.from,
          endDate: range.to,
        },
      });
    }
  };

  const formatDuration = (hours: number): string => {
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    if (hours < 168) return `${hours / 24} day${hours / 24 !== 1 ? 's' : ''}`;
    return `${hours / 168} week${hours / 168 !== 1 ? 's' : ''}`;
  };

  const getPreviewText = (): string => {
    if (!value.enabled) return 'Auto-logout disabled';

    switch (value.mode) {
      case 'duration':
        return `Session expires after ${formatDuration(value.durationHours ?? 8)}`;
      case 'specific-date':
        return value.specificDate
          ? `Logout on ${value.specificDate.toLocaleDateString()} at ${value.specificDate.toLocaleTimeString()}`
          : 'No date selected';
      case 'custom-schedule':
        return value.customSchedule
          ? `Active from ${value.customSchedule.startDate.toLocaleDateString()} to ${value.customSchedule.endDate.toLocaleDateString()}`
          : 'No schedule set';
      default:
        return 'Auto-logout configured';
    }
  };

  return (
    <div
      className={clsx(
        'rounded-lg border border-gray-200 bg-white p-4 transition-opacity',
        disabled && 'opacity-60',
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1">
          <h3 className={clsx('text-lg font-medium', disabled ? 'text-gray-400' : 'text-gray-900')}>
            Auto-Logout Settings
          </h3>
          <p className={clsx('text-sm', disabled ? 'text-gray-400' : 'text-gray-600')}>
            {getPreviewText()}
          </p>
        </div>
        <button
          type="button"
          onClick={handleEnabledToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          role="switch"
          aria-checked={value.enabled}
          aria-label="Toggle auto-logout feature"
          className={clsx(
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
            value.enabled ? 'bg-blue-600' : 'bg-gray-200',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <span className="sr-only">
            {value.enabled ? 'Disable auto-logout' : 'Enable auto-logout'}
          </span>
          <span
            className={clsx(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              value.enabled ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>

      {value.enabled && (
        <div className="animate-in slide-in-from-top-2 space-y-4 duration-200">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={disabled}
            className={clsx(
              'flex w-full items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <span>Configure Auto-Logout</span>
            <span
              className={clsx(
                'transform transition-transform duration-200',
                isExpanded ? 'rotate-180' : ''
              )}
            >
              ▼
            </span>
          </button>

          {isExpanded && (
            <div className="animate-in slide-in-from-top-2 space-y-6 duration-300">
              {/* Mode Selection */}
              <fieldset>
                <legend className="mb-3 block text-sm font-medium text-gray-700">
                  Logout Mode
                </legend>
                <div className="grid grid-cols-1 gap-3">
                  {MODE_OPTIONS.map(option => (
                    <label
                      key={option.mode}
                      htmlFor={`logout-mode-${option.mode}`}
                      aria-label={`Logout mode: ${option.label}`}
                      className={clsx(
                        'relative flex cursor-pointer rounded-lg border p-4 transition-all focus:outline-none',
                        value.mode === option.mode
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'border-gray-300 bg-white hover:bg-gray-50',
                        disabled && 'cursor-not-allowed opacity-50 hover:bg-white'
                      )}
                    >
                      <input
                        id={`logout-mode-${option.mode}`}
                        type="radio"
                        name="logout-mode"
                        value={option.mode}
                        checked={value.mode === option.mode}
                        onChange={() => handleModeChange(option.mode)}
                        disabled={disabled}
                        className="sr-only"
                      />
                      <div className="flex items-start">
                        <div className="mr-3 text-xl">{option.icon}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-500">{option.description}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>{' '}
              {/* Mode-specific Configuration */}
              {value.mode === 'duration' && (
                <fieldset>
                  <legend className="mb-3 block text-sm font-medium text-gray-700">
                    Session Duration
                  </legend>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATION_OPTIONS.map(hours => (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => handleDurationChange(hours)}
                        disabled={disabled}
                        className={clsx(
                          'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          value.durationHours === hours
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                          disabled && 'cursor-not-allowed opacity-50'
                        )}
                      >
                        {formatDuration(hours)}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
              {value.mode === 'specific-date' && (
                <fieldset>
                  <legend className="mb-3 block text-sm font-medium text-gray-700">
                    Select Logout Date
                  </legend>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={value.specificDate}
                      onSelect={handleSpecificDateChange}
                      disabled={disabled}
                      className="border-0 shadow-none"
                    />
                  </div>
                </fieldset>
              )}
              {value.mode === 'custom-schedule' && (
                <fieldset>
                  <legend className="mb-3 block text-sm font-medium text-gray-700">
                    Select Active Period
                  </legend>
                  <div className="flex justify-center">
                    <Calendar
                      mode="range-dual"
                      selected={
                        value.customSchedule
                          ? {
                              from: value.customSchedule.startDate,
                              to: value.customSchedule.endDate,
                            }
                          : undefined
                      }
                      onSelect={handleCustomScheduleChange}
                      numberOfMonths={2}
                      disabled={disabled}
                      className="border-0 shadow-none"
                    />
                  </div>
                  {value.customSchedule && (
                    <div className="mt-3 text-sm text-gray-600">
                      <p>
                        Session will be active from{' '}
                        <strong>{value.customSchedule.startDate.toLocaleDateString()}</strong> to{' '}
                        <strong>{value.customSchedule.endDate.toLocaleDateString()}</strong>
                      </p>
                    </div>
                  )}
                </fieldset>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
