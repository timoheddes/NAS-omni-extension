import { injectStatusIcon } from './shared/ui/icon.js';
import { printToConsole } from './shared/ui/console.js';

const currentUrl = window.location.hostname;
printToConsole(`active on: ${currentUrl}`);
injectStatusIcon();

// Green Acres
// if (currentUrl.includes('green-acres.fr')) {
//   import('./apps/green-acres/main.js');
// }
