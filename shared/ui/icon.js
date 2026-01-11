import { printToConsole } from './console.js';

export function injectStatusIcon(onClick, title, position) {
  if (document.getElementById('nas-omni-root')) return;

  // Create a host for Shadow DOM to prevent style conflicts
  const host = document.createElement('div');
  host.id = 'nas-omni-root';
  host.setAttribute(
    'style',
    'position: fixed; bottom: 10px; right: 50px; z-index: 99999; cursor: pointer;'
  );
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Define the CSS
  const styles = `
        <style>
            :host {
                --neon-cyan: #22d3ee;
                --neon-purple: #a855f7;
                --neon-pink: #f472b6;
                --bg-dark: #0f172a;
            }

            @keyframes loadAnimation {
              0% {
                transform: scale(0);
                rotate: 0deg;
                opacity: 0;
              }
              100% {
                transform: scale(1);
                rotate: 720deg;
                opacity: 1;
              }
            }

            .container {
                width: 40px;
                height: 40px;
                background: var(--bg-dark);
                opacity: 0.9;
                backdrop-filter: blur(6px) brightness(145%);
                -webkit-backdrop-filter: blur(6px) brightness(145%);
                border-radius: 50%;
                box-shadow: 0 0 15px rgba(34, 211, 238, 0.3), inset 0 0 10px rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s ease, width 0.3s ease;
                overflow: hidden;
                animation: 1.5s loadAnimation ease-out forwards;
            }

            /* Hover Effect: Expand slightly */
            .container:hover {
                transform: scale(1.05);
                box-shadow: 0 0 25px rgba(34, 211, 238, 0.6);
            }

            svg {
                width: 28px;
                height: 28px;
            }

            /* ANIMATIONS */

            /* 1. The Core Pulse (Heartbeat) */
            .core {
                animation: pulse 3s infinite ease-in-out;
                transform-origin: center;
            }

            /* 2. DNA Rings Rotation */
            .dna-ring {
                animation: spin 10s linear infinite;
                transform-origin: center;
            }

            /* 3. The Nodes (Flicker) */
            .node {
                animation: flicker 4s infinite ease-in-out;
            }
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
                50% { opacity: 0.5; }
                55% { opacity: 1; }
                70% { opacity: 0.3; }
            }
        </style>
    `;

  // The SVG Structure
  const html = `
        <div class="container" title="${
          title || 'NAS Omni-Tool is active on this site'
        }">
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
    `;

  if (onClick) {
    shadow
      .querySelector('.container')
      .addEventListener('click', onClick);
  }

  shadow.innerHTML = styles + html;
  printToConsole('status icon injected.');
}
