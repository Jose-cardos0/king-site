import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIPad =
    /iPad/.test(ua) ||
    (ua.includes('Macintosh') && 'ontouchend' in document);
  return /iPhone|iPod/.test(ua) || isIPad;
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const mm = window.matchMedia?.('(display-mode: standalone)').matches;
    const iosStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
    return !!(mm || iosStandalone);
  } catch {
    return false;
  }
}

export function usePWAInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => detectStandalone());
  const [isIOS, setIsIOS] = useState<boolean>(() => detectIOS());

  useEffect(() => {
    setIsIOS(detectIOS());
    setInstalled(detectStandalone());

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (installed) {
      toast('Você já instalou o app 👑', { icon: '✓' });
      return 'installed' as const;
    }
    if (deferred) {
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferred(null);
          return 'accepted' as const;
        }
        return 'dismissed' as const;
      } catch {
        return 'error' as const;
      }
    }
    if (isIOS) {
      toast(
        'Para instalar: toque no botão de Compartilhar e depois em "Adicionar à Tela de Início".',
        { duration: 6000, icon: '📲' }
      );
      return 'ios-hint' as const;
    }
    return 'unavailable' as const;
  }, [deferred, installed, isIOS]);

  const canShow = !installed && (!!deferred || isIOS);

  return { installed, isIOS, canShow, hasPrompt: !!deferred, promptInstall };
}
