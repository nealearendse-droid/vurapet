"use client";

import { useEffect, useState } from "react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("vurapet-install-dismissed");
    if (dismissed) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Always show after 2 seconds
    const timer = setTimeout(() => setShowBanner(true), 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } else {
      alert("To install: tap the three-dot menu in Chrome, then tap 'Add to Home Screen'");
    }
    setShowBanner(false);
    sessionStorage.setItem("vurapet-install-dismissed", "true");
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("vurapet-install-dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 16,
      left: 16,
      right: 16,
      zIndex: 9999,
      background: "#1a1410",
      border: "1px solid rgba(196,122,58,0.5)",
      borderRadius: 20,
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      padding: "16px 18px",
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
    }}>
      <span style={{ fontSize: 32, lineHeight: 1 }}>🐾</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, color: "#f0ebe4", fontSize: 14 }}>
          Install VuraPet as an App
        </p>
        <p style={{ margin: "4px 0 12px", fontSize: 12, color: "#7a6050", lineHeight: 1.5 }}>
          Add to your home screen for quick access — works offline too!
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleInstall} style={{
            background: "#c47a3a", color: "#fff", border: "none",
            borderRadius: 10, padding: "8px 18px", fontSize: 13,
            fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>
            Install App
          </button>
          <button onClick={handleDismiss} style={{
            background: "transparent", color: "#7a6050",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "8px 14px", fontSize: 13,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}