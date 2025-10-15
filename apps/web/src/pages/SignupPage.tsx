import { type Component, createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from '../contexts';
import { Fa } from 'solid-fa';
import { faUser, faLock, faEnvelope, faIdCard, faUserPlus, faEye, faEyeSlash, faNotesMedical, faUserShield } from '@fortawesome/free-solid-svg-icons';
import styles from './SignupPage.module.css';

const SignupPage: Component = () => {
	const auth = useAuth();
	const navigate = useNavigate();

	const [username, setUsername] = createSignal('');
	const [password, setPassword] = createSignal('');
	const [email, setEmail] = createSignal('');
	const [name, setName] = createSignal('');
	const [role, setRole] = createSignal('clinician');
	const [adminPasscode, setAdminPasscode] = createSignal('');
	const [showPassword, setShowPassword] = createSignal(false);
	const [showAdminPasscode, setShowAdminPasscode] = createSignal(false);
	const [localError, setLocalError] = createSignal<string | null>(null);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		setLocalError(null);

		if (!username() || !password() || !email() || !name()) {
			setLocalError('Please fill in all required fields');
			return;
		}

		if (role() === 'admin' && !adminPasscode()) {
			setLocalError('Admin passcode is required for administrator accounts');
			return;
		}

		try {
			await auth.signup({
				username: username(),
				password: password(),
				email: email(),
				name: name(),
				role: role(),
				adminPasscode: role() === 'admin' ? adminPasscode() : undefined,
			});
			navigate('/');
		} catch (err) {
			setLocalError(err instanceof Error ? err.message : 'Signup failed');
		}
	};

	const handleBackToLogin = () => {
		navigate('/login');
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
					<p class={styles.subtitle}>Create your account</p>
				</div>

				{/* Error Message */}
				<Show when={localError() || auth.error()}>
					<div class={styles.errorContainer}>
						<p class={styles.errorText}>{localError() || auth.error()}</p>
					</div>
				</Show>

				{/* Signup Form */}
				<form onSubmit={handleSubmit} class={styles.form}>
					{/* Name Field */}
					<div class={styles.inputGroup}>
						<label class={styles.label}>
							<Fa icon={faIdCard} class={styles.labelIcon} />
							Full Name
						</label>
						<input
							type="text"
							placeholder="Enter your full name"
							value={name()}
							onInput={(e) => setName(e.currentTarget.value)}
							class={styles.input}
							disabled={auth.loading()}
						/>
					</div>

					{/* Username Field */}
					<div class={styles.inputGroup}>
						<label class={styles.label}>
							<Fa icon={faUser} class={styles.labelIcon} />
							Username
						</label>
						<input
							type="text"
							placeholder="Choose a username"
							value={username()}
							onInput={(e) => setUsername(e.currentTarget.value)}
							class={styles.input}
							disabled={auth.loading()}
						/>
					</div>

					{/* Email Field */}
					<div class={styles.inputGroup}>
						<label class={styles.label}>
							<Fa icon={faEnvelope} class={styles.labelIcon} />
							Email
						</label>
						<input
							type="email"
							placeholder="Enter your email"
							value={email()}
							onInput={(e) => setEmail(e.currentTarget.value)}
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
								placeholder="Create a password"
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
						<p class={styles.passwordHint}>Minimum 6 characters</p>
					</div>

					{/* Role Selection */}
					<div class={styles.inputGroup}>
						<label class={styles.label}>
							<Fa icon={faUserShield} class={styles.labelIcon} />
							Role
						</label>
						<select
							value={role()}
							onChange={(e) => setRole(e.currentTarget.value)}
							class={styles.select}
							disabled={auth.loading()}
						>
							<option value="clinician">Clinician</option>
							<option value="admin">Administrator</option>
						</select>
					</div>

					{/* Admin Passcode Field (conditional) */}
					<Show when={role() === 'admin'}>
						<div class={styles.inputGroup}>
							<label class={styles.label}>
								<Fa icon={faLock} class={styles.labelIcon} />
								Admin Passcode
							</label>
							<div class="relative">
								<input
									type={showAdminPasscode() ? 'text' : 'password'}
									placeholder="Enter admin passcode"
									value={adminPasscode()}
									onInput={(e) => setAdminPasscode(e.currentTarget.value)}
									class={styles.passwordInput}
									disabled={auth.loading()}
								/>
								<button
									type="button"
									onClick={() => setShowAdminPasscode(!showAdminPasscode())}
									class={styles.passwordToggle}
								>
									<Fa icon={showAdminPasscode() ? faEyeSlash : faEye} />
								</button>
							</div>
							<p class={styles.passwordHint}>Required for admin accounts</p>
						</div>
					</Show>

					{/* Sign Up Button */}
					<button
						type="submit"
						disabled={auth.loading()}
						class={styles.submitButton}
					>
						<Show when={!auth.loading()} fallback={<span>Creating account...</span>}>
							<Fa icon={faUserPlus} class={styles.submitIcon} />
							Create Account
						</Show>
					</button>
				</form>

				{/* Back to Login Link */}
				<div class={styles.footer}>
					<p class={styles.footerText}>Already have an account?</p>
					<button
						onClick={handleBackToLogin}
						class={styles.footerLink}
					>
						Sign In
					</button>
				</div>
			</div>
		</div>
	);
};

export default SignupPage;
