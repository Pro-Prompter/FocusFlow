import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, Settings2, Volume2, Timer } from "lucide-react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const SettingsPanel = ({ settings, onChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNumberChange = (key, min, max) => (event) => {
    const nextValue = Number(event.target.value);
    if (Number.isNaN(nextValue)) return;
    onChange(key, clamp(nextValue, min, max));
  };

  const handleVolumeChange = (event) => {
    onChange("volume", clamp(Number(event.target.value), 0, 100));
  };

  return (
    <section className={`settings-panel ${isOpen ? "open" : "closed"}`} aria-label="Timer settings">
      <button
        type="button"
        className="settings-toggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="settings-panel-content"
      >
        <Settings2 size={18} />
        <span>Settings</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="settings-card" id="settings-panel-content">
          <div className="settings-group">
            <label className="settings-label" htmlFor="pomodoro-length">
              <Timer size={14} /> Focus minutes
            </label>
            <input
              id="pomodoro-length"
              className="settings-input"
              type="number"
              min="5"
              max="120"
              step="1"
              value={settings.pomodoro}
              onChange={handleNumberChange("pomodoro", 5, 120)}
            />
          </div>

          <div className="settings-group">
            <label className="settings-label" htmlFor="short-break-length">
              <Timer size={14} /> Short break minutes
            </label>
            <input
              id="short-break-length"
              className="settings-input"
              type="number"
              min="1"
              max="60"
              step="1"
              value={settings.shortBreak}
              onChange={handleNumberChange("shortBreak", 1, 60)}
            />
          </div>

          <div className="settings-group">
            <label className="settings-label" htmlFor="long-break-length">
              <Timer size={14} /> Long break minutes
            </label>
            <input
              id="long-break-length"
              className="settings-input"
              type="number"
              min="5"
              max="90"
              step="1"
              value={settings.longBreak}
              onChange={handleNumberChange("longBreak", 5, 90)}
            />
          </div>

          <div className="settings-group settings-range-group">
            <label className="settings-label" htmlFor="volume-range">
              <Volume2 size={14} /> Volume
            </label>
            <input
              id="volume-range"
              className="settings-range"
              type="range"
              min="0"
              max="100"
              step="1"
              value={settings.volume}
              onChange={handleVolumeChange}
            />
            <div className="settings-value">{settings.volume}%</div>
          </div>

          <div className="settings-actions">
            <label className="settings-toggle-row">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(event) => onChange("soundEnabled", event.target.checked)}
              />
              Sound cues
            </label>
            <label className="settings-toggle-row">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(event) => onChange("notificationsEnabled", event.target.checked)}
              />
              Notifications
            </label>
            <label className="settings-toggle-row">
              <input
                type="checkbox"
                checked={settings.usePomodoroCycle}
                onChange={(event) => onChange("usePomodoroCycle", event.target.checked)}
              />
              Long break cycle
            </label>
          </div>

          <button type="button" className="settings-reset" onClick={onReset}>
            <RotateCcw size={14} /> Reset defaults
          </button>
        </div>
      )}
    </section>
  );
};

export default SettingsPanel;