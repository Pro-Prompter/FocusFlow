import { useState, useEffect, useCallback, useRef } from "react"; 
import { Play, Pause, RefreshCw } from "lucide-react";
import Player from "./Player";

const CYCLE_LIMIT = 4;

const Timer = ({ 
  pomodoroLength, 
  shortBreakLength, 
  longBreakLength, 
  usePomodoroCycle,
  soundEnabled,
  notificationsEnabled,
  volume,
}) => {
  // Convert minutes to seconds for timer
  const FOCUS_TIME = pomodoroLength * 60;
  const BREAK_TIME = shortBreakLength * 60;
  const LONG_BREAK_TIME = longBreakLength * 60;

  // Keys for localStorage persistence
  const STORAGE_KEY = "focusflow-timer-state";

  // Timer states
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("focus");
  const [cycles, setCycles] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState(0);

  // Track last update time (in ms) using ref to avoid re-renders
  const lastUpdateTime = useRef(Date.now());

  // Load persisted state on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const {
          timeLeft: savedTimeLeft,
          isActive: savedIsActive,
          phase: savedPhase,
          cycles: savedCycles,
          hasStarted: savedHasStarted,
          lastUpdate
        } = JSON.parse(saved);

        setTimeLeft(savedTimeLeft);
        setIsActive(savedIsActive);
        setPhase(savedPhase);
        setCycles(savedCycles);
        setHasStarted(savedHasStarted);

        // Restore lastUpdateTime
        lastUpdateTime.current = lastUpdate || Date.now();
      } catch {
        // ignore corrupted data
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save state to localStorage on any relevant changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        timeLeft,
        isActive,
        phase,
        cycles,
        hasStarted,
        lastUpdate: lastUpdateTime.current,
      })
    );
  }, [timeLeft, isActive, phase, cycles, hasStarted]);

  useEffect(() => {
    if (isActive || hasStarted) return;

    const nextPhaseTime =
      phase === "focus"
        ? FOCUS_TIME
        : usePomodoroCycle && cycles % CYCLE_LIMIT === CYCLE_LIMIT - 1
        ? LONG_BREAK_TIME
        : BREAK_TIME;

    setTimeLeft(nextPhaseTime);
    setProgress(0);
  }, [FOCUS_TIME, BREAK_TIME, LONG_BREAK_TIME, isActive, hasStarted, phase, cycles, usePomodoroCycle]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    const audio = new Audio("/audio/noti.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }, [soundEnabled]);

  const getTotalTime = useCallback(() => {
    if (phase === "focus") return FOCUS_TIME;
    return cycles % CYCLE_LIMIT === CYCLE_LIMIT - 1
      ? LONG_BREAK_TIME
      : BREAK_TIME;
  }, [phase, cycles, FOCUS_TIME, LONG_BREAK_TIME, BREAK_TIME]);

  const showNotification = useCallback((message) => {
    if (!notificationsEnabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (window.Notification.permission === "granted") {
      new window.Notification(message);
    } else if (window.Notification.permission === "default") {
      window.Notification.requestPermission().then(permission => {
        if (permission === "granted") new window.Notification(message);
      });
    }
  }, [notificationsEnabled]);

  // Handle phase switching
  const switchPhase = useCallback(() => {
    playNotificationSound();
    const message = phase === "focus" ? "Break Time!" : "Focus Time!";
    showNotification(message);

    const isLongBreak = usePomodoroCycle && cycles % CYCLE_LIMIT === CYCLE_LIMIT - 1;
    const newPhase = phase === "focus" ? "break" : "focus";
    
    setPhase(newPhase);
    setTimeLeft(
      newPhase === "focus"
        ? FOCUS_TIME
        : isLongBreak
        ? LONG_BREAK_TIME
        : BREAK_TIME
    );
    setProgress(0);
    setIsActive(true);

    document.title = newPhase === "focus"
      ? `Focus Time | FocusFlow`
      : `${isLongBreak ? "Long " : ""}Break Time | FocusFlow`;
  }, [
    cycles,
    phase,
    usePomodoroCycle,
    playNotificationSound,
    showNotification,
    FOCUS_TIME,
    LONG_BREAK_TIME,
    BREAK_TIME,
  ]);

  useEffect(() => {
    const totalTime = getTotalTime();
    setProgress(((totalTime - timeLeft) / totalTime) * 100);
  }, [timeLeft, getTotalTime]);

  // More accurate timer using Date.now deltas
  useEffect(() => {
    if (!isActive) {
      lastUpdateTime.current = Date.now(); // reset last update to now
      return;
    }

    // Ensure resume starts from the exact paused second without accumulated drift.
    lastUpdateTime.current = Date.now();

    const tick = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastUpdateTime.current) / 1000); // elapsed seconds
      if (elapsed > 0) {
        setTimeLeft(prevTime => {
          const newTime = prevTime - elapsed;

          if (newTime <= 0) {
            if (phase === "focus") {
              setCycles(c => c + 1);
            }
            switchPhase();
            return 0;
          }
          return newTime;
        });
        lastUpdateTime.current = now;
      }
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isActive, phase, switchPhase, getTotalTime]);

  // Keyboard controls
  const toggleStartPause = useCallback(() => {
    const now = Date.now();

    if (!hasStarted) {
      setHasStarted(true);
      if (typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "default") {
        window.Notification.requestPermission();
      }
    }

    // Freeze elapsed time at the exact click moment for both pause and resume.
    lastUpdateTime.current = now;
    setIsActive(prev => !prev);
  }, [hasStarted]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setHasStarted(false);
    setPhase("focus");
    setTimeLeft(FOCUS_TIME);
    setCycles(0);
    setProgress(0);
    lastUpdateTime.current = Date.now();
    localStorage.removeItem(STORAGE_KEY);
    document.title = "FocusFlow | Ready to Start";
  }, [FOCUS_TIME]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        toggleStartPause();
      } else if (e.code === "Escape") {
        resetTimer();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [toggleStartPause, resetTimer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="timer-container">
      <Player
        isActive={isActive}
        phase={phase}
        hasStarted={hasStarted}
        soundEnabled={soundEnabled}
        volume={volume}
      />

      <div className="phase-indicator">
        <h2 className={`phase-title ${phase}-phase`}>
          {phase === "focus"
            ? `Focus Time (Cycle ${Math.floor(cycles / CYCLE_LIMIT) + 1})`
            : `${cycles % CYCLE_LIMIT === CYCLE_LIMIT - 1 ? "Long " : ""}Break Time`}
        </h2>
        <div className="cycle-counter" aria-live="polite">
          <span role="img" aria-label="Completed cycles">Completed Cycles:</span> {cycles}
        </div>
      </div>

      <div className="progress-container">
        <svg
          className="progress-circle"
          viewBox="0 0 100 100"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <circle className="progress-background" cx="50" cy="50" r="45" />
          <circle
            className={`progress-fill ${phase}-progress ${isActive ? "active-phase" : ""}`}
            cx="50"
            cy="50"
            r="45"
            style={{
              strokeDasharray: `${2 * Math.PI * 45}`,
              strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`,
            }}
          />
        </svg>
        <div className="progress-content">
          <div className="time-display" aria-label={`${formatTime(timeLeft)} remaining`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="button-group">
        <button
          onClick={toggleStartPause}
          className={`control-button ${isActive ? "active" : ""}`}
          aria-label={isActive ? "Pause timer" : "Start timer"}
        >
          {isActive ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          {isActive ? " Pause" : " Start"}
        </button>
        <button
          onClick={resetTimer}
          className="control-button secondary"
          aria-label="Reset timer"
        >
          <RefreshCw aria-hidden="true" /> Reset
        </button>
      </div>

      <div className="keyboard-hints">
        <kbd>Space</kbd> to play/pause • <kbd>Esc</kbd> to reset
      </div>
    </div>
  );
};

export default Timer;
