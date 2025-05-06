import React from 'react';

interface SidebarProps {
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ children, isOpen, onToggle }: SidebarProps) => {
  return (
    <>
      {isOpen && (
        <button
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden cursor-default"
          onClick={onToggle}
          aria-label="Close sidebar"
          type="button"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <button onClick={onToggle} className="text-white mb-4 lg:hidden">
            Close
          </button>
          {children}
        </div>
      </aside>
    </>
  );
};

export { Sidebar };
