import { render, screen } from '@testing-library/react';
import { Container } from '../Container';

describe('Container', () => {
  it('renders children correctly', () => {
    render(<Container>Test Child</Container>);
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    const { container } = render(<Container>Test Child</Container>);
    expect(container.firstChild).toHaveClass('w-full');
    expect(container.firstChild).toHaveClass('p-container-padding');
    expect(container.firstChild).toHaveClass('block');
  });

  it('renders with specified HTML tag', () => {
    const { container } = render(<Container as="section">Test Child</Container>);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('applies flex display and related props', () => {
    const { container } = render(
      <Container display="flex" orientation="col" items="center" justify="center">
        Test Child
      </Container>
    );
    expect(container.firstChild).toHaveClass('flex');
    expect(container.firstChild).toHaveClass('flex-col');
    expect(container.firstChild).toHaveClass('items-center');
    expect(container.firstChild).toHaveClass('justify-center');
  });

  it('applies grid display and related props', () => {
    const { container } = render(
      <Container display="grid" gridCols={'3'} gap={'4'}>
        Test Child
      </Container>
    );
    expect(container.firstChild).toHaveClass('grid');
    expect(container.firstChild).toHaveClass('grid-cols-3');
    expect(container.firstChild).toHaveClass('gap-4');
  });

  it('applies shadow and rounded props', () => {
    const { container } = render(
      <Container shadow="md" rounded="lg">
        Test Child
      </Container>
    );
    expect(container.firstChild).toHaveClass('shadow-md');
    expect(container.firstChild).toHaveClass('rounded-lg');
  });

  it('applies custom className', () => {
    const { container } = render(<Container className="custom-class">Test Child</Container>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
