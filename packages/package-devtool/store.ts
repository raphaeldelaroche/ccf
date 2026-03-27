import { DevToolsMenu, DevToolsState, Subscriber } from './types';

class DevToolsStore {
  private state: DevToolsState = {
    isOpen: false,
    activeMenuId: null,
    menus: new Map(),
  };

  private subscribers: Set<Subscriber> = new Set();

  getState(): DevToolsState {
    // Return a new object to ensure React detects changes
    return {
      ...this.state,
      menus: new Map(this.state.menus),
    };
  }

  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify(): void {
    this.subscribers.forEach(callback => callback());
  }

  registerMenu(menu: DevToolsMenu): void {
    this.state.menus.set(menu.id, menu);
    
    // Set as active if it's the first menu
    if (this.state.menus.size === 1) {
      this.state.activeMenuId = menu.id;
    }
    
    this.notify();
  }

  unregisterMenu(menuId: string): void {
    this.state.menus.delete(menuId);
    
    // If active menu was removed, switch to first available
    if (this.state.activeMenuId === menuId) {
      const firstMenu = Array.from(this.state.menus.keys())[0];
      this.state.activeMenuId = firstMenu || null;
    }
    
    this.notify();
  }

  togglePanel(): void {
    this.state.isOpen = !this.state.isOpen;
    
    // Sauvegarder l'état dans localStorage
    if (typeof window !== 'undefined') {
      if (this.state.isOpen && this.state.activeMenuId) {
        localStorage.setItem('graphql-panel-open', 'true');
      } else {
        localStorage.setItem('graphql-panel-open', 'false');
      }
    }
    
    this.notify();
  }

  openPanel(menuId?: string): void {
    this.state.isOpen = true;
    if (menuId && this.state.menus.has(menuId)) {
      this.state.activeMenuId = menuId;
    }
    
    // Sauvegarder l'état
    if (typeof window !== 'undefined') {
      localStorage.setItem('graphql-panel-open', 'true');
    }
    
    this.notify();
  }

  setActiveMenu(menuId: string): void {
    if (this.state.menus.has(menuId)) {
      this.state.activeMenuId = menuId;
      this.notify();
    }
  }
}

// Singleton instance
export const devToolsStore = new DevToolsStore();
