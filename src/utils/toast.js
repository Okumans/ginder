// Lightweight pub-sub toast system — no Context/provider wiring needed,
// any component can just call showToast() and the single <ToastContainer/>
// mounted at the app root renders it. Replaces jarring native alert()
// popups with something that matches the app's own visual style.
let listeners = [];
let idCounter = 0;

export const subscribeToast = (fn) => {
  listeners.push(fn);
  return () => { listeners = listeners.filter((l) => l !== fn); };
};

// type: 'info' | 'success' | 'error' | 'warning'
export const showToast = (message, type = 'info') => {
  const toast = { id: ++idCounter, message, type };
  listeners.forEach((fn) => fn(toast));
};
