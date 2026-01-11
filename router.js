import { injectStatusIcon } from './shared/ui/icon.js';
import { printToConsole } from './shared/ui/console.js';

injectStatusIcon();

const currentUrl = window.location.hostname;
printToConsole(`active on: ${currentUrl}.`);

// if (currentUrl.includes('green-acres.fr')) {
//   printToConsole('Loading Gite Hunter...');
//   // Note: Ensure apps/green-acres/main.js exists!
//   import('./apps/green-acres/main.js');
// }
