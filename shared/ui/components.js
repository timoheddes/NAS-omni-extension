import { printToConsole } from './console.js';

export function loadOmniTheme() {
  const files = ['theme.css', 'animations.css', 'buttons.css'];

  files.forEach((file) => {
    // We assume this script is running relative to the NAS root
    // import.meta.url gives us the full URL of THIS script file.
    // We use it to resolve the path to theme.css dynamically.
    const cssUrl = new URL(`./${file}`, import.meta.url).href;
    if (!document.querySelector(`link[href="${cssUrl}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssUrl;
      document.head.appendChild(link);
    }
  });
  printToConsole(`loaded: ${files.join(', ')}`);
}

export function createOmniButton(text, onClick) {
  const btn = document.createElement('button');
  btn.innerText = text;
  btn.className = 'omni-button';

  btn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  };

  return btn;
}
