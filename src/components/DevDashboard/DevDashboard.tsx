import React from 'react';
import {
  dev,
  DevOnly,
  DevPanel,
  DevDataPanel,
  DevConfigPanel,
  DevPerformancePanel,
  DevLoggerPanel,
  useDev,
  useDevPerformance,
  withDevTools,
} from '@/utils';
import type { DevDashboardProps } from './DevDashboard.types';

/**
 * Example component demonstrating all development utilities
 */
const ExampleComponent: React.FC<{ data: unknown; name: string }> = ({ data, name }) => {
  const devUtils = useDev();

  useDevPerformance('ExampleComponent', { name });

  React.useEffect(() => {
    devUtils.debug('ExampleComponent mounted', { name, data });

    devUtils.perfStart('data-processing');

    setTimeout(() => {
      devUtils.perfEnd('data-processing');
    }, Math.random() * 100);

    return () => {
      devUtils.debug('ExampleComponent unmounting');
    };
  }, [devUtils, name, data]);

  const handleClick = () => {
    devUtils.info('Button clicked', { name });

    devUtils.only(() => {
      devUtils.logData('Current component state', { name, data });
    });

    devUtils.breakpoint('Button click handler');
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-bold">Example Component: {name}</h3>

      <button
        onClick={handleClick}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Test Development Utilities
      </button>

      <DevOnly>
        <div className="space-y-4">
          <DevDataPanel title="Component Data" data={data} />

          <DevPanel title="Component Info">
            <div className="space-y-2 text-sm">
              <p>
                <strong>Name:</strong> {name}
              </p>
              <p>
                <strong>Props:</strong> {Object.keys({ data, name }).join(', ')}
              </p>
              <p>
                <strong>Rendered at:</strong> {new Date().toLocaleTimeString()}
              </p>
            </div>
          </DevPanel>
        </div>
      </DevOnly>
    </div>
  );
};

/**
 * Example of using the HOC withDevTools to enhance the ExampleComponent
 */
const EnhancedExampleComponent = withDevTools(ExampleComponent, {
  name: 'ExampleComponent',
  logProps: true,
  trackPerformance: true,
  validateProps: (props): props is { data: unknown; name: string } => {
    return typeof props.name === 'string' && props.data !== undefined;
  },
});

/**
 * Main development dashboard component
 */
export const DevDashboard: React.FC<DevDashboardProps> = ({ collapsed = false }) => {
  const [exampleData, setExampleData] = React.useState({
    timestamp: Date.now(),
    random: Math.random(),
    items: ['item1', 'item2', 'item3'],
  });

  const updateData = () => {
    setExampleData({
      timestamp: Date.now(),
      random: Math.random(),
      items: [`item${Math.floor(Math.random() * 100)}`],
    });
  };

  return (
    <DevOnly>
      <div
        className={`fixed right-4 bottom-4 z-50 overflow-auto rounded-lg border bg-white shadow-lg transition-all duration-300 ${
          collapsed ? 'h-12 w-12' : 'max-h-96 w-96'
        }`}
      >
        {collapsed ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-xs font-bold text-gray-600">DEV</div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <h2 className="text-lg font-bold text-gray-800">Development Dashboard</h2>

            <div className="space-y-2">
              <button
                onClick={updateData}
                className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
              >
                Update Test Data
              </button>

              <button
                onClick={() => dev.logData('Current test data', exampleData)}
                className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
              >
                Log Test Data
              </button>
            </div>

            <DevConfigPanel />
            <DevPerformancePanel />
            <DevLoggerPanel maxEntries={10} />

            <EnhancedExampleComponent data={exampleData} name="Test Component" />
          </div>
        )}
      </div>
    </DevOnly>
  );
};
