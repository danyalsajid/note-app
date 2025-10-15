import { Show } from 'solid-js';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import styles from './OnlineStatusIndicator.module.css';

export default function OnlineStatusIndicator() {
	const isOnline = useOnlineStatus();

	return (
		<Show when={!isOnline()}>
			<div class={styles.container}>
				<div class={styles.offline}>
					<i class="fas fa-wifi-slash" />
					<span>Offline</span>
				</div>
			</div>
		</Show>
	);
}
