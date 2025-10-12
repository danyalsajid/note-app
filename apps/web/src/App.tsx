import { type Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import HomePage from './pages/HomePage';

const App: Component = () => {
	return (
		<Router>
			<Route path="/" component={HomePage} />
			<Route path="/item/:id" component={HomePage} />
		</Router>
	);
};

export default App;
