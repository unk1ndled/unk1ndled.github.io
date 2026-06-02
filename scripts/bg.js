const INTERVAL_BASE = 2000; // ms
const INTERVAL_JITTER = 1_000; // ± ms added to each cycle

const X_RANGE = [1.2, 4.3];
const Y_RANGE = [1.3, 4.8];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pickSize() {
  const x = rand(...X_RANGE).toFixed(2);
  const y = rand(...Y_RANGE).toFixed(2);
  return `${x}em ${y}em`;
}

function applyNextSize() {
  document.body.style.backgroundSize = pickSize();
}

function scheduleNext() {
  const delay = INTERVAL_BASE + rand(-INTERVAL_JITTER, INTERVAL_JITTER);
  setTimeout(() => {
    applyNextSize();
    scheduleNext(); // re-schedule with a fresh jitter each time
  }, delay);
}

// Kick off — first change happens after one full (jittered) interval
scheduleNext();
