'use client';

import { Tab } from '@/types';

interface TabBarProps {
  tabs: Tab[];
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

export default function TabBar({ tabs, onTabSelect, onTabClose, onNewTab }: TabBarProps) {
  return (
    <div className="flex items-center bg-gray-100 border-b border-gray-300">
      <div className="flex flex-1 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center min-w-0 max-w-64 px-4 py-2 border-r border-gray-300 cursor-pointer group ${
              tab.active ? 'bg-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => onTabSelect(tab.id)}
          >
            <span className="truncate text-sm flex-1 mr-2">
              {tab.title || 'New Tab'}
            </span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700 ml-1"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onNewTab}
        className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200"
        title="新しいタブ"
      >
        +
      </button>
    </div>
  );
}
