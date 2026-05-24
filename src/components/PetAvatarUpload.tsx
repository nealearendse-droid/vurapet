"use client";

import { useState, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Image from "next/image";

interface PetAvatarUploadProps {
  petId: string;
  currentAvatarUrl?: string | null;
  petName?: string;
  onUploadComplete?: (url: string) => void;
}

export default function PetAvatarUpload({
  petId,
  currentAvatarUrl,
  petName = "Your Pet",
  onUploadComplete,
}: PetAvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    currentAvatarUrl ?? null
  );
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = useCallback(
    async (file: File) => {
      setError(null);

      // ✅ Supabase client created inside the function — no GoTrueClient warning
      const supabase = createSupabaseBrowserClient();

      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a JPG, PNG, WebP, or GIF image.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5MB.");
        return;
      }

      try {
        setUploading(true);
        setProgress(20);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Not authenticated");

        setProgress(40);

        const fileExt = file.name.split(".").pop()?.toLowerCase();
        const filePath = `${user.id}/${petId}.${fileExt}`;

        // ✅ Upload FIRST — then get the URL after
        const { error: uploadError } = await supabase.storage
          .from("pet-avatars")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        setProgress(80);

        // ✅ Now get the public URL (urlData exists at this point)
        const { data: urlData } = supabase.storage
          .from("pet-avatars")
          .getPublicUrl(filePath);

        // Add cache-busting timestamp so the new photo shows immediately
        const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

        // ✅ Use profile_photo_url — matches what the pet profile page reads
        const { error: dbError } = await supabase
          .from("pets")
          .update({ profile_photo_url: publicUrl })
          .eq("id", petId)
          .eq("user_id", user.id);

        if (dbError) throw dbError;

        setProgress(100);
        setAvatarUrl(publicUrl);
        onUploadComplete?.(publicUrl);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Upload failed. Please try again.";
        setError(message);
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 600);
      }
    },
    [petId, onUploadComplete]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAvatar(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadAvatar(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const initials = petName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative group cursor-pointer transition-all duration-300 ${
          dragOver ? "scale-105" : ""
        }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label="Upload pet photo"
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
      >
        <div
          className={`relative w-32 h-32 rounded-full overflow-hidden border-4 transition-all duration-300 ${
            dragOver
              ? "border-emerald-400 shadow-lg shadow-emerald-200"
              : "border-white shadow-md"
          }`}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${petName}'s photo`}
              fill
              className="object-cover"
              sizes="128px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white text-3xl font-bold tracking-wide">
                {initials}
              </span>
            </div>
          )}

          {!uploading && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1">
              <CameraIcon />
              <span className="text-white text-xs font-medium">
                {avatarUrl ? "Change" : "Add photo"}
              </span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
              <SpinnerIcon />
              <span className="text-white text-xs font-medium">{progress}%</span>
            </div>
          )}
        </div>

        {!uploading && (
          <div className="absolute bottom-0 right-0 w-9 h-9 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm group-hover:bg-emerald-600 transition-colors">
            <PencilIcon />
          </div>
        )}
      </div>

      {uploading && (
        <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {!uploading && !error && (
        <p className="text-xs text-gray-400 text-center max-w-[160px]">
          JPG, PNG or WebP · Max 5MB
        </p>
      )}

      {error && (
        <p className="text-xs text-red-500 text-center max-w-[200px] flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
    </div>
  );
}

function CameraIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-6 h-6 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}