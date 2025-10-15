import { type Component, createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from '../contexts';
import { Fa } from 'solid-fa';
import { faUser, faLock, faRightToBracket, faEye, faEyeSlash, faNotesMedical } from '@fortawesome/free-solid-svg-icons';
import styles from './LoginPage.module.css';

const LoginPage: Component = () => {
	const auth = useAuth();
	const navigate = useNavigate();

	const [username, setUsername] = createSignal('');
	const [password, setPassword] = createSignal('');
	const [showPassword, setShowPassword] = createSignal(false);
	const [localError, setLocalError] = createSignal<string | null>(null);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		setLocalError(null);

		if (!username() || !password()) {
			setLocalError('Please enter both username and password');
			return;
		}

		try {
			await auth.login({
				username: username(),
				password: password(),
			});
			navigate('/');
		} catch (err) {
			setLocalError(err instanceof Error ? err.message : 'Login failed');
		}
	};

	const handleCreateAccount = () => {
		navigate('/signup');
	};

	return (
		<div class={styles.container}>
			<div class={styles.formContainer}>
				{/* Logo and Title */}
				<div class={styles.logoSection}>
					<div class={styles.logoCircle}>
						<Fa icon={faNotesMedical} class={styles.logoIcon} />
					</div>
					<h1 class={styles.title}>Healthcare Notes</h1>
					<p class={styles.subtitle}>Please sign in to continue</p>
				</div>

				{/* Error Message */}
				<Show when={localError() || auth.error()}>
					<div class={styles.errorContainer}>
						<p class={styles.errorText}>{localError() || auth.error()}</p>
					</div>
				</Show>

				{/* Login Form */}
				<form onSubmit={handleSubmit} class={styles.form}>
					{/* Username Field */}
					<div class={styles.inputGroup}>
						<label class={styles.label}>
							<Fa icon={faUser} class={styles.labelIcon} />
							Username
						</label>
						<input
							type="text"
							placeholder="Enter your username"
							value={username()}
							onInput={(e) => setUsername(e.currentTarget.value)}
							class={styles.input}
							disabled={auth.loading()}
						/>
					</div>

					{/* Password Field */}
					<div class={styles.inputGroup}>
						<label class={styles.label}>
							<Fa icon={faLock} class={styles.labelIcon} />
							Password
						</label>
						<div class="relative">
							<input
								type={showPassword() ? 'text' : 'password'}
								placeholder="Enter your password"
								value={password()}
								onInput={(e) => setPassword(e.currentTarget.value)}
								class={styles.passwordInput}
								disabled={auth.loading()}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword())}
								class={styles.passwordToggle}
							>
								<Fa icon={showPassword() ? faEyeSlash : faEye} />
							</button>
						</div>
					</div>

					{/* Sign In Button */}
					<button
						type="submit"
						disabled={auth.loading()}
						class={styles.submitButton}
					>
						<Show when={!auth.loading()} fallback={<span>Signing in...</span>}>
							<Fa icon={faRightToBracket} class={styles.submitIcon} />
							Sign In
						</Show>
					</button>
				</form>

				{/* Create Account Link */}
				<div class={styles.footer}>
					<p class={styles.footerText}>Don't have an account?</p>
					<button
						onClick={handleCreateAccount}
						class={styles.footerLink}
					>
						Create Account
					</button>
				</div>

				{/* Demo Credentials */}
				<div class={styles.demoSection}>
					<p class={styles.demoTitle}>Demo Credentials:</p>
					<div class={styles.demoCredentials}>
						<p class={styles.demoCredential}>
							<span class={styles.demoRole}>Admin:</span> admin / Test@123
						</p>
						<p class={styles.demoCredential}>
							<span class={styles.demoRole}>Clinician:</span> clinician / Test@123
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
