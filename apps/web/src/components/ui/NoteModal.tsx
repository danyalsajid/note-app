import { createSignal, Show, createEffect } from 'solid-js';
import Modal from './Modal';
import VoiceRecorder from './VoiceRecorder';
import type { Note } from '../../types';
import { notesService } from '../../services/notesService';
import styles from './NoteModal.module.css';

interface NoteModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (content: string, tags: string[], voiceNoteFilename?: string, voiceNoteDuration?: number) => void;
	note?: Note | null;
	isLoading?: boolean;
}

export default function NoteModal(props: NoteModalProps) {
	const [content, setContent] = createSignal('');
	const [tagsInput, setTagsInput] = createSignal('');
	const [showVoiceRecorder, setShowVoiceRecorder] = createSignal(false);
	const [voiceNoteBlob, setVoiceNoteBlob] = createSignal<Blob | null>(null);
	const [voiceNoteDuration, setVoiceNoteDuration] = createSignal<number>(0);
	const [voiceNoteFilename, setVoiceNoteFilename] = createSignal<string | null>(null);
	const [isUploadingVoice, setIsUploadingVoice] = createSignal(false);

	// Reset form when modal opens or note changes
	createEffect(() => {
		if (props.isOpen) {
			const note = props.note;
			setContent(note?.content || '');
			setTagsInput(
				note?.tags ? JSON.parse(note.tags).join(', ') : ''
			);
			setVoiceNoteFilename(note?.voiceNoteFilename || null);
			setVoiceNoteDuration(note?.voiceNoteDuration || 0);
			setVoiceNoteBlob(null);
			setShowVoiceRecorder(false);
		}
	});

	const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
		setVoiceNoteBlob(audioBlob);
		setVoiceNoteDuration(duration);
		setShowVoiceRecorder(false);
	};

	const handleRemoveVoiceNote = () => {
		setVoiceNoteBlob(null);
		setVoiceNoteFilename(null);
		setVoiceNoteDuration(0);
	};

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const handleSubmit = async (e: Event) => {
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

		// Upload voice note if present
		let uploadedFilename = voiceNoteFilename();
		let duration = voiceNoteDuration();

		if (voiceNoteBlob()) {
			try {
				setIsUploadingVoice(true);
				const result = await notesService.uploadVoiceNote(voiceNoteBlob()!);
				uploadedFilename = result.filename;
			} catch (error) {
				console.error('Failed to upload voice note:', error);
				alert('Failed to upload voice note. Please try again.');
				setIsUploadingVoice(false);
				return;
			} finally {
				setIsUploadingVoice(false);
			}
		}

		props.onSave(trimmedContent, tags, uploadedFilename || undefined, duration || undefined);
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

				{/* Voice Note Section */}
				<div class={styles.formGroup}>
					<label class={styles.label}>
						Voice Note (Optional)
					</label>
					
					<Show when={!showVoiceRecorder()}>
						<Show
							when={voiceNoteBlob() || voiceNoteFilename()}
							fallback={
								<button
									type="button"
									onClick={() => setShowVoiceRecorder(true)}
									class={styles.voiceButton}
								>
									<i class="fas fa-microphone mr-2" />
									Add Voice Note
								</button>
							}
						>
							<div class={styles.voiceNotePreview}>
								<div class={styles.voiceNoteInfo}>
									<i class="fas fa-microphone text-blue-600 mr-2" />
									<span>Voice note attached ({formatTime(voiceNoteDuration())})</span>
								</div>
								<Show when={voiceNoteFilename() && !voiceNoteBlob()}>
									<audio 
										controls 
										src={notesService.getVoiceNoteUrl(voiceNoteFilename()!)} 
										class={styles.audioPreview}
									/>
								</Show>
								<button
									type="button"
									onClick={handleRemoveVoiceNote}
									class={styles.removeVoiceButton}
								>
									<i class="fas fa-times mr-1" />
									Remove
								</button>
							</div>
						</Show>
					</Show>

					<Show when={showVoiceRecorder()}>
						<VoiceRecorder
							onRecordingComplete={handleRecordingComplete}
							onCancel={() => setShowVoiceRecorder(false)}
						/>
					</Show>
				</div>

				<div class={styles.actions}>
					<button
						type="button"
						onClick={() => props.onClose()}
						class={styles.cancelButton}
						disabled={props.isLoading || isUploadingVoice()}
					>
						Cancel
					</button>
					<button
						type="submit"
						class={styles.saveButton}
						disabled={props.isLoading || isUploadingVoice() || !content().trim()}
					>
						<Show when={props.isLoading || isUploadingVoice()} fallback="Save">
							<i class="fas fa-spinner fa-spin mr-2" />
							<Show when={isUploadingVoice()} fallback="Saving...">
								Uploading voice note...
							</Show>
						</Show>
					</button>
				</div>
			</form>
		</Modal>
	);
}
