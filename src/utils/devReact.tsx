import React, { useState, useEffect, useCallback } from 'react';
import { dev, DevConfig, PerfEntry, LogLevel } from './dev';

/**
 * React hook for development utilities
 */
export function useDev() {
  const [config, setConfig] = useState<DevConfig>(dev.configuration);

  const updateConfig = useCallback((newConfig: Partial<DevConfig>) => {
    dev.saveConfig(newConfig);
    setConfig(dev.configuration);
  }, []);

  return {
    isEnabled: dev.isEnabled,
    config,
    updateConfig,
    debug: dev.debug.bind(dev),
    info: dev.info.bind(dev),
    warn: dev.warn.bind(dev),
    error: dev.error.bind(dev),
    logData: dev.logData.bind(dev),
    perfStart: dev.perfStart.bind(dev),
    perfEnd: dev.perfEnd.bind(dev),
    assert: dev.assert.bind(dev),
    validateData: dev.validateData.bind(dev),
    only: dev.only.bind(dev),
    when: dev.when.bind(dev),
    value: dev.value.bind(dev),
    breakpoint: dev.breakpoint.bind(dev),
    inspect: dev.inspect.bind(dev),
    time: dev.time.bind(dev),
  };
}

/**
 * React hook for performance tracking of component lifecycle
 */
export function useDevPerformance(componentName: string, metadata?: Record<string, unknown>) {
  useEffect(() => {
    dev.perfStart(`${componentName}:mount`, metadata);

    return () => {
      dev.perfEnd(`${componentName}:mount`);
    };
  }, [componentName, metadata]);

  const trackRender = useCallback(() => {
    dev.perfStart(`${componentName}:render`);

    // Track render end on next tick
    setTimeout(() => {
      dev.perfEnd(`${componentName}:render`);
    }, 0);
  }, [componentName]);

  return { trackRender };
}

/**
 * React hook for logging component props changes
 */
export function useDevPropsLogger<T extends Record<string, unknown>>(
  componentName: string,
  props: T,
  options: { logOnMount?: boolean; logOnChange?: boolean } = {}
) {
  const { logOnMount = true, logOnChange = true } = options;
  useEffect(() => {
    if (logOnMount) {
      dev.logData(`${componentName} props (mount)`, props);
    }
  }, [componentName, logOnMount, props]);

  useEffect(() => {
    if (logOnChange) {
      dev.logData(`${componentName} props (change)`, props);
    }
  }, [props, componentName, logOnChange]);
}

/**
 * HOC for adding development utilities to components
 */
export function withDevTools<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  options: {
    name?: string;
    logProps?: boolean;
    trackPerformance?: boolean;
    validateProps?: (props: P) => boolean;
  } = {}
) {
  const {
    name = Component.displayName ?? Component.name ?? 'Component',
    logProps = false,
    trackPerformance = false,
    validateProps,
  } = options;

  const WrappedComponent: React.ComponentType<P> = props => {
    if (validateProps) {
      dev.validateData(
        props,
        validateProps as (data: unknown) => data is P,
        `Invalid props for ${name}`
      );
    }

    if (logProps) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useDevPropsLogger(name, props);
    }

    if (trackPerformance) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useDevPerformance(name, { props: Object.keys(props) });
    }

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withDevTools(${name})`;
  return WrappedComponent;
}

/**
 * Development-only component wrapper
 */
export const DevOnly: React.FC<{ children: React.ReactNode; feature?: keyof DevConfig }> = ({
  children,
  feature = 'debugUI',
}) => {
  if (!dev.when(feature, () => true)) {
    return null;
  }

  return <>{children}</>;
};

/**
 * Development debug panel component
 */
export const DevPanel: React.FC<{
  title?: string;
  collapsed?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ title = 'Debug Info', collapsed = true, className = '', children }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  return (
    <DevOnly feature="debugUI">
      <div className={`dev-panel rounded border border-gray-300 bg-gray-50 text-xs ${className}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full bg-gray-100 px-3 py-2 text-left font-semibold transition-colors hover:bg-gray-200"
        >
          {title} {isCollapsed ? '▶' : '▼'}
        </button>
        {!isCollapsed && <div className="p-3">{children}</div>}
      </div>
    </DevOnly>
  );
};

/**
 * Performance monitoring panel
 */
export const DevPerformancePanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [entries, setEntries] = useState<PerfEntry[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEntries(dev.getPerfEntries());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const clearEntries = () => {
    dev.clearPerfEntries();
    setEntries([]);
  };

  return (
    <DevPanel title="Performance Monitor" className={className}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">Active Measurements: {entries.length}</span>
          <button
            onClick={clearEntries}
            className="rounded bg-red-100 px-2 py-1 text-xs hover:bg-red-200"
          >
            Clear
          </button>
        </div>
        {entries.length > 0 && (
          <div className="max-h-40 overflow-auto">
            {' '}
            {entries.map(entry => (
              <div key={`${entry.name}-${entry.startTime}`} className="mb-1 border-b pb-1 text-xs">
                <div className="font-medium">{entry.name}</div>
                <div className="text-gray-600">
                  Started: {entry.startTime.toFixed(2)}ms ago
                  {entry.metadata && (
                    <div className="mt-1">
                      <pre className="text-xs">{JSON.stringify(entry.metadata, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DevPanel>
  );
};

/**
 * Configuration panel for development settings
 */
export const DevConfigPanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { config, updateConfig } = useDev();

  const handleToggle = (key: keyof DevConfig) => {
    updateConfig({ [key]: !config[key] });
  };

  return (
    <DevPanel title="Dev Configuration" className={className}>
      <div className="space-y-2">
        {Object.entries(config).map(([key, value]) => (
          <label key={key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value}
              onChange={() => handleToggle(key as keyof DevConfig)}
              className="rounded"
            />
            <span className="capitalize">{key}</span>
          </label>
        ))}
      </div>
    </DevPanel>
  );
};

/**
 * Data display panel for debugging
 */
export const DevDataPanel: React.FC<{
  title?: string;
  data: unknown;
  className?: string;
}> = ({ title = 'Data', data, className = '' }) => (
  <DevPanel title={title} className={className}>
    <pre className="max-h-60 overflow-auto rounded border bg-white p-2 text-xs">
      {JSON.stringify(data, null, 2)}
    </pre>
  </DevPanel>
);

/**
 * Logger panel showing recent log messages
 */
export const DevLoggerPanel: React.FC<{ className?: string; maxEntries?: number }> = ({
  className = '',
  maxEntries: _maxEntries = 50,
}) => {
  const [logs, setLogs] = useState<Array<{ level: LogLevel; message: string; timestamp: string }>>(
    []
  );

  useEffect(() => {
    setLogs([
      {
        level: LogLevel.INFO,
        message: 'Development logger initialized',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  const clearLogs = () => setLogs([]);

  const getLogClassName = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return 'bg-red-100';
      case LogLevel.WARN:
        return 'bg-yellow-100';
      case LogLevel.INFO:
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <DevPanel title={`Logs (${logs.length})`} className={className}>
      <div className="space-y-2">
        <button
          onClick={clearLogs}
          className="rounded bg-red-100 px-2 py-1 text-xs hover:bg-red-200"
        >
          Clear Logs
        </button>
        <div className="max-h-60 space-y-1 overflow-auto">
          {logs.map((log, index) => (
            <div
              key={`${log.timestamp}-${index}`}
              className={`rounded p-2 text-xs ${getLogClassName(log.level)}`}
            >
              <div className="flex items-start justify-between">
                <span className="font-medium uppercase">{log.level}</span>
                <span className="text-gray-500">{log.timestamp}</span>
              </div>
              <div className="mt-1 font-mono">{log.message}</div>
            </div>
          ))}
        </div>
      </div>
    </DevPanel>
  );
};
