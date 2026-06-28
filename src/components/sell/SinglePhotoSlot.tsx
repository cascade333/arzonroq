"use client";

import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";

export default function SinglePhotoSlot({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "photo");

    try {
      const res = await fetch("/api/sell/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось загрузить фото");
      } else {
        onChange(data.url);
      }
    } catch {
      setError("Не удалось загрузить фото. Проверьте соединение.");
    }
    setUploading(false);
  }

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-slate-600">{label}</p>
      {value ? (
        <div className="relative h-28 w-full overflow-hidden rounded-lg border border-green-200 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 hover:bg-black/80"
            aria-label="Удалить фото"
          >
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-28 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:border-[#2E8B2E] hover:text-[#2E8B2E] disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Camera className="h-5 w-5" />
              <span className="text-xs">Загрузить фото</span>
            </>
          )}
        </button>
      )}
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
