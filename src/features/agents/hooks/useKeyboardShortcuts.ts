import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEffect, useCallback, useRef, useState } from 'react';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  action: () => void;
  category?: string;
  global?: boolean;
  preventDefault?: boolean;
  disabled?: boolean;
}

interface ShortcutConfig {
  enableGlobal?: boolean;
  enableDebug?: boolean;
  enableHelp?: boolean;
  helpKey?: string;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  config: ShortcutConfig = {}
) {
  const {
    enableGlobal = true,
    enableDebug = false,
    enableHelp = true,
    helpKey = '?',
  } = config;

  const [showHelp, setShowHelp] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLElement | null>(null);

  // Track pressed keys
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = normalizeKey(event);
    setPressedKeys(prev => new Set([...prev, key]));

    // Check for help shortcut
    if (enableHelp && key === helpKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      setShowHelp(true);
      return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      if (shortcut.disabled) return false;
      return isShortcutMatch(shortcut.keys, key, event);
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      
      if (enableDebug) {
        console.log('Keyboard shortcut triggered:', matchingShortcut.keys.join('+'));
      }
      
      matchingShortcut.action();
    }
  }, [shortcuts, enableHelp, helpKey, enableDebug]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = normalizeKey(event);
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  }, []);

  // Set up event listeners
  useEffect(() => {
    const target = enableGlobal ? document : containerRef.current;
    if (!target) return;

    target.addEventListener('keydown', handleKeyDown as EventListener);
    target.addEventListener('keyup', handleKeyUp as EventListener);

    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener);
      target.removeEventListener('keyup', handleKeyUp as EventListener);
    };
  }, [handleKeyDown, handleKeyUp, enableGlobal]);

  const closeHelp = useCallback(() => {
    setShowHelp(false);
  }, []);

  const getShortcutsByCategory = useCallback(() => {
    const categories: Record<string, KeyboardShortcut[]> = {};
    
    shortcuts.forEach(shortcut => {
      const category = shortcut.category || 'General';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(shortcut);
    });

    return categories;
  }, [shortcuts]);

  return {
    showHelp,
    closeHelp,
    pressedKeys: Array.from(pressedKeys),
    containerRef,
    getShortcutsByCategory,
  };
}

// Default shortcuts for common actions
export const useAgentKeyboardShortcuts = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [createLeadOpen, setCreateLeadOpen] = useState(false);

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      keys: ['ctrl+k', 'cmd+k'],
      description: 'Open global search',
      category: 'Navigation',
      action: () => setSearchOpen(true),
    },
    {
      keys: ['ctrl+n', 'cmd+n'],
      description: 'Create new lead',
      category: 'Actions',
      action: () => setCreateLeadOpen(true),
    },
    {
      keys: ['g', 'd'],
      description: 'Go to dashboard',
      category: 'Navigation',
      action: () => window.location.href = '/dashboard',
    },
    {
      keys: ['g', 'l'],
      description: 'Go to leads',
      category: 'Navigation',
      action: () => window.location.href = '/leads',
    },
    {
      keys: ['g', 'a'],
      description: 'Go to analytics',
      category: 'Navigation',
      action: () => window.location.href = '/analytics',
    },
    {
      keys: ['g', 's'],
      description: 'Go to settings',
      category: 'Navigation',
      action: () => window.location.href = '/settings',
    },

    // View shortcuts
    {
      keys: ['v', '1'],
      description: 'Switch to list view',
      category: 'Views',
      action: () => console.log('Switch to list view'),
    },
    {
      keys: ['v', '2'],
      description: 'Switch to kanban view',
      category: 'Views',
      action: () => console.log('Switch to kanban view'),
    },
    {
      keys: ['v', '3'],
      description: 'Switch to calendar view',
      category: 'Views',
      action: () => console.log('Switch to calendar view'),
    },

    // Filter shortcuts
    {
      keys: ['f', 'a'],
      description: 'Filter: Show all leads',
      category: 'Filters',
      action: () => console.log('Show all leads'),
    },
    {
      keys: ['f', 'n'],
      description: 'Filter: Show new leads',
      category: 'Filters',
      action: () => console.log('Show new leads'),
    },
    {
      keys: ['f', 'h'],
      description: 'Filter: Show high priority',
      category: 'Filters',
      action: () => console.log('Show high priority'),
    },

    // Quick actions
    {
      keys: ['r'],
      description: 'Refresh current view',
      category: 'Actions',
      action: () => window.location.reload(),
    },
    {
      keys: ['ctrl+shift+t', 'cmd+shift+t'],
      description: 'Toggle dark mode',
      category: 'Interface',
      action: () => {
        document.dispatchEvent(new CustomEvent('toggleTheme'));
      },
    },
    {
      keys: ['escape'],
      description: 'Close modal/cancel action',
      category: 'Interface',
      action: () => {
        // Close any open modals
        const closeButtons = document.querySelectorAll('[aria-label*="close"], [data-testid*="close"]');
        const lastCloseButton = closeButtons[closeButtons.length - 1] as HTMLElement;
        lastCloseButton?.click();
      },
    },

    // Selection shortcuts
    {
      keys: ['ctrl+a', 'cmd+a'],
      description: 'Select all items',
      category: 'Selection',
      action: () => console.log('Select all'),
      preventDefault: false, // Allow default behavior in inputs
    },
    {
      keys: ['ctrl+d', 'cmd+d'],
      description: 'Deselect all items',
      category: 'Selection',
      action: () => console.log('Deselect all'),
    },

    // Export shortcuts
    {
      keys: ['ctrl+e', 'cmd+e'],
      description: 'Export current data',
      category: 'Export',
      action: () => console.log('Export data'),
    },
    {
      keys: ['ctrl+shift+e', 'cmd+shift+e'],
      description: 'Export selected items',
      category: 'Export',
      action: () => console.log('Export selected'),
    },
  ];

  const { showHelp, closeHelp, getShortcutsByCategory } = useKeyboardShortcuts(shortcuts);

  return {
    shortcuts,
    showHelp,
    closeHelp,
    getShortcutsByCategory,
    searchOpen,
    setSearchOpen,
    createLeadOpen,
    setCreateLeadOpen,
  };
};

// Utility functions
function normalizeKey(event: KeyboardEvent): string {
  const key = event.key.toLowerCase();
  const modifiers: string[] = [];

  if (event.ctrlKey || event.metaKey) modifiers.push(event.ctrlKey ? 'ctrl' : 'cmd');
  if (event.altKey) modifiers.push('alt');
  if (event.shiftKey) modifiers.push('shift');

  // Special key mappings
  const keyMap: Record<string, string> = {
    ' ': 'space',
    'arrowup': 'up',
    'arrowdown': 'down',
    'arrowleft': 'left',
    'arrowright': 'right',
    'enter': 'return',
  };

  const normalizedKey = keyMap[key] || key;
  
  if (modifiers.length > 0) {
    return `${modifiers.join('+')}+${normalizedKey}`;
  }
  
  return normalizedKey;
}

function isShortcutMatch(shortcutKeys: string[], _pressedKey: string, event: KeyboardEvent): boolean {
  return shortcutKeys.some(shortcut => {
    const keys = shortcut.toLowerCase().split('+');
    const modifiers = keys.slice(0, -1);
    const mainKey = keys[keys.length - 1];

    // Check main key
    if (mainKey !== event.key.toLowerCase()) {
      return false;
    }

    // Check modifiers
    const hasCtrl = modifiers.includes('ctrl') || modifiers.includes('cmd');
    const hasAlt = modifiers.includes('alt');
    const hasShift = modifiers.includes('shift');

    const eventHasCtrl = event.ctrlKey || event.metaKey;
    const eventHasAlt = event.altKey;
    const eventHasShift = event.shiftKey;

    return hasCtrl === eventHasCtrl && hasAlt === eventHasAlt && hasShift === eventHasShift;
  });
}

// Hook for managing shortcut contexts
export function useShortcutContext(contextName: string) {
  const [isActive, setIsActive] = useState(false);

  const activate = useCallback(() => {
    setIsActive(true);
    document.body.setAttribute('data-shortcut-context', contextName);
  }, [contextName]);

  const deactivate = useCallback(() => {
    setIsActive(false);
    document.body.removeAttribute('data-shortcut-context');
  }, []);

  useEffect(() => {
    return () => {
      deactivate();
    };
  }, [deactivate]);

  return { isActive, activate, deactivate };
}

// Hook for sequential shortcuts (like vim-style commands)
export function useSequentialShortcuts() {
  const [sequence, setSequence] = useState<string[]>([]);
  const [isInSequence, setIsInSequence] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetSequence = useCallback(() => {
    setSequence([]);
    setIsInSequence(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const addToSequence = useCallback((key: string) => {
    setSequence(prev => [...prev, key]);
    setIsInSequence(true);

    // Reset sequence after 2 seconds of inactivity
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(resetSequence, 2000);
  }, [resetSequence]);

  const matchesSequence = useCallback((pattern: string[]): boolean => {
    if (sequence.length !== pattern.length) return false;
    return sequence.every((key, index) => key === pattern[index]);
  }, [sequence]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    sequence,
    isInSequence,
    addToSequence,
    resetSequence,
    matchesSequence,
  };
}

export default useKeyboardShortcuts;