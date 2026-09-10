'use client';
import { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already running as standalone PWA
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isAppleMobile);

    // Listen for Chrome / Android / Edge install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (isStandalone || installed) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  // Only display button if install prompt is ready OR on iOS
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 transition-all transform active:scale-95 flex-shrink-0"
        title="Install GymFrek as an app on your device"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {/* iOS Manual Installation Guide Modal */}
      <Modal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
        title="Install GymFrek on iPhone / iPad"
      >
        <div className="space-y-4 text-sm text-gray-300 py-2">
          <div className="flex items-center gap-3 bg-gray-900 p-3 rounded-xl border border-gray-700">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center font-black text-white text-xl shadow-lg">
              GF
            </div>
            <div>
              <p className="font-bold text-white text-base">GymFrek App</p>
              <p className="text-xs text-gray-400">Add to your Home Screen for full-screen mode</p>
            </div>
          </div>

          <ol className="space-y-3 pl-1 text-xs">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                1
              </span>
              <span>
                Tap the <strong className="text-white">Share</strong> button at the bottom of Safari (the square with an arrow pointing up <span className="text-base font-bold">⎋</span>).
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                2
              </span>
              <span>
                Scroll down the share sheet and tap <strong className="text-white">&quot;Add to Home Screen&quot;</strong> (➕).
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                3
              </span>
              <span>
                Tap <strong className="text-white">&quot;Add&quot;</strong> in the top-right corner. GymFrek will now appear on your home screen like any native app!
              </span>
            </li>
          </ol>

          <button
            type="button"
            onClick={() => setShowIOSModal(false)}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-xs transition-colors"
          >
            Got it!
          </button>
        </div>
      </Modal>
    </>
  );
}
