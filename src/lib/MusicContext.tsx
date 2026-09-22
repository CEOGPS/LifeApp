// src/lib/MusicContext.tsx
// Global music player context

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUserEmail } from "@/hooks/useUserEmail";

interface Track {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  cover_url?: string;
  duration?: number;
}

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function GlobalMusicProvider({ children }: { children: ReactNode }) {
  const { email } = useUserEmail();
  const userId = email || "anon";
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [queue, setQueue] = useState<Track[]>([]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  React.useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    audioRef.current.onended = () => {
      nextTrack();
    };
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const playTrack = useCallback((track: Track) => {
    if (audioRef.current) {
      audioRef.current.src = track.audio_url;
      audioRef.current.play().catch(console.error);
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  }, []);

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeTrack = useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const nextTrack = useCallback(() => {
    if (queue.length > 0) {
      const next = queue[0];
      setQueue(prev => prev.slice(1));
      playTrack(next);
    } else {
      pauseTrack();
      setCurrentTrack(null);
    }
  }, [queue, playTrack]);

  const prevTrack = useCallback(() => {
    // For simplicity, just restart current track
    if (audioRef.current && currentTrack) {
      audioRef.current.currentTime = 0;
    }
  }, [currentTrack]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return (
    <MusicContext.Provider value={{
      currentTrack,
      isPlaying,
      volume,
      queue,
      playTrack,
      pauseTrack,
      resumeTrack,
      nextTrack,
      prevTrack,
      setVolume,
      addToQueue,
      clearQueue,
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a GlobalMusicProvider");
  }
  return context;
}