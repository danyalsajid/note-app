import { Show, For, createSignal, onMount, onCleanup } from 'solid-js';
import type { Note as NoteType } from '../../types';
import { parseTags } from '../../utils';
import { notesService } from '../../services/notesService';
import styles from './Note.module.css';

interface NoteProps {
	note: NoteType;
	formatDate: (dateString: string) => string;
	onEdit: (note: NoteType) => void;
	onDelete: (note: NoteType) => void;
}

export default function Note(props: NoteProps) {
	const [showMenu, setShowMenu] = createSignal(false);
	let menuContainerRef: HTMLDivElement | undefined;

	const handleEdit = () => {
		setShowMenu(false);
		props.onEdit(props.note);
	};

	const handleDelete = () => {
		setShowMenu(false);
		if (confirm('Are you sure you want to delete this note?')) {
			props.onDelete(props.note);
		}
	};

	const handleClickOutside = (event: Event) => {
		if (menuContainerRef && !menuContainerRef.contains(event.target as Node)) {
			setShowMenu(false);
		}
	};

	onMount(() => {
		if (typeof window !== 'undefined') {
			document.addEventListener('click', handleClickOutside);
		}
	});

	onCleanup(() => {
		if (typeof window !== 'undefined') {
			document.removeEventListener('click', handleClickOutside);
		}
	});

	const tags = () => parseTags(props.note.tags);

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<div class={styles.container}>
			<div class={styles.header}>
				<div class={styles.content}>
					<p class={styles.text}>
						{props.note.content}
					</p>
					
					{/* Voice Note Player */}
					<Show when={props.note.voiceNoteFilename}>
						<div class={styles.voiceNote}>
							<div class={styles.voiceNoteHeader}>
								<i class="fas fa-microphone text-blue-600 mr-2" />
								<span class={styles.voiceNoteLabel}>
									Voice Note ({formatTime(props.note.voiceNoteDuration || 0)})
								</span>
							</div>
							<audio 
								controls 
								src={notesService.getVoiceNoteUrl(props.note.voiceNoteFilename!)} 
								class={styles.audioPlayer}
							/>
						</div>
					</Show>
				</div>
				<div class={styles.menuContainer} ref={menuContainerRef}>
					<button 
						class={styles.menuButton}
						onClick={() => setShowMenu(!showMenu())}
					>
						<i class="fas fa-ellipsis-v" />
					</button>
					<Show when={showMenu()}>
						<div class={styles.dropdown}>
							<button
								class={styles.dropdownItem}
								onClick={handleEdit}
							>
								<i class="fas fa-edit" />
								Edit
							</button>
							<button
								class={styles.dropdownItem}
								onClick={handleDelete}
							>
								<i class="fas fa-trash" />
								Delete
							</button>
						</div>
					</Show>
				</div>
			</div>
			<div class={styles.footer}>
				<span class={styles.timestamp}>
					<i class="fas fa-clock mr-1" />
					{props.formatDate(props.note.createdAt)}
				</span>
				<Show when={tags().length > 0}>
					<div class={styles.tags}>
						<For each={tags()}>
							{tag => (
								<span class={styles.tag}>
									{tag}
								</span>
							)}
						</For>
					</div>
				</Show>
			</div>
		</div>
	);
}
