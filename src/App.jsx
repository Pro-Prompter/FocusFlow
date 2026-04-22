import { useEffect, useState } from "react";
import Timer from "./components/Timer";
import Weather from "./components/Weather";
import "./App.css";
import Navbar from "./components/Navbar";
import SettingsPanel from "./components/SettingsPanel";

const SETTINGS_STORAGE_KEY = "focusflow-settings";
const defaultSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 10,
  usePomodoroCycle: true,
  soundEnabled: true,
  notificationsEnabled: true,
  volume: 70,
};

const loadSettings = () => {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!saved) return defaultSettings;

    const parsed = JSON.parse(saved);
    return {
      ...defaultSettings,
      ...parsed,
    };
  } catch {
    return defaultSettings;
  }
};

function App() {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetSettings = () => setSettings(defaultSettings);

  return (
    <div className="app-container">
      <Navbar />
      <SettingsPanel
        settings={settings}
        onChange={updateSetting}
        onReset={resetSettings}
      />
      <Timer 
        pomodoroLength={settings.pomodoro}
        shortBreakLength={settings.shortBreak}
        longBreakLength={settings.longBreak}
        usePomodoroCycle={settings.usePomodoroCycle}
        soundEnabled={settings.soundEnabled}
        notificationsEnabled={settings.notificationsEnabled}
        volume={settings.volume}
      />
      <Weather />
    </div>
  );
}

export default App;