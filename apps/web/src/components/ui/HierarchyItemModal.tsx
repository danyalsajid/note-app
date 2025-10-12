import { createSignal, Show, createEffect } from 'solid-js';
import Modal from './Modal';
import type { HierarchyNode } from '../../types';
import styles from './NoteModal.module.css';

interface HierarchyItemModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (name: string) => void;
	item?: HierarchyNode | null;
	isLoading?: boolean;
}

export default function HierarchyItemModal(props: HierarchyItemModalProps) {
	const [name, setName] = createSignal('');

	// Reset form when modal opens or item changes
	createEffect(() => {
		if (props.isOpen) {
			setName(props.item?.name || '');
		}
	});

	const handleSubmit = (e: Event) => {
		e.preventDefault();

		const trimmedName = name().trim();
		if (!trimmedName) {
			return;
		}

		props.onSave(trimmedName);
	};

	return (
		<Modal
			isOpen={props.isOpen}
			onClose={props.onClose}
			title={`Edit ${props.item ? props.item.type.charAt(0).toUpperCase() + props.item.type.slice(1) : 'Item'}`}
		>
			<form onSubmit={handleSubmit} class={styles.form}>
				<div class={styles.formGroup}>
					<label for="name" class={styles.label}>
						Name *
					</label>
					<input
						id="name"
						type="text"
						value={name()}
						onInput={e => setName(e.currentTarget.value)}
						placeholder="Enter item name..."
						class={styles.input}
						required
					/>
				</div>

				<div class={styles.actions}>
					<button
						type="button"
						onClick={() => props.onClose()}
						class={styles.cancelButton}
						disabled={props.isLoading}
					>
						Cancel
					</button>
					<button
						type="submit"
						class={styles.saveButton}
						disabled={props.isLoading || !name().trim()}
					>
						<Show when={props.isLoading} fallback="Save">
							<i class="fas fa-spinner fa-spin mr-2" />
							Saving...
						</Show>
					</button>
				</div>
			</form>
		</Modal>
	);
}
