import type { FooterProps } from './Footer.types';

const Footer = ({ showVersion = false }: FooterProps) => {
  return (
    <footer className="bg-secondary sticky bottom-0 p-4 text-center text-white">
      <p>&copy; {new Date().getFullYear()} Chess App. All rights reserved.</p>
      {showVersion && (
        <p className="mt-1 text-xs opacity-75">
          Version {import.meta.env.VITE_APP_VERSION ?? '1.0.0'}
        </p>
      )}
    </footer>
  );
};

export { Footer };
