import React from 'react';

export interface SidebarProps {
  readonly children: React.ReactNode;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}
