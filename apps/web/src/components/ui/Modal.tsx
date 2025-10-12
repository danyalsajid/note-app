import { Show, JSX, onMount, onCleanup, createEffect } from 'solid-js';
import { Portal } from 'solid-js/web';

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
				<div class="fixed inset-0 z-50 flex items-center justify-center">
					{/* Backdrop */}
					<div
						class="absolute inset-0 bg-black/50 transition-opacity"
						onClick={() => props.onClose()}
					/>

					{/* Modal Content */}
					<div
						ref={modalContentRef}
						class="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 z-10"
					>
						{/* Header */}
						<div class="flex items-center justify-between p-6 border-b border-gray-200">
							<h2 class="text-xl font-semibold text-gray-900">
								{props.title || 'Modal'}
							</h2>
							<button
								onClick={() => props.onClose()}
								class="text-gray-400 hover:text-gray-600 transition"
							>
								<i class="fas fa-times text-xl" />
							</button>
						</div>

						{/* Body */}
						<div class="p-6">{props.children}</div>
					</div>
				</div>
			</Portal>
		</Show>
	);
}
