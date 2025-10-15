import { createSignal, Show, createEffect, onCleanup } from 'solid-js';
import Modal from './Modal';
import VoiceRecorder from './VoiceRecorder';
import type { Note } from '../../types';
import { notesService } from '../../services/notesService';
import { aiService } from '../../services/aiService';
import styles from './NoteModal.module.css';

interface NoteModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (content: string, tags: string[], voiceNoteFilename?: string | null, voiceNoteDuration?: number | null) => void;
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
	const [voiceNoteBlobUrl, setVoiceNoteBlobUrl] = createSignal<string | null>(null);
	const [isUploadingVoice, setIsUploadingVoice] = createSignal(false);
	const [isRecording, setIsRecording] = createSignal(false);
	const [isSummarizing, setIsSummarizing] = createSignal(false);

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
			setIsRecording(false);
		}
	});

	// Fetch voice note blob when filename changes
	createEffect(async () => {
		const filename = voiceNoteFilename();
		const hasBlob = voiceNoteBlob();
		
		// Cleanup previous blob URL
		const prevUrl = voiceNoteBlobUrl();
		if (prevUrl) {
			URL.revokeObjectURL(prevUrl);
			setVoiceNoteBlobUrl(null);
		}
		
		// Fetch new blob if we have a filename but no blob
		if (filename && !hasBlob) {
			try {
				const blobUrl = await notesService.fetchVoiceNoteBlob(filename);
				setVoiceNoteBlobUrl(blobUrl);
			} catch (error) {
				console.error('Failed to load voice note:', error);
			}
		}
	});

	// Cleanup blob URL on unmount
	onCleanup(() => {
		const url = voiceNoteBlobUrl();
		if (url) {
			URL.revokeObjectURL(url);
		}
	});

	const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
		setVoiceNoteBlob(audioBlob);
		setVoiceNoteDuration(duration);
		setShowVoiceRecorder(false);
	};

	const handleRemoveVoiceNote = async () => {
		// If there's an existing voice note file, delete it from server
		if (voiceNoteFilename() && !voiceNoteBlob()) {
			try {
				await notesService.deleteVoiceNote(voiceNoteFilename()!);
			} catch (error) {
				console.error('Failed to delete voice note:', error);
			}
		}
		
		setVoiceNoteBlob(null);
		setVoiceNoteFilename(null);
		setVoiceNoteDuration(0);
	};

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	// Count words in content
	const getWordCount = (text: string): number => {
		return text.trim().split(/\s+/).filter(word => word.length > 0).length;
	};

	// Check if content has more than 50 words
	const canSummarize = () => {
		const trimmedContent = content().trim();
		return trimmedContent && getWordCount(trimmedContent) > 50;
	};

	const handleSummarizeContent = async () => {
		const trimmedContent = content().trim();
		if (!trimmedContent) {
			alert('Please enter note content first');
			return;
		}

		if (getWordCount(trimmedContent) <= 50) {
			alert('Content must have more than 50 words to summarize');
			return;
		}

		try {
			setIsSummarizing(true);
			const summary = await aiService.summarizeContent(trimmedContent);
			setContent(summary);
		} catch (error) {
			console.error('Failed to summarize content:', error);
			alert('Failed to summarize content. Please try again.');
		} finally {
			setIsSummarizing(false);
		}
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

		// Pass null if no voice note, otherwise pass the filename
		props.onSave(
			trimmedContent, 
			tags, 
			uploadedFilename || (voiceNoteFilename() ? undefined : null), 
			uploadedFilename || voiceNoteFilename() ? duration || undefined : null
		);
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
					<button
						type="button"
						onClick={handleSummarizeContent}
						class={styles.aiSummarizeButton}
						disabled={isSummarizing() || !canSummarize()}
						title={!canSummarize() ? 'Content must have more than 50 words' : 'Summarize content'}
					>
						<Show when={isSummarizing()} fallback={
							<>
								<i class="fas fa-compress-alt" />
								Summarize Content ({getWordCount(content())} words)
							</>
						}>
							<i class="fas fa-spinner fa-spin" />
							Summarizing...
						</Show>
					</button>
					<p class={styles.hint}>
						Minimum words to get AI summarization should be 50.
					</p>
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
								<Show when={voiceNoteFilename() && !voiceNoteBlob() && voiceNoteBlobUrl()}>
									<audio 
										controls 
										src={voiceNoteBlobUrl()!} 
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
							onRecordingStateChange={setIsRecording}
						/>
					</Show>
				</div>

				<div class={styles.actions}>
					<button
						type="button"
						onClick={() => props.onClose()}
						class={styles.cancelButton}
						disabled={props.isLoading || isUploadingVoice() || isRecording() || isSummarizing()}
					>
						Cancel
					</button>
					<button
						type="submit"
						class={styles.saveButton}
						disabled={props.isLoading || isUploadingVoice() || isRecording() || isSummarizing() || !content().trim()}
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
