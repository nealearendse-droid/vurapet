"use client";

import { useEffect, useState } from "react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Listen for the browser's install prompt event
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("User choice:", outcome);
    setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-green-200 rounded-2xl shadow-lg p-4 flex items-start gap-3">
      <span className="text-3xl">🐾</span>
      <div className="flex-1">
        <p className="font-semibold text-gray-800 text-sm">
          Install VuraPet as an App
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          Add to your home screen for quick access — even offline!
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="bg-green-600 text-white text-xs font-medium px-4 py-1.5 rounded-full hover:bg-green-700 transition"
          >
            Install App
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-400 text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}