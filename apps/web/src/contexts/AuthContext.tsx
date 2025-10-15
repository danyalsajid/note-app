import { createContext, useContext, ParentComponent, createSignal, onMount } from 'solid-js';
import type { User, LoginRequest, SignupRequest } from '../types/auth';
import { authService } from '../services/authService';

/**
 * Auth Context Type Definition
 */
type AuthContextType = {
	// State
	user: () => User | null;
	loading: () => boolean;
	error: () => string | null;
	isAuthenticated: () => boolean;

	// Actions
	login: (credentials: LoginRequest) => Promise<void>;
	signup: (userData: SignupRequest) => Promise<void>;
	logout: () => Promise<void>;
	clearError: () => void;
};

/**
 * Create the Auth Context
 */
const AuthContext = createContext<AuthContextType>();

/**
 * Auth Provider Component
 */
export const AuthProvider: ParentComponent = (props) => {
	// State signals
	const [user, setUser] = createSignal<User | null>(null);
	const [loading, setLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);

	/**
	 * Check if user is authenticated
	 */
	const isAuthenticated = () => !!user();

	/**
	 * Initialize auth state on mount
	 */
	onMount(async () => {
		try {
			if (authService.isAuthenticated()) {
				const currentUser = await authService.getCurrentUser();
				setUser(currentUser);
			}
		} catch (err) {
			console.error('Failed to get current user:', err);
			authService.removeToken();
		} finally {
			setLoading(false);
		}
	});

	/**
	 * Login user
	 */
	const login = async (credentials: LoginRequest) => {
		setLoading(true);
		setError(null);
		try {
			const response = await authService.login(credentials);
			authService.saveToken(response.token);
			setUser(response.user);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Login failed';
			setError(errorMessage);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Signup new user
	 */
	const signup = async (userData: SignupRequest) => {
		setLoading(true);
		setError(null);
		try {
			const response = await authService.signup(userData);
			authService.saveToken(response.token);
			setUser(response.user);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Signup failed';
			setError(errorMessage);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Logout user
	 */
	const logout = async () => {
		setLoading(true);
		try {
			await authService.logout();
			setUser(null);
		} catch (err) {
			console.error('Logout error:', err);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Clear error message
	 */
	const clearError = () => {
		setError(null);
	};

	// Context value
	const contextValue: AuthContextType = {
		// State
		user,
		loading,
		error,
		isAuthenticated,

		// Actions
		login,
		signup,
		logout,
		clearError,
	};

	return (
		<AuthContext.Provider value={contextValue}>
			{props.children}
		</AuthContext.Provider>
	);
};

/**
 * Custom hook to use the Auth Context
 */
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
