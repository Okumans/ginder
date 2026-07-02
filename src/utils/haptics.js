// Tiny wrapper around the Vibration API. No-ops silently on browsers/devices
// that don't support it (desktop, iOS Safari) — this is a bonus touch, not a
// required interaction, so it should never throw or need feature-detection
// at every call site.
const canVibrate = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

export const hapticTap = () => {
  if (canVibrate()) navigator.vibrate(10);
};

export const hapticSwipe = (liked) => {
  if (canVibrate()) navigator.vibrate(liked ? 15 : [10, 30, 10]);
};

export const hapticCelebrate = () => {
  if (canVibrate()) navigator.vibrate([20, 60, 20, 60, 40]);
};
