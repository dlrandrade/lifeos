"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STANDALONE_MEDIA = "(display-mode: standalone)";
const HINT_STORAGE_KEY = "lst:ios-install-hint";
const HINT_EVENT = "lst:ios-install-hint-changed";

function noop() {
  /* noop */
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === "undefined") return noop;
  const media = window.matchMedia(STANDALONE_MEDIA);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getStandaloneSnapshot() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia(STANDALONE_MEDIA).matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function getIsIosSnapshot() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const win = window as Window & { MSStream?: unknown };
  return /iPad|iPhone|iPod/.test(ua) && !win.MSStream;
}

function subscribeIosHint(callback: () => void) {
  if (typeof window === "undefined") return noop;
  const onStorage = () => callback();
  const onCustom = () => callback();
  window.addEventListener("storage", onStorage);
  window.addEventListener(HINT_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HINT_EVENT, onCustom);
  };
}

function getIosHintDismissedSnapshot() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(HINT_STORAGE_KEY) !== null;
}

function getDefaultTrue() {
  return true;
}

function getDefaultFalse() {
  return false;
}

export function PwaRegister() {
  const standalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getDefaultFalse,
  );
  const isIos = useSyncExternalStore(
    () => noop,
    getIsIosSnapshot,
    getDefaultFalse,
  );
  const hintDismissed = useSyncExternalStore(
    subscribeIosHint,
    getIosHintDismissedSnapshot,
    getDefaultTrue,
  );

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [appInstalled, setAppInstalled] = useState(false);
  const [updateReady, setUpdateReady] =
    useState<ServiceWorkerRegistration | null>(null);
  const reloadGuard = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((registration) => {
          if (registration.waiting && navigator.serviceWorker.controller) {
            setUpdateReady(registration);
          }
          registration.addEventListener("updatefound", () => {
            const sw = registration.installing;
            if (!sw) return;
            sw.addEventListener("statechange", () => {
              if (
                sw.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setUpdateReady(registration);
              }
            });
          });
        })
        .catch((err) => {
          console.error("[pwa] sw register failed", err);
        });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    const onControllerChange = () => {
      if (reloadGuard.current) return;
      reloadGuard.current = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setAppInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setAppInstalled(true);
    }
    setInstallPrompt(null);
  }

  function applyUpdate() {
    if (!updateReady) return;
    updateReady.waiting?.postMessage({ type: "SKIP_WAITING" });
  }

  function dismissIosHint() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(HINT_STORAGE_KEY, "1");
    window.dispatchEvent(new Event(HINT_EVENT));
  }

  const installed = standalone || appInstalled;
  const showInstall = !installed && installPrompt !== null;
  const showIosHint = !installed && !installPrompt && isIos && !hintDismissed;
  const showUpdate = updateReady !== null;

  if (!showInstall && !showIosHint && !showUpdate) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-md flex-col gap-2">
        {showUpdate ? (
          <div className="flex items-center justify-between gap-3 rounded-[1.25rem] bg-[#161616] px-4 py-3 text-sm text-[#f8f3eb] shadow-lg">
            <span>Nova versao disponivel.</span>
            <button
              type="button"
              onClick={applyUpdate}
              className="rounded-full bg-[#f8f3eb] px-3 py-1 text-xs font-semibold text-[#161616]"
            >
              Atualizar
            </button>
          </div>
        ) : null}

        {showInstall ? (
          <div className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-line bg-white/95 px-4 py-3 text-sm shadow-lg backdrop-blur">
            <span>Instalar lst no seu dispositivo?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInstallPrompt(null)}
                className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted"
              >
                Agora nao
              </button>
              <button
                type="button"
                onClick={install}
                className="rounded-full bg-[#161616] px-3 py-1 text-xs font-semibold text-[#f8f3eb]"
              >
                Instalar
              </button>
            </div>
          </div>
        ) : null}

        {showIosHint ? (
          <div className="flex items-start justify-between gap-3 rounded-[1.25rem] border border-line bg-white/95 px-4 py-3 text-xs shadow-lg backdrop-blur">
            <p className="leading-5">
              No iPhone, toque em <strong>Compartilhar</strong> e depois{" "}
              <strong>Adicionar a Tela de Inicio</strong> para instalar.
            </p>
            <button
              type="button"
              onClick={dismissIosHint}
              className="rounded-full border border-line px-2 py-1 font-semibold text-muted"
            >
              Ok
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
