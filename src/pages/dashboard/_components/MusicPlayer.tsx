import { useEffect, useRef, useState } from "react";
import { Music2, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, ListMusic, Check } from "lucide-react";

type Track = {
  id: string;
  name: string;
  artist: string;
  url: string;
  size?: string;
  added?: string;
  color?: string;
};

type Playlist = { id: string; name: string; cover: string | null; color: string; tracks: string[] };

type PlayerTrack = { id: string; title: string; artist: string; url: string; duration: number };

function useMusic() {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<PlayerTrack[]>([]);
  const [loopMode, setLoopMode] = useState(false);

  const play = (track?: PlayerTrack) => {
    if (track) {
      setCurrentTrack(track);
      setPlaylist((items) => items.some((item) => item.id === track.id) ? items : [...items, track]);
      setDuration(track.duration || 0);
      setCurrentTime(0);
    }
    setIsPlaying(true);
  };
  const pause = () => setIsPlaying(false);
  const move = (offset: number) => {
    if (!playlist.length) return;
    const current = playlist.findIndex((item) => item.id === currentTrack?.id);
    setCurrentTrack(playlist[(current + offset + playlist.length) % playlist.length]);
    setIsPlaying(true);
  };

  return {
    currentTrack, playlist, isPlaying, volume, currentTime, duration,
    play, pause, next: () => move(1), previous: () => move(-1), setVolume,
    seek: setCurrentTime, setPlaylist, shuffle: () => {}, loopMode,
    toggleLoop: () => setLoopMode((value) => !value),
  };
}

const SOURCES = [
  { label: "Library", path: "/veriton/library" },
  { label: "Spotify", path: "/veriton" },
  { label: "Soundcloud", path: "/veriton" },
  { label: "Music Hub", path: "/music" },
];

function formatTime(sec: number) {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const {
    currentTrack,
    playlist,
    isPlaying,
    volume,
    currentTime,
    duration,
    play,
    pause,
    next,
    previous,
    setVolume,
    seek,
    setPlaylist,
    shuffle,
    loopMode,
    toggleLoop,
  } = useMusic();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [index, setIndex] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lifeos_music_tracks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTracks(parsed.filter((t: Track) => t.url));
      } catch {}
    }
    const savedPl = localStorage.getItem("lifeos_music_playlists");
    if (savedPl) {
      try {
        const parsed = JSON.parse(savedPl);
        setPlaylists(Array.isArray(parsed) ? parsed.filter((pl: Playlist) => Array.isArray(pl.tracks) && pl.tracks.length > 0) : []);
      } catch {}
    }
  }, []);

  const track = tracks[index];

  const applyPlaylist = (pl: Playlist) => {
    const order = new Map(pl.tracks.map((id, i) => [id, i]));
    const queued = tracks
      .filter((t) => order.has(t.id))
      .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    if (queued.length > 0) {
      setTracks((prev) => {
        const others = prev.filter((t) => !order.has(t.id));
        return [...queued, ...others].filter((t) => t.url);
      });
      setIndex(0);
    }
    setActivePlaylist(pl.name);
    setShowPlaylists(false);
  };

  // Sync local state with MusicProvider when track changes
  useEffect(() => {
    if (track?.url) {
      play({ id: track.id, title: track.name, artist: track.artist || "VeritonOS1", url: track.url, duration: 0 });
    }
  }, [track?.url, play]);

  // Sync audio element events with MusicProvider state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const progress = audio.currentTime / (audio.duration || 1);
      // We can't directly update MusicProvider's progress, but we can seek
    };
    const handleLoadedMetadata = () => {};
    const handleEnded = () => {
      if (!tracks.length) return;
      setIndex(
        shuffled
          ? Math.floor(Math.random() * tracks.length)
          : (index + 1) % tracks.length,
      );
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef, tracks.length, index, shuffled]);

  const handleTogglePlay = () => {
    if (!track) return;
    if (isPlaying) pause(); else play({ id: track.id, title: track.name, artist: track.artist || "VeritonOS1", url: track.url, duration: 0 });
  };

  const pickNext = () => {
    if (!tracks.length) return;
    setIndex(
      shuffled
        ? Math.floor(Math.random() * tracks.length)
        : (index + 1) % tracks.length,
    );
  };

  const pickPrev = () => {
    if (!tracks.length) return;
    setIndex((index - 1 + tracks.length) % tracks.length);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg glass-crimson flex items-center justify-center shrink-0 glow-crimson-sm">
          <Music2 size={18} className="text-primary/70" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-white/70 font-medium truncate">
            {track?.name || currentTrack?.title || "No track loaded"}
          </div>
          <div className="text-[10px] text-white/30 truncate">
            {track
              ? track.artist || "VeritonOS1"
              : currentTrack
                ? currentTrack.artist
                : "Create tracks in VeritonOS1 to play"}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-1 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: duration ? `${(currentTime / duration) * 100}%` : "0%",
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-white/20">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <button
          onClick={() => setShuffled((s) => !s)}
          className={`transition-colors ${
            shuffled ? "text-primary" : "text-white/20 hover:text-white/50"
          }`}
        >
          <Shuffle size={13} />
        </button>
        <button
          onClick={pickPrev}
          disabled={!tracks.length && !playlist.length}
          className="text-white/30 hover:text-white/60 transition-colors disabled:opacity-30"
        >
          <SkipBack size={16} />
        </button>
        <button
          onClick={handleTogglePlay}
          disabled={!track && !currentTrack}
          className="w-9 h-9 rounded-full glass-crimson flex items-center justify-center text-primary hover:glow-crimson-sm transition-all disabled:opacity-40"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={pickNext}
          disabled={!tracks.length && !playlist.length}
          className="text-white/30 hover:text-white/60 transition-colors disabled:opacity-30"
        >
          <SkipForward size={16} />
        </button>
        <button
          onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
          className="text-white/20 hover:text-white/50 transition-colors"
        >
          {volume > 0 ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2">
        <div className="text-[8px] text-white/25 font-display tracking-widest">
          {activePlaylist ? `PLAYING: ${activePlaylist.toUpperCase()}` : "SOURCES"}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {SOURCES.map((s) => (
            <span
              key={s.label}
              // onClick={() => navigate(s.path)}
              className="text-[9px] px-2 py-0.5 rounded-full border border-white/8 text-white/25 cursor-pointer hover:border-primary/30 hover:text-primary/50 transition-colors"
            >
              {s.label}
            </span>
          ))}
          {playlists.length > 0 && (
            <span
              onClick={() => setShowPlaylists((v) => !v)}
              className={`flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                showPlaylists
                  ? "glass-crimson border-primary/40 text-primary"
                  : "border-white/8 text-white/25 hover:border-primary/30 hover:text-primary/50"
              }`}
            >
              <ListMusic size={9} /> PLAYLISTS
            </span>
          )}
        </div>
        {showPlaylists && playlists.length > 0 && (
          <div className="flex flex-col gap-1 max-h-28 overflow-y-auto mt-1">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => applyPlaylist(pl)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors text-left"
              >
                {activePlaylist === pl.name && (
                  <Check size={9} className="text-primary shrink-0" />
                )}
                {pl.name}
                <span className="ml-auto text-[8px] text-white/25">
                  {pl.tracks?.length}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}