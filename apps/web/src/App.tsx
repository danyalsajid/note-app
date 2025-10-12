import { type Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import Layout from './components/Layout';

const App: Component = () => {
	return (
		<Router>
			<Route path="/" component={Layout} />
			<Route path="/item/:id" component={Layout} />
		</Router>
	);
};

export default App;
