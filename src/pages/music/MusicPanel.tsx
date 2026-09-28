// src/pages/MusicPanel.tsx
// LifeOS1 — Music Hub
// Suno-shaped. Create / Library / Playlists tabs. Persistent mini-player.
// Per-track "Listen on…" links to 6 streaming services. Bulk import.
// AI lyric polish. Supabase for durable rows, Worker for uploads.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  Music2, Plus, Trash2, Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Volume2, Volume1, VolumeX,
  Search, Loader2, Sparkles, Upload, ListMusic, MoreHorizontal,
  ExternalLink, X,
} from "lucide-react";
/** Small local API client kept in this page so the panel does not depend on a
 * missing shared module. JSON requests get the appropriate content type while
 * FormData uploads are passed through untouched so the browser can set the
 * multipart boundary. */
async function lifeosApi<T = unknown>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const isFormData = init.body instanceof FormData;
  if (!isFormData && init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, { ...init, headers });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "message" in payload
        ? String((payload as { message: unknown }).message)
        : typeof payload === "string" && payload
          ? payload
          : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload as T;
}

function PanelLayout({
  title,
  subtitle,
  icon,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="h-full flex flex-col min-h-0">
      <header className="shrink-0 flex items-center gap-3 pb-3">
        {icon && <div className="text-primary">{icon}</div>}
        <div className="min-w-0">
          <h1 className="text-sm font-display tracking-wider text-white-85">{title}</h1>
          {subtitle && <p className="text-[10px] text-white-30">{subtitle}</p>}
        </div>
        {actions && <div className="ml-auto">{actions}</div>}
      </header>
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}
type EntityName = "Track" | "Playlist";

const db = {
  entities: {
    Track: createEntity<"Track">("Track"),
    Playlist: createEntity<"Playlist">("Playlist"),
  },
};

function createEntity<T extends EntityName>(name: T) {
  const base = `/api/entities/${name}`;
  return {
    async list<R>(sort?: string, limit?: number): Promise<R[]> {
      const query = new URLSearchParams();
      if (sort) query.set("sort", sort);
      if (limit !== undefined) query.set("limit", String(limit));
      const result = await lifeosApi<R[] | { data?: R[] }>(
        `${base}${query.size ? `?${query.toString()}` : ""}`,
      );
      return Array.isArray(result) ? result : result.data ?? [];
    },
    create<R>(body: Record<string, unknown>): Promise<R> {
      return lifeosApi<R>(base, { method: "POST", body: JSON.stringify(body) });
    },
    update<R>(id: string, body: Record<string, unknown>): Promise<R> {
      return lifeosApi<R>(`${base}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    delete(id: string): Promise<void> {
      return lifeosApi(`${base}/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
  };
}

const GENRES = ["Pop", "Rock", "Hip-Hop", "R&B", "Electronic", "Jazz", "Country", "Ambient"] as const;
const MOODS = ["Uplifting", "Melancholic", "Energetic", "Chill", "Romantic", "Dark"] as const;
const VOICES = ["Female", "Male", "Neutral"] as const;
const STREAMING_SERVICES = [
  { id: "spotify", label: "Spotify", color: "#1DB954", search: (title: string, gender?: string) => `https://open.spotify.com/search/${encodeURIComponent(`${title} ${gender ?? ""}`)}` },
  { id: "apple", label: "Apple Music", color: "#FA243C", search: (title: string, gender?: string) => `https://music.apple.com/us/search?term=${encodeURIComponent(`${title} ${gender ?? ""}`)}` },
  { id: "youtube", label: "YouTube Music", color: "#FF0000", search: (title: string, gender?: string) => `https://music.youtube.com/search?q=${encodeURIComponent(`${title} ${gender ?? ""}`)}` },
  { id: "soundcloud", label: "SoundCloud", color: "#FF5500", search: (title: string, gender?: string) => `https://soundcloud.com/search?q=${encodeURIComponent(`${title} ${gender ?? ""}`)}` },
  { id: "deezer", label: "Deezer", color: "#A238FF", search: (title: string, gender?: string) => `https://www.deezer.com/search/${encodeURIComponent(`${title} ${gender ?? ""}`)}` },
  { id: "tidal", label: "Tidal", color: "#FFFFFF", search: (title: string, gender?: string) => `https://tidal.com/search?q=${encodeURIComponent(`${title} ${gender ?? ""}`)}` },
] as const;

interface GeneratedSong {
  status: "generating" | "ready" | "failed";
  title: string;
  lyrics?: string;
  genre?: string;
  mood?: string;
  voice?: string;
  bpm?: number;
  durationSec?: number;
  thumbnailUrl?: string;
  audioUrl?: string;
}

const generateSong = (input: Record<string, unknown>) =>
  lifeosApi<{ id: string }>("/api/music/generate", { method: "POST", body: JSON.stringify(input) });
const pollSongStatus = (id: string) =>
  lifeosApi<GeneratedSong>(`/api/music/status/${encodeURIComponent(id)}`);
const polishLyrics = (lyrics: string, genre: string, bpm: number) =>
  lifeosApi<{ ok: boolean; text: string; detail?: string }>("/api/music/polish", {
    method: "POST",
    body: JSON.stringify({ lyrics, genre, bpm }),
  });

interface PlayerTrack {
  id: string;
  title: string;
  audioFileUrl?: string;
  artist?: string;
  genre?: string;
  thumbnailUrl?: string;
  durationSec?: number;
}

function useMusic() {
  const [tracks, setTracks] = useState<PlayerTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [playing, setPlaying] = useState(false);

  const playTrack = useCallback((track: PlayerTrack) => {
    setCurrentTrack(track);
    setPlaying(true);
  }, []);
  const togglePlay = useCallback(() => setPlaying((value) => !value), []);
  const addToQueue = useCallback((track: PlayerTrack) => {
    setTracks((current) => current.some((item) => item.id === track.id)
      ? current
      : [...current, track]);
  }, []);
  const applyPlaylist = useCallback((ids: string[]) => {
    const first = tracks.find((track) => ids.includes(track.id));
    if (first) playTrack(first);
  }, [tracks, playTrack]);

  return { setTracks, currentTrack, playing, playTrack, togglePlay, addToQueue, applyPlaylist };
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Types + helpers
     ═══════════════════════════════════════════════════════════════════════════ */

  type Tab = "create" | "library" | "playlists";

interface DBTrack {
  id: string;
  title: string;
  lyrics?: string | null;
  genre?: string | null;
  mood?: string | null;
  gender?: string | null;
  bpm?: number | null;
  duration?: number | null;
  coverArtUrl?: string | null;
  audioFileUrl?: string | null;
  status?: string | null;
  playlistIds?: unknown;
  created_at?: string;
  play_count?: number | null;
  last_played_at?: string | null;
}

interface DBPlaylist {
  id: string;
  name: string;
  trackIds?: unknown;
  color?: string | null;
  coverMosaicUrls?: unknown;
  created_at?: string;
}

function safeArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

function rowToPlayerTrack(row: DBTrack): PlayerTrack {
  return {
    id: row.id,
    title: row.title,
    audioFileUrl: row.audioFileUrl ?? undefined,
    artist: row.gender ?? undefined,
    genre: row.genre ?? undefined,
    thumbnailUrl: row.coverArtUrl ?? undefined,
    durationSec: row.duration ?? undefined,
  };
}

function fmtTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main panel
   ═══════════════════════════════════════════════════════════════════════════ */

export default function MusicPanel() {
  const [tab, setTab] = useState<Tab>("create");
  const [songs, setSongs] = useState<DBTrack[]>([]);
  const [playlists, setPlaylists] = useState<DBPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openPlaylistId, setOpenPlaylistId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rawTracks, rawPlaylists] = await Promise.all([
        db.entities.Track.list<DBTrack>("-created_at", 300),
        db.entities.Playlist.list<DBPlaylist>("-created_at", 300),
      ]);
      setSongs(Array.isArray(rawTracks) ? rawTracks : []);
      setPlaylists(Array.isArray(rawPlaylists) ? rawPlaylists : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Feed the global player whenever the library changes.
  const { setTracks } = useMusic();
  useEffect(() => {
    const playable = songs
      .map(rowToPlayerTrack)
      .filter((t) => !!t.audioFileUrl);
    setTracks(playable);
  }, [songs, setTracks]);

  return (
    <PanelLayout
      title="Music Hub"
      subtitle="Generate · Library · Playlists"
      icon={<Music2 size={18} />}
      actions={
        <div className="flex gap-1.5">
          {(["create", "library", "playlists"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setOpenPlaylistId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-display tracking-wider transition-colors ${
                tab === t
                  ? "glass-crimson text-primary"
                  : "glass text-white-40 hover:text-white-80"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-full flex flex-col min-h-0 gap-3">
        {error && (
          <div className="glass rounded-lg border border-crimson/30 bg-crimson/5 px-3 py-2 text-[11px] text-crimson flex items-center justify-between">
            <span>{error}</span>
            <button onClick={refresh} className="text-crimson/70 hover:text-crimson underline">
              Retry
            </button>
          </div>
        )}

        {tab === "create" && (
          <CreateTab
            songs={songs}
            setSongs={setSongs}
            onCommitted={refresh}
          />
        )}

        {tab === "library" && (
          <LibraryTab
            loading={loading}
            songs={songs}
            setSongs={setSongs}
            playlists={playlists}
            onRefresh={refresh}
          />
        )}

        {tab === "playlists" && (
          <PlaylistsTab
            loading={loading}
            playlists={playlists}
            setPlaylists={setPlaylists}
            songs={songs}
            openPlaylistId={openPlaylistId}
            setOpenPlaylistId={setOpenPlaylistId}
          />
        )}
      </div>
    </PanelLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Create tab
   ═══════════════════════════════════════════════════════════════════════════ */

function CreateTab({
  songs,
  setSongs,
  onCommitted,
}: {
  songs: DBTrack[];
  setSongs: React.Dispatch<React.SetStateAction<DBTrack[]>>;
  onCommitted: () => void;
}) {
  const [lyrics, setLyrics] = useState("");
  const [genre, setGenre] = useState<string>(GENRES[0]);
  const [mood, setMood] = useState<string>(MOODS[0]);
  const [voice, setVoice] = useState<string>(VOICES[0]);
  const [bpm, setBpm] = useState(120);
  const [busy, setBusy] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const recent = useMemo(() => songs.slice(0, 10), [songs]);

  const handleGenerate = useCallback(async () => {
    if (!lyrics.trim()) {
      setMsg("Enter lyrics or a description first.");
      return;
    }
    setBusy(true);
    setMsg(null);

    try {
      const { id: stubId } = await generateSong({
        prompt: lyrics.trim(),
        lyrics: lyrics.trim(),
        genre,
        mood,
        voice,
        bpm,
      });

      // Poll the stub until it flips to "ready", then persist the REAL row
      // into Supabase (no client id — server assigns the UUID).
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        let song: GeneratedSong;
        try {
          song = await pollSongStatus(stubId);
        } catch {
          continue;
        }
        if (song.status === "generating") continue;
        if (song.status === "failed") {
          setMsg("Generation failed.");
          setBusy(false);
          return;
        }
        if (song.status === "ready" && song.audioUrl) {
          const inserted = await db.entities.Track.create<DBTrack>({
            title: song.title,
            lyrics: song.lyrics ?? "",
            genre: song.genre,
            mood: song.mood,
            gender: song.voice,
            bpm: song.bpm,
            duration: song.durationSec,
            coverArtUrl: song.thumbnailUrl ?? null,
            audioFileUrl: song.audioUrl,
            status: "ready",
            playlistIds: [],
          });
          if (inserted) {
            setSongs((prev) => [inserted, ...prev]);
          }
          setMsg(`“${song.title}” is ready.`);
          onCommitted();
          setBusy(false);
          return;
        }
      }
      setMsg("Generation timed out.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setBusy(false);
    }
  }, [lyrics, genre, mood, voice, bpm, setSongs, onCommitted]);

  const handlePolish = useCallback(async () => {
    if (!lyrics.trim()) {
      setMsg("Write something to polish first.");
      return;
    }
    setPolishing(true);
    setMsg(null);
    const res = await polishLyrics(lyrics, genre, bpm);
    if (res.ok) {
      setLyrics(res.text);
    } else {
      setMsg(`Polish failed: ${res.detail}`);
    }
    setPolishing(false);
  }, [lyrics, genre, bpm]);

  return (
    <div className="flex flex-1 min-h-0 gap-3">
      <div className="w-[420px] shrink-0 flex flex-col gap-3 overflow-y-auto pr-1">
        <div className="glass rounded-xl border border-white-8 p-3 flex flex-col gap-3">
          <div className="text-[9px] font-display tracking-widest text-teal uppercase">
            New Song
          </div>

          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Write lyrics, or describe the song you want…"
            className="w-full px-3 py-2 rounded-lg bg-[#0d0e17] border border-white-10 text-xs text-white-85 placeholder:text-white-25 focus:outline-none resize-y min-h-[180px] leading-relaxed font-mono"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-display tracking-widest text-teal uppercase mb-1">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-[#0d0e17] border border-white-10 text-xs text-white-85 focus:outline-none"
              >
                {GENRES.map((g: typeof GENRES[number]) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-display tracking-widest text-teal uppercase mb-1">
                Mood
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-[#0d0e17] border border-white-10 text-xs text-white-85 focus:outline-none"
              >
                {MOODS.map((m: typeof MOODS[number]) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-display tracking-widest text-teal uppercase mb-1">
                Voice
              </label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-[#0d0e17] border border-white-10 text-xs text-white-85 focus:outline-none"
              >
                {VOICES.map((v: typeof VOICES[number]) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-display tracking-widest text-teal uppercase mb-1">
                BPM: {bpm}
              </label>
              <input
                type="range"
                min={40}
                max={220}
                step={1}
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          {msg && <div className="text-[11px] text-crimson/90">{msg}</div>}

          <div className="flex gap-2">
            <button
              onClick={handlePolish}
              disabled={polishing || busy}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg glass text-teal text-[11px] font-display tracking-wider hover:text-white disabled:opacity-50 transition-colors"
            >
              {polishing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              POLISH
            </button>
            <button
              onClick={handleGenerate}
              disabled={busy}
              className="flex-[2] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg glass-crimson text-primary text-[11px] font-display tracking-wider hover:glow-crimson-sm disabled:opacity-50 transition-all"
            >
              {busy ? <Loader2 size={11} className="animate-spin" /> : <Music2 size={11} />}
              GENERATE
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col glass rounded-xl border border-white-8 overflow-hidden">
        <div className="px-3 py-2 border-b border-white-5 flex items-center">
          <span className="text-[10px] font-display tracking-widest text-teal uppercase">
            Recent
          </span>
          <span className="ml-auto text-[10px] text-white-30">
            {recent.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {recent.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Music2 size={28} className="mx-auto text-white-10 mb-2" />
                <div className="text-xs text-white-30">
                  Nothing yet. Write something and hit Generate.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {recent.map((s) => (
                <TrackRow key={s.id} track={s} playlists={[]} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Library tab
   ═══════════════════════════════════════════════════════════════════════════ */

function LibraryTab({
  loading,
  songs,
  setSongs,
  playlists,
  onRefresh,
}: {
  loading: boolean;
  songs: DBTrack[];
  setSongs: React.Dispatch<React.SetStateAction<DBTrack[]>>;
  playlists: DBPlaylist[];
  onRefresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return songs.filter((s) => {
      if (genreFilter && s.genre !== genreFilter) return false;
      if (!q) return true;
      return (
        (s.title ?? "").toLowerCase().includes(q) ||
        (s.lyrics ?? "").toLowerCase().includes(q)
      );
    });
  }, [songs, search, genreFilter]);

  const handleImport = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;
      setImporting(true);
      try {
        for (const file of files) {
          const form = new FormData();
          form.append("file", file);
          form.append("type", "music");
          // Use lifeosApi with formData (handled by fetch internally if we pass the form)
          const up = await lifeosApi<{ ok: boolean; url: string }>("/api/upload", {
            method: "POST",
            body: form,
          } as any);
          if (!up?.url) continue;
          const title = file.name.replace(/\.[^.]+$/, "") || "Untitled";
          const row = await db.entities.Track.create<DBTrack>({
            title,
            genre: "Uploaded",
            status: "ready",
            audioFileUrl: up.url,
            lyrics: "",
            playlistIds: [],
          });
          if (row) setSongs((prev) => [row, ...prev]);
        }
        onRefresh();
      } catch (e) {
        console.warn("[music] import failed:", e);
      } finally {
        setImporting(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [setSongs, onRefresh],
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col glass rounded-xl border border-white-8 overflow-hidden">
      <div className="p-3 border-b border-white-5 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white-30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search library…"
            className="w-full h-8 pl-8 pr-3 text-xs rounded-lg bg-[#0d0e17] border border-white-10 text-white-85 placeholder:text-white-25 focus:outline-none"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setGenreFilter(null)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-display transition-colors ${
              !genreFilter ? "glass-crimson text-primary" : "glass text-white-40 hover:text-white-70"
            }`}
          >
            ALL
          </button>
          {GENRES.slice(0, 6).map((g) => (
            <button
              key={g}
              onClick={() => setGenreFilter(genreFilter === g ? null : g)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-display transition-colors ${
                genreFilter === g ? "glass-crimson text-primary" : "glass text-white-40 hover:text-white-70"
              }`}
            >
              {g.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-white-55 text-[11px] font-display tracking-wider hover:text-white-85 disabled:opacity-50 transition-colors"
          >
            {importing ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
            {importing ? "IMPORTING…" : "IMPORT"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={20} className="animate-spin text-white-30" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <Music2 size={32} className="mx-auto text-white-10 mb-2" />
              <div className="text-sm text-white-30">No tracks found</div>
              <div className="text-[11px] text-white-20 mt-1">
                Import audio files or generate a song to get started.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((s) => (
              <TrackRow
                key={s.id}
                track={s}
                playlists={playlists}
                onPlaylistUpdated={onRefresh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Playlists tab
   ═══════════════════════════════════════════════════════════════════════════ */

function PlaylistsTab({
  loading,
  playlists,
  setPlaylists,
  songs,
  openPlaylistId,
  setOpenPlaylistId,
}: {
  loading: boolean;
  playlists: DBPlaylist[];
  setPlaylists: React.Dispatch<React.SetStateAction<DBPlaylist[]>>;
  songs: DBTrack[];
  openPlaylistId: string | null;
  setOpenPlaylistId: (id: string | null) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const { applyPlaylist } = useMusic();

  const openPlaylist = useMemo(
    () => playlists.find((p) => p.id === openPlaylistId) ?? null,
    [playlists, openPlaylistId],
  );

  const createPlaylist = useCallback(async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      const row = await db.entities.Playlist.create<DBPlaylist>({
        name,
        trackIds: [],
        coverMosaicUrls: [],
      });
      if (row) setPlaylists((prev) => [row, ...prev]);
    } catch (e) {
      console.warn("[music] create playlist failed:", e);
    }
    setNewName("");
    setCreating(false);
  }, [newName, setPlaylists]);

  const deletePlaylist = useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this playlist? Songs are not deleted.")) return;
      try {
        await db.entities.Playlist.delete(id);
        setPlaylists((prev) => prev.filter((p) => p.id !== id));
        if (openPlaylistId === id) setOpenPlaylistId(null);
      } catch (e) {
        console.warn("[music] delete playlist failed:", e);
      }
    },
    [setPlaylists, openPlaylistId, setOpenPlaylistId],
  );

  const updateTrackIds = useCallback(
    async (playlistId: string, ids: string[]) => {
      setPlaylists((prev) =>
        prev.map((p) => (p.id === playlistId ? { ...p, trackIds: ids } : p)),
      );
      try {
        await db.entities.Playlist.update(playlistId, { trackIds: ids });
      } catch (e) {
        console.warn("[music] update playlist failed:", e);
      }
    },
    [setPlaylists],
  );

  /* ── Detail view ── */
  if (openPlaylist) {
    const ids = safeArray(openPlaylist.trackIds);
    const plTracks = ids
      .map((id) => songs.find((s) => s.id === id))
      .filter((s): s is DBTrack => !!s);

    return (
      <div className="flex-1 min-h-0 flex flex-col glass rounded-xl border border-white-8 overflow-hidden">
        <div className="p-3 border-b border-white-5 flex items-center gap-3">
          <button
            onClick={() => setOpenPlaylistId(null)}
            className="text-[11px] text-teal hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-display text-white-90 truncate">
              {openPlaylist.name}
            </div>
            <div className="text-[10px] text-white-30">
              {plTracks.length} tracks
            </div>
          </div>
          <button
            onClick={() => applyPlaylist(plTracks.map((t) => t.id))}
            disabled={plTracks.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-crimson text-primary text-[11px] font-display tracking-wider hover:glow-crimson-sm disabled:opacity-40 transition-all"
          >
            <Play size={11} /> PLAY PLAYLIST
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {plTracks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="text-sm text-white-30">
                Empty playlist. Add tracks from the Library tab.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {plTracks.map((t) => (
                <TrackRow
                  key={t.id}
                  track={t}
                  playlists={playlists}
                  onRemoveFromPlaylist={() =>
                    updateTrackIds(
                      openPlaylist.id,
                      ids.filter((x) => x !== t.id),
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Grid view ── */
  return (
    <div className="flex-1 min-h-0 flex flex-col glass rounded-xl border border-white-8 overflow-hidden">
      <div className="p-3 border-b border-white-5 flex items-center">
        <span className="text-[10px] font-display tracking-widest text-teal uppercase">
          Playlists
        </span>
        <button
          onClick={() => setCreating(true)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-crimson text-primary text-[11px] font-display tracking-wider hover:glow-crimson-sm transition-all"
        >
          <Plus size={11} /> NEW PLAYLIST
        </button>
      </div>

      {creating && (
        <div className="px-3 py-2 border-b border-white-5 flex gap-2 items-center">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
            placeholder="Playlist name…"
            className="flex-1 h-8 px-3 text-xs rounded-lg bg-[#0d0e17] border border-white-10 text-white-85 placeholder:text-white-25 focus:outline-none"
          />
          <button
            onClick={createPlaylist}
            className="px-3 h-8 rounded-lg glass-crimson text-primary text-[11px] font-display"
          >
            CREATE
          </button>
          <button
            onClick={() => {
              setCreating(false);
              setNewName("");
            }}
            className="px-3 h-8 rounded-lg glass text-white-50 text-[11px]"
          >
            CANCEL
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={20} className="animate-spin text-white-30" />
          </div>
        ) : playlists.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <ListMusic size={32} className="mx-auto text-white-10 mb-2" />
              <div className="text-sm text-white-30">No playlists yet</div>
              <div className="text-[11px] text-white-20 mt-1">
                Click "New Playlist" to create one.
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {playlists.map((p) => {
              const count = safeArray(p.trackIds).length;
              return (
                <div
                  key={p.id}
                  onClick={() => setOpenPlaylistId(p.id)}
                  className="glass rounded-xl border border-white-8 p-3 flex flex-col gap-2 hover:border-primary/30 transition-colors cursor-pointer group"
                >
                  <div className="aspect-square rounded-lg bg-[#0d0e17] flex items-center justify-center">
                    <ListMusic size={28} className="text-white-15" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white-85 truncate">{p.name}</div>
                      <div className="text-[10px] text-white-30">{count} tracks</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist(p.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-white-30 hover:text-crimson transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TrackRow — shared list row with inline play + overflow menu
   ═══════════════════════════════════════════════════════════════════════════ */

function TrackRow({
  track,
  playlists,
  onRemoveFromPlaylist,
  onPlaylistUpdated,
}: {
  track: DBTrack;
  playlists: DBPlaylist[];
  onRemoveFromPlaylist?: () => void;
  onPlaylistUpdated?: () => void;
}) {
  const { currentTrack, playing, playTrack, togglePlay, addToQueue } = useMusic();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCurrent = currentTrack?.id === track.id;
  const isThisPlaying = isCurrent && playing;
  const isGenerating = track.status === "generating";

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const handlePlay = () => {
    if (!track.audioFileUrl) return;
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(rowToPlayerTrack(track));
    }
  };

  const addToPlaylist = useCallback(
    async (playlistId: string) => {
      const pl = playlists.find((p) => p.id === playlistId);
      if (!pl) return;
      const ids = safeArray(pl.trackIds);
      if (ids.includes(track.id)) return;
      const next = [...ids, track.id];
      try {
        await db.entities.Playlist.update(playlistId, { trackIds: next });
        onPlaylistUpdated?.();
      } catch (e) {
        console.warn("[music] add to playlist failed:", e);
      }
      setMenuOpen(false);
    },
    [playlists, track.id, onPlaylistUpdated],
  );

  return (
    <div
      className={`flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors ${
        isCurrent ? "bg-crimson/8 border border-crimson/20" : "hover:bg-white/5 border border-transparent"
      }`}
    >
      {/* Play button / thumbnail */}
      <button
        onClick={handlePlay}
        disabled={!track.audioFileUrl || isGenerating}
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden disabled:opacity-40 transition-opacity"
        style={{
          background: track.coverArtUrl
            ? `url(${track.coverArtUrl}) center/cover`
            : isCurrent
              ? "linear-gradient(135deg, oklch(0.55 0.22 20 / 40%), oklch(0.35 0.18 20 / 60%))"
              : "oklch(1 0 0 / 0.04)",
        }}
      >
        {isGenerating ? (
          <Loader2 size={14} className="animate-spin text-primary" />
        ) : isThisPlaying ? (
          <Pause size={14} className="text-primary" />
        ) : (
          <Play size={14} className={isCurrent ? "text-primary" : "text-white-50"} />
        )}
      </button>

      {/* Meta */}
      <div className="flex-1 min-w-0">
        <div className={`text-xs truncate ${isCurrent ? "text-primary" : "text-white-85"}`}>
          {track.title}
        </div>
        <div className="text-[10px] text-white-30 truncate">
          {track.genre || "—"}
          {track.bpm ? ` · ${track.bpm} BPM` : ""}
          {track.duration ? ` · ${fmtTime(track.duration)}` : ""}
        </div>
      </div>

      {/* Duration */}
      {track.duration ? (
        <div className="text-[10px] text-white-30 shrink-0">
          {fmtTime(track.duration)}
        </div>
      ) : null}

      {/* Overflow menu */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white-30 hover:text-white-70 hover:bg-white/5 transition-colors"
        >
          <MoreHorizontal size={14} />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-lg border border-white-10 bg-[#0d0e17] shadow-xl overflow-hidden"
            style={{ backdropFilter: "blur(12px)" }}
          >
            {/* Listen on… */}
            <div className="px-3 py-2 text-[9px] font-display tracking-widest text-teal uppercase border-b border-white-5">
              Listen on
            </div>
            {STREAMING_SERVICES.map((svc: {
              id: string;
              label: string;
              color: string;
              search: (title: string, gender?: string) => string;
            }) => {
              const url = svc.search(track.title, track.gender ?? undefined);
              return (
                <a
                  key={svc.id}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-white-70 hover:bg-white/5 transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: svc.color }}
                  />
                  <span className="flex-1">{svc.label}</span>
                  <ExternalLink size={10} className="text-white-30" />
                </a>
              );
            })}

            {/* Add to playlist */}
            {playlists.length > 0 && (
              <>
                <div className="px-3 py-2 text-[9px] font-display tracking-widest text-teal uppercase border-y border-white-5">
                  Add to playlist
                </div>
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => addToPlaylist(pl.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-white-70 hover:bg-white/5 transition-colors text-left"
                  >
                    <ListMusic size={10} className="text-white-30 shrink-0" />
                    <span className="flex-1 truncate">{pl.name}</span>
                  </button>
                ))}
              </>
            )}

            {/* Queue + remove */}
            <div className="border-t border-white-5">
              <button
                onClick={() => {
                  addToQueue(rowToPlayerTrack(track));
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-white-70 hover:bg-white/5 transition-colors text-left"
              >
                <Plus size={10} className="text-white-30 shrink-0" />
                Add to queue
              </button>
              {onRemoveFromPlaylist && (
                <button
                  onClick={() => {
                    onRemoveFromPlaylist();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-crimson/90 hover:bg-crimson/8 transition-colors text-left"
                >
                  <X size={10} className="shrink-0" />
                  Remove from playlist
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}