import { Show, JSX, onMount, onCleanup, createEffect } from 'solid-js';
import { Portal } from 'solid-js/web';
import styles from './Modal.module.css';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: JSX.Element;
}

export default function Modal(props: ModalProps) {
	let modalContentRef: HTMLDivElement | undefined;

	// Handle escape key to close modal
	const handleKeyDown = (event: any) => {
		if (event.key === 'Escape' && props.isOpen) {
			props.onClose();
		}
	};

	onMount(() => {
		document.addEventListener('keydown', handleKeyDown);
	});

	onCleanup(() => {
		document.removeEventListener('keydown', handleKeyDown);
	});

	// Focus first input when modal opens
	createEffect(() => {
		if (props.isOpen && modalContentRef) {
			// Small delay to ensure modal is fully rendered
			window.setTimeout(() => {
				const firstInput = modalContentRef?.querySelector(
					'input, textarea, select'
				) as HTMLElement;
				if (firstInput) {
					firstInput.focus();
				}
			}, 100);
		}
	});

	return (
		<Show when={props.isOpen}>
			<Portal>
				<div class={styles.overlay}>
					{/* Backdrop */}
					<div
						class={styles.backdrop}
						onClick={() => props.onClose()}
					/>

					{/* Modal Content */}
					<div
						ref={modalContentRef}
						class={styles.content}
					>
						{/* Header */}
						<div class={styles.header}>
							<h2 class={styles.title}>
								{props.title || 'Modal'}
							</h2>
							<button
								onClick={() => props.onClose()}
								class={styles.closeButton}
							>
								<i class="fas fa-times text-xl" />
							</button>
						</div>

						{/* Body */}
						<div class={styles.body}>{props.children}</div>
					</div>
				</div>
			</Portal>
		</Show>
	);
}
