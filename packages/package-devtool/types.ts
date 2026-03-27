import { ComponentType } from 'react';

export interface DevToolsMenu {
  id: string;
  name: string;
  icon: string;
  component: ComponentType;
}

export interface DevToolsState {
  isOpen: boolean;
  activeMenuId: string | null;
  menus: Map<string, DevToolsMenu>;
}

export type Subscriber = () => void;

