export function injectStatusIcon(onClick, title) {
  if (document.getElementById('nas-omni-root')) return;

  const host = document.createElement('div');
  host.id = 'nas-omni-root';
  host.setAttribute(
    'style',
    `position: fixed; bottom: 20px; right: 20px; z-index: 99999; cursor: ${
      onClick ? 'pointer' : 'default'
    }; display: flex; align-items: center; justify-content: center;`
  );
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const styles = `
          <style>
              :host {
                  --neon-cyan: #22d3ee;
                  --neon-purple: #a855f7;
                  --neon-pink: #f472b6;
                  --bg-dark: #0f172a;
              }

              /* ENTRANCE ANIMATION (Icon spins in) */
              @keyframes loadAnimation {
                0% { transform: scale(0) rotate(-720deg); opacity: 0; }
                100% { transform: scale(1) rotate(0deg); opacity: 1; }
              }

              /* GLOW FADE IN (Ignites after delay) */
              @keyframes igniteGlow {
                to { opacity: 1; }
              }

              .wrapper {
                  position: relative;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }

              /* THE RGB GLOW (Always On, but Delayed) */
              .glow {
                  position: absolute;
                  inset: -6px;
                  border-radius: 50%;
                  background: conic-gradient(
                      from 0deg,
                      var(--neon-cyan),
                      var(--neon-purple),
                      var(--neon-pink),
                      var(--neon-cyan)
                  );
                  filter: blur(8px);
                  opacity: 0; /* Hidden initially */
                  z-index: 0;

                  /* 1. rotateGlow: Spins forever
                     2. igniteGlow: Fades opacity from 0 to 1 once
                  */
                  animation:
                    rotateGlow 3s linear infinite,
                    igniteGlow 0.5s ease-out forwards;

                  /* ⚡ WAIT 1.5s before starting both animations */
                  animation-delay: 1.5s, 1.5s;
              }

              .container {
                  position: relative;
                  z-index: 1;
                  width: 100%;
                  height: 100%;
                  background: var(--bg-dark);
                  border-radius: 50%;
                  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
                  border: 1px solid rgba(255,255,255,0.1);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

                  /* Initial Entrance */
                  animation: 1.5s loadAnimation ease-out forwards;
              }

              /* Hover Effect: Just a slight pop now (since glow is permanent) */
              .wrapper:hover .container {
                  transform: scale(1.1);
              }

              svg {
                  width: 26px;
                  height: 26px;
                  filter: drop-shadow(0 0 2px rgba(34, 211, 238, 0.5));
              }

              /* INNER ANIMATIONS */
              .core {
                  animation: pulse 3s infinite ease-in-out;
                  transform-origin: center;
              }

              .dna-ring {
                  animation: spin 10s linear infinite;
                  transform-origin: center;
                  animation-delay: 1.5s; /* Syncs with glow appearance */
              }

              .node { animation: flicker 4s infinite ease-in-out; }
              .node:nth-child(2) { animation-delay: 1s; }
              .node:nth-child(3) { animation-delay: 2s; }
              .node:nth-child(4) { animation-delay: 0.5s; }

              @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
              }

              @keyframes pulse {
                  0%, 100% { opacity: 0.8; transform: scale(1); }
                  50% { opacity: 0.4; transform: scale(0.9); }
              }

              @keyframes flicker {
                  0%, 100% { opacity: 1; }
                  55% { opacity: 1; }
                  70% { opacity: 0.3; }
              }

              @keyframes rotateGlow {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
              }
          </style>
      `;

  const html = `
          <div class="wrapper" title="${
            title || 'NAS Omni-Tool is active'
          }">
              <div class="glow"></div>
              <div class="container">
                  <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g class="dna-ring">
                          <path d="M120 120 C 180 180, 332 332, 392 392" stroke="var(--neon-cyan)" stroke-width="24" stroke-linecap="round" stroke-opacity="0.8"/>
                          <path d="M392 120 C 332 180, 290 220, 270 240" stroke="var(--neon-cyan)" stroke-width="24" stroke-linecap="round"/>
                          <path d="M240 270 C 220 290, 180 332, 120 392" stroke="var(--neon-cyan)" stroke-width="24" stroke-linecap="round"/>

                          <circle class="node" cx="120" cy="120" r="25" fill="var(--neon-purple)"/>
                          <circle class="node" cx="392" cy="392" r="25" fill="var(--neon-purple)"/>
                          <circle class="node" cx="392" cy="120" r="25" fill="var(--neon-pink)"/>
                          <circle class="node" cx="120" cy="392" r="25" fill="var(--neon-pink)"/>
                      </g>

                      <circle cx="256" cy="256" r="60" fill="var(--neon-cyan)" opacity="0.1"/>
                      <circle class="core" cx="256" cy="256" r="35" fill="var(--neon-cyan)"/>
                      <circle class="core" cx="256" cy="256" r="15" fill="#fff"/>
                  </svg>
              </div>
          </div>
      `;

  if (onClick) {
    shadow
      .querySelector('.wrapper')
      .addEventListener('click', onClick);
  }

  shadow.innerHTML = styles + html;
}
