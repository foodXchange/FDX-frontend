import { useEffect, useCallback, useRef, useState } from 'react';

interface AccessibilityConfig {
  announceChanges?: boolean;
  respectMotionPreferences?: boolean;
  enableHighContrast?: boolean;
  enableFocusManagement?: boolean;
  skipLinksEnabled?: boolean;
}

interface AccessibilityState {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  keyboardUser: boolean;
  focusVisible: boolean;
}

export function useAccessibility(config: AccessibilityConfig = {}) {
  const {
    announceChanges = true,
    respectMotionPreferences = true,
    enableHighContrast = true,
    enableFocusManagement = true,
    skipLinksEnabled = true,
  } = config;

  const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>({
    reducedMotion: false,
    highContrast: false,
    screenReader: false,
    keyboardUser: false,
    focusVisible: false,
  });

  const announcementRef = useRef<HTMLDivElement>(null);
  const lastAnnouncementRef = useRef<string>('');

  // Detect user preferences and capabilities
  useEffect(() => {
    const updateAccessibilityState = () => {
      setAccessibilityState({
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        screenReader: detectScreenReader(),
        keyboardUser: false, // Will be updated by keyboard detection
        focusVisible: false,
      });
    };

    updateAccessibilityState();

    // Listen for media query changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = () => updateAccessibilityState();
    const handleContrastChange = () => updateAccessibilityState();

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Keyboard user detection
  useEffect(() => {
    let isKeyboardUser = false;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        isKeyboardUser = true;
        setAccessibilityState(prev => ({ ...prev, keyboardUser: true }));
        document.body.classList.add('keyboard-user');
      }
    };

    const handleMouseDown = () => {
      if (isKeyboardUser) {
        isKeyboardUser = false;
        setAccessibilityState(prev => ({ ...prev, keyboardUser: false }));
        document.body.classList.remove('keyboard-user');
      }
    };

    const handleFocusIn = () => {
      if (isKeyboardUser) {
        setAccessibilityState(prev => ({ ...prev, focusVisible: true }));
      }
    };

    const handleFocusOut = () => {
      setAccessibilityState(prev => ({ ...prev, focusVisible: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Screen reader announcement function
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges || !message || message === lastAnnouncementRef.current) return;

    lastAnnouncementRef.current = message;

    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;

      // Clear after announcement to allow for repeated messages
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
        lastAnnouncementRef.current = '';
      }, 1000);
    }
  }, [announceChanges]);

  // Focus management utilities
  const focusElement = useCallback((element: HTMLElement | string, options?: FocusOptions) => {
    if (!enableFocusManagement) return;

    const targetElement = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement
      : element;

    if (targetElement) {
      targetElement.focus(options);
      
      // Scroll into view if needed
      targetElement.scrollIntoView({
        behavior: accessibilityState.reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [enableFocusManagement, accessibilityState.reducedMotion]);

  const createSkipLink = useCallback((target: string, label: string) => {
    if (!skipLinksEnabled) return null;

    const skipLink = document.createElement('a');
    skipLink.href = `#${target}`;
    skipLink.textContent = label;
    skipLink.className = 'skip-link';
    
    // Style the skip link (usually visually hidden until focused)
    Object.assign(skipLink.style, {
      position: 'absolute',
      top: '-40px',
      left: '6px',
      background: '#000',
      color: '#fff',
      padding: '8px',
      textDecoration: 'none',
      borderRadius: '0 0 8px 8px',
      zIndex: '9999',
      transition: 'top 0.3s',
    });

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    return skipLink;
  }, [skipLinksEnabled]);

  // ARIA live region component
  const LiveRegion = () => (
    <div
      ref={announcementRef}
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      }}
    />
  );

  return {
    accessibilityState,
    announce,
    focusElement,
    createSkipLink,
    LiveRegion,
  };
}

// Hook for managing ARIA attributes
export function useAriaAttributes() {
  const setAriaLabel = useCallback((element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label);
  }, []);

  const setAriaDescribedBy = useCallback((element: HTMLElement, ids: string[]) => {
    element.setAttribute('aria-describedby', ids.join(' '));
  }, []);

  const setAriaLabelledBy = useCallback((element: HTMLElement, ids: string[]) => {
    element.setAttribute('aria-labelledby', ids.join(' '));
  }, []);

  const setAriaExpanded = useCallback((element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString());
  }, []);

  const setAriaSelected = useCallback((element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', selected.toString());
  }, []);

  const setAriaChecked = useCallback((element: HTMLElement, checked: boolean | 'mixed') => {
    element.setAttribute('aria-checked', checked.toString());
  }, []);

  const setAriaDisabled = useCallback((element: HTMLElement, disabled: boolean) => {
    element.setAttribute('aria-disabled', disabled.toString());
  }, []);

  const setAriaHidden = useCallback((element: HTMLElement, hidden: boolean) => {
    element.setAttribute('aria-hidden', hidden.toString());
  }, []);

  const setRole = useCallback((element: HTMLElement, role: string) => {
    element.setAttribute('role', role);
  }, []);

  return {
    setAriaLabel,
    setAriaDescribedBy,
    setAriaLabelledBy,
    setAriaExpanded,
    setAriaSelected,
    setAriaChecked,
    setAriaDisabled,
    setAriaHidden,
    setRole,
  };
}

// Hook for color contrast checking
export function useColorContrast() {
  const checkContrast = useCallback((foreground: string, background: string): number => {
    // Convert colors to RGB
    const rgb1 = hexToRgb(foreground);
    const rgb2 = hexToRgb(background);

    if (!rgb1 || !rgb2) return 0;

    // Calculate relative luminance
    const l1 = getRelativeLuminance(rgb1);
    const l2 = getRelativeLuminance(rgb2);

    // Calculate contrast ratio
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }, []);

  const meetsWCAGAA = useCallback((contrast: number, isLargeText: boolean = false): boolean => {
    return contrast >= (isLargeText ? 3 : 4.5);
  }, []);

  const meetsWCAGAAA = useCallback((contrast: number, isLargeText: boolean = false): boolean => {
    return contrast >= (isLargeText ? 4.5 : 7);
  }, []);

  return {
    checkContrast,
    meetsWCAGAA,
    meetsWCAGAAA,
  };
}

// Helper functions
function detectScreenReader(): boolean {
  // This is a simplified detection - in practice, you might use libraries like ally.js
  return !!(
    window.navigator.userAgent.match(/NVDA|JAWS|SAPI|VoiceOver|Orca/) ||
    window.speechSynthesis ||
    'speechSynthesis' in window
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function getRelativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export default useAccessibility;