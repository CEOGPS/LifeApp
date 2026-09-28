import { useRef, useState } from "react";
import { storeImage } from "./brandImage";

const KEY = "lifeos_banner";

export function UploadBanner() {
  const [src, setSrc] = useState<string | null>(() => localStorage.getItem(KEY));
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const take = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    void storeImage(file, 1600).then((url) => {
      localStorage.setItem(KEY, url);
      setSrc(url);
    });
  };

  return (
    <div
      className={`relative h-28 shrink-0 overflow-hidden border-b border-white/10 cursor-pointer group ${dragging ? "bg-primary/10" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        take(event.dataTransfer.files?.[0]);
      }}
      title="Click or drag to upload a banner"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => take(event.target.files?.[0])}
      />
      {src ? (
        <>
          <img src={src} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-xs tracking-[0.2em] text-white/80">CHANGE BANNER</span>
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-xs tracking-[0.2em] text-white/25">UPLOAD BANNER IMAGE</span>
        </div>
      )}
    </div>
  );
}
