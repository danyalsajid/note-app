import { type Component, Show } from 'solid-js';
import { Router, Route, Navigate } from '@solidjs/router';
import { AuthProvider, NavigationProvider, useAuth } from './contexts';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Protected Route Component
const ProtectedRoute: Component<{ component: Component }> = (props) => {
	const auth = useAuth();

	return (
		<Show
			when={!auth.loading()}
			fallback={
				<div class="flex items-center justify-center h-screen">
					<div class="text-gray-600">Loading...</div>
				</div>
			}
		>
			<Show when={auth.isAuthenticated()} fallback={<Navigate href="/login" />}>
				<NavigationProvider>
					{props.component({})}
				</NavigationProvider>
			</Show>
		</Show>
	);
};

const App: Component = () => {
	return (
		<AuthProvider>
			<Router>
				<Route path="/login" component={LoginPage} />
				<Route path="/signup" component={SignupPage} />
				<Route
					path="/"
					component={() => <ProtectedRoute component={HomePage} />}
				/>
				<Route
					path="/item/:id"
					component={() => <ProtectedRoute component={HomePage} />}
				/>
			</Router>
		</AuthProvider>
	);
};

export default App;
