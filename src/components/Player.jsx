import { useState, useRef, useEffect, useMemo } from "react";
import "../App.css";
import { Play, Pause, SkipBack, SkipForward, Music, Shuffle, Search, ListMusic } from "lucide-react";

const baseUrl = "https://datashat.net/music_for_programming_";

const formatArtistForURL = (artist) =>
  artist
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[[\]]/g, "")
    .replace(/[ .]/g, "_")
    .replace(/[^a-z0-9_-]/g, (c) => encodeURIComponent(c).toLowerCase());

const tracks = [
  { id: 1, artist: "Datassette" },
  { id: 2, artist: "Sunjammer" },
  { id: 3, artist: "Datassette" },
  { id: 4, artist: "Com Truise" },
  { id: 5, artist: "Abe Mangger" },
  { id: 6, artist: "Gods of the New Age" },
  { id: 7, artist: "Tahlhoff Garten & Untitled" },
  { id: 8, artist: "Connectedness Locus" },
  { id: 9, artist: "Datassette" },
  { id: 10, artist: "Unity Gain Temple" },
  { id: 11, artist: "Miles Tilmann" },
  { id: 12, artist: "Forgotten Light" },
  { id: 13, artist: "Matt Whitehead" },
  { id: 14, artist: "Tahlhoff Garten & Untitled" },
  { id: 15, artist: "Dan Adeyemi" },
  { id: 16, artist: "Silent Stelios" },
  { id: 17, artist: "Graphplan" },
  { id: 18, artist: "Konx Om Pax" },
  { id: 19, artist: "Hivemind" },
  { id: 20, artist: "Uberdog" },
  { id: 21, artist: "Idol Eyes" },
  { id: 22, artist: "Mindaugaszq" },
  { id: 23, artist: "Panda Magic" },
  { id: 24, artist: "Rites" },
  { id: 25, artist: "_nono_" },
  { id: 26, artist: "Abstraction" },
  { id: 27, artist: "Michael Hicks" },
  { id: 28, artist: "Big War" },
  { id: 29, artist: "Luke Handsfree" },
  { id: 30, artist: "Matt Kruse" },
  { id: 31, artist: "Datassette" },
  { id: 32, artist: "Chris Seddon" },
  { id: 33, artist: "UUAV" },
  { id: 34, artist: "Chukus" },
  { id: 35, artist: "Nadim Kobeissi" },
  { id: 36, artist: "EA7 DMZ" },
  { id: 37, artist: "Lackluster" },
  { id: 38, artist: "J.S. Aurelius" },
  { id: 39, artist: "Kidding Kurrys" },
  { id: 40, artist: "Mark Schneider" },
  { id: 41, artist: "Sunjammer" },
  { id: 42, artist: "Datassette" },
  { id: 43, artist: "Hey Exit" },
  { id: 44, artist: "Hukka" },
  { id: 45, artist: "Ehohroma" },
  { id: 46, artist: "Jo Johnson" },
  { id: 47, artist: "Abe Mangger" },
  { id: 48, artist: "Michael Hicks" },
  { id: 49, artist: "Julien Mier" },
  { id: 50, artist: "Misc. Works" },
  { id: 51, artist: "Mücha" },
  { id: 52, artist: "Inchindown" },
  { id: 53, artist: "Beb Welten" },
  { id: 54, artist: "Hler" },
  { id: 55, artist: "20 Jazz Funk Greats" },
  { id: 56, artist: "Forest Drive West" },
  { id: 57, artist: "Hainbach" },
  { id: 58, artist: "Olive is the Sun" },
  { id: 59, artist: "Miunau" },
  { id: 60, artist: "Tundra" },
  { id: 61, artist: "Linnley" },
  { id: 62, artist: "Our Grey Lives" },
  { id: 63, artist: "T-Flx" },
  { id: 64, artist: "Strepsil" },
  { id: 65, artist: "Matt Whitehead" },
  { id: 66, artist: "Conrad Clipper" },
  { id: 67, artist: "Datassette" },
  { id: 68, artist: "No Data Available" },
  { id: 69, artist: "Pearl River Sound" },
  { id: 70, artist: "Things Disappear" },
  { id: 71, artist: "Neon Genesis" },
  { id: 72, artist: "Freddy Cyclone" },
  { id: 73, artist: "[in]anace" },
  {id: 74, artist: "NCW" },
  { id: 75, artist: "Datassette" },
  { id: 76, artist: "Material Object" },
  { id: 77, artist: "Phonaut" },
  { id: 78, artist: "Datassette" }
].map((track) => ({
  ...track,
  url: `${baseUrl}${track.id}-${formatArtistForURL(track.artist)}.mp3`,
  name: track.artist,
}));

const Player = ({ isActive, phase, hasStarted, volume = 1, soundEnabled }) => {
  const audioRef = useRef(null);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState([]);
  const [shuffleIndex, setShuffleIndex] = useState(0);
  const [isTrackListOpen, setIsTrackListOpen] = useState(false);
  const [trackQuery, setTrackQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const normalizedVolume = useMemo(() => {
    const raw = volume > 1 ? volume / 100 : volume;
    return Math.max(0, Math.min(1, raw));
  }, [volume]);

  const activeTrackIndex =
    isShuffled && shuffledIndices.length > 0
      ? shuffledIndices[shuffleIndex] ?? shuffledIndices[0]
      : currentTrackIndex;

  const activeTrack = tracks[activeTrackIndex];

  const filteredTracks = useMemo(() => {
    const query = trackQuery.trim().toLowerCase();
    if (!query) return tracks;

    return tracks.filter((track) => {
      const byArtist = track.artist.toLowerCase().includes(query);
      const byId = String(track.id).includes(query);
      return byArtist || byId;
    });
  }, [trackQuery]);

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const isExpanded = isTrackListOpen;

  const prefetchTrack = (url) => {
    if (typeof document === "undefined") return;

    const existing = document.querySelector(`link[data-prefetch-track="${url}"]`);
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "audio";
    link.href = url;
    link.crossOrigin = "anonymous";
    link.dataset.prefetchTrack = url;
    document.head.appendChild(link);
  };

  useEffect(() => {
    if (typeof document === "undefined") return;

    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = "https://datashat.net";
    preconnect.crossOrigin = "anonymous";
    document.head.appendChild(preconnect);

    return () => {
      if (preconnect.parentNode) preconnect.parentNode.removeChild(preconnect);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = normalizedVolume;
  }, [normalizedVolume]);

  // Load and play track based on currentTrackIndex and shuffle state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const track = activeTrack;
    if (!track) {
      setError("Track not found.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    audio.pause();

    audio.src = track.url;
    audio.load();

    const nextTrackIndex = isShuffled
      ? shuffledIndices[(shuffleIndex + 1) % tracks.length]
      : (activeTrackIndex + 1) % tracks.length;
    const nextTrack = tracks[nextTrackIndex];
    if (nextTrack?.url) {
      prefetchTrack(nextTrack.url);
    }

    const onCanPlay = () => {
      setIsLoading(false);
      setDuration(audio.duration || 0);

      if (isActive && phase === "focus" && soundEnabled && hasStarted) {
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(false);
      }
    };

    const onError = () => {
      setError("Failed to load track.");
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
    };
  }, [
    activeTrack,
    activeTrackIndex,
    isActive,
    phase,
    hasStarted,
    soundEnabled,
    isShuffled,
    shuffleIndex,
    shuffledIndices,
  ]);

  // Sync playing state when external phase or active changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    if (isActive && phase === "focus" && soundEnabled && hasStarted) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [isActive, phase, soundEnabled, isLoading, hasStarted]);

  // Handle track ended event to advance to next track automatically
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);

    const onEnded = () => {
      if (isShuffled) {
        setShuffleIndex((prev) => (prev + 1) % tracks.length);
      } else {
        setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [isShuffled]);

  // Reset player when timer stops
  useEffect(() => {
    if (!hasStarted) {
      const audio = audioRef.current;
      setIsPlaying(false);
      setIsLoading(true);
      setError(null);
      setIsShuffled(false);
      setShuffledIndices([]);
      setShuffleIndex(0);
      setCurrentTrackIndex(0);
      setCurrentTime(0);
      setDuration(0);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, [hasStarted]);

  // Handle toggle play/pause button click
  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        setError(null);
      } catch {
        setError("Playback failed.");
        setIsPlaying(false);
      }
    }
  };

  // Shuffle toggle handler
  const handleShuffle = () => {
    if (isShuffled) {
      setCurrentTrackIndex(activeTrackIndex);
      setIsShuffled(false);
      setShuffledIndices([]);
      setShuffleIndex(0);
    } else {
      const indices = Array.from({ length: tracks.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      const currentPos = indices.indexOf(currentTrackIndex);
      [indices[0], indices[currentPos]] = [indices[currentPos], indices[0]];

      setShuffledIndices(indices);
      setShuffleIndex(0);
      setIsShuffled(true);
    }
  };

  // Next track handler
  const playNextTrack = () => {
    if (isShuffled) {
      setShuffleIndex((prev) => (prev + 1) % tracks.length);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }
  };

  // Previous track handler
  const playPreviousTrack = () => {
    const audio = audioRef.current;

    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    if (isShuffled) {
      setShuffleIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    }
  };

  // Clicking track directly disables shuffle mode
  const selectTrack = (index) => {
    setCurrentTrackIndex(index);
    if (isShuffled) {
      setIsShuffled(false);
      setShuffledIndices([]);
      setShuffleIndex(0);
    }
    setIsTrackListOpen(false);
  };

  return (
    <div className={`player-bar-container ${isExpanded ? "is-open" : ""}`}>
      <div className="track-list">
        <div className="track-list-header">
          <div className="track-search-wrapper">
            <Search size={14} className="track-search-icon" />
            <input
              type="text"
              className="track-search"
              placeholder="Search by track # or artist"
              value={trackQuery}
              onChange={(event) => setTrackQuery(event.target.value)}
              aria-label="Search tracks"
            />
          </div>
          <span className="track-count">{filteredTracks.length} tracks</span>
        </div>

        <div className="track-list-content">
          {filteredTracks.map((track) => {
            const index = tracks.findIndex((item) => item.id === track.id);
            return (
            <button
              key={track.id}
              className={`track-item ${activeTrackIndex === index ? "active" : ""}`}
              onClick={() => selectTrack(index)}
              disabled={isLoading}
              aria-current={activeTrackIndex === index ? "true" : undefined}
            >
              <span className="track-number">{track.id}</span>
              <span className="track-artist">{track.artist}</span>
              {activeTrackIndex === index && isPlaying && (
                <span className="now-playing">Playing</span>
              )}
            </button>
            );
          })}

          {filteredTracks.length === 0 && (
            <div className="track-empty-state">No tracks match your search.</div>
          )}
        </div>
      </div>

      <div className="player-bar" role="region" aria-label="Music player controls">
        <button
          type="button"
          className={`control-btn track-list-toggle ${isExpanded ? "active" : ""}`}
          onClick={() => setIsTrackListOpen((current) => !current)}
          aria-label={isExpanded ? "Hide tracks" : "Show tracks"}
          title={isExpanded ? "Hide tracks" : "Show tracks"}
        >
          <ListMusic size={18} />
        </button>

        <Music size={20} className="music-icon" />
        {error && <div className="error-message" role="alert">{error}</div>}

        <div className="track-info" aria-live="polite" aria-atomic="true">
          <div className="player-main-meta">
            <span className="track-name">
              {isLoading ? "Loading..." : activeTrack?.name || "Unknown"}
            </span>
            <span className="track-subtitle">MFP #{activeTrack?.id ?? "--"}</span>
          </div>

          <div className="track-progress" role="presentation">
            <div className="track-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="track-time-row">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        <div className="player-controls">
          <button
            onClick={handleShuffle}
            className={`control-btn ${isShuffled ? "active" : ""}`}
            aria-label={isShuffled ? "Disable shuffle" : "Enable shuffle"}
            title={isShuffled ? "Shuffle On" : "Shuffle Off"}
            disabled={isLoading}
          >
            <Shuffle size={20} />
          </button>

          <button
            onClick={playPreviousTrack}
            className="control-btn"
            disabled={isLoading}
            aria-label="Previous track"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlayPause}
            className="control-btn play-pause"
            disabled={isLoading}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isLoading ? (
              <div className="loader" />
            ) : isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} />
            )}
          </button>

          <button
            onClick={playNextTrack}
            className="control-btn"
            disabled={isLoading}
            aria-label="Next track"
          >
            <SkipForward size={20} />
          </button>
        </div>

        <audio ref={audioRef} preload="auto" />
      </div>
    </div>
  );
};

export default Player;