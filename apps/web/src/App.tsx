import { type Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import { NavigationProvider } from './contexts';
import HomePage from './pages/HomePage';
import OfflineIndicator from './components/OfflineIndicator';

const App: Component = () => {
	return (
		<NavigationProvider>
			<Router>
				<Route path="/" component={HomePage} />
				<Route path="/item/:id" component={HomePage} />
			</Router>
			<OfflineIndicator />
		</NavigationProvider>
	);
};

export default App;
