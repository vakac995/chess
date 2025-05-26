/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DevDashboard } from '../DevDashboard';
import * as utils from '@/utils';

// Use counter to provide unique test IDs for nested DevOnly components
let devOnlyCounter = 0;

vi.mock('@/utils', () => {
  const mockDev = {
    logData: vi.fn(),
  };

  const mockUseDev = vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    logData: vi.fn(),
    only: vi.fn(callback => callback()),
    breakpoint: vi.fn(),
    perfStart: vi.fn(),
    perfEnd: vi.fn(),
  }));

  const mockUseDevPerformance = vi.fn();
  const mockWithDevTools = vi.fn(Component => Component);
  const mockGetRandomNumber = vi.fn(() => 0.5);

  const mockDevOnly = vi.fn(({ children }) => {
    devOnlyCounter++;
    return <div data-testid={`dev-only-${devOnlyCounter}`}>{children}</div>;
  });

  const mockDevPanel = vi.fn(({ title, children }) => (
    <div data-testid="dev-panel" data-title={title}>
      {children}
    </div>
  ));

  const mockDevDataPanel = vi.fn(({ title, data }) => (
    <div data-testid="dev-data-panel" data-title={title}>
      {JSON.stringify(data)}
    </div>
  ));

  const mockDevConfigPanel = vi.fn(() => <div data-testid="dev-config-panel">Config Panel</div>);
  const mockDevPerformancePanel = vi.fn(() => (
    <div data-testid="dev-performance-panel">Performance Panel</div>
  ));
  const mockDevLoggerPanel = vi.fn(({ maxEntries }) => (
    <div data-testid="dev-logger-panel" data-max-entries={maxEntries}>
      Logger Panel
    </div>
  ));

  return {
    dev: mockDev,
    DevOnly: mockDevOnly,
    DevPanel: mockDevPanel,
    DevDataPanel: mockDevDataPanel,
    DevConfigPanel: mockDevConfigPanel,
    DevPerformancePanel: mockDevPerformancePanel,
    DevLoggerPanel: mockDevLoggerPanel,
    useDev: mockUseDev,
    useDevPerformance: mockUseDevPerformance,
    withDevTools: mockWithDevTools,
    getRandomNumber: mockGetRandomNumber,
  };
});

describe('DevDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    devOnlyCounter = 0; // Reset counter before each test
  });

  it('renders in expanded state by default', () => {
    render(<DevDashboard />);

    // Should be wrapped in DevOnly - get the first one (main wrapper)
    const devOnlyElements = screen.getAllByTestId(/dev-only-\d+/);
    expect(devOnlyElements[0]).toBeInTheDocument();

    // Should show the main dashboard content
    expect(screen.getByText('Development Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update Test Data/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log Test Data/i })).toBeInTheDocument();

    // Should include all dev panels
    expect(screen.getByTestId('dev-config-panel')).toBeInTheDocument();
    expect(screen.getByTestId('dev-performance-panel')).toBeInTheDocument();
    expect(screen.getByTestId('dev-logger-panel')).toBeInTheDocument();
  });

  it('renders in collapsed state when collapsed prop is true', () => {
    render(<DevDashboard collapsed={true} />);

    // Should show only the DEV text
    expect(screen.getByText('DEV')).toBeInTheDocument();

    // Should not show the main dashboard content
    expect(screen.queryByText('Development Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Update Test Data/i })).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for expanded state', () => {
    const { container } = render(<DevDashboard />);

    const dashboardDiv = container.querySelector('.fixed.right-4.bottom-4');
    expect(dashboardDiv).toBeInTheDocument();
    expect(dashboardDiv).toHaveClass('max-h-96', 'w-96');
    expect(dashboardDiv).not.toHaveClass('h-12', 'w-12');
  });

  it('applies correct CSS classes for collapsed state', () => {
    const { container } = render(<DevDashboard collapsed={true} />);

    const dashboardDiv = container.querySelector('.fixed.right-4.bottom-4');
    expect(dashboardDiv).toBeInTheDocument();
    expect(dashboardDiv).toHaveClass('h-12', 'w-12');
    expect(dashboardDiv).not.toHaveClass('max-h-96', 'w-96');
  });

  it('updates test data when Update Test Data button is clicked', async () => {
    render(<DevDashboard />);

    const updateButton = screen.getByRole('button', { name: /Update Test Data/i });

    // Click the button
    fireEvent.click(updateButton);

    // The component should re-render with new data
    await waitFor(() => {
      // Check if the component is still rendered (basic sanity check)
      const devOnlyElements = screen.getAllByTestId(/dev-only-\d+/);
      expect(devOnlyElements[0]).toBeInTheDocument();
    });
  });

  it('calls dev.logData when Log Test Data button is clicked', () => {
    render(<DevDashboard />);

    const logButton = screen.getByRole('button', { name: /Log Test Data/i });

    // Click the button
    fireEvent.click(logButton);

    // Should call dev.logData with correct parameters
    expect(utils.dev.logData).toHaveBeenCalledWith(
      'Current test data',
      expect.objectContaining({
        timestamp: expect.any(Number),
        random: 0.5, // Our mocked value
        items: expect.any(Array),
      })
    );
  });

  it('passes correct maxEntries prop to DevLoggerPanel', () => {
    render(<DevDashboard />);

    const loggerPanel = screen.getByTestId('dev-logger-panel');
    expect(loggerPanel).toHaveAttribute('data-max-entries', '10');
  });

  it('initializes with correct default data structure', () => {
    render(<DevDashboard />);

    // getRandomNumber should be called for initial data
    expect(utils.getRandomNumber).toHaveBeenCalled();
  });

  it('renders ExampleComponent with correct props', () => {
    render(<DevDashboard />);

    // Should render the enhanced example component
    // We can verify this by checking if the component structure is present
    expect(screen.getByText('Development Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Example Component:/)).toBeInTheDocument();
  });
});

describe('DevDashboard ExampleComponent Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ExampleComponent uses dev utilities correctly', () => {
    render(<DevDashboard />);

    // Should call the dev hooks
    expect(utils.useDev).toHaveBeenCalled();
    expect(utils.useDevPerformance).toHaveBeenCalledWith('ExampleComponent', {
      name: 'Test Component',
    });
  });

  it('ExampleComponent button triggers dev utilities', async () => {
    const mockDevUtils = {
      debug: vi.fn(),
      info: vi.fn(),
      logData: vi.fn(),
      only: vi.fn(callback => callback()),
      breakpoint: vi.fn(),
      perfStart: vi.fn(),
      perfEnd: vi.fn(),
    } as any;

    vi.mocked(utils.useDev).mockReturnValue(mockDevUtils);

    render(<DevDashboard />);

    // Find and click the test button in ExampleComponent
    const testButton = screen.getByRole('button', { name: /Test Development Utilities/i });
    fireEvent.click(testButton);

    // Should trigger dev utilities
    expect(mockDevUtils.info).toHaveBeenCalledWith('Button clicked', { name: 'Test Component' });
    expect(mockDevUtils.breakpoint).toHaveBeenCalledWith('Button click handler');
  });
});

describe('DevDashboard DevOnly Integration', () => {
  it('wraps entire component in DevOnly', () => {
    render(<DevDashboard />);

    expect(utils.DevOnly).toHaveBeenCalledWith(
      expect.objectContaining({
        children: expect.anything(),
      }),
      undefined
    );
  });

  it('DevOnly component receives children correctly', () => {
    render(<DevDashboard />);

    // DevOnly should render its children - check for the main dashboard content
    expect(screen.getByText('Development Dashboard')).toBeInTheDocument();
  });
});

describe('DevDashboard Props Handling', () => {
  it('handles undefined collapsed prop (should default to false)', () => {
    render(<DevDashboard />);

    // Should render in expanded state
    expect(screen.getByText('Development Dashboard')).toBeInTheDocument();
  });

  it('handles explicit collapsed=false prop', () => {
    render(<DevDashboard collapsed={false} />);

    // Should render in expanded state
    expect(screen.getByText('Development Dashboard')).toBeInTheDocument();
  });

  it('handles explicit collapsed=true prop', () => {
    render(<DevDashboard collapsed={true} />);

    // Should render in collapsed state
    expect(screen.getByText('DEV')).toBeInTheDocument();
    expect(screen.queryByText('Development Dashboard')).not.toBeInTheDocument();
  });
});
