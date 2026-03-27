'use client';

import { useEffect, useState } from 'react';
import { devToolsStore } from './store';
import { DevToolsState } from './types';

export function DevToolsPanel() {
  const [state, setState] = useState<DevToolsState>(devToolsStore.getState());

  useEffect(() => {
    const unsubscribe = devToolsStore.subscribe(() => {
      const newState = devToolsStore.getState();
      setState(newState);
    });

    return unsubscribe;
  }, []);

  const { isOpen, activeMenuId, menus } = state;
  const menusArray = Array.from(menus.values());
  const activeMenu = activeMenuId ? menus.get(activeMenuId) : null;

  if (!isOpen) {
    return (
      <button
        onClick={() => devToolsStore.togglePanel()}
        className="fixed bottom-20 left-4 z-[9999] bg-black text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium"
        aria-label="Open DevTools"
      >
        <span>🛠️</span>
        <span>DevTools</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 z-[9999] bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[600px] w-[600px]">
      {/* Header */}
      <div className="bg-black text-white px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛠️</span>
          <span className="font-semibold text-sm">DevTools</span>
        </div>
        <button
          onClick={() => devToolsStore.togglePanel()}
          className="text-white hover:text-gray-300 transition-colors"
          aria-label="Close DevTools"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      {menusArray.length > 0 && (
        <div className="flex border-b border-gray-200 bg-gray-50">
          {menusArray.map(menu => (
            <button
              key={menu.id}
              onClick={() => devToolsStore.setActiveMenu(menu.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeMenuId === menu.id
                  ? 'bg-white text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>{menu.icon}</span>
              <span>{menu.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white">
        {activeMenu ? (
          <activeMenu.component />
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">No menus registered</p>
            <p className="text-sm">Use devToolsStore.registerMenu() to add custom menus</p>
          </div>
        )}
      </div>
    </div>
  );
}
