import { createSignal, Show, createEffect } from 'solid-js';
import Modal from './Modal';
import type { Note } from '../../types';
import styles from './NoteModal.module.css';

interface NoteModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (content: string, tags: string[]) => void;
	note?: Note | null;
	isLoading?: boolean;
}

export default function NoteModal(props: NoteModalProps) {
	const [content, setContent] = createSignal('');
	const [tagsInput, setTagsInput] = createSignal('');

	// Reset form when modal opens or note changes
	createEffect(() => {
		if (props.isOpen) {
			const note = props.note;
			setContent(note?.content || '');
			setTagsInput(
				note?.tags ? JSON.parse(note.tags).join(', ') : ''
			);
		}
	});

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		
		const trimmedContent = content().trim();
		if (!trimmedContent) {
			return;
		}

		// Parse tags from comma-separated string
		const tags = tagsInput()
			.split(',')
			.map((tag: string) => tag.trim())
			.filter((tag: string) => tag.length > 0);

		props.onSave(trimmedContent, tags);
	};

	return (
		<Modal
			isOpen={props.isOpen}
			onClose={props.onClose}
			title={props.note ? 'Edit Note' : 'Add Note'}
		>
			<form onSubmit={handleSubmit} class={styles.form}>
				<div class={styles.formGroup}>
					<label for="content" class={styles.label}>
						Content *
					</label>
					<textarea
						id="content"
						value={content()}
						onInput={e => setContent(e.currentTarget.value)}
						placeholder="Enter note content..."
						class={styles.textarea}
						rows={6}
						required
					/>
				</div>

				<div class={styles.formGroup}>
					<label for="tags" class={styles.label}>
						Tags
					</label>
					<input
						id="tags"
						type="text"
						value={tagsInput()}
						onInput={e => setTagsInput(e.currentTarget.value)}
						placeholder="Enter tags separated by commas (e.g., important, follow-up)"
						class={styles.input}
					/>
					<p class={styles.hint}>
						Separate multiple tags with commas
					</p>
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
						disabled={props.isLoading || !content().trim()}
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
