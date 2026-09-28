// src/pages/veriton/VeritonWrapper.tsx
// Wrapper to embed Veriton app within LifeOS1 dashboard - No auth, uses LifeOS1 styling

import React, { Suspense, lazy } from "react";
import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { PanelLayout } from "@/components/layout/PanelLayout";
import { Music, Zap } from "lucide-react";

// Lazy load Veriton components
const VeritonAppLayout = lazy(() => import("../veriton/src/components/AppLayout.jsx").then(m => ({ default: m.default as React.ComponentType<any> })));
const VeritonCreate = lazy(() => import("../veriton/src/pages/Create.jsx").then(m => ({ default: m.default as React.ComponentType<any> })));
const VeritonLibrary = lazy(() => import("../veriton/src/pages/Library.jsx").then(m => ({ default: m.default as React.ComponentType<any> })));
const VeritonPlaylists = lazy(() => import("../veriton/src/pages/Playlists.jsx").then(m => ({ default: m.default as React.ComponentType<any> })));
const VeritonDashboard = lazy(() => import("../veriton/src/pages/Dashboard.jsx").then(m => ({ default: m.default as React.ComponentType<any> })));
const VeritonVideoStudio = lazy(() => import("../veriton/src/pages/VideoStudio.tsx").then(m => ({ default: m.default as React.ComponentType<any> })));
const VeritonTrackDetail = lazy(() => import("../veriton/src/pages/TrackDetail.jsx").then(m => ({ default: m.default as React.ComponentType<any> })));

// Simplified player context for Veriton within LifeOS1
interface PlayerContextType {
  currentTrack: any | null;
  trackList: any[];
  isPlaying: boolean;
  playTrack: (track: any, list: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

const PlayerContext = React.createContext<PlayerContextType | null>(null);

function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = React.useState<any | null>(null);
  const [trackList, setTrackList] = React.useState<any[]>([]);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const playTrack = (track: any, list: any[]) => {
    setCurrentTrack(track);
    setTrackList(list);
    setIsPlaying(true);
  };

  const onNext = () => {
    const idx = trackList.findIndex((t: any) => t.id === currentTrack?.id);
    if (idx >= 0 && idx < trackList.length - 1) {
      setCurrentTrack(trackList[idx + 1]);
    }
  };

  const onPrev = () => {
    const idx = trackList.findIndex((t: any) => t.id === currentTrack?.id);
    if (idx > 0) {
      setCurrentTrack(trackList[idx - 1]);
    }
  };

  return (
    <PlayerContext.Provider value={{ currentTrack, trackList, isPlaying, playTrack, onNext, onPrev, setIsPlaying }}>
      {children}
    </PlayerContext.Provider>
  );
}

function GlobalMusicPlayer() {
  const context = React.useContext(PlayerContext);
  const currentTrack = context?.currentTrack;
  const onNext = context?.onNext;
  const onPrev = context?.onPrev;
  const trackList = context?.trackList;
 
  if (!currentTrack) return null;
 
  return (
    <div className="fixed bottom-0 left-0 right-0 glass-crimson border-t border-white/10 p-2 z-50">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="w-12 h-12 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{currentTrack?.title || "Unknown Track"}</div>
          <div className="text-xs text-white/60 truncate">{currentTrack?.artist || "Unknown Artist"}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onPrev} className="p-2 rounded-lg glass text-white/60 hover:text-white" aria-label="Previous">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>
          <button onClick={() => {}} className="p-2 rounded-lg glass text-white/60 hover:text-white" aria-label="Play/Pause">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
          <button onClick={onNext} className="p-2 rounded-lg glass text-white/60 hover:text-white" aria-label="Next">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VeritonWrapper() {
  return (
    <PanelLayout
      title="Veriton Studio"
      subtitle="AI Music & Video Generation Studio"
      icon={<Music className="text-crimson-400" />}
    >
      <div className="h-full flex flex-col min-h-0">
        <HashRouter>
          <PlayerProvider>
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center bg-[#050505]">
                <div className="w-12 h-12 border-4 border-crimson border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <Routes>
                <Route path="/veriton/*" element={<VeritonAppLayout />}>
                  <Route index element={<Navigate to="/veriton/dashboard" replace />} />
                  <Route path="dashboard" element={<VeritonDashboard />} />
                  <Route path="create" element={<VeritonCreate />} />
                  <Route path="library" element={<VeritonLibrary />} />
                  <Route path="playlists" element={<VeritonPlaylists />} />
                  <Route path="video-studio" element={<VeritonVideoStudio />} />
                  <Route path="track/:id" element={<VeritonTrackDetail />} />
                </Route>
              </Routes>
            </Suspense>
            <GlobalMusicPlayer />
          </PlayerProvider>
        </HashRouter>
      </div>
    </PanelLayout>
  );
}