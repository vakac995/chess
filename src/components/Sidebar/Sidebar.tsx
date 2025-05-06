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
          className="bg-opacity-50 fixed inset-0 z-30 cursor-default bg-black lg:hidden"
          onClick={onToggle}
          aria-label="Close sidebar"
          type="button"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 transform bg-gray-800 text-white transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <button onClick={onToggle} className="mb-4 text-white lg:hidden">
            Close
          </button>
          {children}
        </div>
      </aside>
    </>
  );
};

export { Sidebar };
