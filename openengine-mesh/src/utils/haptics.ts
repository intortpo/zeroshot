/**
 * Web Haptic Feedback Utility for Petri Zero Mobile & Touch Surfaces
 * Provides tactile feedback for navigation, toggles, note capture, and agent push actions.
 */

export const triggerLightHaptic = () => {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      navigator.vibrate(10);
    } catch {
      // Ignore vibration errors on unsupported or blocked devices
    }
  }
};

export const triggerMediumHaptic = () => {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      navigator.vibrate(22);
    } catch {
      // Ignore
    }
  }
};

export const triggerSuccessHaptic = () => {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      // Distinct double pulse for positive actions (note saved, pushed to agent)
      navigator.vibrate([15, 60, 25]);
    } catch {
      // Ignore
    }
  }
};

export const triggerWarningHaptic = () => {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      navigator.vibrate([30, 80, 40]);
    } catch {
      // Ignore
    }
  }
};
