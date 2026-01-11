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

              /* ENTRANCE ANIMATION */
              @keyframes loadAnimation {
                0% { transform: scale(0) rotate(-720deg); opacity: 0; }
                100% { transform: scale(1) rotate(0deg); opacity: 1; }
              }

              /* WRAPPER */
              .wrapper {
                  position: relative;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }

              /* THE RGB GLOW (Layer 0) */
              /* Sits absolutely behind the container */
              .glow {
                  position: absolute;
                  inset: -6px; /* How much it spills out */
                  border-radius: 50%;
                  background: conic-gradient(
                      from 0deg,
                      var(--neon-cyan),
                      var(--neon-purple),
                      var(--neon-pink),
                      var(--neon-cyan)
                  );
                  filter: blur(8px);
                  opacity: 0;        /* Hidden by default */
                  z-index: 0;        /* Behind Container */
                  transition: opacity 0.4s ease;
              }

              /* THE MAIN ICON */
              .container {
                  position: relative;
                  z-index: 1; /* Sits ON TOP of the glow */

                  width: 100%;
                  height: 100%;
                  background: var(--bg-dark); /* Masks the center of the glow */
                  border-radius: 50%;

                  /* Glassy look */
                  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
                  border: 1px solid rgba(255,255,255,0.1);

                  display: flex;
                  align-items: center;
                  justify-content: center;

                  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

                  /* Entrance Animation */
                  animation: 1.5s loadAnimation ease-out forwards;
              }

              /* Scale the orb */
              .wrapper .container {
                  transform: scale(1.1);
              }

              /* Spin the glow */
              .wrapper .glow {
                  opacity: 1;
                  animation: rotateGlow 1.5s linear infinite;
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
                  /* Wait for entrance to finish before spinning */
                  animation-delay: 1.5s;
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
    // Attach click to the wrapper so it works even if you click the glow
    shadow
      .querySelector('.wrapper')
      .addEventListener('click', onClick);
  }

  shadow.innerHTML = styles + html;
}
