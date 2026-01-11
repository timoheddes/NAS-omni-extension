import { injectStatusIcon } from './shared/ui/icon.js';
import { printToConsole } from './shared/ui/console.js';

injectStatusIcon();

const currentUrl = window.location.hostname;
printToConsole(`active on: ${currentUrl}`);

// Green Acres
if (currentUrl.includes('green-acres.fr')) {
  import('./apps/green-acres/main.js');
}
