// Audio provider for global music playback

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverUrl?: string;
  duration: number;
}

interface MusicContextType {
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  play: (track?: Track) => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (vol: number) => void;
  seek: (time: number) => void;
  addToPlaylist: (tracks: Track[]) => void;
  setPlaylist: (tracks: Track[]) => void;
  shuffle: () => void;
  toggleLoop: () => void;
  loopMode: "none" | "one" | "all";
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loopMode, setLoopMode] = useState<"none" | "one" | "all">("all");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIndexRef = useRef(0);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    audioRef.current.addEventListener("timeupdate", () => {
      if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    });
    audioRef.current.addEventListener("loadedmetadata", () => {
      if (audioRef.current) setDuration(audioRef.current.duration);
    });
    audioRef.current.addEventListener("ended", () => {
      handleTrackEnd();
    });
    audioRef.current.addEventListener("error", (e) => {
      console.error("[Music] Audio error:", e);
      handleTrackEnd();
    });

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const handleTrackEnd = useCallback(() => {
    if (loopMode === "one" && currentTrack) {
      audioRef.current?.play().catch(console.error);
      return;
    }
    
    if (loopMode === "all" || currentIndexRef.current < playlist.length - 1) {
      next();
    } else {
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  }, [loopMode, currentTrack, playlist.length]);

  const play = useCallback((track?: Track) => {
    if (track) {
      setCurrentTrack(track);
      currentIndexRef.current = playlist.findIndex(t => t.id === track.id);
      if (currentIndexRef.current === -1) currentIndexRef.current = 0;
    }
    
    if (!currentTrack && playlist.length > 0) {
      setCurrentTrack(playlist[0]);
      currentIndexRef.current = 0;
    }
    
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [currentTrack, playlist]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const next = useCallback(() => {
    if (playlist.length === 0) return;
    currentIndexRef.current = (currentIndexRef.current + 1) % playlist.length;
    const nextTrack = playlist[currentIndexRef.current];
    setCurrentTrack(nextTrack);
    if (audioRef.current) {
      audioRef.current.src = nextTrack.url;
      audioRef.current.play().catch(console.error);
    }
  }, [playlist]);

  const previous = useCallback(() => {
    if (playlist.length === 0) return;
    currentIndexRef.current = (currentIndexRef.current - 1 + playlist.length) % playlist.length;
    const prevTrack = playlist[currentIndexRef.current];
    setCurrentTrack(prevTrack);
    if (audioRef.current) {
      audioRef.current.src = prevTrack.url;
      audioRef.current.play().catch(console.error);
    }
  }, [playlist]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [duration]);

  const addToPlaylist = useCallback((tracks: Track[]) => {
    setPlaylist(prev => [...prev, ...tracks]);
  }, []);

  const setPlaylistTracks = useCallback((tracks: Track[]) => {
    setPlaylist(tracks);
    currentIndexRef.current = 0;
  }, []);

  const shuffle = useCallback(() => {
    setPlaylist(prev => [...prev].sort(() => Math.random() - 0.5));
  }, []);

  const toggleLoop = useCallback(() => {
    setLoopMode(prev => {
      if (prev === "none") return "all";
      if (prev === "all") return "one";
      return "none";
    });
  }, []);

  return (
    <MusicContext.Provider value={{
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
      addToPlaylist: addToPlaylist,
      setPlaylist: setPlaylistTracks,
      shuffle,
      toggleLoop,
      loopMode,
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}