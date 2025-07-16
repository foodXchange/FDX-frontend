import { useEffect, useCallback, useRef, useState } from 'react';

interface KeyboardNavigationConfig {
  containerSelector?: string;
  itemSelector?: string;
  enableWrapAround?: boolean;
  enableTypeAhead?: boolean;
  typeAheadDelay?: number;
  onSelect?: (element: HTMLElement, index: number) => void;
  onEscape?: () => void;
  enableArrowKeys?: boolean;
  enableHomeEnd?: boolean;
  enablePageKeys?: boolean;
}

interface NavigationState {
  currentIndex: number;
  items: HTMLElement[];
  typeAheadQuery: string;
}

export function useKeyboardNavigation(config: KeyboardNavigationConfig = {}) {
  const {
    containerSelector = '[role="listbox"], [role="menu"], [role="grid"]',
    itemSelector = '[role="option"], [role="menuitem"], [role="gridcell"], [tabindex]',
    enableWrapAround = true,
    enableTypeAhead = true,
    typeAheadDelay = 1000,
    onSelect,
    onEscape,
    enableArrowKeys = true,
    enableHomeEnd = true,
    enablePageKeys = true,
  } = config;

  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentIndex: -1,
    items: [],
    typeAheadQuery: '',
  });

  const typeAheadTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLElement | null>(null);

  // Find navigable items
  const updateNavigableItems = useCallback(() => {
    const container = containerRef.current || document.querySelector(containerSelector) as HTMLElement;
    if (!container) return;

    const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[];
    const visibleItems = items.filter(item => {
      const style = window.getComputedStyle(item);
      return style.display !== 'none' && style.visibility !== 'hidden' && !item.disabled;
    });

    setNavigationState(prev => ({
      ...prev,
      items: visibleItems,
    }));
  }, [containerSelector, itemSelector]);

  // Navigate to specific index
  const navigateToIndex = useCallback((index: number) => {
    const { items } = navigationState;
    if (items.length === 0) return;

    let newIndex = index;
    
    if (enableWrapAround) {
      if (newIndex < 0) newIndex = items.length - 1;
      if (newIndex >= items.length) newIndex = 0;
    } else {
      newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
    }

    const targetElement = items[newIndex];
    if (targetElement) {
      targetElement.focus();
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'nearest',
      });

      setNavigationState(prev => ({
        ...prev,
        currentIndex: newIndex,
      }));

      onSelect?.(targetElement, newIndex);
    }
  }, [navigationState, enableWrapAround, onSelect]);

  // Navigate relative to current position
  const navigateRelative = useCallback((delta: number) => {
    navigateToIndex(navigationState.currentIndex + delta);
  }, [navigationState.currentIndex, navigateToIndex]);

  // Type-ahead functionality
  const handleTypeAhead = useCallback((character: string) => {
    if (!enableTypeAhead) return;

    const newQuery = navigationState.typeAheadQuery + character.toLowerCase();
    const { items } = navigationState;

    // Find matching item
    const matchingIndex = items.findIndex((item, index) => {
      const text = item.textContent?.toLowerCase() || '';
      return text.startsWith(newQuery) && index > navigationState.currentIndex;
    });

    // If no match found after current position, search from beginning
    const fallbackIndex = matchingIndex === -1 
      ? items.findIndex(item => {
          const text = item.textContent?.toLowerCase() || '';
          return text.startsWith(newQuery);
        })
      : matchingIndex;

    if (fallbackIndex !== -1) {
      navigateToIndex(fallbackIndex);
    }

    setNavigationState(prev => ({
      ...prev,
      typeAheadQuery: newQuery,
    }));

    // Clear type-ahead query after delay
    if (typeAheadTimeoutRef.current) {
      clearTimeout(typeAheadTimeoutRef.current);
    }
    
    typeAheadTimeoutRef.current = setTimeout(() => {
      setNavigationState(prev => ({
        ...prev,
        typeAheadQuery: '',
      }));
    }, typeAheadDelay);
  }, [enableTypeAhead, navigationState, navigateToIndex, typeAheadDelay]);

  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, metaKey, shiftKey } = event;

    // Update items list if needed
    updateNavigableItems();

    switch (key) {
      case 'ArrowDown':
        if (enableArrowKeys) {
          event.preventDefault();
          navigateRelative(1);
        }
        break;

      case 'ArrowUp':
        if (enableArrowKeys) {
          event.preventDefault();
          navigateRelative(-1);
        }
        break;

      case 'ArrowRight':
        // For horizontal navigation
        if (enableArrowKeys) {
          event.preventDefault();
          navigateRelative(1);
        }
        break;

      case 'ArrowLeft':
        // For horizontal navigation
        if (enableArrowKeys) {
          event.preventDefault();
          navigateRelative(-1);
        }
        break;

      case 'Home':
        if (enableHomeEnd) {
          event.preventDefault();
          navigateToIndex(0);
        }
        break;

      case 'End':
        if (enableHomeEnd) {
          event.preventDefault();
          navigateToIndex(navigationState.items.length - 1);
        }
        break;

      case 'PageDown':
        if (enablePageKeys) {
          event.preventDefault();
          navigateRelative(10); // Jump by 10 items
        }
        break;

      case 'PageUp':
        if (enablePageKeys) {
          event.preventDefault();
          navigateRelative(-10); // Jump by 10 items
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (navigationState.currentIndex >= 0) {
          const currentItem = navigationState.items[navigationState.currentIndex];
          currentItem?.click();
        }
        break;

      case 'Escape':
        onEscape?.();
        break;

      default:
        // Handle type-ahead for printable characters
        if (key.length === 1 && !ctrlKey && !metaKey && !shiftKey) {
          handleTypeAhead(key);
        }
        break;
    }
  }, [
    enableArrowKeys,
    enableHomeEnd,
    enablePageKeys,
    navigateRelative,
    navigateToIndex,
    navigationState,
    onEscape,
    handleTypeAhead,
    updateNavigableItems,
  ]);

  // Set up keyboard event listener
  useEffect(() => {
    const container = containerRef.current || document.querySelector(containerSelector) as HTMLElement;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerSelector, handleKeyDown]);

  // Update items when component mounts or config changes
  useEffect(() => {
    updateNavigableItems();
  }, [updateNavigableItems]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typeAheadTimeoutRef.current) {
        clearTimeout(typeAheadTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentIndex: navigationState.currentIndex,
    items: navigationState.items,
    navigateToIndex,
    navigateRelative,
    containerRef,
    setContainer: (element: HTMLElement | null) => {
      containerRef.current = element;
      updateNavigableItems();
    },
  };
}

// Hook for managing focus traps (useful for modals)
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll(selector)) as HTMLElement[];
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || event.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab: move backwards
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: move forwards
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [isActive, getFocusableElements]);

  // Set up focus trap
  useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Focus the first focusable element in the container
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Add keyboard listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to the previously focused element
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isActive, handleKeyDown, getFocusableElements]);

  return containerRef;
}

// Hook for managing roving tabindex
export function useRovingTabindex(items: HTMLElement[], activeIndex: number = 0) {
  useEffect(() => {
    items.forEach((item, index) => {
      if (index === activeIndex) {
        item.setAttribute('tabindex', '0');
      } else {
        item.setAttribute('tabindex', '-1');
      }
    });
  }, [items, activeIndex]);

  const setActiveIndex = useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < items.length) {
      items.forEach((item, index) => {
        if (index === newIndex) {
          item.setAttribute('tabindex', '0');
          item.focus();
        } else {
          item.setAttribute('tabindex', '-1');
        }
      });
    }
  }, [items]);

  return { setActiveIndex };
}

export default useKeyboardNavigation;