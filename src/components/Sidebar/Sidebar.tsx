import type { SidebarProps } from './Sidebar.types';

const Sidebar = ({ children, isOpen, onToggle }: SidebarProps) => {
  return (
    <>
      {isOpen && (
        <button
          className="fixed inset-0 z-30 cursor-default bg-black/50 lg:hidden"
          onClick={onToggle}
          aria-label="Close sidebar"
          type="button"
        />
      )}

      <aside
        className={`bg-secondary fixed top-0 left-0 z-40 h-full w-64 transform text-white transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-container-padding">
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
