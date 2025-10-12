import { createSignal } from 'solid-js';
import Modal from './Modal';
import { capitalizeFirst } from '../../utils/helpers';
import styles from './AddItemModal.module.css';

interface AddItemModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (name: string) => void;
	itemType: string;
	parentName?: string | null;
	parentType?: string | null;
}

export default function AddItemModal(props: AddItemModalProps) {
	const [name, setName] = createSignal('');
	const [error, setError] = createSignal('');

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		const trimmedName = name().trim();

		if (!trimmedName) {
			setError('Name is required');
			return;
		}

		props.onSubmit(trimmedName);
		handleClose();
	};

	const handleClose = () => {
		setName('');
		setError('');
		props.onClose();
	};

		return (
		<Modal
			isOpen={props.isOpen}
			onClose={handleClose}
			title={`Add New ${capitalizeFirst(props.itemType)}`}
		>
			<form onSubmit={handleSubmit} class={styles.form}>
				<div>
					{props.parentName && (
						<p class={styles.description}>
							Add a new {capitalizeFirst(props.itemType)} under{' '}
							{capitalizeFirst(props.parentType || '')} :{' '}
							{props.parentName}
						</p>
					)}
					<input
						id="item-name"
						type="text"
						value={name()}
						onInput={e => {
							setName(e.currentTarget.value);
							setError('');
						}}
						placeholder={`Enter ${props.itemType.toLowerCase()} name`}
						class={styles.input}
					/>
					{error() && (
						<p class={styles.error}>{error()}</p>
					)}
				</div>

				<div class={styles.actions}>
					<button
						type="button"
						onClick={handleClose}
						class={styles.cancelButton}
					>
						Cancel
					</button>
					<button
						type="submit"
						class={styles.submitButton}
					>
						Add {capitalizeFirst(props.itemType)}
					</button>
				</div>
			</form>
		</Modal>
	);
}
