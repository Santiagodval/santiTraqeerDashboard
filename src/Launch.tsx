import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import "./launch.css";

const App = lazy(() => import("./App"));
const SESSION_KEY = "traqeer.launch.seen";

function seenIntro() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

class LaunchBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Orbit() {
  return (
    <div className="launch-orbit" aria-hidden="true">
      <div className="launch-aura" />
      <svg viewBox="0 0 320 320" fill="none">
        <defs>
          <linearGradient id="launch-trail" x1="35" y1="35" x2="285" y2="285" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d8f7df" />
            <stop offset=".55" stopColor="#88b7a1" stopOpacity=".45" />
            <stop offset="1" stopColor="#88b7a1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="160" cy="160" r="145" stroke="#b6d9c6" strokeOpacity=".08" />
        <circle cx="160" cy="160" r="113" stroke="#b6d9c6" strokeOpacity=".14" strokeDasharray="2 8" />
        <path d="M160 1v14M160 305v14M1 160h14M305 160h14" stroke="#bad9c9" strokeOpacity=".4" />
        <g className="launch-ring launch-ring-outer">
          <circle cx="160" cy="160" r="145" stroke="url(#launch-trail)" strokeWidth="1.5" strokeDasharray="228 683" strokeLinecap="round" />
          <circle cx="160" cy="15" r="4" fill="#d8f7df" />
          <circle cx="160" cy="15" r="9" stroke="#d8f7df" strokeOpacity=".2" />
        </g>
        <g className="launch-ring launch-ring-inner">
          <circle cx="160" cy="160" r="91" stroke="url(#launch-trail)" strokeWidth="1" strokeDasharray="190 382" />
          <circle cx="160" cy="251" r="3" fill="#91c4ab" />
        </g>
        <path className="launch-connectors" d="M160 47v27M47 160h27M246 160h27M160 246v27" stroke="#b6d9c6" strokeOpacity=".3" />
      </svg>
      <div className="launch-symbol">
        <svg viewBox="0 0 80 80" fill="none">
          <path className="launch-monogram" d="M39 19v33c0 6 3 9 9 9h8M24 34h33" stroke="#eef5e9" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="55" y="53" width="9" height="9" rx="3" fill="#a0cfac" />
        </svg>
      </div>
      <span className="launch-orbit-label">TQ / OPERATIONS</span>
    </div>
  );
}

function EnterArrow() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function Launch() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">("loading");
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [duration] = useState(() => seenIntro() ? 140 : 1050);
  const started = useRef(performance.now());
  const overlay = useRef<HTMLDivElement>(null);
  const focusWorkspace = useRef(false);
  const handleReady = useCallback(() => setReady(true), []);
  const handleError = useCallback(() => {
    setFailed(true);
    setPhase("loading");
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!ready || failed || phase !== "loading") return;
    const timer = window.setTimeout(() => setPhase("leaving"), reduced ? 0 : Math.max(0, duration - (performance.now() - started.current)));
    return () => window.clearTimeout(timer);
  }, [ready, failed, phase, reduced, duration]);

  useEffect(() => {
    if (phase !== "leaving") return;
    focusWorkspace.current = overlay.current?.contains(document.activeElement) ?? false;
    const timer = window.setTimeout(() => {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* Intro remains available when storage is blocked. */ }
      setPhase("done");
    }, reduced ? 0 : 360);
    return () => window.clearTimeout(timer);
  }, [phase, reduced]);

  useEffect(() => {
    if (phase !== "done" || !focusWorkspace.current) return;
    const main = document.querySelector<HTMLElement>("main");
    main?.setAttribute("tabindex", "-1");
    main?.focus({ preventScroll: true });
  }, [phase]);

  return (
    <>
      <div className={`launch-workspace ${phase === "loading" ? "launch-workspace-hidden" : ""}`} inert={phase !== "done"} aria-hidden={phase !== "done" ? true : undefined}>
        <LaunchBoundary onError={handleError}>
          <Suspense fallback={null}>
            <App />
            <Ready onReady={handleReady} />
          </Suspense>
        </LaunchBoundary>
      </div>
      {phase !== "done" && (
        <div ref={overlay} className={`launch-screen ${phase === "leaving" ? "launch-screen-leaving" : ""} ${failed ? "launch-screen-failed" : ""}`} aria-label="Inicio de Traqeer" data-testid="launch-screen">
          <header className="launch-header">
            <span className="launch-wordmark">traqeer<span>.</span></span>
            <span className="launch-header-label">CUSTOMER OPERATIONS</span>
          </header>
          <div className="launch-content">
            <Orbit />
            <p className="launch-eyebrow">CLARIDAD PARA LO QUE SIGUE</p>
            <h1>Tus relaciones,<br /><span>en contexto.</span></h1>
            <div className="launch-status" role={failed ? "alert" : "status"} aria-live="polite">
              <span className="launch-status-dot" />
              <span>{failed ? "No se pudo abrir el workspace." : ready ? "Todo listo para tu próximo paso." : "Preparando tu workspace…"}</span>
            </div>
            {failed ? (
              <button className="launch-enter" onClick={() => window.location.reload()}>Volver a intentar <EnterArrow /></button>
            ) : (
              <button className="launch-enter" disabled={!ready} onClick={() => setPhase("leaving")}>Entrar al workspace <EnterArrow /></button>
            )}
          </div>
          <footer className="launch-footer">
            <span><i aria-hidden="true" /> DEMO · DATOS FICTICIOS</span>
            <span>SANTIAGO VALDEZ <b aria-hidden="true">/</b> WORKSPACE LOCAL</span>
          </footer>
        </div>
      )}
    </>
  );
}
