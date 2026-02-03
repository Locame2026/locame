'use client';

import { Hero } from '@/components/Hero';

/**
 * UI ES "TONTA" (Regla I.1)
 * La página principal se delega en componentes atómicos.
 */
export default function Home() {
  return (
    <main className="main-container">
      <div className="bg-glow"></div>

      <Hero />

      <footer className="landing-footer">
        <p>© 2026 LOCAME. Tu menú diario, rápido y fácil.</p>
      </footer>

      <style jsx>{`
        .main-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .landing-footer {
          position: absolute;
          bottom: 30px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .bg-glow {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 50% 50%, rgba(var(--primary-rgb), 0.03) 0%, transparent 50%);
          pointer-events: none;
        }
      `}</style>
    </main>
  );
}
