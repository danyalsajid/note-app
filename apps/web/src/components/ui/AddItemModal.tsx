import { createSignal } from 'solid-js';
import Modal from './Modal';
import { capitalizeFirst } from '../../utils/helpers';

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
			<form onSubmit={handleSubmit} class="space-y-4">
				<div>
					{props.parentName && (
						<p class="text-sm text-gray-600 mb-3">
							Add a new {capitalizeFirst(props.itemType)} under{' '}
							{capitalizeFirst(props.parentType)} :{' '}
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
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
					/>
					{error() && (
						<p class="mt-1 text-sm text-red-600">{error()}</p>
					)}
				</div>

				<div class="flex justify-end gap-3 pt-2">
					<button
						type="button"
						onClick={handleClose}
						class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
					>
						Add {capitalizeFirst(props.itemType)}
					</button>
				</div>
			</form>
		</Modal>
	);
}
