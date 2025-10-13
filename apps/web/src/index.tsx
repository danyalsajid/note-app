/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';
import 'solid-devtools';

import App from './App';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
	);
}

render(() => <App />, root!);

// Register service worker for offline functionality
registerServiceWorker({
	onSuccess: () => {
		console.log('Service worker registered successfully');
	},
	onUpdate: () => {
		console.log('New service worker available. Refresh to update.');
	},
	onOffline: () => {
		console.log('App is offline. Some features may be limited.');
	},
	onOnline: () => {
		console.log('App is back online. Syncing data...');
	},
});
