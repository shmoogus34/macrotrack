import confetti from 'canvas-confetti';

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
  if (typeof window === 'undefined') return;

  try {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'heavy':
          navigator.vibrate(45);
          break;
        case 'success':
          navigator.vibrate([15, 60, 25]);
          break;
        case 'error':
          navigator.vibrate([40, 60, 40]);
          break;
      }
    }
  } catch {
    // Ignore unsupported
  }
}

export function celebrateGoal() {
  triggerHaptic('success');
  if (typeof window === 'undefined') return;
  try {
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#30D158', '#0A84FF', '#FF9F0A', '#FF453A', '#BF5AF2'],
    });
  } catch {
    // Ignore error
  }
}
